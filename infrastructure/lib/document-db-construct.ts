import {Construct} from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import {
    aws_cloudfront as cloudfront,
} from 'aws-cdk-lib';
import path from "path";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as docdb from "aws-cdk-lib/aws-docdb";

export class DocumentDB extends Construct {

    public readonly dbSecret: secretsmanager.Secret;
    public readonly cluster: docdb.DatabaseCluster;
    public readonly vpc: ec2.Vpc;
    public readonly dbEnvironment;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // This is needed as DocumentDB is not publicly accessibly
        this.vpc = new ec2.Vpc(this, 'DocumentDBVpc', {
            maxAzs: 2,
        });

        // This is needed as DocumentDB is not publicly accessibly
        const securityGroup = new ec2.SecurityGroup(this, 'DocumentDBSecurityGroup', {
            vpc: this.vpc,
            allowAllOutbound: true,
        });
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(27017), 'Allow MongoDB traffic');

        this.dbSecret = new secretsmanager.Secret(this, 'DbCredentialsSecret', {
            secretName: 'db-credentials',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: 'documentman',
                }),
                generateStringKey: 'password',
                excludeCharacters: '/@"\'\\',
            },
        });

        // Set up a "cheap" cluster for the document db
        this.cluster = new docdb.DatabaseCluster(this, 'DocumentDBCluster', {
            masterUser: {
                username: this.dbSecret.secretValueFromJson('username').unsafeUnwrap(),
                password: this.dbSecret.secretValueFromJson('password'),
            },
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
            vpc: this.vpc,
            securityGroup,
            instances: 1,
        });

        this.dbEnvironment = {
            DB_URI: this.cluster.clusterEndpoint.socketAddress,
        }
    }

}