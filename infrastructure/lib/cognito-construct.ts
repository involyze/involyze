import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from 'constructs';
import {aws_cloudfront as cloudfront, Duration, Fn} from 'aws-cdk-lib';
import {AppCloudfront} from "./app-cloudfront-construct";

export class InvolyzeCognito extends Construct {

  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, cloudfront: AppCloudfront, domainName: string | undefined, certificate: any, selfSignUpEnabled: boolean) {
    super(scope, id);

    const useCustomDomain = domainName && certificate;

    // Create a Cognito User Pool

    this.userPool = new cognito.UserPool(this, 'MyOtherUserPool', {
      selfSignUpEnabled: selfSignUpEnabled,
      signInAliases: {
        email: true, // Users can sign in with their email
      },
      autoVerify: {
        email: true, // Automatically verify email addresses
      },
    });

    this.userPoolDomain = useCustomDomain ? this.userPool.addDomain("MyUserPoolDomain", {
      customDomain: {
        domainName: `auth.${domainName}`,
        certificate: certificate,
      },
    }) : this.userPool.addDomain("MyUserPoolDomain", {
      cognitoDomain: {
        domainPrefix: process.env.COGNITO_PREFIX || "involyze",
      }
    })

    const cloudFrontUrl = `https://${cloudfront.distribution.domainName}`
    const cloudFrontLogin = cloudFrontUrl + "/login";
    const cloudFrontLogout = cloudFrontUrl + "/logout";

    // Define a User Pool Client with Authorization Code Flow enabled
    this.userPoolClient = new cognito.UserPoolClient(this, 'OAuth2CognitoClient', {
      userPool: this.userPool,
      generateSecret: false,
      accessTokenValidity: Duration.hours(24),
      refreshTokenValidity: Duration.hours(24),
      idTokenValidity: Duration.hours(24),
      oAuth: {
        flows: {
          authorizationCodeGrant: true, // Enable Authorization Code Grant Flow
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: ['http://localhost:5173/login', cloudFrontLogin, "https://involyze.com/login"], // Replace with your actual callback URL
        logoutUrls: ['http://localhost:5173/logout', cloudFrontLogout, "https://involyze.com/logout"], // Replace with your logout URL
      },
    });
  }
}