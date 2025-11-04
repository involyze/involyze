import {Construct} from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import {aws_apigateway} from "aws-cdk-lib";
import {createTask} from "./invoice-processing-stack";
import {InvoiceBucket} from "./invoice-bucket-construct";
import * as appsync from "aws-cdk-lib/aws-appsync";
import path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {InvolyzeCognito} from "./cognito-construct";
import {DocumentDB} from "./document-db-construct";
import { DocumentDynamo } from './document-dynamo';

export class DocumentGraphqlApi extends Construct {

    public readonly bucket: s3.Bucket;
    public readonly api: appsync.GraphqlApi;

    constructor(
        scope: Construct,
        id: string,
        region: string,
        cognito: InvolyzeCognito,
        documentDB: DocumentDB,
        documentDynamo: DocumentDynamo
    ) {
        super(scope, id);

        // Create AppSync API with Cognito User Pool Authentication
        this.api = new appsync.GraphqlApi(this, 'AppSyncApi', {
            name: 'SvelteAppSyncAPI',
            definition: {
                schema: appsync.SchemaFile.fromAsset(path.join(__dirname, '../schema/schema.graphql'))
            },
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool: cognito.userPool,
                    },
                },
                additionalAuthorizationModes: [
                    {
                        authorizationType: appsync.AuthorizationType.IAM,
                    },
                ],
            },
            xrayEnabled: true, // Enable X-Ray tracing
        });

        //We have to return an object on mutation
        const noneDataSource = this.api.addNoneDataSource('NoneDataSource', {
            name: 'NoneDataSource',
        });

        // Create the resolver for 'notifyJobStatus'
        noneDataSource.createResolver('NotifyJobStatusResolver', {
            typeName: 'Mutation',
            fieldName: 'notifyJobStatus',
            requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "payload": {
            "jobId": "$context.arguments.jobId",
            "status": "$context.arguments.status",
            "message": "$context.arguments.message"
          }
        }
      `),
            responseMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "jobId": "$context.result.jobId",
          "status": "$context.result.status",
          "message": "$context.result.message"
        }
      `),
        });

        const [getStatisticsTask, getStatisticsFunction] = createTask(this, 'GetStatistics', documentDB.vpc, documentDB.dbEnvironment);
        const [getResultsTask, getResultsFunction] = createTask(this, 'GetResults', documentDB.vpc, documentDB.dbEnvironment);
        const [getJobsTask, getJobsFunction] = createTask(this, 'GetJobs', undefined, {JOBS_TABLE: documentDynamo.table.tableName});
        const [reportStatusTask, reportStatusFunction] = createTask(this, 'ReportStatus',undefined, {APPSYNC_API_URL: this.api.graphqlUrl, REGION: region});

        documentDB.cluster.connections.allowDefaultPortFrom(getResultsFunction);
        documentDB.cluster.connections.allowDefaultPortFrom(getStatisticsFunction);
        documentDB.dbSecret.grantRead(getResultsFunction);
        documentDB.dbSecret.grantRead(getStatisticsFunction);

        // Grant permissions to the Lambda function
        documentDynamo.table.grantReadData(getJobsFunction)
        this.api.grantMutation(reportStatusFunction);
        // Create event source mapping
        reportStatusFunction.addEventSource(
            new lambdaEventSources.DynamoEventSource(documentDynamo.table, {
                startingPosition: lambda.StartingPosition.LATEST,
            })
        );

        // Add resolvers for each endpoint
        const getStatisticsLambdaDs = this.api.addLambdaDataSource('GetStatisticsDatasource', getStatisticsFunction);
        const getResultsLambdaDs = this.api.addLambdaDataSource('GetResultsDatasource', getResultsFunction);
        const getJobsLambdaDs = this.api.addLambdaDataSource('GetJobsDataSource', getJobsFunction);

        getJobsLambdaDs.createResolver('GetJobsResolver',{
            typeName: 'Query',
            fieldName: 'getJobs',
        });

        // Resolvers for each query
        getStatisticsLambdaDs.createResolver('GetStatisticsResolver', {
            typeName: 'Query', // Matches the `Query` type in the GraphQL schema
            fieldName: 'getStatistics', // Matches the `getStatistics` field in the schema
        });

        getResultsLambdaDs.createResolver('GetResultsResolver', {
            typeName: 'Query',
            fieldName: 'getResults', // Matches the `getResults` field in the schema
        });
    }

}