export const otpTemplate = (otp: string, name: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #124d25;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-weight: 600;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .greeting {
      font-size: 20px;
      margin-bottom: 20px;
      color: #124d25;
      font-weight: 500;
    }
    .message {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 25px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 5px;
      background-color: #f0f7f1;
      color: #124d25;
      padding: 15px 25px;
      border-radius: 6px;
      margin: 15px 0 25px;
      display: inline-block;
      border: 1px dashed #124d25;
    }
    .footer {
      background-color: #f0f7f1;
      padding: 15px;
      text-align: center;
      font-size: 14px;
      color: #666666;
      border-top: 3px solid #124d25;
    }
    .expire-notice {
      font-size: 15px;
      color: #666666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>Verification Required</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello ${name},</div>
        <div class="message">Thank you for your request. Please use the verification code below:</div>
        <div class="otp-code">${otp}</div>
        <div class="expire-notice">This code will expire in 10 minutes.</div>
      </div>
      <div class="footer">
        For security reasons, please do not share this code with anyone.
      </div>
    </div>
  </div>
</body>
</html>
`;
