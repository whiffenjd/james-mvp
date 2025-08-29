import { ConfidentialClientApplication } from '@azure/msal-node';

const tenantId = process.env.OAUTH_TENANT_ID!;
const clientId = process.env.OAUTH_CLIENT_ID!;
const clientSecret = process.env.OAUTH_CLIENT_SECRET!;

const authority = `https://login.microsoftonline.com/${tenantId}`;

const msalClient = new ConfidentialClientApplication({
  auth: {
    clientId,
    authority,
    clientSecret, // ✅ replace with cert in prod for best practice
  },
});

// Centralized AuthService
export const AuthService = {
  async getAccessToken() {
    const result = await msalClient.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!result || !result.accessToken) {
      throw new Error('Failed to acquire access token via MSAL');
    }

    return result.accessToken;
  },
};
