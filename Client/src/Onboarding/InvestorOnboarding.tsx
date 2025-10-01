import { useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { OnboardingProvider } from "../Context/OnboardingContext";
import { useTheme } from "../Context/ThemeContext";
import getSubdomain from "../FundManager/hooks/getSubDomain";
import { OnboardingSteps } from "./steps/OnboardingSteps";
import { useThemeByDomain } from "../FundManager/hooks/Theme&AssetsHooks";
import LoadingSpinner from "../PublicComponents/Components/LoadingSpinner";
import React from "react";

// Main Onboarding Container
export default function InvestorOnboarding() {
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
    "/onboarding",
  ].some((path) => location.pathname.startsWith(path));
  const {
    data,
    isLoading: isThemeLoading,
    isFetching: isThemeFetching,
  } = useThemeByDomain(subdomain || "", !!subdomain && isPublicPath);

  React.useEffect(() => {
    console.log("isAuthenticated", user);
    if (data?.data && isPublicPath) {
      applyTheme(data.data);
    }
  }, [data, applyTheme, location.pathname]);

  console.log("themeQuery", data?.data);

  // Wait until BOTH auth and theme are resolved
  if (user === undefined || isThemeLoading || isThemeFetching) {
    return <LoadingSpinner />; // make this spinner cover the full page
  }
  return (
    <OnboardingProvider>
      <OnboardingSteps />
    </OnboardingProvider>
  );
}
