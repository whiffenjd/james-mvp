// FundManagerLayout.tsx (Fixed)
import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BsBellFill } from "react-icons/bs";
import { FaCaretDown } from "react-icons/fa";
import {
  Bell,
  CircleDollarSign,
  Files,
  FileText,
  LayoutGrid,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useTheme } from "../../Context/ThemeContext";
import ManagerSidebar from "../Public/ManagerSidebar";
import { useGetUnreadCount } from "../../API/Endpoints/Notification/notification";
import UserDropdown from "../../Components/UserDropDown";

const FundManagerLayout = () => {
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data, isLoading } = useGetUnreadCount(user?.id);
  const unreadCount = data?.unreadCount || 0;

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
      path: "/fundmanager/dashboard",
    },
    {
      id: "investors",
      icon: <Users size={22} />,
      label: "Investors",
      path: "investors",
    },
    {
      id: "Funds",
      icon: <CircleDollarSign size={22} />,
      label: "Funds and Reporting",
      path: "funds",
    },
    {
      id: "Subscription_Documents",
      icon: <Files size={22} />,
      label: "Subscription Documents",
      path: "subscription-documents",
    },
    {
      id: "tax",
      icon: <Receipt size={22} />,
      label: "Tax Reports",
      path: "tax",
    },
    {
      id: "documents",
      icon: <FileText size={22} />,
      label: "AML/KYC Documents",
      path: "documents",
    },

    {
      id: "settings",
      icon: <Settings size={22} />,
      label: "Settings",
      path: "settings",
    },
    {
      id: "notifications",
      icon: (
        <div className={`relative ${isLoading ? "opacity-70 blur-[1px]" : ""}`}>
          <Bell size={22} />
          {!isLoading && unreadCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      ),
      label: "Notifications",
      path: "notifications",
    },
  ];

  return (
    <div
      className="h-full min-h-screen px-7 py-12 flex gap-9"
      style={{ backgroundColor: currentTheme.dashboardBackground }}
    >
      {/* Sidebar - Fixed width, no flex shrinking */}
      <div className="flex-shrink-0">
        <ManagerSidebar menuItems={menuItems} userRole="fundManager" />
      </div>

      {/* Main content area - Takes remaining space but constrained */}
      <div
        className="flex-1 min-w-0 h-[calc(100vh-96px)] rounded-[40px] flex flex-col overflow-hidden"
        style={{ backgroundColor: currentTheme.cardBackground }}
      >
        {/* Header */}
        <header className="w-full flex justify-between items-center py-7 px-9 relative flex-shrink-0">
          <h3
            className="text-xl font-semibold"
            style={{ color: currentTheme.primaryText }}
          >
            Fund Manager
          </h3>
          <div className="flex items-center gap-4">


            {/* Replace the entire dropdown section with this: */}
            <UserDropdown
              user={user}
              onLogout={handleLogout}
              currentTheme={currentTheme}
            />
          </div>
        </header>

        {/* Content area with proper constraints */}
        <div className="flex-1 min-w-0 overflow-hidden px-9 pb-9">
          <div className="w-full h-full max-w-full min-w-0 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundManagerLayout;
