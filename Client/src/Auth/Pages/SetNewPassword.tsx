import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useResetPassword } from "../../API/Endpoints/Auth/AuthApis";

const SetNewPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();

  // Extract token and email from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    const emailParam = params.get("email");

    if (!tokenParam) {
      toast.error("Reset token is missing");
      navigate("/login");
      return;
    }

    if (!emailParam) {
      toast.error("Email is missing");
      navigate("/login");
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [location.search, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      toast.error("Both fields are required.");
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
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            "Password reset failed. The link may have expired.";
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
        <h2 className="font-markazi font-semibold text-5xl">
          Set New Password
        </h2>
        <h3 className="font-semibold text-2xl mt-6">
          Enter and confirm your new password
        </h3>

        {!passwordSet ? (
          <form onSubmit={handleSubmit} className="w-full mt-10">
            <div className="space-y-6">
              {/* Password Field */}
              <div className="w-full relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New Password"
                  className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  disabled={resetPasswordMutation.isPending}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="w-full relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                  disabled={resetPasswordMutation.isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium mt-8 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={
                formData.password.length < 6 ||
                formData.password !== formData.confirmPassword ||
                resetPasswordMutation.isPending
              }
            >
              {resetPasswordMutation.isPending ? (
                <span className="animate-spin inline-block h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
              ) : null}
              Set Password
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4 text-2xl font-medium">
              Your password has been updated successfully.
            </div>
            <p className="text-gray-700">Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetNewPassword;
