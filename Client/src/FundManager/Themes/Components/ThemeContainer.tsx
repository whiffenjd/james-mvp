// components/ThemeContainer.tsx
import React, { useEffect } from "react";
import { useTheme } from "../../../Context/ThemeContext";

interface ThemeContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ThemeContainer: React.FC<ThemeContainerProps> = ({
  children,
  className = "",
}) => {
  const { currentTheme } = useTheme();

  return (
    <div
      className={`theme-container ${className}`}
      style={
        {
          // Set CSS variables directly on this container
          "--dashboard-bg": currentTheme.dashboardBackground,
          "--card-bg": currentTheme.cardBackground,
          "--primary-text": currentTheme.primaryText,
          "--secondary-text": currentTheme.secondaryText,
          "--sidebar-accent": currentTheme.sidebarAccentText,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default ThemeContainer;
