import {Construct} from 'constructs';
import {aws_apigateway} from "aws-cdk-lib";
import {createTask} from "./invoice-processing-stack";
import {InvoiceBucket} from "./invoice-bucket-construct";
import {InvolyzeCognito} from "./cognito-construct";
import {AuthorizationType, Cors} from "aws-cdk-lib/aws-apigateway";

export class DocumentRestApi extends Construct {

    public readonly api: aws_apigateway.RestApi

    constructor(
        scope: Construct,
        id: string,
        invoiceBucket: InvoiceBucket,
        cognito: InvolyzeCognito
    ) {
        super(scope, id);

        // register upload lambda
        const [uploadTask, uploadFunction] = createTask(this, 'Upload', undefined, {INVOICE_BUCKET: invoiceBucket.bucket.bucketName,});
        invoiceBucket.bucket.grantPut(uploadFunction);

        const cognitoAuthorizer = new aws_apigateway.CognitoUserPoolsAuthorizer(this, "InvolyzeRestApiAuthorizer", {
            cognitoUserPools: [cognito.userPool],
        });

        // expose lambda via api gateway
        this.api = new aws_apigateway.RestApi(this, "DocumentUploadApi");
        const uploadResource = this.api.root.addResource('upload-document', {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS, // the endpoint is bearer protected thus we dont need to care about cors here
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: Cors.DEFAULT_HEADERS
            },
        });
        uploadResource.addMethod("POST", new aws_apigateway.LambdaIntegration(uploadFunction), {
            // protect with cognito
            authorizer: cognitoAuthorizer,
        });
    }

}