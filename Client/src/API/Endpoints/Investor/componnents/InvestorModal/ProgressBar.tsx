interface ProgressBarProps {
    currentStep: number
    steps: string[]
}

export function ProgressBar({ currentStep, steps }: ProgressBarProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep ? "bg-theme-sidebar-accent text-white" : "bg-gray-200 text-gray-500"}
                `}
                            >
                                {index + 1}
                            </div>
                            <span className="text-xs text-gray-600 mt-2 text-center max-w-20">{step}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`
                  flex-1 h-0.5 mx-4
                  ${index < currentStep ? "bg-theme-sidebar-accent" : "bg-gray-200"}
                `}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
