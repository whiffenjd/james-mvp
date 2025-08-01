import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import LoadingSpinner from "../../PublicComponents/Components/LoadingSpinner";

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
    user?.isOnboarded !== true
  ) {
    if (!location.pathname.includes("/investor/onboarding")) {
      return <Navigate to="/investor/onboarding" replace />;
    }
  }


  return children ? <>{children}</> : <Outlet />;
};

export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Show loading until authentication state is determined
  if (user === undefined) {
    return <LoadingSpinner />;
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
