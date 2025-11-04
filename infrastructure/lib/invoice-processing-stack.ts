import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as path from 'path';
import { InvolyzeCognito } from './cognito-construct';
import * as cdk from 'aws-cdk-lib';
import {AppSiteBucket} from "./app-site-bucket-construct";
import {AppCloudfront} from "./app-cloudfront-construct";
import {InvoiceBucket} from "./invoice-bucket-construct";
import {DocumentDB} from "./document-db-construct";
import {DocumentPipeline} from "./document-pipeline-construct";
import {DocumentRestApi} from "./document-rest-api";
import {DocumentDynamo} from "./document-dynamo";
import {DocumentGraphqlApi} from "./document-graphql-api";
import { 
  aws_certificatemanager as acm,
  Duration } 
from 'aws-cdk-lib';

export class InvoiceProcessingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const region = process.env.AWS_REGION || "eu-central-1"
    const selfSignUpEnabled = process.env.COGNITO_SELF_SIGNUP_ENABLED === "true"

    const domainName = process.env.DOMAIN_NAME || undefined;
    const hostedZoneId = process.env.HOSTED_ZONE_ID || undefined;
    const certificateArn = process.env.CERTIFICATE_ARN || undefined;
    const useCustomDomain = domainName && hostedZoneId && certificateArn;

    console.log(`${useCustomDomain ? 'Using custom domain' : 'Not using custom domain, since env var(s) empty' }:
        ${domainName}', hosted zone: '${hostedZoneId}', certificate: '${certificateArn}'`);

    const certificate = useCustomDomain ? acm.Certificate.fromCertificateArn(this, 'SiteCertificate', certificateArn) : undefined;

    // web
    const websiteBucket = new AppSiteBucket(this, "WebsiteBucket");
    const cloudfront = new AppCloudfront(this, "Cloudfront", websiteBucket, domainName, hostedZoneId, certificate);
    const cognito = new InvolyzeCognito(this, "InvolyzeCognito", cloudfront, domainName, certificate, selfSignUpEnabled);
    const invoiceBucket = new InvoiceBucket(this, "InvolyzeBucket");
    const restApi = new DocumentRestApi(this, "DocumentUpload", invoiceBucket, cognito);


    // processing
    const dynamoDB = new DocumentDynamo(this, "DynamoDB");
    const documentDB = new DocumentDB(this, "DocumentDB");
    const documentPipeline = new DocumentPipeline(this, "DocumentPipeline", invoiceBucket, documentDB, dynamoDB);
    const graphQlAndAppSync = new DocumentGraphqlApi(this, "DocumentGraphqlApi", region, cognito, documentDB, dynamoDB);


    //Outputs for Postprocessing
    new cdk.CfnOutput(this, 'USERPOOLID', {
      value: cognito.userPool.userPoolId,
      description: 'USERPOOLID for replacement',
    });

    new cdk.CfnOutput(this, 'DISTRIBUTIONDOMAIN', {
      value: cloudfront.distribution.domainName,
      description: 'DISTRIBUTIONDOMAIN for hosting',
    });

    if (useCustomDomain) {
      new cdk.CfnOutput(this, 'DOMAINNAME', {
        value: domainName,
        description: 'DOMAINNAME for replacement',
      });
    }
    
    new cdk.CfnOutput(this, 'USERPOOLDOMAIN', {
      value: cognito.userPoolDomain.domainName,
      description: 'USERPOOLDOMAIN for replacement',
    });

    new cdk.CfnOutput(this, 'CLIENTID', {
      value: cognito.userPoolClient.userPoolClientId,
      description: 'CLIENTID for replacement',
    });

    new cdk.CfnOutput(this, 'DISTRIBUTIONID', {
      value: cloudfront.distribution.distributionId,
      description: 'The ID of the CloudFront Distribution for replacement',
    });

    new cdk.CfnOutput(this, 'FRONTENDBUCKETNAME', {
      value: websiteBucket.websiteBucket.bucketName,
      description: 'The bucket name of the bucket where the static site is hosted',
    });

    new cdk.CfnOutput(this, 'UPLOADAPIURL', { value: restApi.api.url });

    new cdk.CfnOutput(this, 'GRAPHQLURL', { value: graphQlAndAppSync.api.graphqlUrl });
  }
}

export function createTask(
  scope: Construct,
  id: string,
  vpc: ec2.IVpc|undefined = undefined,
  environment:  {[p: string]: string} = {},
  altId: string | undefined = undefined
): [tasks.LambdaInvoke, lambda.Function] {
  if (!altId)  {
    altId = id
  }
  const lambdaFunction = new lambda.Function(scope, altId, {
    runtime: lambda.Runtime.NODEJS_22_X,
    handler: `${id}.handler`,
    code: lambda.Code.fromAsset(
      path.join(__dirname, '../../functions/processing/dist'),
    ),
    vpc: vpc,
    environment: environment,
    timeout: Duration.seconds(10)
  });

  const task = new tasks.LambdaInvoke(scope, `${altId}Task`, {
    lambdaFunction: lambdaFunction,
  });

  return [task, lambdaFunction];
}
