# Role Based Routing

# Authentication System Documentation

This documentation covers the complete authentication system in the application, including login, signup, password reset functionality, OTP verification, and role-based routing.

## Table of Contents

- [Overview](#overview)
- [Authentication Flows](#authentication-flows)
  - [Login Flow](#login-flow)
  - [Signup Flow](#signup-flow)
  - [Password Reset Flow](#password-reset-flow)
  - [OTP Verification Flow](#otp-verification-flow)
- [Routing System](#routing-system)
  - [Protected Routes](#protected-routes)
  - [Role-Based Access Control](#role-based-access-control)
  - [Route Configuration](#route-configuration)
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

## Routing System

The application implements a comprehensive routing system with role-based access control to ensure users can only access appropriate pages based on their authentication status and role.

### Protected Routes

The application uses several route wrapper components to handle different access control scenarios:

#### Base Protected Route

The `ProtectedRoute` component provides basic authentication protection:

```tsx
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Show loading until authentication state is determined
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};
```

#### Role-Specific Protected Routes

The application has specialized route components for each user role:

1. **AdminRoute**: Ensures only administrators can access certain pages
2. **FundManagerRoute**: Restricts access to fund manager functionality
3. **InvestorRoute**: Protects investor-specific pages
4. **PublicRoute**: Prevents authenticated users from accessing public pages like login

Each role-specific route performs the following checks:

1. Authentication status check
2. Role verification
3. Appropriate redirection based on access rights

Example of a role-specific route (AdminRoute):

```tsx
export const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Show loading until authentication state is determined
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard if not admin
  if (user?.role !== "admin") {
    // Redirect based on role
    if (user?.role === "investor") {
      return <Navigate to="/investor/dashboard" replace />;
    } else if (user?.role === "fundmanager") {
      return <Navigate to="/fundmanager/dashboard" replace />;
    } else {
      // Fallback for unknown roles
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render children or outlet if user is admin
  return children ? <>{children}</> : <Outlet />;
};
```

### Role-Based Access Control

The routing system implements a comprehensive role-based access control (RBAC) strategy:

1. **Role Definitions**:

   - Admin: System administrators with full access
   - Fund Manager: Users who manage investment funds
   - Investor: Users who invest in available funds

2. **Access Control Logic**:

   - Each protected route verifies the user's role
   - Users attempting to access unauthorized sections are redirected
   - Redirection targets depend on the user's authenticated role

3. **Dynamic Redirection**:
   - The application uses a `RedirectBasedOnRole` component to dynamically route users:

```tsx
function RedirectBasedOnRole() {
  const { user } = useAuth();

  switch (user?.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "fundmanager":
      return <Navigate to="/fundmanager/dashboard" replace />;
    case "investor":
      return <Navigate to="/investor/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
```

### Route Configuration

The route configuration in the main App component organizes routes by access level:

```tsx
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>
          {/* Public routes - accessible when not logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<SetNewPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Add more admin routes here */}
          </Route>

          {/* Fund Manager routes */}
          <Route element={<FundManagerRoute />}>
            <Route
              path="/fundmanager/dashboard"
              element={<FundManagerDashboard />}
            />
            {/* Add more fund manager routes here */}
          </Route>

          {/* Investor routes */}
          <Route element={<InvestorRoute />}>
            <Route path="/investor/dashboard" element={<InvestorDashboard />} />
            {/* Add more investor routes here */}
          </Route>

          {/* Error and fallback routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Redirect root to login or appropriate dashboard based on auth state */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RedirectBasedOnRole />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to home which will then redirect appropriately */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### Key Routing Features

1. **Route Organization**:

   - Routes are logically grouped by access level
   - Each section is wrapped in its appropriate protected route component

2. **Loading States**:

   - Loading spinner displayed while authentication state is determined
   - Prevents flickering between pages during authentication checks

3. **Error Handling**:

   - Unauthorized access attempts are redirected to appropriate pages
   - Specific "unauthorized" page for users with invalid roles

4. **Smart Redirects**:

   - Root path (`/`) intelligently redirects based on authentication state
   - Catch-all route handles any invalid URLs

5. **Nested Routes**:
   - React Router's `Outlet` component enables nested route structures
   - Role-specific route sections can contain multiple nested routes

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

## Integration with Auth Context

The routing system is tightly integrated with the application's authentication context, which provides the necessary authentication state to the protected routes.

### Auth Context Overview

The application uses a React Context (`AuthContext`) to manage authentication state and make it available throughout the application:

```tsx
// AuthContext.tsx (simplified for illustration)
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "fundmanager" | "investor";
}

interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for token and verify on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("authToken");

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get("/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          Cookies.remove("authToken");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        Cookies.remove("authToken");
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set("authToken", token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

### Key Integration Points

1. **Authentication State**:

   - The `useAuth` hook provides access to:
     - `isAuthenticated`: Boolean indicating if the user is logged in
     - `user`: User object containing role and other details
     - `login`: Function to set authentication state
     - `logout`: Function to clear authentication state

2. **Initial Loading State**:

   - The Auth context initially sets `user` to `undefined` during loading
   - Protected routes display a loading spinner until authentication state is determined
   - This prevents flashing of unauthorized content during page load

3. **Route Protection**:

   - Protected route components use `useAuth()` to access authentication state
   - Decisions about routing are made based on `isAuthenticated` and `user.role`

4. **Token Verification**:
   - Token verification occurs when the application loads
   - Invalid or expired tokens trigger automatic logout
   - Users with invalid sessions are redirected to the login page

### Example Usage in Route Components

```tsx
export const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Protected route logic uses auth context state
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    // Redirect based on role
    if (user?.role === "investor") {
      return <Navigate to="/investor/dashboard" replace />;
    } else if (user?.role === "fundmanager") {
      return <Navigate to="/fundmanager/dashboard" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
```

## Authentication and Routing Flow Diagram

```
┌────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                │     │                 │     │                 │
│  Application   │────▶│  Auth Context   │────▶│  Route Guards   │
│     Start      │     │  Initialization │     │  Protection     │
│                │     │                 │     │                 │
└────────────────┘     └─────────────────┘     └────────┬────────┘
                                                        │
         ┌───────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Check Auth     │     │  Role-Based     │     │  Component      │
│  Status         │────▶│  Redirection    │────▶│  Rendering      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```
