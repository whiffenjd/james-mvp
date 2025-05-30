// Context/ThemeContext.tsx - Fixed with backend priority and auto-sync
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  useApplyTheme,
  useSelectedTheme,
  useThemes,
  useThemeById,
} from "../FundManager/hooks/Theme&AssetsHooks";
import { useAuth } from "./AuthContext";

export interface Theme {
  id?: string;
  userId?: string;
  dashboardBackground: string;
  cardBackground: string;
  primaryText: string;
  secondaryText: string;
  sidebarAccentText: string;
  createdAt?: string;
  selectedThemeId?: string | null;
}

interface ThemeContextType {
  currentTheme: Theme;
  selectedThemeId: string | null;
  setCurrentTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
  handleThemeDeleted: (
    deletedThemeId: string,
    availableThemes?: Theme[]
  ) => void;
  isLoading: boolean;
  error: string | null;
}

const defaultTheme: Theme = {
  dashboardBackground: "#14B8A6", // teal-500
  cardBackground: "#FFFFFF",
  primaryText: "#000000",
  secondaryText: "#6B7280",
  sidebarAccentText: "#14B8A6",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  dashboardType?: "fundManager" | "investor" | "admin";
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  dashboardType = "fundManager",
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id;
  const userSelectedThemeId = user?.selectedThemeId; // Get from user object

  // Track initialization
  const isInitialized = useRef(false);
  const hasSetInitialTheme = useRef(false);

  // TanStack Query hooks
  const {
    data: selectedThemeData,
    isLoading: isThemeLoading,
    error: themeError,
    refetch: refetchSelectedTheme,
  } = useSelectedTheme();

  const { data: allThemesData } = useThemes(); // Get all themes
  const applyThemeMutation = useApplyTheme();

  // Get specific theme by ID when we have a selected theme ID
  const { data: specificThemeData, isLoading: isSpecificThemeLoading } =
    useThemeById(
      selectedThemeId || userSelectedThemeId || "",
      !!(selectedThemeId || userSelectedThemeId)
    );

  // Generate user-specific localStorage key
  const getUserThemeKey = useCallback(
    (userId: string) => `theme_${userId}`,
    []
  );

  // Load theme from localStorage (only as cache)
  const loadThemeFromStorage = useCallback(
    (userId: string): Theme | null => {
      try {
        const userThemeKey = getUserThemeKey(userId);
        const savedTheme = localStorage.getItem(userThemeKey);

        if (savedTheme) {
          const themeData = JSON.parse(savedTheme);
          return themeData;
        }
      } catch (error) {
        console.error("Error loading theme from localStorage:", error);
      }
      return null;
    },
    [getUserThemeKey]
  );

  // Save theme to localStorage (as cache only)
  const saveThemeToStorage = useCallback(
    (userId: string, theme: Theme, themeId?: string) => {
      try {
        const userThemeKey = getUserThemeKey(userId);
        const themeData = {
          ...theme,
          selectedThemeId: themeId || null,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(userThemeKey, JSON.stringify(themeData));
      } catch (error) {
        console.error("Error saving theme to localStorage:", error);
      }
    },
    [getUserThemeKey]
  );

  // Find theme from available themes by ID
  const findThemeById = useCallback(
    (themeId: string, themes: Theme[]): Theme | null => {
      return themes.find((theme) => theme.id === themeId) || null;
    },
    []
  );

  // Apply theme function
  const applyTheme = useCallback(
    async (theme: Theme) => {
      console.log("Applying theme:", theme);

      // Always update local state immediately
      setCurrentTheme(theme);
      setSelectedThemeId(theme.id || null);

      // Cache to localStorage
      if (dashboardType === "fundManager" && userId) {
        saveThemeToStorage(userId, theme, theme.id);

        // Save to backend
        try {
          if (theme.id) {
            await applyThemeMutation.mutateAsync({ themeId: theme.id });
          } else {
            // Clear selection for default theme
            await applyThemeMutation.mutateAsync({ themeId: null });
          }
        } catch (error) {
          console.error("Failed to save theme to database:", error);
        }
      }
    },
    [dashboardType, userId, saveThemeToStorage, applyThemeMutation]
  );

  // Handle theme deletion
  const handleThemeDeleted = useCallback(
    async (deletedThemeId: string, availableThemes?: Theme[]) => {
      if (selectedThemeId === deletedThemeId) {
        console.log("Deleted theme was selected, switching to fallback");

        let fallbackTheme: Theme;
        let fallbackThemeId: string | null = null;

        if (availableThemes && availableThemes.length > 0) {
          fallbackTheme = availableThemes[0];
          fallbackThemeId = fallbackTheme.id || null;
        } else {
          fallbackTheme = defaultTheme;
          fallbackThemeId = null;
        }

        await applyTheme(fallbackTheme);
      }
    },
    [selectedThemeId, applyTheme]
  );

  // Main effect to handle theme initialization and sync
  useEffect(() => {
    if (dashboardType !== "fundManager" || !userId) return;

    // Skip if we've already set the initial theme
    if (hasSetInitialTheme.current) return;

    const initializeTheme = async () => {
      console.log("Initializing theme for user:", userId);
      console.log("User selected theme ID:", userSelectedThemeId);
      console.log("All themes data available:", !!allThemesData?.data);

      // Wait for themes data to be available before proceeding
      if (!allThemesData?.success || !allThemesData.data) {
        console.log("Waiting for themes data...");
        return;
      }

      try {
        // Priority 1: Use user's selectedThemeId if available
        if (userSelectedThemeId) {
          console.log("Using user's selected theme ID from user object");

          const selectedTheme = findThemeById(
            userSelectedThemeId,
            allThemesData.data
          );
          if (selectedTheme) {
            console.log("Found theme from user's selection:", selectedTheme);
            setCurrentTheme(selectedTheme);
            setSelectedThemeId(userSelectedThemeId);
            saveThemeToStorage(userId, selectedTheme, userSelectedThemeId);
            hasSetInitialTheme.current = true;
            return;
          } else {
            console.log("User's selected theme not found in available themes");
          }
        }

        // Priority 2: Fetch from backend if user doesn't have selectedThemeId
        console.log("Fetching theme from backend...");
        const { data: backendThemeData } = await refetchSelectedTheme();
        if (
          backendThemeData?.success &&
          backendThemeData.data?.selectedThemeId
        ) {
          console.log(
            "Using theme from backend:",
            backendThemeData.data.selectedThemeId
          );

          const selectedTheme = findThemeById(
            backendThemeData.data.selectedThemeId,
            allThemesData.data
          );
          if (selectedTheme) {
            setCurrentTheme(selectedTheme);
            setSelectedThemeId(backendThemeData.data.selectedThemeId);
            saveThemeToStorage(
              userId,
              selectedTheme,
              backendThemeData.data.selectedThemeId
            );
            hasSetInitialTheme.current = true;
            return;
          }
        }

        // Priority 3: Check localStorage cache
        const localTheme = loadThemeFromStorage(userId);
        if (localTheme && localTheme.selectedThemeId) {
          console.log("Using theme from localStorage cache");
          const cachedTheme = findThemeById(
            localTheme.selectedThemeId,
            allThemesData.data
          );
          if (cachedTheme) {
            setCurrentTheme(cachedTheme);
            setSelectedThemeId(localTheme.selectedThemeId);
            hasSetInitialTheme.current = true;
            return;
          }
        }

        // Priority 4: Use default theme
        console.log("Using default theme");
        setCurrentTheme(defaultTheme);
        setSelectedThemeId(null);
        hasSetInitialTheme.current = true;
      } catch (error) {
        console.error("Error initializing theme:", error);
        // Fallback to default theme on error
        setCurrentTheme(defaultTheme);
        setSelectedThemeId(null);
        hasSetInitialTheme.current = true;
      } finally {
        isInitialized.current = true;
      }
    };

    // Initialize theme
    initializeTheme();
  }, [
    userId,
    dashboardType,
    userSelectedThemeId,
    allThemesData, // This will trigger when themes are loaded
    findThemeById,
    loadThemeFromStorage,
    saveThemeToStorage,
    refetchSelectedTheme,
  ]);

  // Effect to handle specific theme loading when we have an ID but not the theme data
  useEffect(() => {
    if (
      specificThemeData?.success &&
      specificThemeData.data &&
      !isSpecificThemeLoading &&
      selectedThemeId &&
      selectedThemeId === specificThemeData.data.id
    ) {
      console.log("Loading specific theme data:", specificThemeData.data);
      setCurrentTheme(specificThemeData.data);

      if (userId) {
        saveThemeToStorage(userId, specificThemeData.data, selectedThemeId);
      }
    }
  }, [
    specificThemeData,
    isSpecificThemeLoading,
    selectedThemeId,
    userId,
    saveThemeToStorage,
  ]);

  // Handle user login/logout and theme updates
  useEffect(() => {
    if (!userId) {
      console.log("User logged out, resetting theme");
      setCurrentTheme(defaultTheme);
      setSelectedThemeId(null);
      isInitialized.current = false;
      hasSetInitialTheme.current = false;
    } else if (userId && !hasSetInitialTheme.current) {
      // User just logged in, reset flags to trigger theme initialization
      console.log("User logged in, preparing for theme initialization");
      isInitialized.current = false;
      hasSetInitialTheme.current = false;
    }
  }, [userId]);

  // Watch for changes in user's selectedThemeId (important for first login)
  useEffect(() => {
    if (
      dashboardType === "fundManager" &&
      userId &&
      userSelectedThemeId &&
      allThemesData?.success &&
      allThemesData.data &&
      (selectedThemeId !== userSelectedThemeId || !hasSetInitialTheme.current)
    ) {
      console.log("User selectedThemeId changed or first load, updating theme");

      const selectedTheme = findThemeById(
        userSelectedThemeId,
        allThemesData.data
      );
      if (selectedTheme) {
        console.log("Applying theme from user object:", selectedTheme);
        setCurrentTheme(selectedTheme);
        setSelectedThemeId(userSelectedThemeId);
        saveThemeToStorage(userId, selectedTheme, userSelectedThemeId);
        hasSetInitialTheme.current = true;
      }
    }
  }, [
    userId,
    userSelectedThemeId,
    allThemesData,
    selectedThemeId,
    dashboardType,
    findThemeById,
    saveThemeToStorage,
  ]);

  const contextValue: ThemeContextType = {
    currentTheme,
    selectedThemeId,
    setCurrentTheme,
    applyTheme,
    handleThemeDeleted,
    isLoading:
      isThemeLoading || applyThemeMutation.isPending || isSpecificThemeLoading,
    error: themeError?.message || applyThemeMutation.error?.message || null,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
