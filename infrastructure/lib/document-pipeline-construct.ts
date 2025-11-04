import {Construct} from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { createTask } from "./invoice-processing-stack";
import { InvoiceBucket } from "./invoice-bucket-construct";
import { DocumentDB } from "./document-db-construct";
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import {DocumentDynamo} from "./document-dynamo";
import { DefinitionBody } from 'aws-cdk-lib/aws-stepfunctions';

export class DocumentPipeline extends Construct {


    constructor(
        scope: Construct,
        id: string,
        invoiceBucket: InvoiceBucket,
        documentDB: DocumentDB,
        dynamoDB: DocumentDynamo
    ) {
        super(scope, id);

        const [ocrStepTask, ocrStepFunction] = createTask(this, 'OCRStep', undefined, {
            INVOICE_BUCKET: invoiceBucket.bucket.bucketName,
        });

        invoiceBucket.bucket.grantRead(ocrStepFunction);

        ocrStepFunction.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['textract:AnalyzeExpense'],
                resources: ['*'],
            }),
        );

        const [saveResultTask, saveResultFunction] = createTask(this, 'SaveResult', documentDB.vpc, documentDB.dbEnvironment);

        // Allow Lambda to connect to DocumentDB
        documentDB.cluster.connections.allowDefaultPortFrom(saveResultFunction);
        // Grant the Lambda function access to the db credentials
        documentDB.dbSecret.grantRead(saveResultFunction);

        const [savePendingTask, savePendingLambda] = createTask(this, 'SaveStatus', undefined, {PROGRESS_STATE: "PENDING", JOBS_TABLE: dynamoDB.table.tableName}, "SavePendingStatus");
        const [saveStartedTask, saveStartedLambda] = createTask(this, 'SaveStatus', undefined, {PROGRESS_STATE: "STARTED", JOBS_TABLE: dynamoDB.table.tableName}, "SaveStartedStatus");
        const [saveCompletedTask, saveCompletedLambda] = createTask(this, 'SaveStatus', undefined, {PROGRESS_STATE: "COMPLETED", JOBS_TABLE: dynamoDB.table.tableName}, "SaveCompletedStatus");
        const [saveFailedTask, saveFailedLambda] = createTask(this, 'SaveStatus', undefined, {PROGRESS_STATE: "FAILED", JOBS_TABLE: dynamoDB.table.tableName}, "SaveFailedStatus");

        dynamoDB.table.grantFullAccess(savePendingLambda);
        dynamoDB.table.grantFullAccess(saveStartedLambda);
        dynamoDB.table.grantFullAccess(saveCompletedLambda);
        dynamoDB.table.grantFullAccess(saveFailedLambda);

        const pipeline = new sfn.StateMachine(this, 'InvoiceProcessing', {
            definitionBody: DefinitionBody.fromChainable(saveStartedTask
              .next(ocrStepTask)
              .next(
                new sfn.Choice(this, 'OCRSuccessfulChoice')
                  .when(
                    sfn.Condition.booleanEquals('$.Payload.success', true),
                    saveResultTask.next(saveCompletedTask),
                  )
                  .otherwise(saveFailedTask),
              ),)
        });

        const [startPipelineTask, startPipelineLambda] = createTask(this, 'StartPipeline', undefined, {STEP_FUNCTION: pipeline.stateMachineArn});

        pipeline.grantStartExecution(startPipelineLambda);

        invoiceBucket.bucket.addEventNotification(
            s3.EventType.OBJECT_CREATED_PUT,
            new s3n.LambdaDestination(startPipelineLambda)
        )
    }
}