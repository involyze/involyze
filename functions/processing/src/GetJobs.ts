import AWS from "aws-sdk";

interface JobStatus {
  jobId: string;
  status: string;
  message?: string;
}

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

export const handler = async (): Promise<JobStatus[]> => {
  const tableName = process.env.JOBS_TABLE;

  if (!tableName) {
    throw new Error("Environment variable JOBS_TABLE is not set.");
  }

  try {
    // Scan the DynamoDB table to retrieve all job entries
    const params = {
      TableName: tableName,
    };

    const response = await dynamoDbClient.scan(params).promise();

    // Map the results to the JobStatus type
    const jobStatuses: JobStatus[] =
      response.Items?.map((item) => ({
        jobId: item.id,
        status: item.state,
        message: item.message,
      })) || [];

    return jobStatuses;
  } catch (error) {
    console.error("Error fetching jobs from DynamoDB:", error);
    throw new Error("Failed to fetch jobs.");
  }
};