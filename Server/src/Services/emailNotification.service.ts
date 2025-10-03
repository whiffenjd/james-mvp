import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/DbConnection';
import { UsersTable } from '../db/schema';
import { GraphMailer } from '../configs/Nodemailer';

interface NotificationData {
  entityType: string;
  action: string;
  fundName: string;
  performedByName: string;
  amount?: number;
  targetUserName?: string;
  description?: string;
}
interface EmailNotificationParams {
  userIds: string[];
  notificationData: NotificationData;
  createdBy: string;
}
//THIS IS ONLY FOR THE TARGET USER
function personalizeDescription(notification: any): string {
  const { description, entityType, action, fundName, performedByName, amount, targetUserName } =
    notification;

  if (entityType === 'capital_call') {
    if (action === 'created') {
      // Only shown to the investor being called
      return `You were requested to invest $${amount} in ${fundName} fund`;
    }
    if (action === 'approved' || action === 'rejected') {
      // Only shown to fund manager (isTargetUser will be true for fund manager)
      const actionText = action === 'approved' ? 'approved' : 'rejected';
      return `${targetUserName || 'An investor'} ${actionText} a capital call of $${amount} for ${fundName} fund`;
    }
  }

  if (entityType === 'distribution') {
    if (action === 'created') {
      // Only shown to the investor receiving distribution
      return `You received a distribution of $${amount} from ${fundName} fund`;
    }
    if (action === 'approved' || action === 'rejected') {
      // Only shown to fund manager
      const actionText = action === 'approved' ? 'approved' : 'rejected';
      return `${targetUserName || 'An investor'} ${actionText} a distribution of $${amount} for ${fundName} fund`;
    }
  }
  if (entityType === 'fund_report') {
    // Shown to all relevant users as before
    return `${performedByName} uploaded a fund report for ${fundName} fund`;
  }
  return description; // Fallback to original description
}

// Email template function
function createEmailTemplate(message: string, userName: string): string {
  const loginUrl = process.env.FRONTEND_URL;
  const brandColor = '#017776';
  const brandColorDark = '#015655';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Investment Portal Notification</title>
      <style>
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: ${brandColor};
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 15px 0;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background: ${brandColorDark};
        }
      </style>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${brandColor}; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px; color: white;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Investment Portal</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Notification Update</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid ${brandColor};">
        <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
        <p style="font-size: 16px; margin: 15px 0;">${message}</p>
            <a href="${loginUrl}" 
          class="button" 
          style="display:inline-block; padding:12px 24px; background:${brandColor}; 
                  color:#ffffff !important; text-decoration:none; border-radius:6px; 
                  font-weight:bold; margin:15px 0;">
          Log In to View Details
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #fff; border-radius: 8px; border: 1px solid #e9ecef;">
        <p style="margin: 0; color: #6c757d; font-size: 14px;">
          This is an automated notification from Investment Portal.<br>
          Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
}
// Main email notification function
async function sendEmailNotifications({
  userIds,
  notificationData,
  createdBy,
}: EmailNotificationParams): Promise<void> {
  try {
    // Fetch user details for the notification recipients
    const users = await db
      .select({
        id: UsersTable.id,
        name: UsersTable.name,
        email: UsersTable.email,
      })
      .from(UsersTable)
      .where(inArray(UsersTable.id, userIds));

    if (users.length === 0) {
      console.log('No users found for email notifications');
      return;
    }

    // Send emails to each user
    const emailPromises = users.map(async (user) => {
      try {
        // const isTargetUser = user.id === createdBy;
        const personalizedMessage = personalizeDescription(notificationData);
        const emailHtml = createEmailTemplate(personalizedMessage, user.name);

        const subject = `Investment Portal - ${
          notificationData.entityType === 'capital_call'
            ? 'Capital Call'
            : notificationData.entityType === 'distribution'
              ? 'Distribution'
              : notificationData.entityType === 'fund_report'
                ? 'Fund Report'
                : 'Notification'
        } Update`;

        await GraphMailer.sendMail({
          from: process.env.SENDER_UPN!,
          to: user.email,
          subject: subject,
          html: emailHtml,
        });

        console.log(`Email notification sent to ${user.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
      }
    });

    await Promise.allSettled(emailPromises);
  } catch (error) {
    console.error('Error in sendEmailNotifications:', error);
  }
}

// Async wrapper to handle notifications without blocking API
export function triggerEmailNotifications(params: EmailNotificationParams): void {
  process.nextTick(async () => {
    await sendEmailNotifications(params);
  });
}

export { sendEmailNotifications, EmailNotificationParams, NotificationData };
