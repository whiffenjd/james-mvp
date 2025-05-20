# Login Component

Here's a GitBook-friendly Markdown (`.md`) documentation version of your `Login` component code. You can copy this into a file like `Login.md` in your GitHub repo for GitBook to render it correctly.

---

# 📥 Login Component

This component handles user login functionality, email verification checks, and OTP resend via the UI. It integrates with your Auth and OTP API hooks.

---

## 🔗 Dependencies

```tsx
import { Eye, EyeOff, Mail } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useLogin } from "../../API/Endpoints/Auth/AuthApis";
import { useResendOtp } from "../../API/Endpoints/Otp/OtpResendApis";
```

---

## 💡 Component: `Login`

```tsx
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const resendOtpMutation = useResendOtp();
  const logoimg = null;
```

---

## 📤 Event Handlers

### 🔄 `handleChange`

Updates the `formData` state when the user types in the input fields.

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
```

### 👁️ `togglePasswordVisibility`

Toggles password visibility between `text` and `password`.

```tsx
const togglePasswordVisibility = () => {
  setShowPassword((prev) => !prev);
};
```

### 🔁 `handleResendOtp`

Sends a request to resend the OTP if the user's email is not verified.

```tsx
const handleResendOtp = () => {
  if (!formData.email) {
    toast.error("Email is required");
    return;
  }

  resendOtpMutation.mutate(
    { email: formData.email },
    {
      onSuccess: (response) => {
        if (response.success) {
          toast.success("OTP resent successfully");
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        } else {
          toast.error(response.message || "Failed to resend OTP");
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Failed to resend OTP";
        toast.error(errorMessage);
      },
    }
  );
};
```

### 🔐 `handleSubmit`

Handles form submission, login mutation, and email verification check.

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const { email, password } = formData;

  if (!email || !password) {
    toast.error("All fields are required.");
    return;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters.");
    return;
  }

  loginMutation.mutate(
    { email, password },
    {
      onSuccess: (response) => {
        if (response.success) {
          if (response.data.user && !response.data.user.isEmailVerified) {
            toast.error("Email not verified. Please verify your email first.");
            setEmailNotVerified(true);
            return;
          }

          toast.success("Signed in successfully!");
          login({
            user: response.data.user,
            token: response.data.token,
          });
          navigate("/dashboard");
        } else {
          toast.error(response.message || "Login failed");
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "Login failed. Please try again.";
        if (errorMessage.includes("Email not verified")) {
          toast.error("Email not verified. Please verify your email first.");
          setEmailNotVerified(true);
        } else {
          toast.error(errorMessage);
        }
      },
    }
  );
};
```

---

## 🎨 UI Structure

The login page includes:

- Background styling
- Conditional logo
- Email/password form
- OTP resend notice
- Show/hide password functionality
- Navigation links for "Forgot Password?" and "Sign Up"

---

## 🧩 JSX Structure

```tsx
return (
  <div className="login-wrapper">
    <div className="logo">{logoimg ? <img src={logoimg} /> : <p>Logo</p>}</div>

    <div className="login-card">
      <p>Welcome</p>
      <h3>Sign in Your Account</h3>

      <form onSubmit={handleSubmit}>
        {emailNotVerified && (
          <div className="email-verification-warning">
            <Mail />
            <p>Your email is not verified</p>
            <button onClick={handleResendOtp}>Resend Verification Email</button>
          </div>
        )}

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
          <button type="button" onClick={togglePasswordVisibility}>
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <Link to="/forgot-password">Forgot Password?</Link>

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <span className="spinner" /> : null}
          Sign In
        </button>

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  </div>
);
```

---

## ✅ Features Summary

| Feature                   | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| Input Validation          | Validates email and minimum password length            |
| Auth Integration          | Uses custom `useLogin()` hook for authentication       |
| Email Verification Check  | Blocks login if `isEmailVerified` is false             |
| OTP Resend                | Sends OTP via `useResendOtp()` hook                    |
| Toast Notifications       | Uses `react-hot-toast` for alerts and feedback         |
| Navigation                | Redirects user to `/dashboard` on success              |
| Responsive Design Support | Uses Tailwind classes for responsive and styled layout |

---

## 📁 File Location

```bash
/src/pages/Auth/Login.tsx
```

---

Let me know if you'd like this broken into smaller GitBook chapters (e.g., "Form Handling", "API Integration", "Email Verification", etc.), or if you want to include screenshots or visual diagrams for UI/UX.
