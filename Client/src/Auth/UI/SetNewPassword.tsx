import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const SetNewPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      toast.error('Both fields are required.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    // Simulate successful password set
    toast.success('Password set successfully!');
    setPasswordSet(true);
  };

  return (
    <div className="bg-bgDark h-screen w-full flex items-center justify-center flex-col before:absolute before:inset-0 before:bg-[url('/assets/bg.png')] before:bg-cover before:bg-[center_-200px] before:bg-no-repeat before:content-[''] before:z-0 z-0">
      <div className="w-[590px] bg-white rounded-[20px] flex items-center justify-center flex-col py-[60px] px-[53px] z-10" style={{
        background: 'linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)'
      }}>
        <p className="font-markazi font-semibold text-5xl">Set New Password</p>
        <h3 className="font-semibold text-2xl mt-6">Enter and confirm your new password</h3>

        {!passwordSet ? (
          <form onSubmit={handleSubmit} className="w-full mt-14 space-y-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="New Password"
                className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium transition-colors"
            >
              Set Password
            </button>
          </form>
        ) : (
          <p className="text-green-700 text-center mt-10 font-semibold">Your password has been updated successfully.</p>
        )}
      </div>
    </div>
  );
};

export default SetNewPassword;
