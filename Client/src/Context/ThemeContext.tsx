// Context/ThemeContext.tsx - Fixed version
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
import { themeResetService } from "../FundManager/Themes/Components/ThemeResetService";

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

export const defaultTheme: Theme = {
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

  // Extract selectedThemeId from user.selectedTheme object
  const userSelectedThemeId = user?.selectedTheme;

  // Enhanced loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const [isThemeReady, setIsThemeReady] = useState(false);

  // Track initialization per user
  const isInitialized = useRef(false);
  const hasSetInitialTheme = useRef(false);
  const themeApplicationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedUserThemeId = useRef<string | null>(null);
  const currentUserId = useRef<string | null>(null);

  // TanStack Query hooks
  const {
    isLoading: isThemeLoading,
    error: themeError,
    refetch: refetchSelectedTheme,
    data: selectedThemeData,
  } = useSelectedTheme({ enabled: true }, userSelectedThemeId ?? undefined);


  const {
    data: allThemesData,
    isLoading: isAllThemesLoading,
    refetch: refetchAllThemes,
  } = useThemes();
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

  // Initialize currentTheme to defaultTheme always
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);


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

  // COMPLETE RESET function for theme state
  const resetThemeState = useCallback(() => {
    // Clear DOM styles immediately
    const root = document.documentElement;
    root.style.removeProperty("--dashboard-bg");
    root.style.removeProperty("--card-bg");
    root.style.removeProperty("--primary-text");
    root.style.removeProperty("--secondary-text");
    root.style.removeProperty("--sidebar-accent-text");

    // Reset all state
    setCurrentTheme(defaultTheme);
    setSelectedThemeId(null);
    setIsInitializing(true);
    setIsApplyingTheme(false);
    setIsThemeReady(false);

    // Clear refs
    isInitialized.current = false;
    hasSetInitialTheme.current = false;
    lastProcessedUserThemeId.current = null;
    currentUserId.current = null;

    // Clear any pending timeouts
    if (themeApplicationTimeoutRef.current) {
      clearTimeout(themeApplicationTimeoutRef.current);
      themeApplicationTimeoutRef.current = null;
    }
  }, []);

  // Register with theme reset service
  useEffect(() => {
    const unregister = themeResetService.registerResetCallback(resetThemeState);
    return () => {
      unregister();
    };
  }, [resetThemeState]);

  // IMMEDIATE initialization when user changes
  useEffect(() => {
    if (currentUserId.current !== userId) {

      currentUserId.current = userId || "";
      setIsThemeReady(false);
      setIsInitializing(true);

      if (!userId) {
        // User logged out - reset handled by service
        return;
      } else {
        // User logged in - reset initialization flags
        hasSetInitialTheme.current = false;
        lastProcessedUserThemeId.current = null;
      }
    }
  }, [userId, dashboardType]);

  // MAIN THEME INITIALIZATION EFFECT - Improved priority handling
  useEffect(() => {
    // Skip if not fundManager dashboard or no user
    if (dashboardType !== "fundManager" || !userId || !user) {
      if (!userId) {
        setIsInitializing(false);
        setIsThemeReady(true);
      }
      return;
    }

    // Skip if already initialized for this user
    if (hasSetInitialTheme.current && currentUserId.current === userId) {
      return;
    }

    // Initialize theme based on priority: Backend > localStorage > Default
    const initializeThemeFromData = () => {
      setIsInitializing(true);
      setIsThemeReady(false);

      try {
        // Priority 1: Backend selected theme data
        if (selectedThemeData && !isThemeLoading) {

          setCurrentTheme(selectedThemeData);
          setSelectedThemeId(selectedThemeData.id || null);

          // Save to localStorage for future page loads
          if (selectedThemeData.id) {
            saveThemeToStorage(userId, selectedThemeData, selectedThemeData.id);
            lastProcessedUserThemeId.current = selectedThemeData.id;
          }

          hasSetInitialTheme.current = true;
          setIsInitializing(false);
          setIsThemeReady(true);
          return;
        }

        // Priority 2: localStorage cache (only if backend is still loading or empty)
        if (isThemeLoading || !selectedThemeData) {
          const cachedTheme = loadThemeFromStorage(userId);
          if (cachedTheme && cachedTheme.id && cachedTheme.id !== "default") {

            setCurrentTheme(cachedTheme);
            setSelectedThemeId(
              cachedTheme.selectedThemeId || cachedTheme.id || null
            );
            lastProcessedUserThemeId.current =
              cachedTheme.selectedThemeId || cachedTheme.id || null;

            hasSetInitialTheme.current = true;
            setIsInitializing(false);
            setIsThemeReady(true);
            return;
          }
        }

        // Priority 3: Default theme (fallback)
        if (!isThemeLoading && !selectedThemeData) {

          setCurrentTheme(defaultTheme);
          setSelectedThemeId(null);
          hasSetInitialTheme.current = true;
          setIsInitializing(false);
          setIsThemeReady(true);
        }
      } catch (error) {
        console.error("Error initializing theme:", error);
        setCurrentTheme(defaultTheme);
        setSelectedThemeId(null);
        hasSetInitialTheme.current = true;
        setIsInitializing(false);
        setIsThemeReady(true);
      }
    };

    initializeThemeFromData();
  }, [
    userId,
    user,
    dashboardType,
    selectedThemeData,
    isThemeLoading,
    loadThemeFromStorage,
    saveThemeToStorage,
  ]);

  // Enhanced apply theme function with instant refetch
  const applyTheme = useCallback(
    async (theme: Theme) => {

      setIsApplyingTheme(true);
      setIsThemeReady(false);

      try {
        // 1. Update state immediately
        setCurrentTheme(theme);
        setSelectedThemeId(theme.id || null);

        // 2. Persist to localStorage immediately
        if (userId) {
          saveThemeToStorage(userId, theme, theme.id);
        }

        // 3. Sync with backend (if applicable)
        if (dashboardType === "fundManager" && userId) {
          try {
            await applyThemeMutation.mutateAsync({
              themeId: theme.id && theme.id !== "default" ? theme.id : "",
            });

            // 4. **INSTANTLY REFETCH** the selected theme to update selectedThemeData

            await refetchSelectedTheme();


          } catch (error) {
            console.error("Failed to save theme to database:", error);
            // Revert on backend failure
            if (userId) {
              const previousTheme = selectedThemeData || defaultTheme;
              setCurrentTheme(previousTheme);
              setSelectedThemeId(previousTheme.id || null);
              saveThemeToStorage(userId, previousTheme, previousTheme.id);
            }
            throw error;
          }
        }

        setIsApplyingTheme(false);
        setIsThemeReady(true);
      } catch (error) {
        console.error("Error applying theme:", error);
        setIsApplyingTheme(false);
        setIsThemeReady(true);
        throw error;
      }
    },
    [
      dashboardType,
      userId,
      saveThemeToStorage,
      applyThemeMutation,
      selectedThemeData,
      refetchSelectedTheme, // Added this dependency
    ]
  );

  // Handle theme deletion
  const handleThemeDeleted = useCallback(
    async (deletedThemeId: string, availableThemes?: Theme[]) => {
      if (selectedThemeId === deletedThemeId) {
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

  // Effect to handle specific theme loading (when theme ID changes)
  useEffect(() => {
    if (
      specificThemeData?.success &&
      specificThemeData.data &&
      !isSpecificThemeLoading &&
      selectedThemeId &&
      selectedThemeId === specificThemeData.data.id &&
      currentTheme.id !== specificThemeData.data.id
    ) {

      setIsApplyingTheme(true);
      setIsThemeReady(false);

      setCurrentTheme(specificThemeData.data);

      if (userId) {
        saveThemeToStorage(userId, specificThemeData.data, selectedThemeId);
      }

      setTimeout(() => {
        setIsApplyingTheme(false);
        setIsThemeReady(true);
      }, 50); // Faster timeout
    }
  }, [
    specificThemeData,
    isSpecificThemeLoading,
    selectedThemeId,
    userId,
    saveThemeToStorage,
    currentTheme,
  ]);

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
  const { isLoading, isThemeReady, isApplyingTheme } = useTheme();

  if (isLoading || !isThemeReady || isApplyingTheme) {
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
