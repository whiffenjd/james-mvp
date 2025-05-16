import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    
    // Simulate API call
    setEmailSent(true);
    toast.success('Password reset email sent!');
  };

  return (
    <div className="bg-bgDark h-screen w-full flex items-center justify-center flex-col before:absolute before:inset-0 before:bg-[url('/assets/bg.png')] before:bg-cover before:bg-[center_-200px] before:bg-no-repeat before:content-[''] before:z-0 z-0">
      <div className="w-[590px] bg-white rounded-[20px] flex items-center justify-center flex-col py-[60px] px-[53px] z-10" style={{
        background: 'linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)'
      }}>
        <p className="font-markazi font-semibold text-5xl">Forgot Password</p>
        <h3 className="font-semibold text-2xl mt-6">Reset Your Password</h3>

        <form onSubmit={handleSubmit} className="w-full mt-14 space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {!emailSent ? (
            <button
              type="submit"
              className="w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium transition-colors"
            >
              Send Reset Link
            </button>
          ) : (
            <p className="text-green-700 text-center font-semibold">Password reset link has been sent!</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
