import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useDashboardAssets,
  useClearUserCache,
} from "../../FundManager/hooks/Theme&AssetsHooks";
import { useAuth } from "../../Context/AuthContext";

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  userRole: string;
}

const ManagerSidebar: React.FC<SidebarProps> = ({ menuItems, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("");
  const clearUserCache = useClearUserCache();

  const {
    data: dashboardAssets,
    isLoading: assetsLoading,
    error: assetsError,
    refetch: refetchAssets,
  } = useDashboardAssets();

  // Clear cache when user changes (login/logout)
  useEffect(() => {
    const currentUserId = user?.id;

    // Clear cache when user changes or logs out
    if (!currentUserId) {
      clearUserCache();
    }
  }, [user?.id, clearUserCache]);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(
      (item) =>
        currentPath === item.path ||
        (item.path === "/fundmanager/dashboard" &&
          currentPath === "/fundmanager/dashboard")
    );

    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [location.pathname, menuItems]);

  // Force refetch assets when user role changes and user is fund manager
  useEffect(() => {
    if (userRole === "fundManager" && user?.id) {
      refetchAssets?.();
    }
  }, [userRole, user?.id, refetchAssets]);

  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item.id);
    navigate(item.path);
  };

  const getLogoAndInfo = () => {
    if (userRole === "fundManager") {
      if (assetsLoading) {
        return {
          logo: null,
          projectName: null,
          isLoading: true,
        };
      }

      if (assetsError || !dashboardAssets?.data) {
        return {
          logo: null,
          projectName: null,
          isLoading: false,
        };
      }

      return {
        logo: dashboardAssets.data.logoUrl,
        projectName: dashboardAssets.data.projectName,
        isLoading: false,
      };
    }

    return {
      logo: null,
      projectName: null,
      isLoading: false,
    };
  };

  const { logo, projectName, isLoading } = getLogoAndInfo();

  const LoadingSkeleton = () => (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const LogoLoader = () => (
    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-theme-sidebar-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const DefaultLogo = () => (
    <img src="/assets/logo.png" alt="" className="object-contain h-8" />
  );

  return (
    <div className="w-full max-w-[302px] min-h-[calc(100vh-96px)] overflow-hidden">
      <div className="bg-theme-card p-6 flex flex-col h-full rounded-[40px]">
        <div className="flex items-center mt-6 mb-10 gap-3">
          <div className="flex-shrink-0">
            {userRole === "fundManager" ? (
              <>
                {isLoading ? (
                  <LogoLoader />
                ) : logo ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      key={`${logo}-${user?.id}`} // Force re-render when logo or user changes
                      src={logo}
                      alt="Project Logo"
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-theme-sidebar-accent/10 flex items-center justify-center">
                              <span class="text-theme-sidebar-accent text-xs font-semibold">${
                                projectName?.charAt(0) || "P"
                              }</span>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <DefaultLogo />
                )}
              </>
            ) : (
              <img
                src="/assets/logo.png"
                alt="Logo"
                className="h-12 max-h-12 object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    target.style.display = "none";
                    const fallbackDiv = document.createElement("div");
                    fallbackDiv.className =
                      "w-12 h-12 bg-theme-sidebar-accent/10 rounded-lg flex items-center justify-center";
                    fallbackDiv.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-theme-sidebar-accent/60"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`;
                    parent.appendChild(fallbackDiv);
                  }
                }}
              />
            )}
          </div>

          {userRole === "fundManager" && (
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <h3
                  key={`${projectName}-${user?.id}`} // Force re-render when project name or user changes
                  className="text-theme-primary font-semibold text-sm leading-tight truncate"
                >
                  {projectName || "Project Name"}
                </h3>
              )}
            </div>
          )}
        </div>

        {userRole === "fundManager" && assetsError && !isLoading && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs mb-2">
              Failed to load project assets
            </p>
            <button
              onClick={() => refetchAssets?.()}
              className="text-red-600 text-xs underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="flex-1 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center w-full px-4 py-4 rounded-[10px] transition-colors text-sm font-poppins font-normal ${
                activeItem === item.id
                  ? "bg-theme-sidebar-accent text-white"
                  : "text-theme-sidebar-accent hover:bg-theme-sidebar-accent hover:text-white"
              }`}
              onClick={() => handleItemClick(item)}
            >
              <span className="mr-3 text-current">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="h-32"></div>
      </div>
    </div>
  );
};

export default ManagerSidebar;
