import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useLogout } from "../API/Endpoints/Auth/AuthApis";

// Types for our auth data
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: { user: User; token: string }) => void;
  logout: (
    setIsLoggingOut: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  getToken: () => string | null;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie expiration time (7 days in this case)
const COOKIE_EXPIRATION_DAYS = 7;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  // Check for existing auth data on load
  useEffect(() => {
    const storedToken = Cookies.get("authToken");
    const storedUser = Cookies.get("authUser");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // If parsing fails, clear the cookies
        Cookies.remove("authToken");
        Cookies.remove("authUser");
      }
    }
  }, []);

  const login = (userData: { user: User; token: string }) => {
    setUser(userData.user);
    setToken(userData.token);

    // Store in cookies
    Cookies.set("authToken", userData.token);
    Cookies.set("authUser", JSON.stringify(userData.user));
  };

  const logout = (
    setIsLoggingOut: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsLoggingOut(true);

    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setUser(null);
        setToken(null);

        Cookies.remove("authToken");
        Cookies.remove("authUser");

        toast.success("Logged out successfully");
        setIsLoggingOut(false); // hide loader after success

        navigate("/login");
      },
      onError: (error) => {
        toast.error("Logout failed. Please try again.");

        setIsLoggingOut(false); // hide loader after failure
      },
    });
  };

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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        getToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
