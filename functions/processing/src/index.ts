import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async () => {
  const date = new Date().toISOString();
  console.log(`Function executed at: ${date}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ date }),
  };
};
