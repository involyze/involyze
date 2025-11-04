import {Amplify} from "aws-amplify";
import {Cognito} from "../cognito/cognito";
import {generateClient} from "aws-amplify/api";

Amplify.configure({
    API: {
        GraphQL: {
            endpoint: Cognito.GraphqlApiUrlOrDefault(),
            region: 'eu-central-1',
            defaultAuthMode: "none",
        }
    }
})

export const useGraphQLClient = () => {
    return generateClient();
}