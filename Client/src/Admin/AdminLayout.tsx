// FundManagerLayout.tsx (Updated)
import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BsBellFill } from "react-icons/bs";
import { FaCaretDown } from "react-icons/fa";
import { LayoutGrid } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

import { defaultTheme } from "../Context/ThemeContext";
import Sidebar from "../PublicComponents/Components/Sidebar";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        e.target &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
      path: "/admin/dashboard", // This should match your index route
    },
  ];

  return (
    <div
      className="h-full px-7 py-12 flex gap-9"
      style={{ backgroundColor: defaultTheme.dashboardBackground }}
    >
      <Sidebar menuItems={menuItems} />
      <div
        className="w-full h-[calc(100vh-96px)] rounded-[40px]"
        style={{ backgroundColor: defaultTheme.cardBackground }}
      >
        <header className="w-full flex justify-between items-center py-7 px-9 relative">
          <h3
            className="text-xl font-semibold"
            style={{ color: defaultTheme.primaryText }}
          >
            Admin
          </h3>
          <div className="flex items-center gap-4">
            <div className="cursor-pointer">
              <BsBellFill
                size={22}
                style={{ color: defaultTheme.sidebarAccentText }}
              />
            </div>
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              <h3
                className="font-nunito text-sm capitalize"
                style={{ color: defaultTheme.primaryText }}
              >
                {user?.name || ""}
              </h3>
              <button
                className="p-2"
                style={{ color: defaultTheme.sidebarAccentText }}
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <FaCaretDown />
              </button>
              {showDropdown && (
                <div
                  className="absolute top-6 right-2 shadow-md rounded-lg py-2 px-4 z-50 min-w-[120px]"
                  style={{ backgroundColor: defaultTheme.cardBackground }}
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

export default AdminLayout;
