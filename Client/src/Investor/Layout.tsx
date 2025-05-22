// import React from 'react'
// import Sidebar from '../PublicComponents/Components/Sidebar'
// import { Outlet } from 'react-router-dom'
// import { BsBellFill } from 'react-icons/bs'
// import { useAuth } from '../Context/AuthContext'
// import { FaCaretDown } from 'react-icons/fa'

// type Props = {}

// const InvestorLayout = (props: Props) => {

//     const {user}=useAuth();

//     const avatar=user?.avatar||"/assets/avatar.png"
    
//   return (
//     <div className='bg-bgPrimary h-full px-7 py-12 flex gap-9 ' >
//         <Sidebar/>
//         <div className="w-full h-[calc(100vh-96px)] bg-secondary  rounded-[40px]">
//             <header className="w-full  flex justify-between items-center py-7 px-9" >
//              <h3 className='text-xl font-semibold text-[#000000b3] '>
//                 Investors
//              </h3>
//              <div className='flex items-center  gap-4'>
//                 <div className='text-bgPrimary'><BsBellFill  size={22} /></div>
//                 <div className='flex items-center gap-2'>
//                     <img src={avatar} alt="" className='h-8 w-8 rounded-full object-contain' />
//                     <h3 className='font-nunito text-sm capitalize'>{user ? user?.name:""} </h3>
//                     <button className='text-bgPrimary p-2'>
//                     <FaCaretDown />
//                     </button>
//                 </div>
//              </div>
//             </header>

//         {<Outlet />}
//       </div>
//     </div>
//   )
// }

// export default InvestorLayout

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../PublicComponents/Components/Sidebar';
import { Outlet } from 'react-router-dom';
import { BsBellFill } from 'react-icons/bs';
import { FaCaretDown } from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext';

const InvestorLayout = () => {
  const { user, logout } = useAuth();
  const avatar = user?.avatar || "/assets/avatar.png";
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(setIsLoggingOut); // pass setter directly if logout expects it
  };

  return (
    <div className="bg-bgPrimary h-full px-7 py-12 flex gap-9">
      <Sidebar />
      <div className="w-full h-[calc(100vh-96px)] bg-secondary rounded-[40px]">
        <header className="w-full flex justify-between items-center py-7 px-9 relative">
          <h3 className="text-xl font-semibold text-[#000000b3]">Investors</h3>
          <div className="flex items-center gap-4">
            <div className="text-bgPrimary cursor-pointer">
              <BsBellFill size={22} />
            </div>
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              {/* <img src={avatar} alt="" className="h-8 w-8 rounded-full object-contain " /> */}
              <h3 className="font-nunito text-sm capitalize">{user?.name || ""}</h3>
              <button
                className="text-bgPrimary p-2"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <FaCaretDown />
              </button>

              {showDropdown && (
                <div className="absolute top-6 right-2 bg-white shadow-md rounded-lg py-2 px-4 z-50 min-w-[120px]">
                  <button
                    className="text-red-600 font-medium text-sm hover:underline"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                  >
                     {isLoggingOut ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
};

export default InvestorLayout;
