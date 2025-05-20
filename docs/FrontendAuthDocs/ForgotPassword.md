# ForgotPassword Component

# Password Reset Flow Documentation

This documentation covers the password reset functionality in the application, explaining both the user flow and the implementation details.

## Table of Contents

- [Overview](#overview)
- [User Flow](#user-flow)
- [Component Documentation](#component-documentation)
  - [ForgotPassword Component](#forgotpassword-component)
  - [SetNewPassword Component](#setnewpassword-component)
- [API Integration](#api-integration)
- [Security Considerations](#security-considerations)
- [UI/UX Elements](#uiux-elements)

## Overview

The password reset system provides users with a secure way to regain access to their accounts when they've forgotten their passwords. The process follows industry-standard practices with email verification to ensure security.

## User Flow

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

Both components integrate with authentication API endpoints to handle the password reset process.

### Password Reset Request

```typescript
// Using react-query's mutation hook
const resetRequestMutation = useRequestPasswordReset();

// API call
resetRequestMutation.mutate(
  { email },
  {
    onSuccess: (response) => {
      if (response.success) {
        setEmailSent(true);
        toast.success("Password reset email sent!");
      } else {
        toast.error(response.message || "Failed to send reset email");
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to send reset email";
      toast.error(errorMessage);
    },
  }
);
```

### Password Reset Completion

```typescript
// Using react-query's mutation hook
const resetPasswordMutation = useResetPassword();

// API call
resetPasswordMutation.mutate(
  {
    email,
    token,
    newPassword: password,
  },
  {
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Password reset successfully!");
        setPasswordSet(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error(response.message || "Password reset failed");
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Password reset failed. The link may have expired.";
      toast.error(errorMessage);
    },
  }
);
```

## Security Considerations

1. **Token-based Verification**:

   - Each password reset request generates a unique token
   - Tokens are time-limited for security
   - Both email and token are required to complete the reset

2. **Password Requirements**:

   - Minimum length of 6 characters
   - Confirmation to prevent typos

3. **Error Handling**:
   - Generic error messages to prevent user enumeration
   - Proper validation on both client and server side

## UI/UX Elements

### Visual Design

Both components feature a consistent design with:

- Gradient background: `linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)`
- Rounded containers with 20px border radius
- Consistent text styles and input fields

### User Experience Features

1. **Loading Indicators**:

   - Spinner animation during API requests
   - Disabled inputs and buttons during loading

2. **Password Visibility Toggle**:

   - Eye/Eye-off icons for showing/hiding passwords
   - Improves user experience when entering passwords

3. **Feedback System**:

   - Toast notifications for success and error states
   - Clear instructions at each step
   - Automatic redirection after successful password reset

4. **Form Validation**:
   - Real-time validation of password requirements
   - Button disabled until validation criteria are met
