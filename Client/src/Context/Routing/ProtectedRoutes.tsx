import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import LoadingSpinner from "../../PublicComponents/Components/LoadingSpinner";
import { useTheme } from "../ThemeContext";
import getSubdomain from "../../FundManager/hooks/getSubDomain";
import { useThemeByDomain } from "../../FundManager/hooks/Theme&AssetsHooks";
import React from "react";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Show loading until authentication state is determined
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  // Show loading until authentication state is determined
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard if not admin
  if (user?.role !== "admin") {
    // Redirect based on role
    if (user?.role === "investor") {
      return <Navigate to="/investor/dashboard" replace />;
    } else if (user?.role === "fundManager") {
      return <Navigate to="/fundmanager/dashboard" replace />;
    } else {
      // Fallback for unknown roles
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render children or outlet if user is admin
  return children ? <>{children}</> : <Outlet />;
};

export const FundManagerRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();

  // Show loading until authentication state is determined
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard if not fund manager
  if (user?.role !== "fundManager") {
    // Redirect based on role
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "investor") {
      return <Navigate to="/investor/dashboard" replace />;
    } else {
      // Fallback for unknown roles
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render children or outlet if user is fund manager
  return children ? <>{children}</> : <Outlet />;
};

export const InvestorRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  // Show loading until authentication state is determined
  if (user === undefined) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard if not investor
  if (user?.role !== "investor") {
    // Redirect based on role
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "fundManager") {
      return <Navigate to="/fundmanager/dashboard" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (
    user?.isOnboarded !== true &&
    user?.onboardingStatus?.status !== "complete_later"
  ) {
    if (!location.pathname.includes("/investor/onboarding")) {
      return <Navigate to="/investor/onboarding" replace />;
    }
  }

  // if (
  //   user?.onboardingStatus?.status !== 'approved' &&
  //   user?.onboardingStatus?.status !== 'complete_later'
  // ) {
  //   if (!location.pathname.includes('/investor/onboarding')) {
  //     return <Navigate to="/investor/onboarding" replace />;
  //   }
  // } else if (user?.onboardingStatus?.status === 'complete_later') {
  //   return <Navigate to="/investor/onboarding" replace />;
  // }

  return children ? <>{children}</> : <Outlet />;
};

export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { applyTheme } = useTheme();

  // get subdomain
  const hostname = window.location.hostname;
  const subdomain = getSubdomain(hostname);

  // fetch theme
  const location = useLocation();
  const isPublicPath = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ].some((path) => location.pathname.startsWith(path));
  const {
    data,
    isLoading: isThemeLoading,
    isFetching: isThemeFetching,
  } = useThemeByDomain(subdomain || "", !!subdomain && isPublicPath);

  React.useEffect(() => {
    if (data?.data && !isAuthenticated) {
      applyTheme(data.data);
    }
  }, [data, applyTheme]);

  console.log("themeQuery", data?.data);

  // Wait until BOTH auth and theme are resolved
  if (user === undefined || isThemeLoading || isThemeFetching) {
    return <LoadingSpinner />; // make this spinner cover the full page
  }

  // If user is authenticated, redirect to their appropriate dashboard
  if (isAuthenticated) {
    // Redirect based on role
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "fundManager") {
      return <Navigate to="/fundmanager/dashboard" replace />;
    } else if (user?.role === "investor") {
      return <Navigate to="/investor/dashboard" replace />;
    } else {
      // Fallback for unknown roles
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render children or outlet for public routes
  return children ? <>{children}</> : <Outlet />;
};
