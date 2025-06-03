import { useOnboarding } from "../../Context/OnboardingContext";
import { DocumentUploadStepEntity } from "./DocumentsUploader";
import { DocumentUploadStep } from "./DocumentUploadStep";
import { EntityClassificationStep } from "./EntityClassificationStep";
import { HighNetWorthQualificationStep } from "./HighNetWorthQualificationStep";
import { IndividualInvestorTypeStep } from "./IndividualInvestorTypeStep";
import { InvestorTypeStep } from "./InvestorTypeStep";
import { JurisdictionStep } from "./JurisdictionStep";
import { ProgressIndicator } from "./ProgressIndicator";
import { SelfCertifiedSophisticatedStep } from "./SelfCertifiedSophisticatedStep";

export function OnboardingSteps() {
    const { state } = useOnboarding();

    // Helper to get total steps based on investor type
    const getTotalSteps = () => state.formData.investorType === 'individual' ? 5 : 4;

    const renderCurrentStep = () => {
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
                    return <div>Qualification Step - To be implemented</div>;
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
        <div className="w-screen h-screen min-h-screen bg-[#2FB5B4] flex items-center justify-center overflow-auto">
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
