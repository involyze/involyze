import { DatabaseService } from './shared/database-service';
import { StatisticsGranularity } from './shared/models';

export const handler = async (event: any) => {
  const {
    granularity,
    userId,
  }: { granularity: StatisticsGranularity; userId: string } = event.arguments;

  try {
    const collection = await DatabaseService.connectToInvoices();

    // Define the aggregation pipeline
    let groupByField;

    // Define the date format or range to group by
    switch (granularity) {
      case 'Week':
        groupByField = {
          $isoWeek: { $dateFromString: { dateString: '$date.date' } },
        };
        break;
      case 'Month':
        groupByField = {
          $month: { $dateFromString: { dateString: '$date.date' } },
        };
        break;
      case 'Day':
      default:
        groupByField = {
          $dayOfYear: { $dateFromString: { dateString: '$date.date' } },
        };
        break;
    }

    const result = await collection
      .aggregate([
        {
          $match: {
            userId: userId, // Filter by userId
            'date.iso': true, // Filter out invoices with iso = false
          },
        },
        {
          $project: {
            date: 1, // Keep the date
            items: 1, // Keep the items
          },
        },
        {
          $unwind: '$items', // Unwind the items array to sum their expenses
        },
        {
          $group: {
            _id: groupByField, // Group by the selected granularity (Day, Week, or Month)
            date: { $first: '$date' },
            totalExpenses: { $sum: '$items.price' },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by the grouping field (date)
        },
      ])
      .toArray();

    // GraphQL expects raw data
    return result;
  } catch (error: any) {
    console.error('Error retrieving statistics data:', error);

    // Throw error to AppSync
    throw new Error('Failed to retrieve processing result');
  }
};
