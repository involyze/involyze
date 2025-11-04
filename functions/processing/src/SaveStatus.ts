import { ProgressState, ProgressStatus } from "./shared/models";
import { writeStatusToDb } from "./shared/utils";


export const handler = async (event: any) => {
  try {
    const input = {
      id: event.Payload.id,
      userId: event.Payload.userId,
      bucketName: event.Payload.bucketName,
      filePath: event.Payload.filePath
    }
    const progressStatus: ProgressStatus = {
      id: input.id,
      timestamp: Date.now(),
      state:   process.env.PROGRESS_STATE as ProgressState,
      message: event.message || "Progress has changed to " + process.env.PROGRESS_STATE,
    };

    console.log(progressStatus);
    await writeStatusToDb(progressStatus);

    return event.Payload;
  } catch (error: any) {
    console.error("Error Saving Status:", error);
    throw new Error("Failed to report save status")
  }
};