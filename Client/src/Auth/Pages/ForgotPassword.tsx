import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useRequestPasswordReset } from "../../API/Endpoints/Auth/AuthApis";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const resetRequestMutation = useRequestPasswordReset();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

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
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || "Failed to send reset email";
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <div className="bg-bgDark h-screen w-full flex items-center justify-center flex-col before:absolute before:inset-0 before:bg-[url('/assets/bg.png')] before:bg-cover before:bg-[center_-200px] before:bg-no-repeat before:content-[''] before:z-0 z-0">
      <div
        className="w-[590px] bg-white rounded-[20px] flex items-center justify-center flex-col py-[60px] px-[53px] z-10"
        style={{
          background:
            "linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)",
        }}
      >
        <h2 className="font-markazi font-semibold text-5xl">Forgot Password</h2>
        <h3 className="font-semibold text-2xl mt-6">Reset Your Password</h3>

        <form onSubmit={handleSubmit} className="w-full mt-10">
          {!emailSent ? (
            <>
              <div className="mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={resetRequestMutation.isPending}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                disabled={!email || resetRequestMutation.isPending}
              >
                {resetRequestMutation.isPending ? (
                  <span className="animate-spin inline-block h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                ) : null}
                Send Reset Link
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mb-6 text-lg">
                Password reset link has been sent to{" "}
                <span className="font-medium">{email}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Please check your email inbox and click on the link to reset
                your password.
              </p>
            </div>
          )}

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
