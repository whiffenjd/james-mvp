import React, { useEffect } from "react";

import { useThemeContext } from "../../../Context/InvestorThemeContext";

interface ThemeContainerProps {
  children: React.ReactNode;
  className?: string;
  applyGlobally?: boolean; // Option to apply theme globally
}

const InvestorThemeContainer: React.FC<ThemeContainerProps> = ({
  children,
  className = "",
  applyGlobally = false,
}) => {
  const { currentTheme, isLoadingCurrentTheme } = useThemeContext();

  // Apply CSS variables to document root if applyGlobally is true
  useEffect(() => {
    if (applyGlobally && currentTheme) {
      const root = document.documentElement;
      root.style.setProperty(
        "--dashboard-bg",
        currentTheme.dashboardBackground
      );
      root.style.setProperty("--card-bg", currentTheme.cardBackground);
      root.style.setProperty("--primary-text", currentTheme.primaryText);
      root.style.setProperty("--secondary-text", currentTheme.secondaryText);
      root.style.setProperty(
        "--sidebar-accent",
        currentTheme.sidebarAccentText
      );
    }
  }, [currentTheme, applyGlobally]);

  if (isLoadingCurrentTheme) {
    return (
      <div
        className={`theme-container-loading ${className} flex items-center justify-center p-8`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading theme...</span>
      </div>
    );
  }

  const themeStyles = currentTheme
    ? ({
        "--dashboard-bg": currentTheme.dashboardBackground,
        "--card-bg": currentTheme.cardBackground,
        "--primary-text": currentTheme.primaryText,
        "--secondary-text": currentTheme.secondaryText,
        "--sidebar-accent": currentTheme.sidebarAccentText,
      } as React.CSSProperties)
    : {};

  console.log("ThemeContainer - Current Theme:", currentTheme);
  console.log("ThemeContainer - Theme Styles:", themeStyles);

  return (
    <div
      className={`theme-container ${className}`}
      style={themeStyles}
      data-theme-applied={!!currentTheme}
    >
      {children}
    </div>
  );
};

export default InvestorThemeContainer;
