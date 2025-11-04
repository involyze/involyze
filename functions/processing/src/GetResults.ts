import { DatabaseService } from './shared/database-service';

export const handler = async (event: any) => {
  const { userId, jobId }: { userId: string; jobId: string | undefined } =
    event.arguments;

  try {
    const collection = await DatabaseService.connectToInvoices();
    const filter: any = { userId };
    if (jobId) {
      filter.jobId = jobId;
    }
    const result = await collection.find(filter).toArray();

    // GraphQL expects raw data
    return result;
  } catch (error: any) {
    console.error('Error retrieving processing result data:', error);

    // Throw error to AppSync
    throw new Error('Failed to retrieve processing result');
  }
};
