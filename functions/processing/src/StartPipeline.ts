import {SFNClient, StartExecutionCommand} from "@aws-sdk/client-sfn";
import {S3Event} from "aws-lambda";

const STEP_FUNCTION = process.env.STEP_FUNCTION;


export const handler = async (event: S3Event) => {
    const client = new SFNClient({ region: "eu-central-1"});

    const fileDescriptor = event.Records[0].s3;
    const bucketName = fileDescriptor.bucket.name;
    const filePath = fileDescriptor.object.key;
    const userId = filePath.split("/")[0];

    const input = {
        Payload: {
            id: filePath,
            userId,
            bucketName,
            filePath
        }
    }

    console.log(input);

    const command = new StartExecutionCommand({
        stateMachineArn: STEP_FUNCTION,
        input: JSON.stringify(input),
    });

    const response = await client.send(command);
    console.log("Step Function started successfully:", response);
}