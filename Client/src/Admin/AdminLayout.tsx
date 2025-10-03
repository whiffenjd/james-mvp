// FundManagerLayout.tsx (Updated)
import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";

import { LayoutGrid, Users } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";
import { defaultTheme } from "../Context/ThemeContext";
import Sidebar from "../PublicComponents/Components/Sidebar";
import UserDropdown from "../Components/UserDropDown";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Add this effect
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }

    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [isSidebarOpen]);
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
    {
      id: "View",
      icon: <Users size={22} />,
      label: "Users ",
      path: "/admin/users", // This should match your index route
    },
  ];

  return (
    <div
      className="h-full px-4 md:px-7 py-6 md:py-12 flex gap-6 md:gap-9 relative"
      style={{ backgroundColor: defaultTheme.dashboardBackground }}
    >
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ backgroundColor: defaultTheme.cardBackground }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar - hidden on mobile unless toggled */}
      <div
        className={`fixed md:static z-40 h-full transition-all duration-300 
    ${isSidebarOpen ? "left-0" : "-left-full"} md:left-0`}
      >
        <Sidebar menuItems={menuItems} />
      </div>

      {/* Main content area */}
      <div
        className="w-full h-[calc(100vh-48px)] flex flex-col md:h-[calc(100vh-96px)] rounded-2xl md:rounded-[40px] ml-0 md:ml-0"
        style={{ backgroundColor: defaultTheme.cardBackground }}
      >
        <header className="w-full flex justify-between items-center py-4 px-4 md:py-7 md:px-9 relative">
          <h3
            className="text-lg md:text-xl font-semibold"
            style={{ color: defaultTheme.primaryText }}
          >
            Admin
          </h3>
          <div className="flex items-center gap-3 md:gap-4">

            {/* Replace entire dropdown section with: */}
            <UserDropdown
              user={user}
              onLogout={handleLogout}
              currentTheme={defaultTheme}
            />
          </div>
        </header>
        <div className="flex-1 overflow-auto px-4 py-4 md:px-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
