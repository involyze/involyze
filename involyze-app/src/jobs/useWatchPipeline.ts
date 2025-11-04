import {useGraphQLClient} from "../graphql/useGrapqhlClient";
import {useAuthentication} from "../auth/useAuthentication";
import type {GraphQLResult, GraphQLSubscription} from "aws-amplify/api";

export interface JobEvent {
    jobId: string;
    status: string;
    message: string;
}

export const useWatchPipeline = () => {
    const client = useGraphQLClient();
    const auth = useAuthentication();

    let subscription: any;

    const subscribe = (jobId: string, callback: (event: JobEvent) => void) => {
        const topic = client.graphql({
            query: `subscription OnJobStatusUpdated { onJobStatusUpdated(jobId: "${jobId}") { jobId status message } }`,
            authToken: auth.bearerHeader()
        }) as GraphQLSubscription<any>;

        subscription = topic.subscribe({
            next: (event : any) => {
                const updatedJob = event?.data?.onJobStatusUpdated;
                if (updatedJob) {
                    console.log(updatedJob);
                    callback(updatedJob as JobEvent);
                }
            },
            error: (error: any) => {
                console.error('Subscription error:', JSON.stringify(error, null, 2));
            }
        });
    }

    const unsubscribe = () => {
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    return {
        subscribe,
        unsubscribe,
    }
}