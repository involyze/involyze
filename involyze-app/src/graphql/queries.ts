/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getJobs = /* GraphQL */ `query GetJobs {
  getJobs {
    jobId
    status
    message
    __typename
  }
}
` as GeneratedQuery<APITypes.GetJobsQueryVariables, APITypes.GetJobsQuery>;
export const getStatistics = /* GraphQL */ `query GetStatistics {
  getStatistics
}
` as GeneratedQuery<
  APITypes.GetStatisticsQueryVariables,
  APITypes.GetStatisticsQuery
>;
export const getResults = /* GraphQL */ `query GetResults($id: ID!) {
  getResults(id: $id)
}
` as GeneratedQuery<
  APITypes.GetResultsQueryVariables,
  APITypes.GetResultsQuery
>;
