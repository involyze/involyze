import { DatabaseService } from './shared/database-service';
export const handler = async (event: any) => {
  // Assuming `event` contains the `Invoice` object with `shop` and `items` as described in OCRStep
  const input = {
    id: event.Payload.id,
    userId: event.Payload.userId,
    bucketName: event.Payload.bucketName,
    filePath: event.Payload.filePath,
    invoice: event.Payload.invoice,
  };

  const invoice = input.invoice;

  // Validate
  if (
    !invoice.shop ||
    !Array.isArray(invoice.items) ||
    invoice.items.length === 0
  ) {
    throw new Error('Invalid invoice data. Shop name or items missing.');
  }

  invoice.createdAt = new Date().toISOString();

  try {
    const collection = await DatabaseService.connectToInvoices();
    const result = await collection.insertOne(invoice);
    //We do not need the invoice
    delete input.invoice;
    return input;
  } catch (error: any) {
    console.error('Error inserting invoice data:', error);
    throw new Error('Failed to store invoice data.');
  }
};
