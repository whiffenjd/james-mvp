import { useAuth } from "../../Context/AuthContext";
import { useOnboarding } from "../../Context/OnboardingContext";
import { useOnboardingInfo } from "../../API/Endpoints/Onboarding/useInvestorOnboarding";
import { DocumentUploadStepEntity } from "./DocumentsUploader";
import { DocumentUploadStep } from "./DocumentUploadStep";
import { EntityClassificationStep } from "./EntityClassificationStep";
import { HighNetWorthQualificationStep } from "./HighNetWorthQualificationStep";
import { IndividualInvestorTypeStep } from "./IndividualInvestorTypeStep";
import { InvestorTypeStep } from "./InvestorTypeStep";
import { JurisdictionStep } from "./JurisdictionStep";
import { ProgressIndicator } from "./ProgressIndicator";
import { SelfCertifiedSophisticatedStep } from "./SelfCertifiedSophisticatedStep";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";

import { OnboardingComplete } from "./OnboardingComplete";
import { useTheme, type Theme } from "../../Context/ThemeContext";

const OnboardingStatus = ({
  status,
  rejectionNote,
  currentTheme,
}: {
  status: string;
  rejectionNote?: string;
  currentTheme: Theme;
}) => (
  <div className="my-6 px-4">
    <div
      className={`rounded-xl p-5 shadow-sm border
            ${
              status === "pending"
                ? "bg-yellow-50 border-yellow-200"
                : status === "rejected"
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
            }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-lg">
          {status === "pending" && "⏳"}
          {status === "rejected" && "❌"}
        </span>
        <span
          className="font-semibold text-gray-800 text-lg capitalize"
          style={{ color: currentTheme.secondaryText }}
        >
          {status}
        </span>
      </div>
      {rejectionNote && (
        <div className="mt-2 text-sm text-red-600">{rejectionNote}</div>
      )}
      <div
        className="mt-2 text-sm "
        style={{ color: currentTheme.secondaryText }}
      >
        {status === "pending"
          ? "Your submission is under review."
          : status === "rejected"
            ? "Please review the reason and resubmit."
            : "You have completed onboarding."}
      </div>
    </div>
  </div>
);

export function OnboardingSteps() {
  const { state, dispatch, updateFormData } = useOnboarding();
  const { user, logout, updateOnboardingStatus } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { currentTheme } = useTheme();
  // Only fetch onboarding info if user has onboarding status
  const { data: onboardingInfo, isLoading: isLoadingOnboarding } =
    useOnboardingInfo({
      enabled: !!user?.onboardingStatus, // Only run query if onboardingStatus exists
    });

  // Effect to handle existing onboarding data
  useEffect(() => {
    if (user?.onboardingStatus && onboardingInfo?.data?.formData) {
      const updateStates = async () => {
        try {
          // Clear existing form data
          dispatch({ type: "RESET_FORM" });

          // Wait for form data update to complete
          await new Promise<void>((resolve) => {
            if (onboardingInfo.data) {
              updateFormData(onboardingInfo.data.formData);
            }
            setTimeout(resolve, 100);
          });

          // Set to last step based on investor type, with null check
          const investorType = onboardingInfo.data?.formData?.investorType;
          const lastStep = investorType === "individual" ? 5 : 4;
          dispatch({ type: "SET_STEP", payload: lastStep });
          if (
            onboardingInfo?.data?.status === "approved" &&
            user?.onboardingStatus?.status !== "approved"
          ) {
            updateOnboardingStatus("approved");
            return;
          }
          // Show status messages with null checks
          if (
            user.onboardingStatus &&
            user.onboardingStatus.status === "rejected"
          ) {
            toast.error("Your previous submission was rejected.");
          } else if (
            user.onboardingStatus &&
            user.onboardingStatus.status === "pending"
          ) {
            toast.error("Your onboarding submission is pending approval");
          }
        } catch (error) {
          console.error("Error updating onboarding state:", error);
        }
      };

      updateStates();
    }
  }, [user?.onboardingStatus, onboardingInfo?.data?.formData]);

  const handleLogout = () => {
    logout(setIsLoggingOut);
  };

  // Show loading state only if we're actually fetching data
  if (user?.onboardingStatus && isLoadingOnboarding) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <Loader2
          className={`animate-spin h-8 w-8 mb-4 ${currentTheme.sidebarAccentText}`}
          style={{ color: currentTheme.sidebarAccentText }}
        />
        <p
          className="text-gray-600"
          style={{ color: currentTheme.sidebarAccentText }}
        >
          Loading your onboarding information...
        </p>
      </div>
    );
  }

  // Helper to get total steps based on investor type
  const getTotalSteps = () =>
    state.formData.investorType === "individual" ? 5 : 4;

  const renderCurrentStep = () => {
    const totalSteps = getTotalSteps();
    // If there's existing onboarding data, show status at the last step
    if (user?.onboardingStatus?.status === "approved" && !user?.isOnboarded) {
      return <OnboardingComplete />;
    }
    if (user?.onboardingStatus && state.currentStep === totalSteps) {
      return (
        <>
          <OnboardingStatus
            status={user.onboardingStatus.status}
            rejectionNote={user?.onboardingStatus?.rejectionNote ?? undefined}
            currentTheme={currentTheme}
          />
          {/* Still show the document upload step below the status */}
          {state.formData.investorType === "individual" ? (
            <DocumentUploadStep />
          ) : (
            <DocumentUploadStepEntity />
          )}
        </>
      );
    }

    switch (state.currentStep) {
      case 1:
        return <JurisdictionStep />;
      case 2:
        return <InvestorTypeStep />;
      case 3:
        if (state.formData.investorType === "individual") {
          return <IndividualInvestorTypeStep />;
        }
        return <EntityClassificationStep />;
      case 4:
        if (state.formData.investorType === "individual") {
          if (state.formData.individualInvestorType === "high_net_worth") {
            return <HighNetWorthQualificationStep />;
          } else if (
            state.formData.individualInvestorType ===
            "self_certified_sophisticated_investor"
          ) {
            return <SelfCertifiedSophisticatedStep />;
          }
          return <div>Step not found</div>;
        }
        return <DocumentUploadStepEntity />;
      case 5:
        if (state.formData.investorType === "individual") {
          return <DocumentUploadStep />;
        }
        if (state.formData.investorType === "entity") {
          return <DocumentUploadStepEntity />;
        }
        return <div>Step not found</div>;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div
      className="w-screen h-screen min-h-screen flex items-center justify-center overflow-auto relative"
      style={{ backgroundColor: currentTheme.dashboardBackground }}
    >
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="absolute top-4 right-4 bg-transparent hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Existing content */}
      <div className="flex w-[90vw] h-[90vh] gap-4">
        {/* Progress Sidebar */}
        <div className="h-full bg-[#F4F4F5] rounded-2xl overflow-hidden">
          <ProgressIndicator />
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#F4F4F5] p-10 rounded-3xl overflow-hidden">
          <div className="w-full h-full flex flex-col">
            {/* Header - Fixed height */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: currentTheme.dashboardBackground,
                    }}
                  >
                    <span className="text-white font-bold">▲</span>
                  </div>
                  <span
                    className="font-semibold text-[#017776] text-xl tracking-wide"
                    style={{
                      color: currentTheme.dashboardBackground,
                    }}
                  >
                    LOGO
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-700">
                  {/* Resync Button */}
                  {/* {user?.onboardingStatus && (
                                        <button
                                            // onClick={async () => {
                                            //     await refetchOnboarding();
                                            //     toast.success("Onboarding data re-synced!");
                                            // }}
                                            onClick={() => {
                                                window.location.reload();
                                            }}
                                            className="  text-[#017776] rounded-lg px-3 py-1 font-medium hover:bg-[#E0F7F6] transition-colors flex items-center gap-2"
                                            disabled={isLoadingOnboarding}
                                        >
                                            {isLoadingOnboarding ? (
                                                <Loader2 className="animate-spin h-4 w-4" />
                                            ) : (
                                                <RotateCcw />
                                            )}

                                        </button>
                                    )} */}
                  <span
                    className="font-medium"
                    style={{
                      color: currentTheme.primaryText,
                    }}
                  >
                    Need Help?
                  </span>
                  <span
                    className="underline cursor-pointer"
                    style={{
                      color: currentTheme.sidebarAccentText,
                    }}
                  >
                    LogIn
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h1
                  className="text-3xl font-playfair font-bold text-[#017776]"
                  style={{ color: currentTheme.primaryText }}
                >
                  Investor OnBoarding
                </h1>
                <p
                  className="tertiary-heading"
                  style={{ color: currentTheme.primaryText }}
                >
                  Complete the Following steps to start investing
                </p>
              </div>
            </div>

            {/* Step Content - Scrollable */}
            <div className="flex-1 overflow-auto ">{renderCurrentStep()}</div>

            {/* Progress Indicator - Fixed at bottom */}
            <div className="flex-shrink-0 flex justify-center items-center mt-6">
              <div className="flex items-center space-x-2 mb-6">
                {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map(
                  (step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className="h-2 w-16 rounded-full"
                        style={{
                          backgroundColor:
                            step <= state.currentStep
                              ? currentTheme?.dashboardBackground || "#017776"
                              : currentTheme?.secondaryText || "#e5e7eb", // fallback: gray-200
                        }}
                      />
                      {step < getTotalSteps() && <div className="w-2" />}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
