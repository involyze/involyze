declare global {
  interface Window {
    __APP_CONFIG__: {
      restApiUrl: string;
      clientId: string;
      domainName: string;
      cognitoDomain: string;
      graphqlApiUrl: string;
    };
  }
}

// This ensures the file is treated as a module
export {};
