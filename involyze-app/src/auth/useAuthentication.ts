import { useAuthTokenStorage } from './useTokenStorage';

const base64URLtoBase64 = (base64URL: string) => base64URL.replace(/-/g, '+').replace(/_/g, '/');

export const useAuthentication = () => {

  const storage = useAuthTokenStorage();

  const retrieveFromStorage = () => storage.getAuthToken().id_token ?? "";
  const isAuthenticated = () => !!retrieveFromStorage();
  const isNotAuthenticated = () => !isAuthenticated()
  const userId = () => {
    const idToken = retrieveFromStorage();

    if (!idToken) {
      return "";
    }

    const payload = base64URLtoBase64(idToken).split(".")[1];

    if(!payload) {
      return "";
    }

    const idTokenJson = atob(payload);
    const json = JSON.parse(idTokenJson);

    return json["sub"] || "";
  }

  const bearerHeader = () => `Bearer ${retrieveFromStorage()}`;

  return {
    isAuthenticated,
    isNotAuthenticated,
    bearerHeader,
    userId,
  }
}