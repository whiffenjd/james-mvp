// Context/ThemeContext.tsx - Fixed with corrected selectedTheme.selectedThemeId logic
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
  name?: string;
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
  isInitializing: boolean;
  isApplyingTheme: boolean;
  isThemeReady: boolean;
  error: string | null;
}

const defaultTheme: Theme = {
  id: "default",
  userId: "null",
  name: "Default",
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
  const { user } = useAuth();
  const userId = user?.id;

  // FIXED: Extract selectedThemeId from user.selectedTheme object
  const userSelectedThemeId = user?.selectedTheme;
  console.log("User selectedTheme object:", user?.selectedTheme);
  console.log("Extracted selectedThemeId:", userSelectedThemeId);

  // Enhanced loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const [isThemeReady, setIsThemeReady] = useState(false);

  // Track initialization
  const isInitialized = useRef(false);
  const hasSetInitialTheme = useRef(false);
  const themeApplicationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedUserThemeId = useRef<string | null>(null);

  // TanStack Query hooks
  const {
    data: selectedThemeData,
    isLoading: isThemeLoading,
    error: themeError,
    refetch: refetchSelectedTheme,
  } = useSelectedTheme();

  const { data: allThemesData, isLoading: isAllThemesLoading } = useThemes();
  const applyThemeMutation = useApplyTheme();

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

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const cachedTheme =
      typeof window !== "undefined" && user?.id
        ? loadThemeFromStorage(user.id)
        : null;
    return cachedTheme || defaultTheme;
  });

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(() => {
    // Priority: user's selectedTheme > localStorage cache > null
    if (userSelectedThemeId) {
      return userSelectedThemeId;
    }

    const cachedTheme =
      typeof window !== "undefined" && user?.id
        ? loadThemeFromStorage(user.id)
        : null;
    return cachedTheme?.selectedThemeId || null;
  });

  // Only fetch specific theme if we have an ID and it's different from current theme
  const shouldFetchSpecificTheme = !!(
    selectedThemeId &&
    selectedThemeId !== currentTheme?.id &&
    selectedThemeId !== "default"
  );

  const { data: specificThemeData, isLoading: isSpecificThemeLoading } =
    useThemeById(selectedThemeId || "", shouldFetchSpecificTheme);

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

  // Enhanced apply theme function with loading states
  const applyTheme = useCallback(
    async (theme: Theme) => {
      console.log("Applying theme:", theme);

      // Start theme application loading
      setIsApplyingTheme(true);
      setIsThemeReady(false);

      // Clear any existing timeout
      if (themeApplicationTimeoutRef.current) {
        clearTimeout(themeApplicationTimeoutRef.current);
      }

      try {
        // Always update local state immediately
        setCurrentTheme(theme);
        setSelectedThemeId(theme.id || null);

        // Cache to localStorage
        if (dashboardType === "fundManager" && userId) {
          saveThemeToStorage(userId, theme, theme.id);

          // Save to backend
          try {
            if (theme.id && theme.id !== "default") {
              await applyThemeMutation.mutateAsync({ themeId: theme.id });
            } else {
              // Clear selection for default theme
              await applyThemeMutation.mutateAsync({ themeId: null });
            }
          } catch (error) {
            console.error("Failed to save theme to database:", error);
          }
        }

        // Add a small delay to ensure theme is fully applied
        themeApplicationTimeoutRef.current = setTimeout(() => {
          setIsThemeReady(true);
          setIsApplyingTheme(false);
        }, 300);
      } catch (error) {
        console.error("Error applying theme:", error);
        setIsApplyingTheme(false);
        setIsThemeReady(true);
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

        if (availableThemes && availableThemes.length > 0) {
          fallbackTheme = availableThemes[0];
        } else {
          fallbackTheme = defaultTheme;
        }

        await applyTheme(fallbackTheme);
      }
    },
    [selectedThemeId, applyTheme]
  );

  // Main effect: Handle user's selectedTheme changes (highest priority)
  useEffect(() => {
    if (dashboardType !== "fundManager" || !userId) {
      setIsInitializing(false);
      setIsThemeReady(true);
      return;
    }

    // If we have user's selectedThemeId and it's different from current, apply it immediately
    if (
      userSelectedThemeId &&
      userSelectedThemeId !== lastProcessedUserThemeId.current &&
      allThemesData?.success &&
      allThemesData.data
    ) {
      console.log("Processing user's selectedThemeId1:", userSelectedThemeId);

      setIsApplyingTheme(true);
      setIsThemeReady(false);

      const selectedTheme = findThemeById(
        userSelectedThemeId,
        allThemesData.data
      );

      if (selectedTheme) {
        console.log("Found theme from user selection2:", selectedTheme);
        setCurrentTheme(selectedTheme);
        setSelectedThemeId(userSelectedThemeId);
        saveThemeToStorage(userId, selectedTheme, userSelectedThemeId);
        lastProcessedUserThemeId.current = userSelectedThemeId;
        hasSetInitialTheme.current = true;

        setTimeout(() => {
          setIsApplyingTheme(false);
          setIsThemeReady(true);
          setIsInitializing(false);
        }, 200);
        return;
      }
    }

    // Skip if we've already set the initial theme and user has no selectedTheme
    if (hasSetInitialTheme.current && isThemeReady && !userSelectedThemeId) {
      setIsInitializing(false);
      return;
    }

    // Initialize theme when we don't have user's selectedTheme
    const initializeTheme = async () => {
      console.log("Initializing theme for user3:", userId);
      console.log("All themes data availabl4:", !!allThemesData?.data);

      setIsInitializing(true);
      setIsThemeReady(false);

      // Wait for themes data to be available before proceeding
      if (!allThemesData?.success || !allThemesData.data) {
        console.log("Waiting for themes data...");
        return;
      }

      try {
        // Priority 1: Fetch from backend if user doesn't have selectedTheme in profile
        if (!userSelectedThemeId) {
          console.log("Fetching theme from backend...");
          const { data: backendThemeData } = await refetchSelectedTheme();
          console.log("Backend theme data:", backendThemeData);
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
              setIsInitializing(false);
              setIsThemeReady(true);
              return;
            }
          }
        }

        // Priority 2: Check localStorage cache
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
            setIsInitializing(false);
            setIsThemeReady(true);
            return;
          }
        }

        // Priority 3: Use default theme
        console.log("Using default theme55");
        setCurrentTheme(defaultTheme);
        setSelectedThemeId(null);
        hasSetInitialTheme.current = true;
        setIsInitializing(false);
        setIsThemeReady(true);
      } catch (error) {
        console.error("Error initializing theme:", error);
        // Fallback to default theme on error
        setCurrentTheme(defaultTheme);
        setSelectedThemeId(null);
        hasSetInitialTheme.current = true;
        setIsInitializing(false);
        setIsThemeReady(true);
      } finally {
        isInitialized.current = true;
      }
    };

    // Only initialize if we haven't processed user's theme and don't have user's selectedTheme
    if (!userSelectedThemeId && !hasSetInitialTheme.current) {
      initializeTheme();
    }
  }, [
    userId,
    dashboardType,
    userSelectedThemeId,
    allThemesData,
    findThemeById,
    loadThemeFromStorage,
    saveThemeToStorage,
    refetchSelectedTheme,
    isThemeReady,
  ]);

  // Effect to handle specific theme loading when we have an ID but not the theme data
  useEffect(() => {
    if (
      specificThemeData?.success &&
      specificThemeData.data &&
      !isSpecificThemeLoading &&
      selectedThemeId &&
      selectedThemeId === specificThemeData.data.id &&
      currentTheme.id !== specificThemeData.data.id
    ) {
      console.log("Loading specific theme data:", specificThemeData.data);
      setIsApplyingTheme(true);
      setIsThemeReady(false);

      setCurrentTheme(specificThemeData.data);

      if (userId) {
        saveThemeToStorage(userId, specificThemeData.data, selectedThemeId);
      }

      // Mark theme as ready after a brief delay
      setTimeout(() => {
        setIsApplyingTheme(false);
        setIsThemeReady(true);
      }, 200);
    }
  }, [
    specificThemeData,
    isSpecificThemeLoading,
    selectedThemeId,
    userId,
    saveThemeToStorage,
    currentTheme.id,
  ]);

  // Handle user login/logout and theme updates
  useEffect(() => {
    // if (!userId) {
    //   console.log("User logged out, resetting theme");
    //   setCurrentTheme(defaultTheme);
    //   setSelectedThemeId(null);
    //   setIsInitializing(false);
    //   setIsThemeReady(true);
    //   isInitialized.current = false;
    //   hasSetInitialTheme.current = false;
    //   lastProcessedUserThemeId.current = null;
    // } else

    if (userId && !hasSetInitialTheme.current) {
      // User just logged in, reset flags to trigger theme initialization
      console.log("User logged in, preparing for theme initialization");
      setIsInitializing(true);
      setIsThemeReady(false);
      isInitialized.current = false;
      hasSetInitialTheme.current = false;
      lastProcessedUserThemeId.current = null;
    }
  }, [userId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (themeApplicationTimeoutRef.current) {
        clearTimeout(themeApplicationTimeoutRef.current);
      }
    };
  }, []);

  // Calculate comprehensive loading state
  const isLoading =
    isThemeLoading ||
    applyThemeMutation.isPending ||
    isSpecificThemeLoading ||
    isAllThemesLoading ||
    isInitializing ||
    isApplyingTheme ||
    !isThemeReady;

  const contextValue: ThemeContextType = {
    currentTheme,
    selectedThemeId,
    setCurrentTheme,
    applyTheme,
    handleThemeDeleted,
    isLoading,
    isInitializing,
    isApplyingTheme,
    isThemeReady,
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

// Utility component for theme-aware loading
export const ThemeLoader: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isLoading, isThemeReady } = useTheme();

  if (isLoading || !isThemeReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-600 text-sm">Loading theme...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
