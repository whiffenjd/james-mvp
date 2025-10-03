import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useInvestorSignup } from "../../API/Endpoints/Investor/InvestorSignupApis";
import { useTheme } from "../../Context/ThemeContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const signupMutation = useInvestorSignup();
  const logoimg = null;
  const { fundManagerId } = useParams<{ fundManagerId?: string }>();
  const { currentTheme } = useTheme();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

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

    // Prepare signup data (omitting confirmPassword)
    const signupData = {
      name,
      email,
      password,
      referralId: fundManagerId ? fundManagerId : null, // <-- include this
    };

    signupMutation.mutate(signupData, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success("Signup successful! Please verify your email.");
          // Redirect to email verification
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

  return (
    <div className="bg-bgDark h-screen w-full flex items-center justify-center flex-col overflow-hidden">
      {/* Beautiful 3-color fading gradient from bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(165deg, 
        #2C2C2E 10%,
        ${currentTheme.sidebarAccentText}10 20%,
        ${currentTheme.sidebarAccentText}20 30%,
        ${currentTheme.dashboardBackground}60 50%, 
        ${currentTheme.dashboardBackground}25 45%, 
        transparent 90%)`,
        }}
      />

      {/* Your content here with relative z-index */}
      <div className="relative z-10">
        {/* Your login card and other content */}
      </div>
      <div className="absolute top-14 short:static short:mb-2">
        {logoimg ? (
          <img src={logoimg} alt="Logo" className="h-16 w-auto" />
        ) : (
          <p
            className="text-white text-3xl"
            style={{ color: currentTheme.sidebarAccentText }}
          >
            Logo
          </p>
        )}
      </div>

      <div
        className="w-[590px] bg-white rounded-[20px] flex items-center justify-center flex-col py-[60px] px-[53px] z-10"
      // style={{
      //   background:
      //     "linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)",
      // }}
      >
        <p
          className="font-markazi font-semibold text-5xl"
          style={{ color: currentTheme.primaryText }}
        >
          Welcome
        </p>
        <h3
          className="font-semibold text-2xl mt-6"
          style={{ color: currentTheme.primaryText }}
        >
          Sign up Your Account
        </h3>

        <form onSubmit={handleSubmit} className="w-full mt-14 space-y-2">
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={signupMutation.isPending}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={signupMutation.isPending}
            />

            {/* Password Field */}
            <div className="w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={signupMutation.isPending}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                disabled={signupMutation.isPending}
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
                placeholder="Confirm Password"
                className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={signupMutation.isPending}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
                disabled={signupMutation.isPending}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium mt-8 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={
                !formData.name ||
                !formData.email ||
                formData.password.length < 6 ||
                formData.password !== formData.confirmPassword ||
                signupMutation.isPending
              }
            >
              {signupMutation.isPending ? (
                <span className="animate-spin inline-block h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
              ) : null}
              Sign Up
            </button>

            <div className="text-center mt-4">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="underline font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
