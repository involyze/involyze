/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type JobStatus = {
  __typename: "JobStatus",
  jobId: string,
  status: string,
  message?: string | null,
};

export type NotifyJobStatusMutationVariables = {
  jobId: string,
  status: string,
  message?: string | null,
};

export type NotifyJobStatusMutation = {
  notifyJobStatus:  {
    __typename: "JobStatus",
    jobId: string,
    status: string,
    message?: string | null,
  },
};

export type GetJobsQueryVariables = {
};

export type GetJobsQuery = {
  getJobs?:  Array< {
    __typename: "JobStatus",
    jobId: string,
    status: string,
    message?: string | null,
  } | null > | null,
};

export type GetStatisticsQueryVariables = {
};

export type GetStatisticsQuery = {
  getStatistics?: string | null,
};

export type GetResultsQueryVariables = {
  id: string,
};

export type GetResultsQuery = {
  getResults?: string | null,
};

export type OnJobStatusUpdatedSubscriptionVariables = {
  jobId: string,
};

export type OnJobStatusUpdatedSubscription = {
  onJobStatusUpdated?:  {
    __typename: "JobStatus",
    jobId: string,
    status: string,
    message?: string | null,
  } | null,
};
