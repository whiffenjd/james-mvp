// FundManagerLayout.tsx (Updated)
import React, { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BsBellFill } from "react-icons/bs";
import { FaCaretDown } from "react-icons/fa";
import { LayoutGrid, Settings } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useTheme } from "../../Context/ThemeContext";
import Sidebar from "../../PublicComponents/Components/Sidebar";
import ManagerSidebar from "../Public/ManagerSidebar";

const FundManagerLayout = () => {
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const avatar = user?.avatar || "/assets/avatar.png";
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isLoading, isInitializing, isApplyingTheme, isThemeReady } =
    useTheme();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(setIsLoggingOut);
  };

  // Updated menu items with proper paths
  const menuItems = [
    {
      id: "dashboard",
      icon: <LayoutGrid size={22} />,
      label: "Dashboard",
      path: "/fundmanager/dashboard", // This should match your index route
    },
    {
      id: "settings",
      icon: <Settings size={22} />,
      label: "Settings",
      path: "/fundmanager/dashboard/settings", // This matches your nested route
    },
  ];
  // if (isLoading || isInitializing || isApplyingTheme) {
  //   return (
  //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm">
  //       <div className="flex flex-col items-center space-y-4">
  //         <div className="relative">
  //           <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
  //           <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent absolute inset-0"></div>
  //         </div>
  //         <div className="text-center">
  //           <p className="text-gray-700 font-medium">
  //             {isInitializing ? "Initializing theme..." : "Applying theme..."}
  //           </p>
  //           <p className="text-gray-500 text-sm mt-1">Please wait</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div
      className="h-full px-7 py-12 flex gap-9"
      style={{ backgroundColor: currentTheme.dashboardBackground }}
    >
      <ManagerSidebar menuItems={menuItems} userRole="fundManager" />
      <div
        className="w-full h-[calc(100vh-96px)] rounded-[40px]"
        style={{ backgroundColor: currentTheme.cardBackground }}
      >
        <header className="w-full flex justify-between items-center py-7 px-9 relative">
          <h3
            className="text-xl font-semibold"
            style={{ color: currentTheme.primaryText }}
          >
            Fund Manager
          </h3>
          <div className="flex items-center gap-4">
            <div className="cursor-pointer">
              <BsBellFill
                size={22}
                style={{ color: currentTheme.sidebarAccentText }}
              />
            </div>
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              <h3
                className="font-nunito text-sm capitalize"
                style={{ color: currentTheme.primaryText }}
              >
                {user?.name || ""}
              </h3>
              <button
                className="p-2"
                style={{ color: currentTheme.sidebarAccentText }}
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <FaCaretDown />
              </button>
              {showDropdown && (
                <div
                  className="absolute top-6 right-2 shadow-md rounded-lg py-2 px-4 z-50 min-w-[120px]"
                  style={{ backgroundColor: currentTheme.cardBackground }}
                >
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

export default FundManagerLayout;
