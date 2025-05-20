import { transporter } from '../configs/Nodemailer';
import { otpTemplate } from './OtpEmailVerifyTemplate';
import { resetTemplate } from './PasswordResetTempalte';

export const sendResetPasswordEmail = async (email: string, token: string, name: string) => {
  const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${email}`;
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
