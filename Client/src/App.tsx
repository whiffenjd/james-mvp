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
import InvestorDashboard from "./Investor/Dashboard";
import Unauthorized from "./PublicComponents/Components/Unauthorized";
import { useAuth } from "./Context/AuthContext";
import InvestorOnboarding from "./Onboarding/InvestorOnboarding";
import InvestorLayout from "./Investor/Layout";
import DashboardSettings from "./FundManager/Themes/Pages/DashboardMain";
import FundManagerLayout from "./FundManager/Layout/FundManagerLayout";
import { ThemeLoader, ThemeProvider } from "./Context/ThemeContext";
import "./App.css";
import ThemeContainer from "./FundManager/Themes/Components/ThemeContainer";
import FundManagerDashboard from "./FundManager/Dashboard";
import AdminLayout from "./Admin/AdminLayout";
import {
  InvestorThemeProvider,
  ThemeLoaderInvestor,
} from "./Context/InvestorThemeContext";
import InvestorThemeContainer from "./FundManager/Themes/Components/InvestorThemeContainer";
import InvestorsPage from "./FundManager/InvestorsPage/Investors";
import FundsAndReporting from "./FundManager/Funds and Reporting/FundsAndReporting";
import Project from "./FundManager/Funds and Reporting/project";

import FundsAndReportingInvestors from "./Investor/Funds and Reporting/FundsAndReportingInvestors";
import InvestorsProject from "./Investor/Funds and Reporting/project";
import SubscriptionDocuments from "./Investor/Subscription Documents/SubscriptionDocuments";
import NotificationsScreen from "./FundManager/Notification/Notification";
import AdminUsersPage from "./Admin/Users/UsersPage";



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

            <Route path="/signup/:fundManagerId?" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<SetNewPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
          </Route>

          {/* Admin routes - NO THEMING */}
          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={
                <div className="admin-dashboard min-h-screen bg-gray-50">
                  <AdminLayout />
                </div>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />

              {/* Add more nested admin routes here */}
            </Route>
          </Route>

          {/* Fund Manager routes - WITH THEMING */}
          <Route element={<FundManagerRoute />}>
            <Route
              path="/fundmanager/dashboard"
              element={
                <ThemeProvider>
                  <ThemeLoader>
                    <ThemeContainer>
                      <FundManagerLayout />
                    </ThemeContainer>
                  </ThemeLoader>
                </ThemeProvider>
              }
            >
              <Route index element={<FundManagerDashboard />} />
              <Route path="investors" element={<InvestorsPage />} />
              <Route path="funds" element={<FundsAndReporting />} />
              <Route path="project/:id" element={<Project />} />

              <Route path="settings" element={<DashboardSettings />} />
              <Route path="notifications" element={<NotificationsScreen />} />

              {/* <Route path="funds" element={<FundTestComponent />} /> */}

              {/* Add more fund manager routes here */}
            </Route>
          </Route>

          {/* Investor routes - NO THEMING */}
          <Route element={<InvestorRoute />}>
            <Route
              path="/investor/onboarding"
              element={<InvestorOnboarding />}
            />
            <Route
              path="/investor/dashboard"
              element={
                <InvestorThemeProvider>
                  <ThemeLoaderInvestor>
                    <InvestorThemeContainer>
                      <InvestorLayout />
                    </InvestorThemeContainer>
                  </ThemeLoaderInvestor>
                </InvestorThemeProvider>
              }
            >
              <Route index element={<InvestorDashboard />} />
              <Route path="funds" element={<FundsAndReportingInvestors />} />
              <Route path="project/:id" element={<InvestorsProject />} />
              <Route
                path="subscription-documents"
                element={<SubscriptionDocuments />}
              />
              <Route path="notifications" element={<NotificationsScreen />} />


              {/* Add more investor routes here */}
            </Route>
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
