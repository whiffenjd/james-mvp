import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

type Props = {}

const Login = (props: Props) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const logoimg=null

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error('All fields are required.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    console.log("logged in with",formData)

    // Proceed with sign-in logic here
    toast.success('Signed in successfully!');
  };
  return (
    <div className={`bg-bgDark   h-screen w-full flex items-center justify-center flex-col  before:absolute before:inset-0 before:bg-[url('/assets/bg.png')] before:bg-cover before: before:bg-[center_-200px]  before:bg-no-repeat before:content-[''] before:z-0 z-0`}>
      <div className="absolute top-14 short:static short:mb-2">
        {
          logoimg?<img src={logoimg} alt="Logo" className="h-16 w-auto" />: <p className='text-white text-3xl'>Logo</p>
        }
    
  </div>
<div className='w-[590px] bg-white  rounded-[20px] flex items-center justify-center flex-col py-[60px] px-[53px] z-10'  style={{
        background: 'linear-gradient(135deg, #F4F4F5 10%, #B1DEDF 60%, #2FB5B4 120%)'
      }}>
  <p className='font-markazi font-semibold text-5xl'>Welcome</p>
  <h3 className='font-semibold text-2xl mt-6'>Sign in Your Account</h3>
 
    <form 
          onSubmit={handleSubmit}
          className='w-full mt-14 space-y-2'
        >
          <div className='space-y-4'>
            <input 
              type="email" 
              name="email" 
              placeholder='Username' 
              className='border border-bgDark rounded-[100px]  bg-transparent  w-full h-[46px] px-6 placeholder:text-bgDark placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary' 
              required
              value={formData.email}
          onChange={handleChange}
            />
            
            
            <div className="w-full mb-4 relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password" 
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          // className="w-full px-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-cyan-600 pr-12"
          className='border border-bgDark rounded-[100px] bg-transparent w-full h-[46px] px-6 placeholder:text-bgDark  placeholder:text-base focus:outline-none focus:ring-2 focus:ring-primary' 
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
          </div>
          
          <div className='flex justify-end items-center'>
            <a href="#" className=' text-base underline'>Forgot Password?</a>
          </div>
          
          <div className='space-y-4'>
            <button
              type="submit"
              className={`w-full bg-bgPrimary rounded-[100px] h-[46px] font-medium mt-8  transition-colors disabled:opacity-50`}
              disabled={formData?.password.length < 6|| !formData?.email}
            >
              Sign In
            </button>
            
           
          </div>
        </form>
</div>
    </div>
  )
}

export default Login