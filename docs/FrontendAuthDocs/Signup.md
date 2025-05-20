#Signup Component

Here's a **GitBook-compatible Markdown documentation** version of your `Signup` component. This is structured clearly with code snippets, section titles, and explanations to help readers understand each part of the component.

---

# 📘 `Signup` Component Documentation

This `Signup` component provides the registration form for investors, integrating password validation, form state handling, and API interaction using `react-hot-toast`, `react-router-dom`, and a custom hook `useInvestorSignup`.

---

## 🚀 Features

- Signup form with input validation
- Password visibility toggles
- API integration using custom React hook
- Redirect to email verification on successful signup
- UI built with Tailwind CSS
- Displays toast messages on error/success

---

## 📂 File Path

```
/src/components/Auth/Signup.tsx
```

---

## 📦 Dependencies

```ts
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useInvestorSignup } from "../../API/Endpoints/Investor/InvestorSignupApis";
```

---

## 🧠 Component State

```ts
const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
```

- `formData`: Stores user inputs for name, email, password, and confirmPassword.
- `showPassword` & `showConfirmPassword`: Toggle password visibility.

---

## 🔁 Handlers

### `handleChange`

Updates `formData` on input change.

```ts
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
```

---

### `togglePasswordVisibility` & `toggleConfirmPasswordVisibility`

Toggles the visibility of password fields.

```ts
const togglePasswordVisibility = () => {
  setShowPassword((prev) => !prev);
};

const toggleConfirmPasswordVisibility = () => {
  setShowConfirmPassword((prev) => !prev);
};
```

---

### `handleSubmit`

Validates the form and triggers the signup API mutation.

```ts
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const { name, email, password, confirmPassword } = formData;

  if (!name || !email || !password || !confirmPassword) {
    toast.error("All fields are required.");
    return;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  const signupData = { name, email, password };

  signupMutation.mutate(signupData, {
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Signup successful! Please verify your email.");
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(response.message || "Signup failed");
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMessage);
    },
  });
};
```

---

## 🧱 JSX Structure

### Layout

The page is full-screen and centers the form with a background image overlay.

```tsx
<div className="bg-bgDark h-screen w-full flex items-center justify-center flex-col ...">
```

### Logo Section

Renders a logo or placeholder text.

```tsx
{
  logoimg ? (
    <img src={logoimg} alt="Logo" />
  ) : (
    <p className="text-white text-3xl">Logo</p>
  );
}
```

---

### Signup Form UI

Each input is styled with TailwindCSS and follows validation rules.

#### Input Fields

- **Name**
- **Email**
- **Password** with eye toggle icon
- **Confirm Password** with eye toggle icon

```tsx
<input
  type={showPassword ? "text" : "password"}
  name="password"
  ...
/>
```

#### Submit Button

Disabled unless form is valid.

```tsx
<button
  type="submit"
  disabled={
    !formData.name ||
    !formData.email ||
    formData.password.length < 6 ||
    formData.password !== formData.confirmPassword ||
    signupMutation.isPending
  }
>
  {signupMutation.isPending ? <span className="loader" /> : "Sign Up"}
</button>
```

---

## 🔗 Navigation

After a successful signup:

```ts
navigate(`/verify-email?email=${encodeURIComponent(email)}`);
```

For existing users:

```tsx
<Link to="/login">Sign In</Link>
```

---

## 🧪 API Hook

```ts
const signupMutation = useInvestorSignup();
```

Make sure `useInvestorSignup` returns a `useMutation` object with `mutate`, `isPending`, and error/success handling.

---

## 📝 Notes

- Ensure all required fields are entered and validated before submitting.
- Eye icons toggle input types for password visibility.
- Use `.env` or environment-specific logic if you plan to dynamically load `logoimg`.

---

## 📷 UI Preview

> You can embed screenshots or visual examples of the form here for GitBook.

---
