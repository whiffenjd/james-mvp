import { GraphMailer } from '../configs/Nodemailer';
import { otpTemplate } from './OtpEmailVerifyTemplate';
import { resetTemplate } from './PasswordResetTempalte';
import dotenv from 'dotenv';

dotenv.config();
export const sendResetPasswordEmail = async (
  email: string,
  token: string,
  name: string,
  subdomain: string,
) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173/';
  const url = new URL(frontendUrl);

  // Insert subdomain only if it exists
  let host = url.host; // e.g. "localhost:5173"
  if (subdomain) {
    host = `${subdomain}.${host}`; // → "fund1.localhost:5173"
  }

  const resetLink = `${url.protocol}//${host}/reset-password?token=${token}&email=${email}`;

  try {
    await GraphMailer.sendMail({
      from: process.env.SENDER_UPN!, // Graph requires this to be a valid tenant user
      to: email,
      subject: 'Reset your password',
      html: resetTemplate(email, resetLink, name),
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
