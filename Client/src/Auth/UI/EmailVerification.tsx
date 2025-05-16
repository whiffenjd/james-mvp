import React, { useState } from 'react';
import toast from 'react-hot-toast';

const EmailVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    toast.success('Email verified!');
    // Proceed with verification
  };

  return (
    <div className="bg-bgDark h-screen w-full flex items-center justify-center flex-col before:absolute before:inset-0 before:bg-[url('/assets/bg.png')] before:bg-cover before:bg-[center_-200px] before:bg-no-repeat before:content-[''] before:z-0 z-0">
      <div className="w-[590px] bg-white rounded-[20px] flex items-center justify-center flex-col py-[60px] px-[53px] z-10" style={{
        background: 'linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)'
      }}>
        <p className="font-markazi font-semibold text-5xl">Verify Email</p>
        <h3 className="font-semibold text-2xl mt-6">Enter the verification code</h3>
        <p className="font-semibold text-base mt-2">sent to your email</p>


        <form onSubmit={handleSubmit} className="w-full mt-14 space-y-6 flex flex-col items-center">
          <div className="flex gap-3">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                className="w-14 h-14 text-center border border-bgDark rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium transition-colors mt-6"
          >
            Verify
          </button>
          <button
            type="button"
            className="w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium transition-colors mt-1"
          >
            Resend Code
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
