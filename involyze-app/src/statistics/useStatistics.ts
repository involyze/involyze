import { useGraphQLClient } from '../graphql/useGrapqhlClient';
import { useAuthentication } from '../auth/useAuthentication';
import type { InvoiceDate } from 'src/results/useResults';

export interface StatisticResult {
  readonly _id: string;
  readonly date: InvoiceDate;
  readonly totalExpenses: number;
}

export type StatisticsGranularity = 'Day' | 'Month' | 'Week';

export const useStatistics = () => {
  const client = useGraphQLClient();
  const auth = useAuthentication();

  const fetchMyStatistics = async (granularity: StatisticsGranularity) => {
    const response = await client.graphql({
      query: `query GetStatistics($userId: ID!, $granularity: String!) { 
                getStatistics(userId: $userId, granularity: $granularity) { 
                    _id
                    date {
                        iso
                        date
                    }
                    totalExpenses
                } 
            }`,
      variables: {
        userId: auth.userId(),
        granularity,
      },
      authToken: auth.bearerHeader(),
    });

    return response.data.getStatistics as StatisticResult[];
  };

  return {
    fetchMyStatistics: fetchMyStatistics,
  };
};
