import {useAuthentication} from "../auth/useAuthentication";
import {Cognito} from "../cognito/cognito";

export interface PresignedUrlResponse {
    readonly uploadUrl: string;
    readonly jobId: string;
}

export const useUpload = () => {
    const auth = useAuthentication();

    const fetchPreSignedUrl = async () => {
        const baseUrl = Cognito.RestApiUrlOrDefault();
        const uploadUrl = baseUrl + "upload-document";
        const result = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Authorization": auth.bearerHeader()
            }
        });

        const json = await result.json();
        return json as PresignedUrlResponse;
    }

    const uploadFile = async (file: File, uploadUrl: string) => {
        await fetch(uploadUrl, {
            method: "PUT",
            body: file,
        });
    }

    return { uploadFile, fetchPreSignedUrl };
}