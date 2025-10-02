import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboarding } from "../../Context/OnboardingContext";
import { jurisdictionSchema } from "../schema";
import { StepHeader } from "../StepHeader";
import { useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useTheme } from "../../Context/ThemeContext";

// Step 1: Jurisdiction Selection
export function JurisdictionStep() {
  const { state, updateFormData, nextStep } = useOnboarding();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jurisdictionSchema),
    defaultValues: { jurisdiction: state.formData.jurisdiction || "" },
  });
  const { user } = useAuth();
  const isPending = user?.onboardingStatus?.status === "pending";
  const { currentTheme } = useTheme();

  useEffect(() => {
    if (state.formData.jurisdiction) {
      setValue("jurisdiction", state.formData.jurisdiction);
    }
  }, [state.formData.jurisdiction, setValue]);
  const onSubmit = (data: any) => {
    updateFormData(data);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <StepHeader
        step={1}
        title="Jurisdiction Selection"
        subtitle="Select your jurisdiction for compliance requirements"
        currentTheme={currentTheme}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            style={{ color: currentTheme.secondaryText }}
          >
            Jurisdiction
          </label>
          <select
            {...register("jurisdiction")}
            disabled={isPending}
            className="w-[80vw] p-3 border outline-none border-gray-300 rounded-lg "
          >
            <option value="" className="hover:!bg-[#2FB5B4]">
              Select your jurisdiction
            </option>
            <option value="united_states" className="hover:!bg-[#2FB5B4]">
              United States
            </option>
            <option value="united_kingdom" className="hover:!bg-[#2FB5B4]">
              United Kingdom
            </option>
            <option value="european_union" className="hover:!bg-[#2FB5B4]">
              European Union
            </option>
          </select>
          {errors.jurisdiction && (
            <p className="mt-1 text-sm text-red-600">
              {errors.jurisdiction.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
          style={{
            backgroundColor: currentTheme.dashboardBackground,
            color: currentTheme.primaryText,
          }}
        >
          Continue
        </button>
      </form>
    </div>
  );
}
