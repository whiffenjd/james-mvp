import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboarding } from "../../Context/OnboardingContext";
import { individualInvestorTypeSchema } from "../schema";
import { StepHeader } from '../StepHeader';


// Step 3: Individual Investor Type Selection
export function IndividualInvestorTypeStep() {
    const { state, updateFormData, nextStep, prevStep } = useOnboarding();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(individualInvestorTypeSchema),
        defaultValues: { individualInvestorType: state.formData.individualInvestorType || '' }
    });

    const onSubmit = (data: any) => {
        updateFormData(data);
        nextStep();
    };

    return (
        <div className="space-y-6">
            <StepHeader
                step={3}
                title="Investor Categorization"
                subtitle="Determine your investor classification"
            />



            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                        Please select your investor classification
                    </label>
                    <div className="space-y-3">
                        <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                {...register('individualInvestorType')}
                                type="radio"
                                value="high_net_worth"
                                className="mt-1 mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div>
                                <span className="font-medium">High Net Worth Individual</span>
                            </div>
                        </label>

                        <label className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                {...register('individualInvestorType')}
                                type="radio"
                                value="self_certified_sophisticated_investor"
                                className="mt-1 mr-3 h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div>
                                <span className="font-medium">Self-Certified Sophisticated Investor</span>
                            </div>
                        </label>
                    </div>
                    {errors.individualInvestorType && (
                        <p className="mt-1 text-sm text-red-600">{errors.individualInvestorType.message}</p>
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
