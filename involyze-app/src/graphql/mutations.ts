/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const notifyJobStatus = /* GraphQL */ `mutation NotifyJobStatus($jobId: ID!, $status: String!, $message: String) {
  notifyJobStatus(jobId: $jobId, status: $status, message: $message) {
    jobId
    status
    message
    __typename
  }
}
` as GeneratedMutation<
  APITypes.NotifyJobStatusMutationVariables,
  APITypes.NotifyJobStatusMutation
>;
