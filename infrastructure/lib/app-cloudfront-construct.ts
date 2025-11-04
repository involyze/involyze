import { Construct } from 'constructs';
import * as cdk from "aws-cdk-lib";
import {
    aws_certificatemanager as acm,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins, aws_route53 as route53, aws_route53_targets as targets
} from "aws-cdk-lib";
import { AppSiteBucket } from "./app-site-bucket-construct";

export class AppCloudfront extends Construct {

    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, appBucket: AppSiteBucket, domainName: string | undefined, hostedZoneId: string | undefined, certificate: acm.ICertificate | undefined) {
        super(scope, id);

        const useCustomDomain = domainName && hostedZoneId && certificate;
        const aliases = useCustomDomain ? [ `*.${domainName}` ] : [];
        const domainNames = useCustomDomain ? [ domainName ] : [];
    
        // CloudFront Distribution
        this.distribution = new cloudfront.Distribution(this, "SiteDistribution", {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessIdentity(appBucket.websiteBucket, {
                    originAccessIdentity: appBucket.websiteBucketOai,
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            defaultRootObject: "index.html",
            errorResponses: [
                {
                    httpStatus: 404,
                    responsePagePath: "/index.html",
                    responseHttpStatus: 200,
                    ttl: cdk.Duration.minutes(1),
                },
                {
                    httpStatus: 403,
                    responsePagePath: "/index.html",
                    responseHttpStatus: 200,
                    ttl: cdk.Duration.minutes(1),
                }
            ],
            domainNames: domainNames.concat(aliases),
            certificate,
        });

        if (useCustomDomain) {
            const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                hostedZoneId: hostedZoneId,
                zoneName: domainName,
            })

            new route53.ARecord(this, `AliasRecord-${domainName}`, {
                zone: hostedZone,
                recordName: domainName,
                target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
            });
            

            for (const alias of aliases) {
                new route53.ARecord(this, `AliasRecord-${alias}`, {
                    zone: hostedZone,
                    recordName: alias,
                    target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
                });
            }
        }
    }
}