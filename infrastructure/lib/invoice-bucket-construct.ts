import {Construct} from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import {HttpMethods} from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";

export class InvoiceBucket extends Construct {

    public readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.bucket = new s3.Bucket(this, "InvolyzeBucket", {
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            cors: [
                {
                    allowedMethods: [HttpMethods.PUT, HttpMethods.GET, HttpMethods.POST],
                    allowedOrigins: ["*"],
                    allowedHeaders: ["*"],
                    exposedHeaders: []
                }
            ]
        });
    }

}