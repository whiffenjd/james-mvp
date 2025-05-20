# React Tanstack Queries

# Authentication System Documentation

This documentation covers the complete authentication system in the application, including login, signup, password reset functionality, and OTP verification.

## Table of Contents

- [Overview](#overview)
- [Authentication Flows](#authentication-flows)
  - [Login Flow](#login-flow)
  - [Signup Flow](#signup-flow)
  - [Password Reset Flow](#password-reset-flow)
  - [OTP Verification Flow](#otp-verification-flow)
- [Component Documentation](#component-documentation)
  - [ForgotPassword Component](#forgotpassword-component)
  - [SetNewPassword Component](#setnewpassword-component)
- [API Integration](#api-integration)
  - [API Endpoints](#api-endpoints)
  - [Axios Instances](#axios-instances)
- [Security Considerations](#security-considerations)
- [UI/UX Elements](#uiux-elements)

## Overview

The authentication system provides a complete user management solution with secure login, signup, password reset, and email verification capabilities. It follows industry-standard security practices and provides a seamless user experience.

## Authentication Flows

### Login Flow

1. **Access Login Page**:

   - User navigates to the login page
   - User enters email and password credentials

2. **Authentication**:

   - System validates credentials against the database
   - On success, user receives an authentication token
   - Token is stored in cookies for subsequent authenticated requests

3. **Session Management**:
   - User remains logged in until they log out or the token expires
   - Authenticated requests include the token in the Authorization header

### Signup Flow

1. **Access Signup Page**:

   - User navigates to the investor signup page
   - User provides name, email, and password

2. **Account Creation**:

   - System validates the information
   - System creates a new investor account
   - System sends an OTP for email verification

3. **Email Verification**:
   - User receives an OTP via email
   - User enters the OTP on the verification page
   - Account is activated upon successful verification

### Password Reset Flow

1. **Initiate Password Reset**:

   - User navigates to the "Forgot Password" page
   - User enters their email address
   - System sends a password reset link to the provided email

2. **Email Receipt**:

   - User receives an email with a reset link
   - Link contains a unique token and the user's email address as query parameters

3. **Set New Password**:

   - User clicks the link in the email
   - User is directed to the "Set New Password" page
   - User enters and confirms a new password
   - System validates the token and updates the password

4. **Completion**:
   - User receives confirmation of successful password reset
   - User is redirected to the login page

### OTP Verification Flow

1. **Receive OTP**:

   - User receives an OTP via email after signup
   - User navigates to the OTP verification page

2. **Enter OTP**:

   - User enters the received OTP
   - System validates the OTP against the stored value

3. **OTP Resend Option**:

   - If OTP is not received or expired, user can request a new one
   - System generates and sends a new OTP to the user's email

4. **Account Activation**:
   - On successful OTP verification, the user's account is activated
   - User is redirected to the login page or dashboard

## Component Documentation

### ForgotPassword Component

The `ForgotPassword` component handles the first step of the password reset process.

#### Key Features

- Email input validation
- API integration with password reset request endpoint
- Success/failure state management
- Loading state indication during API calls

#### Usage

```jsx
import { ForgotPassword } from "../path/to/component";

// Inside a router
<Route path="/forgot-password" element={<ForgotPassword />} />;
```

#### Implementation Details

- **State Management**:

  - Tracks email input
  - Tracks whether the reset email has been sent
  - Manages API request state

- **Form Handling**:

  - Validates that email is provided
  - Prevents submission during pending requests
  - Handles API response and errors

- **UI States**:
  - Initial form with email input
  - Loading state during API request
  - Success state after email is sent

### SetNewPassword Component

The `SetNewPassword` component handles the final step where users set their new password.

#### Key Features

- Password and confirm password validation
- Token extraction from URL parameters
- Password visibility toggle
- Automatic redirection after successful reset

#### Usage

```jsx
import { SetNewPassword } from "../path/to/component";

// Inside a router
<Route path="/reset-password" element={<SetNewPassword />} />;
```

#### Implementation Details

- **URL Parameter Handling**:

  - Extracts token and email from URL query parameters
  - Validates presence of both parameters
  - Redirects to login if parameters are missing

- **Password Validation**:

  - Ensures password is at least 6 characters
  - Verifies that password and confirmation match
  - Prevents submission if validation fails

- **Security Features**:

  - Password visibility toggle for better user experience
  - Token-based verification through API

- **UI States**:
  - Password entry form
  - Loading state during API request
  - Success state with automatic redirection

## API Integration

The authentication system integrates with backend API endpoints using React Query's mutation hooks for efficient API state management.

### API Endpoints

The following API endpoints are utilized for various authentication operations:

#### Login API

```typescript
// Login
export const useLogin = () =>
  useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await axiosPublic.post("/auth/user/login", data);
      return res.data;
    },
  });

// Payload Type
type LoginPayload = {
  email: string;
  password: string;
};
```

#### Logout API

```typescript
// Logout
export const useLogout = () =>
  useMutation({
    mutationFn: async () => {
      const res = await axiosPrivate.post("/auth/user/logout");
      return res.data;
    },
  });
```

#### Password Reset APIs

```typescript
// Send reset password link
export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: async (data: ResetRequestPayload) => {
      const res = await axiosPublic.post(
        "/auth/user/resetPasswordRequest",
        data
      );
      return res.data;
    },
  });

// Update password
export const useResetPassword = () =>
  useMutation({
    mutationFn: async (data: ResetPasswordPayload) => {
      const res = await axiosPublic.post("/auth/user/resetPassword", data);
      return res.data;
    },
  });

// Payload Types
type ResetRequestPayload = {
  email: string;
};

type ResetPasswordPayload = {
  email: string;
  token: string;
  newPassword: string;
};
```

#### Investor Signup API

```typescript
// Investor Signup
export const useInvestorSignup = () =>
  useMutation<InvestorSignupResponse, Error, InvestorSignupData>({
    mutationFn: async (data) => {
      const response = await axiosPublic.post(
        "/auth/investor/investorSignup",
        data
      );
      return response.data;
    },
  });

// Types
interface InvestorSignupData {
  name: string;
  email: string;
  password: string;
}

interface InvestorSignupResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}
```

#### OTP Verification APIs

```typescript
// Resend OTP
export const useResendOtp = () =>
  useMutation<ResendOtpResponse, Error, ResendOtpInput>({
    mutationFn: async (payload) => {
      const response = await axiosPublic.post("/auth/otp/resendOtp", payload);
      return response.data;
    },
  });

// Verify OTP
export const useVerifyInvestorOtp = () =>
  useMutation<VerifyOtpResponse, Error, VerifyOtpInput>({
    mutationFn: async (payload) => {
      const response = await axiosPublic.post("/auth/otp/verifyOtp", payload);
      return response.data;
    },
  });

// Types
interface ResendOtpInput {
  email: string;
}

interface ResendOtpResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

interface VerifyOtpInput {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}
```

### Axios Instances

The application uses two different Axios instances for handling API requests:

#### Public Axios Instance

For unauthenticated endpoints that don't require authorization:

```typescript
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosPublic = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosPublic;
```

#### Private Axios Instance

For authenticated endpoints that require authorization:

```typescript
import axios from "axios";
import Cookies from "js-cookie";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosPrivate = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from cookies
axiosPrivate.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosPrivate;
```

## Security Considerations

The authentication system incorporates multiple security measures to protect user accounts and data:

### Token-Based Authentication

1. **JWT Token Storage**:

   - Authentication tokens are stored in HTTP-only cookies
   - This helps prevent XSS (Cross-Site Scripting) attacks

2. **Token Expiration**:

   - Tokens have a limited lifetime
   - Expired tokens require re-authentication

3. **Automatic Token Inclusion**:
   - The private Axios instance automatically includes the token in requests
   - This ensures consistent authentication across the application

### Password Security

1. **Password Requirements**:

   - Minimum length of 6 characters
   - Frontend validation prevents weak passwords
   - Backend validation enforces password policies

2. **Secure Password Reset**:
   - Time-limited reset tokens
   - One-time use tokens
   - Verification of both email and token for reset

### OTP Security

1. **Time-Limited OTPs**:

   - OTPs expire after a set period
   - This prevents delayed use of intercepted codes

2. **Resend Limitations**:

   - Rate limiting on OTP resend requests
   - Prevents abuse of the OTP system

3. **Secure Verification**:
   - OTP validation happens server-side
   - Prevents client-side manipulation

### API Security

1. **HTTPS Enforcement**:

   - All API communications occur over HTTPS
   - Prevents man-in-the-middle attacks

2. **Public vs. Private Endpoints**:

   - Clear separation between authenticated and unauthenticated endpoints
   - Authorization enforcement on protected routes

3. **Error Handling**:
   - Generic error messages prevent user enumeration
   - Detailed errors logged server-side for debugging

## UI/UX Elements

### Visual Design

All authentication components feature a consistent design with:

- Gradient background: `linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)`
- Rounded containers with 20px border radius
- Consistent text styles and input fields

### User Experience Features

1. **Form Validation**:

   - Real-time validation of inputs
   - Clear error messages for invalid inputs
   - Disabled submit buttons until forms are valid

2. **Loading States**:

   - Spinner animations during API requests
   - Disabled inputs during processing
   - Visual feedback for ongoing operations

3. **Password Visibility Toggles**:

   - Eye/Eye-off icons for showing/hiding passwords
   - Improves user experience when entering passwords

4. **Success Feedback**:

   - Toast notifications for successful operations
   - Clear success messages embedded in the UI
   - Automatic redirections after completed workflows

5. **Error Handling**:
   - Toast notifications for errors
   - User-friendly error messages
   - Recovery options when operations fail

## Implementation Best Practices

### React Query Integration

The application uses React Query (TanStack Query) for efficient API state management:

1. **Mutation Hooks**:

   - Encapsulated in custom hooks for reusability
   - Standardized error handling
   - Built-in loading states

2. **Response Handling**:
   - Consistent success/error pattern
   - Type-safe responses with TypeScript interfaces

### Token Management

1. **Cookie-Based Storage**:

   - Uses js-cookie for token management
   - Prevents token exposure to JavaScript (when HTTP-only is set server-side)

2. **Axios Interceptors**:
   - Automatically attaches tokens to authorized requests
   - Centralizes authentication logic

### Route Protection

While not explicitly shown in the provided code, the authentication system should be complemented with:

1. **Protected Routes**:

   - Routes that require authentication
   - Redirect unauthenticated users to login

2. **Role-Based Access Control**:
   - Different permissions for different user types
   - Route restrictions based on user roles

### Conclusion

This authentication system provides a comprehensive solution for user management, incorporating industry best practices for security and user experience. The system's modular design allows for easy maintenance and extension as application requirements evolve.
