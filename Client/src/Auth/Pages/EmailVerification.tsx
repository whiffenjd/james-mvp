import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useVerifyInvestorOtp } from "../../API/Endpoints/Otp/OtpVerifyApis";
import { useResendOtp } from "../../API/Endpoints/Otp/OtpResendApis";

const EmailVerification = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [email, setEmail] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  // Create refs for input elements
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const verifyOtpMutation = useVerifyInvestorOtp();
  const resendOtpMutation = useResendOtp();

  // Setup input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Get email from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      toast.error("Email parameter is missing");
      navigate("/login");
    }
  }, [location.search, navigate]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;

    // Only accept numbers
    if (isNaN(Number(value))) return;

    // Create a new array with the updated value
    const newOtp = [...otp];

    // Handle paste event (multiple characters)
    if (value.length > 1) {
      // Split the pasted string into array
      const pastedValues = value.split("").slice(0, 6);

      // Fill the OTP array with pasted values
      const newFilledOtp = [...otp];
      for (let i = 0; i < pastedValues.length; i++) {
        if (index + i < 6) {
          newFilledOtp[index + i] = pastedValues[i];
        }
      }

      setOtp(newFilledOtp);

      // Move focus to the appropriate field
      const newPosition = Math.min(index + pastedValues.length, 5);
      if (newPosition < 6) {
        inputRefs.current[newPosition]?.focus();
      }
      return;
    }

    // Normal single character input
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.nextSibling && value) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (index > 0 && !otp[index]) {
        // If current field is empty and user presses backspace, move to previous field
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle left arrow key
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle right arrow key
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content contains digits
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("").slice(0, 6);
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      // Focus on appropriate field after paste
      const focusIndex = Math.min(index + digits.length, 5);
      if (focusIndex < 6) {
        inputRefs.current[focusIndex]?.focus();
      }
    }
  };

  const handleResendOtp = () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("OTP resent successfully");
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
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    verifyOtpMutation.mutate(
      { email, otp: enteredOtp },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Email verified successfully!");
            navigate("/login");
          } else {
            toast.error(response.message || "Verification failed");
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || "Verification failed";
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
        <h2 className="font-markazi font-semibold text-5xl">Verify Email</h2>

        <p className="text-xl mt-4 text-center">
          Enter the verification code sent to your email
          <span className="block font-medium mt-2">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-10">
          <div className="flex justify-center gap-2 sm:gap-4">
            {otp.map((data, index) => (
              <input
                key={index}
                ref={(el) =>
                  (inputRefs.current[index] = el as HTMLInputElement)
                }
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) =>
                  handleChange(e.target as HTMLInputElement, index)
                }
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={(e) => handlePaste(e, index)}
                onFocus={(e) => e.target.select()}
                className="w-14 h-14 text-center border border-bgDark rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={verifyOtpMutation.isPending}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center">
            <button
              type="submit"
              className="w-full max-w-xs bg-bgPrimary rounded-[100px] h-[46px] font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? (
                <span className="animate-spin inline-block h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
              ) : null}
              Verify
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-700">Didn't receive the code?</p>

              <button
                type="button"
                onClick={handleResendOtp}
                className="text-primary font-medium mt-2 hover:underline"
                disabled={resendOtpMutation.isPending}
              >
                {resendOtpMutation.isPending ? "Sending..." : "Send again"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
