import { useForm } from "react-hook-form";
import { useOnboarding } from "../../Context/OnboardingContext";
import { investorTypeSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepHeader } from "../StepHeader";
import { useAuth } from "../../Context/AuthContext";

// Step 2: Investor Type Selection
export function InvestorTypeStep() {
    const { state, updateFormData, nextStep, prevStep } = useOnboarding();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(investorTypeSchema),
        defaultValues: { investorType: state.formData.investorType || '' }
    });
    const { user } = useAuth();
    const isPending = user?.onboardingStatus?.status === 'pending';

    const onSubmit = (data: any) => {
        updateFormData(data);
        nextStep();
    };

    return (
        <div className="space-y-6">

            <StepHeader
                step={2}
                title="Investor Categorization"
                subtitle="Determine your investor classification"
            />


            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                        Individual Investor Type
                    </label>
                    <div className="space-y-3">
                        <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                {...register('investorType')}
                                type="radio"
                                value="individual"
                                disabled={isPending}
                                className="mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div>
                                <span className="font-medium">Individual</span>
                                <p className="text-sm text-gray-600">Investing as an individual</p>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                {...register('investorType')}
                                type="radio"
                                value="entity"
                                disabled={isPending}
                                className="mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div>
                                <span className="font-medium">Entity</span>
                                <p className="text-sm text-gray-600">Investing on behalf of an entity</p>
                            </div>
                        </label>
                    </div>
                    {errors.investorType && (
                        <p className="mt-1 text-sm text-red-600">{errors.investorType.message}</p>
                    )}
                </div>

                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
}