import { transporter } from '../configs/Nodemailer';
import { otpTemplate } from './OtpEmailVerifyTemplate';
import { resetTemplate } from './PasswordResetTempalte';
import dotenv from 'dotenv';

dotenv.config();
export const sendResetPasswordEmail = async (email: string, token: string, name: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Investment Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: resetTemplate(email, resetLink, name),
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
