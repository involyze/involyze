import axios from 'axios';
import { Sha256 } from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { DynamoDBStreamEvent } from 'aws-lambda';
import * as url from 'url';
const APPSYNC_API_URL = process.env.APPSYNC_API_URL || "";
const REGION = process.env.REGION || "";

export const handler = async (event: DynamoDBStreamEvent) => {
  const mutation = `
    mutation UpdateJobStatus($id: ID!, $status: String!, $message: String) {
      notifyJobStatus(jobId: $id, status: $status, message: $message) {
        jobId
        status
        message
      }
    }
  `;

  for (const record of event.Records) {
    if (record.eventName === 'MODIFY' || record.eventName === 'INSERT') {
      const newImage = record.dynamodb?.NewImage;
      if (newImage) {
        const id = newImage.id?.S;
        const status = newImage.state?.S;
        const message = newImage.message?.S;

        if (!id || !status) {
          console.error('Missing required fields (id or status).');
          continue;
        }

        try {
          const signer = new SignatureV4({
            credentials: defaultProvider(),
            region: REGION,
            service: 'appsync',
            sha256: Sha256,
          });

          const { host, pathname } = new URL(APPSYNC_API_URL);
          const params = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: host,
            },
            body: JSON.stringify({
              query: mutation,
              variables: {
                id,
                status,
                message,
              },
              operationName: 'UpdateJobStatus',
            }),
            hostname: host,
            path: pathname,
          };
          const requestToBeSigned = new HttpRequest(params);
          console.log('requestToBeSigned', requestToBeSigned)

          // Sign the request to call mutation
          const signedRequest = await signer.sign(requestToBeSigned);

          // sending the signed request using Axios to call mutation.
          const response = await axios({
            url: APPSYNC_API_URL,
            method: signedRequest.method,
            data: signedRequest.body,
            headers: signedRequest.headers,
          });
          const { data } = response.data;
          console.log('data from the mutation', data);
          return data;
        } catch (error: any) {
          console.error('Error sending AppSync mutation:', error);
          return error;
        }
      }
    }
  }
};