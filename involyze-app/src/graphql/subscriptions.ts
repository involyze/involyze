/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onJobStatusUpdated = /* GraphQL */ `subscription OnJobStatusUpdated($jobId: ID!) {
  onJobStatusUpdated(jobId: $jobId) {
    jobId
    status
    message
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnJobStatusUpdatedSubscriptionVariables,
  APITypes.OnJobStatusUpdatedSubscription
>;
