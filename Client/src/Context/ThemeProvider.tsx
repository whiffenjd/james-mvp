import React, { useEffect } from "react";

import { useAuth } from "../Context/AuthContext";
import { useThemeManagement } from "../FundManager/hooks/UseThemeManagement";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { clearUserThemeCache } = useThemeManagement();

  // Clear theme cache when user changes
  useEffect(() => {
    return () => {
      // This will run when the component unmounts or user changes
      clearUserThemeCache();
    };
  }, [user?.id, clearUserThemeCache]);

  return <>{children}</>;
};

export default ThemeProvider;
