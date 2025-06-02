// contexts/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext"; // Adjust import path as needed
import {
  useThemes,
  useThemeById,
  useApplyTheme,
  useSelectedTheme,
} from "../FundManager/hooks/Theme&AssetsHooks";
import type { Theme } from "./ThemeContext";

interface ThemeContextType {
  // Current applied theme
  currentTheme: Theme | null;

  // All available themes
  themes: Theme[];

  // Loading states
  isLoadingThemes: boolean;
  isLoadingCurrentTheme: boolean;
  isApplyingTheme: boolean;

  // Theme operations
  applyTheme: (themeId: string) => Promise<void>;
  refreshTheme: () => void;

  // Error states
  themeError: string | null;

  // Helper methods
  getThemeById: (id: string) => Theme | undefined;
  isThemeApplied: (themeId: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  userType?: "investor" | "fund-manager"; // Add user type support
}

export const InvestorThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  userType = "investor",
}) => {
  const { user, isAuthenticated } = useAuth();

  // Local state for managing theme operations
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Only fetch data when user is authenticated and is an investor
  const shouldFetchThemes = isAuthenticated && userType === "investor";

  // Fetch all themes
  const {
    data: themesResponse,
    isLoading: isLoadingThemes,
    error: themesError,
    refetch: refetchThemes,
  } = useThemes({
    enabled: shouldFetchThemes,
  });

  // Get selected theme info
  const {
    data: selectedThemeResponse,
    isLoading: isLoadingSelectedTheme,
    error: selectedThemeError,
    refetch: refetchSelectedTheme,
  } = useSelectedTheme({
    enabled: shouldFetchThemes,
  });

  // Determine which theme ID to fetch
  const selectedThemeId =
    user?.selectedTheme || selectedThemeResponse?.data?.selectedThemeId;

  // Fetch specific theme by ID
  const {
    data: currentThemeResponse,
    isLoading: isLoadingCurrentTheme,
    error: currentThemeError,
    refetch: refetchCurrentTheme,
  } = useThemeById(
    selectedThemeId || "",
    shouldFetchThemes && !!selectedThemeId
  );

  // Apply theme mutation
  const applyThemeMutation = useApplyTheme();

  // Extract themes array
  const themes = themesResponse?.data || [];

  // Determine loading states
  const isApplyingTheme = applyThemeMutation.isPending;
  const isAnyLoading =
    isLoadingThemes || isLoadingSelectedTheme || isLoadingCurrentTheme;

  // Handle theme initialization and updates
  useEffect(() => {
    if (!shouldFetchThemes) {
      setIsInitialized(false);
      setCurrentTheme(null);
      return;
    }

    // ✅ Fix: If currentThemeResponse.data is an array, extract the first item
    const themeData = Array.isArray(currentThemeResponse?.data)
      ? currentThemeResponse.data[0]
      : currentThemeResponse?.data;

    if (currentThemeResponse?.success && themeData) {
      setCurrentTheme(themeData);
      setThemeError(null);
      setIsInitialized(true);
      return;
    }

    if (selectedThemeId && themes.length > 0) {
      const foundTheme = themes.find((theme) => theme.id === selectedThemeId);
      if (foundTheme) {
        setCurrentTheme(foundTheme);
        setThemeError(null);
        setIsInitialized(true);
        return;
      }
    }

    if (!selectedThemeId && isInitialized) {
      setCurrentTheme(null);
      setThemeError(null);
    }

    if (!isAnyLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [
    currentThemeResponse,
    selectedThemeId,
    themes,
    shouldFetchThemes,
    isAnyLoading,
    isInitialized,
  ]);

  // Handle errors
  useEffect(() => {
    const errors = [
      themesError?.message,
      selectedThemeError?.message,
      currentThemeError?.message,
      applyThemeMutation.error?.message,
    ].filter(Boolean);

    if (errors.length > 0) {
      setThemeError(errors[0] || "An error occurred while loading theme");
    } else {
      setThemeError(null);
    }
  }, [
    themesError,
    selectedThemeError,
    currentThemeError,
    applyThemeMutation.error,
  ]);

  // Apply theme function
  const applyTheme = useCallback(
    async (themeId: string) => {
      if (!shouldFetchThemes) {
        throw new Error(
          "User must be authenticated as investor to apply themes"
        );
      }

      try {
        setThemeError(null);

        // Find the theme in our themes list
        const themeToApply = themes.find((theme) => theme.id === themeId);
        if (!themeToApply) {
          throw new Error("Theme not found");
        }

        // Apply the theme via API
        await applyThemeMutation.mutateAsync({ themeId });

        // Update local state immediately for better UX
        setCurrentTheme(themeToApply);

        // Refresh selected theme data to ensure consistency
        await refetchSelectedTheme();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to apply theme";
        setThemeError(errorMessage);
        throw error;
      }
    },
    [shouldFetchThemes, themes, applyThemeMutation, refetchSelectedTheme]
  );

  // Refresh theme data
  const refreshTheme = useCallback(() => {
    if (!shouldFetchThemes) return;

    refetchThemes();
    refetchSelectedTheme();
    if (selectedThemeId) {
      refetchCurrentTheme();
    }
  }, [
    shouldFetchThemes,
    refetchThemes,
    refetchSelectedTheme,
    refetchCurrentTheme,
    selectedThemeId,
  ]);

  // Helper functions
  const getThemeById = useCallback(
    (id: string): Theme | undefined => {
      return themes.find((theme) => theme.id === id);
    },
    [themes]
  );

  const isThemeApplied = useCallback(
    (themeId: string): boolean => {
      return currentTheme?.id === themeId;
    },
    [currentTheme]
  );

  const contextValue: ThemeContextType = {
    currentTheme,
    themes,
    isLoadingThemes: isLoadingThemes || !isInitialized,
    isLoadingCurrentTheme: isLoadingCurrentTheme || !isInitialized,
    isApplyingTheme,
    applyTheme,
    refreshTheme,
    themeError,
    getThemeById,
    isThemeApplied,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

// Theme Loading Component
export const ThemeLoaderInvestor: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isLoadingThemes, isLoadingCurrentTheme, themeError } =
    useThemeContext();

  if (themeError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-2">Theme Error</div>
          <div className="text-gray-600">{themeError}</div>
        </div>
      </div>
    );
  }

  if (isLoadingThemes || isLoadingCurrentTheme) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading theme...</span>
      </div>
    );
  }

  return <>{children}</>;
};

// CSS Variables Injector Component
export const ThemeCSSInjector: React.FC = () => {
  const { currentTheme } = useThemeContext();

  useEffect(() => {
    if (!currentTheme) {
      // Remove custom theme variables if no theme is applied
      const root = document.documentElement;
      root.style.removeProperty("--dashboard-background");
      root.style.removeProperty("--card-background");
      root.style.removeProperty("--primary-text");
      root.style.removeProperty("--secondary-text");
      root.style.removeProperty("--sidebar-accent-text");
      return;
    }

    // Apply theme CSS variables
    const root = document.documentElement;
    root.style.setProperty(
      "--dashboard-background",
      currentTheme.dashboardBackground
    );
    root.style.setProperty("--card-background", currentTheme.cardBackground);
    root.style.setProperty("--primary-text", currentTheme.primaryText);
    root.style.setProperty("--secondary-text", currentTheme.secondaryText);
    root.style.setProperty(
      "--sidebar-accent-text",
      currentTheme.sidebarAccentText
    );
  }, [currentTheme]);

  return null;
};

// Export types for external use
export type { ThemeContextType };
