

interface AuthToken {
  readonly access_token: string;
  readonly id_token: string;
  readonly refresh_token: string;
}

export const useAuthTokenStorage = () => {

  const getAuthToken = () => {
    const json = sessionStorage.getItem("authToken") ?? "{}"

    try {
      return JSON.parse(json) as AuthToken;
    } catch (e) {
      console.debug("failed to read auth token");
      return {} as AuthToken;
    }

  };
  const setAuthToken = (tokenJson: string) => sessionStorage.setItem("authToken", tokenJson);

  return {
    getAuthToken,
    setAuthToken
  }
}