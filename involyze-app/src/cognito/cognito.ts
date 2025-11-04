// src/cognito.ts
export const Cognito = {
  // CAUTION: If the stack is deleted and recreated you need to change the defaults
  RestApiUrlOrDefault: () =>
    environmentValueOrDefault(
      window.__APP_CONFIG__.restApiUrl,
      '{{UPLOADAPIURL}}',
      'https://<<ANONYMIZED>>.execute-api.eu-central-1.amazonaws.com/prod/',
    ),
  ClientIdOrDefault: () =>
    environmentValueOrDefault(
      window.__APP_CONFIG__.clientId,
      '{{CLIENTID}}',
      '<<ANONYMIZED>>',
    ),
  DomainNameOrEmpty: () =>
    environmentValueOrDefault(
      window.__APP_CONFIG__.domainName,
      '{{DOMAINNAME}}',
      '',
    ),
  UserPoolDomainOrDefault: () =>
    environmentValueOrDefault(
      window.__APP_CONFIG__.cognitoDomain,
      '{{USERPOOLDOMAIN}}',
      'involyze',
    ),
  GraphqlApiUrlOrDefault: () =>
    environmentValueOrDefault(
      window.__APP_CONFIG__.graphqlApiUrl,
      '{{GRAPHQLURL}}',
      'https://<<ANONYMIZED>>.appsync-api.eu-central-1.amazonaws.com/graphql',
    ),
};

const environmentValueOrDefault = (
  environmentValue: string,
  placeholder: string,
  defaultValue: string,
) => {
  if (environmentValue == placeholder) {
    return defaultValue;
  }
  return environmentValue;
};
