# Complete Api Documentation

Here’s a beautifully **structured Markdown version** of your API documentation tailored for **GitBook** (which supports standard Markdown with some GitBook-specific enhancements for navigation and clarity):

---

# API Documentation

---

## 📘 Introduction

This documentation provides details about the **authentication** and **profile** API endpoints for the platform.

The API allows users to:

- Register and verify email with OTP
- Log in and reset their password
- Access and manage their profile

---

## 🌐 Base URL

```
http://localhost:5000
```

> ⚠️ In production, replace this with your actual domain.

---

## 🔐 Authentication

### 🔑 Auth Mechanism

All protected endpoints require JWT-based authentication. After logging in, you'll receive a JWT token:

```
Authorization: Bearer <token>
```

---

### 📥 Investor Signup

Creates a new investor and sends OTP to the provided email.

- **URL:** `/auth/investor/investorSignup`
- **Method:** `POST`
- **Auth required:** ❌

#### Request Body

```json
{
  "name": "John Doe",
  "email": "example@domain.com",
  "password": "123456"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "message": "OTP sent to email"
  }
}
```

> 🔎 The email must be valid. Password must be at least 6 characters.

---

### ✅ Verify OTP

Verifies OTP sent to user's email.

- **URL:** `/auth/otp/verifyOtp`
- **Method:** `POST`
- **Auth required:** ❌

#### Request Body

```json
{
  "email": "example@domain.com",
  "otp": "123456"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "UUID",
      "name": "John Doe",
      "email": "example@domain.com",
      ...
    }
  }
}
```

> ⚠️ OTPs expire within 10-15 minutes.

---

### 🔁 Resend OTP

Resends OTP to email.

- **URL:** `/auth/otp/resendOtp`
- **Method:** `POST`
- **Auth required:** ❌

#### Request Body

```json
{
  "email": "example@domain.com"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "message": "OTP resent to email"
  }
}
```

> 🔒 Rate limits may apply to prevent abuse.

---

### 🔓 User Login

Logs in user and returns JWT token.

- **URL:** `/auth/user/login`
- **Method:** `POST`
- **Auth required:** ❌

#### Request Body

```json
{
  "email": "example@domain.com",
  "password": "123456"
}
```

#### Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "id": "UUID",
      "name": "John Doe",
      ...
    }
  }
}
```

> 🛡️ Store the token securely and use it in all protected requests.

---

### 🔑 Reset Password Request

Starts password reset process.

- **URL:** `/auth/user/resetPasswordRequest`
- **Method:** `POST`
- **Auth required:** ❌

#### Request Body

```json
{
  "email": "example@domain.com"
}
```

#### Success Response

```json
{
  "success": true,
  "message": {
    "token": "<RESET_TOKEN>",
    "message": "Reset link sent"
  },
  "data": {
    "token": "<RESET_TOKEN>",
    "message": "Reset link sent"
  }
}
```

> 📩 In production, a reset link should be emailed to the user.

---

### 🔒 Reset Password

Completes password reset using token.

- **URL:** `/auth/user/resetPassword`
- **Method:** `POST`
- **Auth required:** ❌

#### Request Body

```json
{
  "email": "example@domain.com",
  "token": "<RESET_TOKEN>",
  "newPassword": "newSecurePassword"
}
```

#### Success Response

```json
{
  "success": true,
  "message": {
    "message": "Password updated"
  },
  "data": {
    "message": "Password updated"
  }
}
```

> ✅ Password must meet policy requirements.

---

## 🙋‍♂️ Profile

### 👤 Get User Profile

Fetch authenticated user’s profile.

- **URL:** `/profile/user/profile`
- **Method:** `GET`
- **Auth required:** ✅ Bearer Token

#### Headers

```http
Authorization: Bearer <token>
```

#### Success Response

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "UUID",
    "name": "John Doe",
    "email": "example@domain.com",
    ...
  }
}
```

> 🚫 Passwords should not be returned even in hashed form.

---

## ⚠️ Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional details"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning                      |
| ---- | ---------------------------- |
| 400  | Bad Request                  |
| 401  | Unauthorized (Missing token) |
| 403  | Forbidden                    |
| 404  | Not Found                    |
| 500  | Internal Server Error        |

---
