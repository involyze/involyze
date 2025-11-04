import { ProgressStatus } from "./models";
import AWS from "aws-sdk";


/**
 * Writes the given ProgressStatus to DynamoDB.
 * @param {ProgressStatus} status - The progress status to write.
 * @returns {Promise<void>} A promise that resolves when the operation completes.
 */
async function writeStatusToDb(status: ProgressStatus): Promise<void> {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    const TABLE_NAME = process.env.JOBS_TABLE || "Jobs";

    const params = {
        TableName: TABLE_NAME,
        Item: {
            id: status.id,
            timestamp: status.timestamp,
            state: status.state,
            message: status.message,
        },
    };

    try {
        await dynamoDb.put(params).promise();
        console.log("Status written to DynamoDB successfully:", status);
    } catch (error) {
        console.error("Error writing status to DynamoDB:", error);
        throw new Error("Failed to write status to DynamoDB.");
    }
}

export { writeStatusToDb };
