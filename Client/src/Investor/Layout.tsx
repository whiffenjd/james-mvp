import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../PublicComponents/Components/Sidebar";
import { Outlet } from "react-router-dom";
import { BsBellFill } from "react-icons/bs";
import { FaCaretDown } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";
import { LayoutGrid } from "lucide-react";

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
  const menuItems = [
    {
      id: "dashboard",
      icon: <LayoutGrid size={22} />,
      label: "Dashboard",
      path: "/investor/dashboard",
    },
    // { id: "investors", icon: <Users size={22} />, label: "Investors", path: "/investor/investors" },
    // {
    //   id: "funds",
    //   icon: <PieChart size={22} />,
    //   label: "Agreement document",
    //   path: "/investor/funds"
    // },
    // { id: "tax", icon: <FileText size={20} />, label: "Tax Report", path: "/investor/tax" },
    // { id: "kyc", icon: <File size={20} />, label: "Documents", path: "/investor/kyc" },
    // { id: "settings", icon: <Settings size={20} />, label: "Settings", path: "/investor/settings" },
    // { id: "notifications", icon: <Bell size={20} />, label: "Notifications", path: "/investor/notifications" },
    // { id: "support", icon: <HelpCircle size={20} />, label: "Support", path: "/investor/support" },
  ];
  return (
    <div className="bg-bgPrimary h-full px-7 py-12 flex gap-9">
      <Sidebar menuItems={menuItems} userRole="investor" />
      <div className="w-full h-[calc(100vh-96px)] bg-secondary rounded-[40px]">
        <header className="w-full flex justify-between items-center py-7 px-9 relative">
          <h3 className="text-xl font-semibold text-[#000000b3]">Investors</h3>
          <div className="flex items-center gap-4">
            <div className="text-bgPrimary cursor-pointer">
              <BsBellFill size={22} />
            </div>
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              {/* <img src={avatar} alt="" className="h-8 w-8 rounded-full object-contain " /> */}
              <h3 className="font-nunito text-sm capitalize">
                {user?.name || ""}
              </h3>
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
