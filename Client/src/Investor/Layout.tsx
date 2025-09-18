// 1. FIXED InvestorLayout.tsx - Apply theme styles properly
import { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BsBellFill } from "react-icons/bs";
import { FaCaretDown } from "react-icons/fa";
import { Bell, CircleDollarSign, Files, LayoutGrid } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import ManagerSidebar from "../FundManager/Public/ManagerSidebar";
import { useThemeContext } from "../Context/InvestorThemeContext";
import { useGetUnreadCount } from "../API/Endpoints/Notification/notification";

const InvestorLayout = () => {
  const { user, logout } = useAuth();

  const { currentTheme, isLoadingCurrentTheme } = useThemeContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data, isPending } = useGetUnreadCount(user?.id);
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

  const menuItems = [
    {
      id: "dashboard",
      icon: <LayoutGrid size={22} />,
      label: "Dashboard",
      path: "/investor/dashboard",
    },
    {
      id: "funds",
      icon: <CircleDollarSign size={22} />,
      label: "Funds",
      path: "funds",
    },
    {
      id: "tax",
      icon: <CircleDollarSign size={22} />,
      label: "Tax Reports",
      path: "tax", // This matches your nested route
    },
    {
      id: "Subscription_Documents",
      icon: <Files size={22} />,
      label: "Subscription Documents",
      path: "subscription-documents",
    },
    {
      id: "notifications",
      icon: (
        <div className={`relative ${isPending ? 'opacity-70 blur-[1px]' : ''}`}>
          <Bell size={22} />
          {!isPending && unreadCount > 0 && (
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

  // Show loading state while theme is loading
  if (isLoadingCurrentTheme) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading theme...</span>
      </div>
    );
  }

  // Default fallback colors if no theme is applied
  const themeStyles = {
    dashboardBg: currentTheme?.dashboardBackground,
    cardBg: currentTheme?.cardBackground || "#ffffff",
    primaryText: currentTheme?.primaryText || "#111827",
    secondaryText: currentTheme?.secondaryText || "#6b7280",
    sidebarAccent: currentTheme?.sidebarAccentText || "#3b82f6",
  };

  return (
    <div
      className="min-h-screen px-7 py-12 flex gap-9 transition-colors duration-300"
      style={{
        backgroundColor: currentTheme?.dashboardBackground,
      }}
    >
      <ManagerSidebar menuItems={menuItems} userRole="investor" />

      <div
        className="w-full h-[calc(100vh-96px)] rounded-[40px] transition-colors duration-300"
        style={{ backgroundColor: themeStyles.cardBg }}
      >
        <header className="w-full flex justify-between items-center py-7 px-9 relative">
          <h3
            className="text-xl font-semibold transition-colors duration-300"
            style={{ color: themeStyles.primaryText }}
          >
            Investor Dashboard
          </h3>

          <div className="flex items-center gap-4">
            <div className="cursor-pointer transition-colors duration-300">
              <BsBellFill
                size={22}
                style={{ color: themeStyles.sidebarAccent }}
              />
            </div>

            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              <h3
                className="font-nunito text-sm capitalize transition-colors duration-300"
                style={{ color: themeStyles.primaryText }}
              >
                {user?.name || "User"}
              </h3>

              <button
                className="p-2 transition-colors duration-300"
                style={{ color: themeStyles.sidebarAccent }}
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <FaCaretDown />
              </button>

              {showDropdown && (
                <div
                  className="absolute top-6 right-2 shadow-lg rounded-lg py-2 px-4 z-50 min-w-[120px] border transition-colors duration-300"
                  style={{
                    backgroundColor: themeStyles.cardBg,
                    borderColor: themeStyles.secondaryText + "40", // Add opacity
                  }}
                >
                  <button
                    className="text-red-600 font-medium text-sm hover:underline disabled:opacity-50"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-red-600 rounded-full mr-2"></span>
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

        {/* Outlet with theme context */}
        <div className="px-9 pb-7 h-[calc(100%-88px)] overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default InvestorLayout;
