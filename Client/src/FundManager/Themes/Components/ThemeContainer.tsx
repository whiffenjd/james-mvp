import React, { useEffect } from "react";
import { useTheme } from "../../../Context/ThemeContext";

interface ThemeContainerProps {
  children: React.ReactNode;
  className?: string;
  applyGlobally?: boolean; // Option to apply theme globally
}

const ThemeContainer: React.FC<ThemeContainerProps> = ({
  children,
  className = "",
  applyGlobally = false,
}) => {
  const { currentTheme } = useTheme();
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

  const themeStyles = currentTheme
    ? ({
        "--dashboard-bg": currentTheme.dashboardBackground,
        "--card-bg": currentTheme.cardBackground,
        "--primary-text": currentTheme.primaryText,
        "--secondary-text": currentTheme.secondaryText,
        "--sidebar-accent": currentTheme.sidebarAccentText,
      } as React.CSSProperties)
    : {};

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

export default ThemeContainer;
