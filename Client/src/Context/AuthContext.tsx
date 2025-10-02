import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useGetUserProfile, useLogout } from "../API/Endpoints/Auth/AuthApis";
import { QueryClient } from "@tanstack/react-query";
import { themeResetService } from "../FundManager/Themes/Components/ThemeResetService";
import { onboardingResetService } from "../Onboarding/services/OnboardingResetService";
import { useDispatch } from "react-redux";
import { RESET_STATE } from "../Redux/rootReducers";
import { resetFunds } from "../Redux/features/Funds/fundsSlice";

// Types for our auth data
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
  selectedTheme?: string | null;
  createdAt: string;
  updatedAt: string;
  isOnboarded?: boolean;
  onboardingStatus?: {
    status: "pending" | "approved" | "rejected" | "complete_later";
    rejectionNote?: string | null;
    documentStatus?: string | null; // ✅ added
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean; // New flag to track auth initialization
  login: (userData: { user: User; token: string }) => void;
  logout: (
    setIsLoggingOut: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  logoutAuto: () => void;
  getToken: () => string | null;
  updateUser: (userData: Partial<User>) => void;
  updateOnboardingStatus: (
    status: "pending" | "approved" | "rejected" | "complete_later",
    rejectionNote?: string
  ) => void;
  updateOnboardedStatus: (isOnboarded: boolean) => void; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie expiration time (7 days in this case)
const COOKIE_EXPIRATION_DAYS = 7;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const dispatch = useDispatch();
  const hasUserAndToken = !!user && !!token; // or user.accessToken
  const { data: freshUser, isSuccess } = useGetUserProfile({
    enabled: hasUserAndToken,
  });
  useEffect(() => {
    if (isSuccess && freshUser) {
      setUser(freshUser);
      Cookies.set("authUser", JSON.stringify(freshUser), {
        expires: COOKIE_EXPIRATION_DAYS,
      });
    }
  }, [isSuccess, freshUser]);

  // Check for existing auth data on load - SYNCHRONOUSLY
  useEffect(() => {
    const storedToken = Cookies.get("authToken");
    const storedUser = Cookies.get("authUser");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthInitialized(true);
      } catch (error) {
        Cookies.remove("authToken");
        Cookies.remove("authUser");
        setIsAuthInitialized(true);
      }
    } else {
      setIsAuthInitialized(true);
    }
  }, []);

  // Create a queryClient instance
  const queryClient = new QueryClient();

  useEffect(() => {
    // Clear cache when user changes - only if auth is initialized
    if (isAuthInitialized) {
      queryClient.removeQueries({ queryKey: ["dashboardAssets"] });
      queryClient.removeQueries({ queryKey: ["themes"] });
    }
  }, [user?.id, isAuthInitialized]);

  const login = (userData: { user: User; token: string }) => {
    // Set auth data immediately
    setUser(userData.user);
    setToken(userData.token);
    setIsAuthInitialized(true);

    // Store in cookies with expiration
    Cookies.set("authToken", userData.token, {
      expires: COOKIE_EXPIRATION_DAYS,
    });
    Cookies.set("authUser", JSON.stringify(userData.user), {
      expires: COOKIE_EXPIRATION_DAYS,
    });
    queryClient.invalidateQueries({
      queryKey: ["dashboardAssets", user?.id],
    });
    // Trigger theme reset and refresh for new user
    // Use setTimeout to ensure auth state is fully updated before theme initialization
    setTimeout(() => {
      themeResetService.performCompleteReset();
    }, 0);
  };

  const performLogoutCleanup = useCallback(async () => {
    // Reset theme states BEFORE clearing auth
    themeResetService.performCompleteReset();

    // Reset onboarding form
    onboardingResetService.performReset();

    // Reset auth state
    setUser(null);
    setToken(null);

    // Clear cookies
    Cookies.remove("authToken");
    Cookies.remove("authUser");

    dispatch(resetFunds());
    dispatch({ type: RESET_STATE });

    // 5. Purge persisted store
    // await persistor.purge();

    // Clear query cache
    queryClient.clear();
  }, [queryClient, dispatch]);
  const dashboardAssetsQueryKey = ["dashboardAssets"];
  const logoutAuto = useCallback(() => {
    performLogoutCleanup();
    // localStorage.removeItem(getUserThemeKey(user?.id || ""));
    navigate("/login");
  }, [performLogoutCleanup, navigate]);

  const logout = useCallback(
    (setIsLoggingOut?: React.Dispatch<React.SetStateAction<boolean>>) => {
      if (setIsLoggingOut) {
        setIsLoggingOut(true);
      }

      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          performLogoutCleanup();

          queryClient.removeQueries({ queryKey: dashboardAssetsQueryKey });
          queryClient.invalidateQueries({
            queryKey: ["dashboardAssets", user?.id],
          });
          // localStorage.removeItem(getUserThemeKey(user?.id || ""));
          toast.success("Logged out successfully");
          if (setIsLoggingOut) {
            setIsLoggingOut(false);
          }
          navigate("/login");
        },
        onError: (error: any) => {
          // If server says user is already logged out or session expired
          const loggedOut =
            error?.response?.data?.loggedOut || error?.data?.loggedOut || false;

          if (loggedOut) {
            performLogoutCleanup();
            toast.error("Session expired. Please log in again.");
            navigate("/login");
          } else {
            toast.error("Logout failed. Please try again.");
          }
          if (setIsLoggingOut) {
            setIsLoggingOut(false);
          }
        },
      });
    },
    [logoutMutation, performLogoutCleanup, navigate]
  );

  const getToken = () => {
    return token;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      Cookies.set("authUser", JSON.stringify(updatedUser), {
        expires: COOKIE_EXPIRATION_DAYS,
      });
    }
  };

  const updateOnboardingStatus = useCallback(
    (
      status: "pending" | "approved" | "rejected" | "complete_later",
      rejectionNote?: string
    ) => {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              onboardingStatus: {
                status,
                rejectionNote,
              },
            }
          : null
      );
    },
    []
  );

  const updateOnboardedStatus = useCallback((isOnboarded: boolean) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            isOnboarded,
          }
        : null
    );

    // Also update the cookie
    const storedUser = Cookies.get("authUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const updatedUser = {
        ...parsedUser,
        isOnboarded,
      };
      Cookies.set("authUser", JSON.stringify(updatedUser), {
        expires: COOKIE_EXPIRATION_DAYS,
      });
    }
  }, []);

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAuthInitialized,
    login,
    logout,
    logoutAuto,
    getToken,
    updateUser,
    updateOnboardingStatus,
    updateOnboardedStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
