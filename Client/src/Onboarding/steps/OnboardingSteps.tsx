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


const OnboardingStatus = ({ status, rejectionNote }: { status: string; rejectionNote?: string }) => (
    <div className="space-y-6 my-4 px-4">
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Onboarding Status</h2>
            <div className={`p-4 rounded-lg ${status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                status === 'rejected' ? 'bg-red-50 border border-red-200' :
                    'bg-gray-50 border border-gray-200'
                }`}>
                <p className="font-medium mb-2">
                    Status: <span className="capitalize">{status}</span>
                </p>
                {rejectionNote && (
                    <div className="mt-4">
                        <p className="font-medium text-red-600">Rejection Reason:</p>
                        <p className="mt-1 text-gray-700">{rejectionNote}</p>
                    </div>
                )}
                <p className="mt-4 text-sm text-gray-600">
                    {status === 'pending'
                        ? 'Your onboarding submission is being reviewed. We will notify you once the review is complete.'
                        : 'Please review the feedback and resubmit your onboarding information.'}
                </p>
            </div>
        </div>
    </div>
);


export function OnboardingSteps() {
    const { state, dispatch, updateFormData } = useOnboarding();
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Only fetch onboarding info if user has onboarding status
    const { data: onboardingInfo, isLoading: isLoadingOnboarding } = useOnboardingInfo({
        enabled: !!user?.onboardingStatus // Only run query if onboardingStatus exists
    });

    // Effect to handle existing onboarding data
    useEffect(() => {
        if (user?.onboardingStatus && onboardingInfo?.data) {
            // Clear existing form data
            dispatch({ type: 'RESET_FORM' });

            // Update with saved onboarding data and set to last step
            updateFormData(onboardingInfo.data.formData);

            // Set to last step based on investor type
            const lastStep = onboardingInfo.data.formData.investorType === 'individual' ? 5 : 4;
            dispatch({ type: 'SET_STEP', payload: lastStep });

            // Show status messages
            if (user.onboardingStatus.status === 'rejected') {
                const baseMessage = "Your previous submission was rejected.";
                const note = user.onboardingStatus?.rejectionNote;
                toast.error(note ? `${baseMessage}\n${note}` : baseMessage);
            } else if (user.onboardingStatus.status === 'pending') {
                toast.error('Your onboarding submission is pending approval');
            }
        }
    }, [user?.onboardingStatus, onboardingInfo?.data]);

    const handleLogout = () => {
        logout(setIsLoggingOut);
    };

    // Show loading state only if we're actually fetching data
    if (user?.onboardingStatus && isLoadingOnboarding) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 mb-4 text-teal-600" />
                    <p className="text-gray-600">Loading your onboarding information...</p>
                </div>
            </div>
        );
    }

    // Helper to get total steps based on investor type
    const getTotalSteps = () => state.formData.investorType === 'individual' ? 5 : 4;

    const renderCurrentStep = () => {
        // If there's existing onboarding data, show status at the last step
        if (user?.onboardingStatus && (state.currentStep === 4 || state.currentStep === 5)) {
            return (
                <>
                    <OnboardingStatus
                        status={user.onboardingStatus.status}
                        rejectionNote={user.onboardingStatus.rejectionNote ?? undefined}
                    />
                    {/* Still show the document upload step below the status */}
                    {state.formData.investorType === 'individual'
                        ? <DocumentUploadStep />
                        : <DocumentUploadStepEntity />
                    }
                </>
            );
        }

        switch (state.currentStep) {
            case 1:
                return <JurisdictionStep />;
            case 2:
                return <InvestorTypeStep />;
            case 3:
                if (state.formData.investorType === 'individual') {
                    return <IndividualInvestorTypeStep />;
                }
                return <EntityClassificationStep />;
            case 4:
                if (state.formData.investorType === 'individual') {
                    if (state.formData.individualInvestorType === 'high_net_worth') {
                        return <HighNetWorthQualificationStep />;
                    } else if (state.formData.individualInvestorType === 'self_certified_sophisticated_investor') {
                        return <SelfCertifiedSophisticatedStep />
                    }
                    return <div>Step not found</div>;
                }
                return <DocumentUploadStepEntity />;
            case 5:
                if (state.formData.investorType === 'individual') {
                    return <DocumentUploadStep />;
                }
                if (state.formData.investorType === 'entity') {
                    return <DocumentUploadStepEntity />;
                }
                return <div>Step not found</div>;
            default:
                return <div>Step not found</div>;
        }
    };

    return (
        <div className="w-screen h-screen min-h-screen bg-[#2FB5B4] flex items-center justify-center overflow-auto relative">
            {/* Add Logout Button - Floating */}
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
                                    <div className="w-8 h-8 bg-[#017776] rounded flex items-center justify-center">
                                        <span className="text-white font-bold">▲</span>
                                    </div>
                                    <span className="font-semibold text-[#017776] text-xl tracking-wide">LOGO</span>
                                </div>
                                <div className="text-sm text-gray-700">
                                    <span className="mr-4 font-medium">Need Help?</span>
                                    <span className="underline cursor-pointer">LogIn</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h1 className="text-3xl font-playfair font-bold text-[#017776]">Investor OnBoarding</h1>
                                <p className="tertiary-heading">Complete the Following steps to start investing</p>
                            </div>
                        </div>

                        {/* Step Content - Scrollable */}
                        <div className="flex-1 overflow-auto">
                            {renderCurrentStep()}
                        </div>

                        {/* Progress Indicator - Fixed at bottom */}
                        <div className="flex-shrink-0 flex justify-center items-center mt-6">
                            <div className="flex items-center space-x-2 mb-6">
                                {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`h-2 w-16 rounded-full ${step <= state.currentStep ? 'bg-teal-600' : 'bg-gray-200'
                                            }`} />
                                        {step < getTotalSteps() && <div className="w-2" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
