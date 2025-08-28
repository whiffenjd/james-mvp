/**
 * graph-sendmail-test.ts
 * Send a test email via Microsoft Graph API (Client Credentials flow).
 *
 * Required envs:
 *   OAUTH_TENANT_ID, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET
 *
 * Optional envs:
 *   SENDER_UPN   - sender email (must be licensed in tenant)
 *   TO           - recipient(s), comma separated
 *   SUBJECT      - subject line
 *   BODY         - body text
 *   CONTENT_TYPE - "Text" | "HTML"
 *   SAVE_TO_SENT - "true" | "false"
 */

import fetch from 'node-fetch';

const tenantId: string = process.env.OAUTH_TENANT_ID || '';
const clientId: string = process.env.OAUTH_CLIENT_ID || '';
const clientSecret: string = process.env.OAUTH_CLIENT_SECRET || '';

const senderUpn: string = process.env.SENDER_UPN || 'sender@yourtenant.com';
const recipients: string[] = (process.env.TO || 'someone@example.com')
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);

const subject: string = process.env.SUBJECT || 'Hello from Graph API';
const body: string = process.env.BODY || 'This is a test email body.';
const contentType: 'Text' | 'HTML' = (process.env.CONTENT_TYPE as any) || 'Text';
const saveToSent: boolean = process.env.SAVE_TO_SENT === 'true' ? true : false;

async function getAccessToken(): Promise<string> {
  console.log('🔑 Requesting access token...');
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'https://graph.microsoft.com/.default');

  const res = await fetch(url, {
    method: 'POST',
    body: params,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`❌ Failed to get token: ${res.status} ${res.statusText} - ${errText}`);
  }

  const data = (await res.json()) as any;
  console.log('✅ Access token acquired.');
  return data.access_token;
}

async function sendMail(accessToken: string) {
  console.log('✉️ Preparing mail payload...');
  const mail = {
    message: {
      subject,
      body: {
        contentType,
        content: body,
      },
      toRecipients: recipients.map((address) => ({
        emailAddress: { address },
      })),
      from: {
        emailAddress: { address: senderUpn },
      },
    },
    saveToSentItems: saveToSent,
  };

  console.log('📤 Sending mail via Graph API...');
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderUpn)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mail),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`❌ Failed to send mail: ${res.status} ${res.statusText} - ${errText}`);
  }

  console.log('✅ Mail sent successfully.');
}

(async () => {
  try {
    if (!tenantId || !clientId || !clientSecret) {
      throw new Error(
        '❌ Missing required env vars: OAUTH_TENANT_ID, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET',
      );
    }
    console.log('🚀 Starting Graph API mail test...');
    console.log('Using sender:', senderUpn);
    console.log('Recipients:', recipients.join(', '));

    const token = await getAccessToken();
    await sendMail(token);
  } catch (err) {
    console.error('🔥 Error:', err);
    process.exit(1);
  }
})();
