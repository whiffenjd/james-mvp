import type { Theme } from "../Context/ThemeContext";

interface StepHeaderProps {
  step: number | string; // Depending on what you expect
  title: string;
  subtitle: string;
  currentTheme: Theme;
}

export function StepHeader({
  step,
  title,
  subtitle,
  currentTheme,
}: StepHeaderProps) {
  console.log("currentTheme", currentTheme);
  return (
    <div className="flex items-center gap-4 mb-6">
      <div
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#147574] text-white font-semibold text-base"
        style={{
          backgroundColor: currentTheme.dashboardBackground,
          color: currentTheme.primaryText,
        }}
      >
        {step}
      </div>
      <div className="text-start">
        <h2
          className="text-xl font-semibold text-[#000000E5]/90"
          style={{ color: currentTheme.primaryText }}
        >
          {title}
        </h2>
        <p
          className="mt-0.5 text-[#000000B2]/70 text-sm"
          style={{ color: currentTheme.secondaryText }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
