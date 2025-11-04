import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import {
    aws_cloudfront as cloudfront,
} from 'aws-cdk-lib';
import path from "path";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";

export class AppSiteBucket extends Construct {

    public readonly websiteBucket: s3.Bucket;
    public readonly websiteBucketOai: cloudfront.OriginAccessIdentity;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create an Origin Access Identity
        this.websiteBucketOai = new cloudfront.OriginAccessIdentity(this, 'OAI');

        this.websiteBucket = new s3.Bucket(this, "SiteBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "index.html",
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

        // Grant the OAI access to the bucket
        this.websiteBucket.addToResourcePolicy(
            new iam.PolicyStatement({
                actions: ['s3:GetObject'],
                resources: [`${this.websiteBucket.bucketArn}/*`],
                principals: [new iam.CanonicalUserPrincipal(this.websiteBucketOai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
            }),
        );

        // Deploy static files to S3
        const frontendPath = path.join(__dirname, '../../involyze-app/dist')
        new s3Deployment.BucketDeployment(this, "DeploySvelteApp", {
            sources: [s3Deployment.Source.asset(frontendPath)], // Path to your Svelte build output
            destinationBucket: this.websiteBucket,
        });
    }

}