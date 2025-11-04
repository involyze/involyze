import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

const INVOICE_BUCKET = process.env.INVOICE_BUCKET;


export const handler = async (event: any) => {
  const bucket = INVOICE_BUCKET;
  const userId = event.requestContext.authorizer.claims.sub;
  const filePath = userId + "/" + crypto.randomUUID()
  const s3 = new S3Client({ region: "eu-central-1" });
  const command = new PutObjectCommand({ Bucket: bucket, Key: filePath });
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET"
    },
    body: JSON.stringify({
      "uploadUrl": signedUrl,
      "jobId": filePath
    })
  };
}