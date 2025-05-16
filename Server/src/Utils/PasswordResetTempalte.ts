export const resetTemplate = (
  otp: string,
  resetLink: string,
  name: string
): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 0;
      margin: 0;
      background-color: #f8f8f8;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color:rgb(20, 168, 84); /* Sea Green */
      padding: 25px 30px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .content {
      background-color: white;
      padding: 35px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 15px;
      color:rgb(22, 112, 61); /* Sea Green */
      font-weight: 600;
    }
    .message {
      margin-bottom: 30px;
      line-height: 1.6;
      color: #555;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .reset-link {
      display: inline-block;
      padding: 14px 30px;
      background-color: #2e8b57; /* Sea Green */
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    
      font-size: 16px;
      transition: background-color 0.3s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
       .reset-link2 {
      display: inline-block;
      padding: 14px 30px;
      background-color:rgb(255, 255, 255);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    
      font-size: 16px;
      transition: background-color 0.3s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .reset-link:hover {
      background-color: #3cb371; /* Medium Sea Green - slightly lighter for hover */
    }
    .otp-container {
      margin: 25px 0;
      text-align: center;
    }
    .otp-label {
      display: block;
      margin-bottom: 10px;
      color: #666;
      font-size: 14px;
    }
    .otp-code {
      font-size: 24px;
      letter-spacing: 3px;
      background-color: #f0f9f0; /* Light green background */
      color: #2e8b57;
      padding: 12px 20px;
      border-radius: 5px;
      font-weight: bold;
      display: inline-block;
      border: 1px dashed #2e8b57;
    }
    .expire-notice {
      margin-top: 20px;
      font-size: 14px;
      color: #777;
      text-align: center;
      font-style: italic;
    }
    .footer {
      background-color: #f0f9f0; /* Light green background */
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e0f0e0;
    }
    .security-notice {
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
    .company-name {
      margin-top: 15px;
      color: #2e8b57;
      font-weight: 600;
      font-size: 14px;
    }
    /* Responsive adjustments */
    @media screen and (max-width: 480px) {
      .container {
        margin: 10px;
      }
      .header, .content, .footer {
        padding: 20px 15px;
      }
      .reset-link {
        padding: 12px 20px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name},</div>
      <div class="message">
        We received a request to reset your password. To continue with the password reset process, please click the button below.
      </div>
      
      <div class="button-container">
        <a class="reset-link" href="${resetLink}">Reset My Password</a>
      </div>
  
        <a class="reset-link2" href="${resetLink}">${resetLink}</a>

      
      <div class="otp-container">
        <span class="otp-label">Your Email:</span>
        <div class="otp-code">${otp}</div>
      </div>
      
      
    </div>
    <div class="footer">
      <div class="security-notice">
        For security reasons, please do not share this email, link, or verification code with anyone. If you didn't request a password reset, please disregard this email or contact our support team.
      </div>
      <div class="company-name">James White label Team</div>
    </div>
  </div>
</body>
</html>
`;
