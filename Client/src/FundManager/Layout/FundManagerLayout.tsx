// FundManagerLayout.tsx (Updated)
import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BsBellFill } from "react-icons/bs";
import { FaCaretDown } from "react-icons/fa";
import { Bell, CircleDollarSign, LayoutGrid, Settings } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useTheme } from "../../Context/ThemeContext";
import ManagerSidebar from "../Public/ManagerSidebar";
import { useGetUnreadCount } from "../../API/Endpoints/Notification/notification";

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
      path: "/fundmanager/dashboard", // This should match your index route
    },
    {
      id: "investors",
      icon: <CircleDollarSign size={22} />,
      label: "Investors",
      path: "investors", // This matches your nested route
    },
    {
      id: "Funds",
      icon: <CircleDollarSign size={22} />,
      label: "Funds and Reporting",
      path: "funds", // This matches your nested route
    },
    {
      id: "tax",
      icon: <CircleDollarSign size={22} />,
      label: "Tax Reports",
      path: "tax", // This matches your nested route
    },
    {
      id: "documents",
      icon: <CircleDollarSign size={22} />,
      label: "AML/KYC Documents",
      path: "documents", // This matches your nested route
    },
    {
      id: "settings",
      icon: <Settings size={22} />,
      label: "Settings",
      path: "settings", // This matches your nested route
    },
    {
      id: "notifications",
      icon: (
        <div className={`relative ${isLoading ? 'opacity-70 blur-[1px]' : ''}`}>
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
    }
  ];

  return (
    <div
      className="h-full px-7 py-12 flex gap-9"
      style={{ backgroundColor: currentTheme.dashboardBackground }}
    >
      <ManagerSidebar menuItems={menuItems} userRole="fundManager" />
      <div
        className="w-full h-[calc(100vh-96px)] rounded-[40px] flex flex-col"
        style={{ backgroundColor: currentTheme.cardBackground }}
      >
        <header className="w-full flex justify-between items-center py-7 px-9 relative flex-shrink-0">
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
        <div className="flex-1 overflow-auto px-9 pb-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FundManagerLayout;
