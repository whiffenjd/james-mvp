
import { StepHeader } from '../StepHeader';
import { useProceedOnboarding } from '../../API/Endpoints/Onboarding/useInvestorOnboarding';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Step 1: Jurisdiction Selection
export function OnboardingComplete() {
    const { updateOnboardedStatus } = useAuth();
    const { mutateAsync: proceedOnboarding, isPending: isLoading } = useProceedOnboarding();
    const nav = useNavigate();
    const handleProceed = async () => {
        try {
            await proceedOnboarding();
            updateOnboardedStatus(true);
            nav("/")
            toast.success("Prceeding to Dashbaord")
        } catch (error) {
            console.error('Failed to proceed:', error);
            toast.error(`Failed to proceed: ${error}`);
        }
    };
    return (
        <div className="space-y-6">
            <StepHeader
                step={5}
                title="Complete"
                subtitle="Review and proceed to platform"
            />

            <div className="rounded-md border border-gray-300 p-6 shadow-sm max-w-5xl mx-auto text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    On Boarding complete!
                </h2>
                <p className="text-gray-700 mb-2">
                    Your account has been created successfully. You have chosen to complete
                    AML/KYC verification later.
                </p>
                <p className="text-[#976700] font-medium mb-6">
                    Note: You will not be able to invest until your AML/KYC verification has been approved.
                </p>
                <button
                    disabled={isLoading}
                    type="button"
                    className="bg-[#017776] text-white px-6 py-2 rounded-md transition"
                    onClick={() => {

                        handleProceed();
                    }}
                >
                    {isLoading ? 'Loading...' : "Proceed to Platform"}
                </button>
            </div>
        </div>

    );
}