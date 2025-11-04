<script>
  import { useAuthentication } from './useAuthentication';
  import { useCurrentRouteSvelte, useRouter } from '../routing/useCurrentRoute.svelte';
  import { useAuthTokenStorage } from './useTokenStorage';
  import { Cognito } from '../cognito/cognito';

  const route = useCurrentRouteSvelte();
  const router= useRouter();
  const authentication = useAuthentication();
  const tokenStorage = useAuthTokenStorage();

  const clientId= Cognito.ClientIdOrDefault();

  const domainName = Cognito.DomainNameOrEmpty();
  const cognitoBaseUrl = domainName !== '' ? `https://auth.${domainName}` : `https://${Cognito.UserPoolDomainOrDefault()}.auth.eu-central-1.amazoncognito.com`; 
  const cognitoAuthUrl = cognitoBaseUrl + "/oauth2/authorize"
  const cognitoTokenUrl = cognitoBaseUrl + "/oauth2/token"
  const redirectUrl = window.origin + window.location.pathname;

  if (route.queryParams.has("code")) {

    const authorizationCode = route.queryParams.get("code") ?? "";

    const acquireAuthToken = async () => {
      const result = await fetch(cognitoTokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "grant_type": "authorization_code",
          "client_id": clientId,
          "redirect_uri": redirectUrl,
          "code": authorizationCode
        })
      });

      if (!result.ok) {
        console.debug("Could not exchange code for access token");
        router.navigate(window.origin);
      }

      const bodyText = await result.text();
      tokenStorage.setAuthToken(bodyText);

      router.navigate(window.origin);
    }

    acquireAuthToken();



  } else if (authentication.isNotAuthenticated()) {
    const params = new URLSearchParams();
    params.append("response_type", "code");
    params.append("client_id", clientId);
    params.append("redirect_uri", redirectUrl);

    router.navigate(
      cognitoAuthUrl,
      params
    )
  }

</script>

<div>
</div>