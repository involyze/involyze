import * as cdk from 'aws-cdk-lib';
import { InvoiceProcessingStack } from '../lib/invoice-processing-stack';

const app = new cdk.App();
new InvoiceProcessingStack(app, 'InvoiceProcessingStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1',
  },
});
