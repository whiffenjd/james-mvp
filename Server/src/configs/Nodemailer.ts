import fetch from 'node-fetch';

const tenantId = process.env.OAUTH_TENANT_ID!;
const clientId = process.env.OAUTH_CLIENT_ID!;
const clientSecret = process.env.OAUTH_CLIENT_SECRET!;
const senderUpn = process.env.SENDER_UPN!;

async function getAccessToken() {
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'https://graph.microsoft.com/.default');

  const res = await fetch(url, { method: 'POST', body: params });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

export const transporter = {
  async sendMail(options: {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
  }) {
    const token = await getAccessToken();

    const recipients = (Array.isArray(options.to) ? options.to : [options.to]).map((addr) => ({
      emailAddress: { address: addr },
    }));

    const mail = {
      message: {
        subject: options.subject,
        body: {
          contentType: options.html ? 'HTML' : 'Text',
          content: options.html || options.text || '',
        },
        toRecipients: recipients,
        from: { emailAddress: { address: senderUpn } }, // Graph only accepts a valid tenant user
      },
      saveToSentItems: true,
    };

    const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderUpn)}/sendMail`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mail),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Graph sendMail failed: ${res.status} ${res.statusText}\n${body}`);
    }

    console.log('✅ Mail sent via Microsoft Graph');
  },
};
