import { useOnboarding } from "../../Context/OnboardingContext";

export function ProgressIndicator() {
    const { state } = useOnboarding();
    const steps = [
        { number: 1, title: 'Jurisdiction', completed: state.currentStep > 1 },
        { number: 2, title: 'Investor Type', completed: state.currentStep > 2 },
        { number: 3, title: 'Classification', completed: state.currentStep > 3 },
        { number: 4, title: 'Qualification', completed: state.currentStep > 4 },
        { number: 5, title: 'Documents', completed: state.currentStep > 5 }
    ];

    return (
        <div className="w-20 bg-[#F4F4F5] p-4 ">
            <div className="space-y-8">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex flex-col items-center">
                        <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              ${step.completed
                                ? 'bg-teal-600 text-white'
                                : state.currentStep === step.number
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                            }
            `}>
                            {step.completed ? '✓' : step.number}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-0.5 h-6 mt-2 ${step.completed ? 'bg-teal-600' : 'bg-gray-200'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}