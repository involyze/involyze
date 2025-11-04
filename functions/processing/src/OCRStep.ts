import {
  AnalyzeExpenseCommand,
  TextractClient,
} from '@aws-sdk/client-textract';
import * as chrono from 'chrono-node';
import { Invoice, Item } from './shared/models';

const INVOICE_BUCKET = process.env.INVOICE_BUCKET;

export const handler = async (event: any) => {
  const input = {
    id: event.Payload.id,
    userId: event.Payload.userId,
    bucketName: event.Payload.bucketName,
    filePath: event.Payload.filePath,
  };

  const client = new TextractClient();

  console.log(event);

  const docInput = {
    Document: {
      S3Object: {
        Bucket: INVOICE_BUCKET,
        Name: input.filePath,
      },
    },
  };
  try {
    const command = new AnalyzeExpenseCommand(docInput);
    const response: any = await client.send(command);

    const items: Array<Item> = [];
    const shopNames = [];
    const dates = [];
    for (const expenseDocument of response.ExpenseDocuments) {
      for (const lineItemGroup of expenseDocument.LineItemGroups) {
        for (const lineItem of lineItemGroup.LineItems) {
          const item: Item = {
            name: undefined!,
            quantity: undefined,
            price: undefined,
          };
          for (const expenseField of lineItem.LineItemExpenseFields) {
            switch (expenseField.Type.Text) {
              case 'ITEM':
                item.name = expenseField.ValueDetection.Text.replace('\n', ' ');
                break;
              case 'QUANTITY':
                const numbers =
                  expenseField.ValueDetection.Text.match(/[-+]?\d*\.?\d+/);
                if (numbers && numbers.length > 0) {
                  item.quantity = +numbers[0];
                }
                break;
              case 'PRICE':
                item.price = +expenseField.ValueDetection.Text.replace(
                  ',',
                  '.',
                ).replace(/[^\d.]+/g, '');
                break;
            }
          }
          if (item.name !== undefined) {
            items.push(item);
          }
        }
      }
      for (const summaryField of expenseDocument.SummaryFields) {
        if (
          summaryField.GroupProperties?.[0].Types.includes('VENDOR') &&
          summaryField.Type.Text === 'NAME'
        ) {
          shopNames.push({
            confidence: summaryField.Type.Confidence,
            value: summaryField.ValueDetection.Text,
          });
        } else if (summaryField.Type.Text === 'INVOICE_RECEIPT_DATE') {
          dates.push({
            confidence: summaryField.Type.Confidence,
            value: parseDate(summaryField.ValueDetection.Text),
          });
        }
      }
    }

    const shop = shopNames.reduce(
      (max, item) => (item.confidence > max.confidence ? item : max),
      shopNames[0] ?? undefined,
    )?.value;

    const date = dates.reduce(
      (max, item) => (item.confidence > max.confidence ? item : max),
      dates[0] ?? undefined,
    )?.value;

    (input as any).invoice = {
      userId: input.userId,
      jobId: input.id,
      shop,
      date,
      items,
    };


    if(!shop ||
      !Array.isArray(items) ||
      items.length === 0) {
      (input as any).success = false;
    } else {
      (input as any).success = true;
    }
  } catch (e: any)  {
    console.error("Error processing invoice", e);
    (input as any).success = false;
  }

  return input;
};

function parseDate(
  dateString: string,
  retry: boolean = true,
): { iso: boolean; date: string } {
  // Try to parse as english format
  let date = chrono.parseDate(dateString);
  if (date) {
    return {
      iso: true,
      date: date.toISOString(),
    };
  }

  // Try to parse as german format
  date = chrono.de.parseDate(dateString);
  if (date) {
    return {
      iso: true,
      date: date.toISOString(),
    };
  }

  // Convert dates like `12 Jänner 2024` to `12. Jänner 2024`
  if (retry && /^\d{1,2}/.test(dateString)) {
    let date = parseDate(dateString.replace(/^(\d{1,2})/, '$1.'), false);
    if (date.iso) {
      return date;
    }
  }

  // Fallback if we cannot parse it
  return {
    iso: false,
    date: dateString,
  };
}
