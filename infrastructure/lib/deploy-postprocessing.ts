import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

const cloudFormation = new AWS.CloudFormation();
const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();

async function getStackOutputs(stackName: string): Promise<Record<string, string>> {
  const response = await cloudFormation.describeStacks({ StackName: stackName }).promise();
  const outputs = response.Stacks?.[0]?.Outputs;

  if (!outputs) {
    throw new Error(`No outputs found for stack: ${stackName}`);
  }

  const result: Record<string, string> = {};
  outputs.forEach((output) => {
    if (output.OutputKey && output.OutputValue) {
      result[output.OutputKey] = output.OutputValue;
    }
  });

  return result;
}

async function readFileFromS3(bucketName: string, fileName: string): Promise<string> {
  const data = await s3
    .getObject({
      Bucket: bucketName,
      Key: fileName,
    })
    .promise();

  if (!data.Body) {
    throw new Error(`File not found: ${fileName}`);
  }

  return data.Body.toString();
}

function replacePlaceholders(fileContent: string, replacements: Record<string, string>): string {
  let updatedContent = fileContent;
  console.log(replacements)
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `{{${key}}}`;
    updatedContent = updatedContent.replace(new RegExp(placeholder, 'g'), value);
  }
  console.log(updatedContent)
  return updatedContent;
}

async function writeFileToS3(
  bucketName: string,
  fileName: string,
  fileContent: string
): Promise<void> {
  await s3
    .putObject({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: 'text/html',
    })
    .promise();

  console.log(`Updated file written to: s3://${bucketName}/${fileName}`);
}

async function invalidateCache(distributionId: string, pathPattern: string) {
  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `${Date.now()}`, // Unique reference for the invalidation request
      Paths: {
        Quantity: 1,
        Items: [pathPattern], // This can be '*' to invalidate everything
      },
    },
  };

  try {
    const data = await cloudfront.createInvalidation(params).promise();
    console.log(`Invalidation request created: ${data?.Invalidation?.Id}`);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

async function main() {
  const stackName = 'InvoiceProcessingStack';
  const fileName = 'index.html';

  try {
    console.log(`Fetching outputs for stack: ${stackName}`);
    const outputs = await getStackOutputs(stackName);
    const bucketName = outputs["FRONTENDBUCKETNAME"];

    console.log('Stack Outputs:', outputs);

    console.log(`Reading file from S3: s3://${bucketName}/${fileName}`);
    const fileContent = await readFileFromS3(bucketName, fileName);

    console.log('Replacing placeholders in the file...');
    const updatedContent = replacePlaceholders(fileContent, outputs);

    console.log(`Writing updated file back to S3: s3://${bucketName}/${fileName}`);
    await writeFileToS3(bucketName, fileName, updatedContent);

    await invalidateCache(outputs["DISTRIBUTIONID"],"/*")

    console.log('Operation completed successfully.');
  } catch (error) {
    console.error('Error during operation:', error);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
});