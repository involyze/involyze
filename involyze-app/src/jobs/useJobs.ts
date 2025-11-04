import {getJobs} from "../graphql/queries";
import {useAuthentication} from "../auth/useAuthentication";
import {useGraphQLClient} from "../graphql/useGrapqhlClient";


export const useJobs = () => {
    const client = useGraphQLClient();
    const auth = useAuthentication();

    const fetchJobs = async () => {
        const jobs = await client.graphql({
            query: getJobs,
            authToken: auth.bearerHeader(),
        });

        const payload = jobs.data.getJobs
        console.log(payload);

        return;
    }

    return {
        fetchJobs
    }
}