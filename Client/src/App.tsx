import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { Toaster } from "react-hot-toast";
import Login from "./Auth/Pages/Login";
import Signup from "./Auth/Pages/Signup";
import EmailVerification from "./Auth/Pages/EmailVerification";
import ForgotPassword from "./Auth/Pages/ForgotPassword";
import SetNewPassword from "./Auth/Pages/SetNewPassword";
import {
  AdminRoute,
  FundManagerRoute,
  InvestorRoute,
  ProtectedRoute,
  PublicRoute,
} from "./Context/Routing/ProtectedRoutes";
import AdminDashboard from "./Admin/Dashboard";
import FundManagerDashboard from "./FundManager/Dashboard";
import InvestorDashboard from "./Investor/Dashboard";
import Unauthorized from "./PublicComponents/Components/Unauthorized";
import { useAuth } from "./Context/AuthContext";
import InvestorLayout from "./Investor/Layout";

function RedirectBasedOnRole() {
  const { user } = useAuth();

  switch (user?.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "fundmanager":
      return <Navigate to="/fundmanager/dashboard" replace />;
    case "investor":
      return <Navigate to="/investor/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />

        <Routes>
          {/* Public routes - accessible when not logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<SetNewPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Add more admin routes here */}
          </Route>

          {/* Fund Manager routes */}
          <Route element={<FundManagerRoute />}>
            <Route
              path="/fundmanager/dashboard"
              element={<FundManagerDashboard />}
            />
            {/* Add more fund manager routes here */}
          </Route>

          {/* Investor routes */}
          <Route element={<InvestorRoute />}>
            <Route path="/investor" element={<InvestorLayout />} >
            <Route path="dashboard" element={<InvestorDashboard />} />
            
            </Route>
            {/* Add more investor routes here */}
          </Route>
       


          {/* Error and fallback routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Redirect root to login or appropriate dashboard based on auth state */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RedirectBasedOnRole />
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to home which will then redirect appropriately */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
