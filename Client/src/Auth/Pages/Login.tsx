import { Eye, EyeOff, Mail } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useLogin } from "../../API/Endpoints/Auth/AuthApis";
import { useResendOtp } from "../../API/Endpoints/Otp/OtpResendApis";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const resendOtpMutation = useResendOtp();
  const logoimg = null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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
            navigate(
              `/verify-email?email=${encodeURIComponent(formData.email)}`
            );
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
            // Check if email is verified from the response
            if (response.data.user && !response.data.user.isEmailVerified) {
              toast.error(
                "Email not verified. Please verify your email first."
              );
              setEmailNotVerified(true);
              return;
            }

            toast.success("Signed in successfully!");
            // Store user data in auth context
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

  return (

    <div
      className={`bg-bgDark h-screen w-full flex items-center justify-center flex-col before:absolute before:inset-0 before:bg-[url('/assets/bg.png')] before:bg-cover before:bg-[center_-200px] before:bg-no-repeat before:content-[''] before:z-0 z-0`}
    >
      <div className="absolute top-14 short:static short:mb-2">
        {logoimg ? (
          <img src={logoimg} alt="Logo" className="h-16 w-auto" />
        ) : (
          <p className="text-white text-3xl">Logo</p>
        )}
      </div>

      <div
        className="w-[590px] bg-white rounded-[20px] flex items-center justify-center flex-col py-[60px] px-[53px] z-10"
        style={{
          background:
            "linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)",
        }}
      >
        <p className="font-markazi font-semibold text-5xl">Welcome</p>
        <h3 className="font-semibold text-2xl mt-6">Sign in Your Account</h3>

        <form onSubmit={handleSubmit} className="w-full mt-14 space-y-2">
          {emailNotVerified && (
            <div className="mb-4 bg-amber-50 border border-amber-300 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="text-bgDark" size={20} />
                <p className="text-bgDark font-medium">
                  Your email is not verified
                </p>
              </div>
              <p className="mt-2 text-bgDark text-sm">
                Please verify your email to access your account.
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                className="mt-3 bg-bgPrimary hover:bg-bgDark text-white px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center"
                disabled={resendOtpMutation.isPending}
              >
                {resendOtpMutation.isPending ? (
                  <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                ) : null}
                Resend Verification Email
              </button>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loginMutation.isPending}
            />

            <div className="w-full mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loginMutation.isPending}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                disabled={loginMutation.isPending}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end items-center">
            <Link to="/forgot-password" className="text-base underline">
              Forgot Password?
            </Link>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium mt-8 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={
                formData.password.length < 6 ||
                !formData.email ||
                loginMutation.isPending
              }
            >
              {loginMutation.isPending ? (
                <span className="animate-spin inline-block h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
              ) : null}
              Sign In
            </button>

            <div className="text-center mt-4">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
