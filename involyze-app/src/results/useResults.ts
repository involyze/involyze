import { useGraphQLClient } from '../graphql/useGrapqhlClient';
import { useAuthentication } from '../auth/useAuthentication';
import type { GraphQLResult } from 'aws-amplify/api';

export interface InvoiceResult {
  readonly _id: string;
  readonly jobId: string;
  readonly userId: string;
  readonly shop: string;
  readonly date: InvoiceDate;
  readonly items: InvoiceItem[];
  readonly createdAt: string;
}

export interface InvoiceDate {
  readonly date: string;
  readonly iso: boolean;
}

export interface InvoiceItem {
  readonly price: number;
  readonly quantity: number;
  readonly name: string;
}

export const useResults = () => {
  const client = useGraphQLClient();
  const auth = useAuthentication();

  const fetchMyResults = async (jobId?: string) => {
    const response = (await client.graphql({
      query: `query GetResults($userId: ID!, $jobId: String) { 
                getResults(userId: $userId, jobId: $jobId) { 
                    _id 
                    jobId 
                    userId
                    shop 
                    date { iso date } 
                    items { 
                        name 
                        quantity 
                        price 
                    } 
                    createdAt 
                } 
            }`,
      variables: {
        userId: auth.userId(),
        jobId,
      },
      authToken: auth.bearerHeader(),
    })) as GraphQLResult<any>;

    return response.data.getResults as InvoiceResult[];
  };

  return {
    fetchMyResults,
  };
};
