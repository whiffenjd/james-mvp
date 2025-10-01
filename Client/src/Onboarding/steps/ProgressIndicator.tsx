import { useOnboarding } from "../../Context/OnboardingContext";
import { useTheme } from "../../Context/ThemeContext";

export function ProgressIndicator() {
  const { state } = useOnboarding();
  const { currentTheme } = useTheme();
  // Get steps based on investor type
  const getSteps = () => {
    const baseSteps = [
      { number: 1, title: "Jurisdiction", completed: state.currentStep > 1 },
      { number: 2, title: "Investor Type", completed: state.currentStep > 2 },
    ];

    if (state.formData.investorType === "individual") {
      return [
        ...baseSteps,
        {
          number: 3,
          title: "Classification",
          completed: state.currentStep > 3,
        },
        { number: 4, title: "Qualification", completed: state.currentStep > 4 },
        { number: 5, title: "Documents", completed: state.currentStep > 5 },
      ];
    } else {
      return [
        ...baseSteps,
        {
          number: 3,
          title: "Classification",
          completed: state.currentStep > 3,
        },
        { number: 4, title: "Documents", completed: state.currentStep > 4 },
      ];
    }
  };

  const steps = getSteps();

  return (
    <div className="w-20 bg-[#F4F4F5] p-4">
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
          `}
              style={{
                backgroundColor:
                  step.completed || state.currentStep === step.number
                    ? currentTheme.dashboardBackground
                    : currentTheme.secondaryText,
                color: currentTheme.primaryText,
              }}
            >
              {step.completed ? "✓" : step.number}
            </div>

            {index < steps.length - 1 && (
              <div
                className="w-0.5 h-6 mt-2"
                style={{
                  backgroundColor: step.completed
                    ? currentTheme.dashboardBackground
                    : currentTheme.secondaryText,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
