interface StepHeaderProps {
    step: number | string; // Depending on what you expect
    title: string;
    subtitle: string;
}

export function StepHeader({ step, title, subtitle }: StepHeaderProps) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#147574] text-white font-semibold text-base">
                {step}
            </div>
            <div className="text-start">
                <h2 className="text-xl font-semibold text-[#000000E5]/90">{title}</h2>
                <p className="mt-0.5 text-[#000000B2]/70 text-sm">{subtitle}</p>
            </div>
        </div>
    );
}