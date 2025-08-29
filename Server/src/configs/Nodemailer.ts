// graphMailer.ts
import fetch from 'node-fetch';
import { AuthService } from './msalAuthService';

const senderUpn = process.env.SENDER_UPN!;

export const GraphMailer = {
  async sendMail(options: {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
  }) {
    const token = await AuthService.getAccessToken();

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
        from: { emailAddress: { address: senderUpn } }, // must be valid tenant user
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
