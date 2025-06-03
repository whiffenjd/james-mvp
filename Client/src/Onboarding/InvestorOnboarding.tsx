import { OnboardingProvider } from "../Context/OnboardingContext";
import { OnboardingSteps } from "./steps/OnboardingSteps";

// Main Onboarding Container
export default function InvestorOnboarding() {
    return (
        <OnboardingProvider>
            <OnboardingSteps />
        </OnboardingProvider>
    );
}