import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOnboarding } from "../../Context/OnboardingContext";
import { useState } from "react";
import clsx from "clsx";
import { entityDetailsSchema } from "../schema";

const highNetWorthOptions = [
    {
        value: "a",
        label: (
            <>
                (a) Any body corporate which has, or which is a member of the same group as an undertaking which has, a called-up share capital or net assets of not less than £500,000 if the body corporate has more than 20 members or is a subsidiary undertaking of an undertaking which has more than 20 members
            </>
        ),
        showDetails: true,
    },
    {
        value: "b",
        label: (
            <>
                (b)Any body corporate which has, or which is a member of the same group as an undertaking which has, a called-up share capital or net assets of not less than £5,000,000
            </>
        ),
        showDetails: true,
    },
    {
        value: "c",
        label: (
            <>
                (c)Any unincorporated association or partnership which has net assets of not less than £5 million
            </>
        ),
        showDetails: true,
    },
    {
        value: "d",
        label: (
            <>
                (d)The trustee of a high value trust
            </>
        ),
        showDetails: true,
    },
    {
        value: "e",
        label: (
            <>
                (e)any person to whom the communication may otherwise lawfully be made.
            </>
        ),
        showDetails: false,
    },
];

export function EntityClassificationStep() {
    const { state, updateFormData, nextStep, prevStep } = useOnboarding();

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(entityDetailsSchema),
        defaultValues: {
            entityType: state.formData.entityDetails?.entityType || "",
            entityName: state.formData.entityDetails?.entityName || "",
            referenceNumber: state.formData.entityDetails?.referenceNumber || "",
            highNetWorthCompanySubType: state.formData.entityDetails?.highNetWorthCompanySubType || null,
        },
        mode: "onChange" // Enable real-time validation
    });

    const entityType = watch("entityType");
    const subType = watch("highNetWorthCompanySubType");

    const onSubmit = (data) => {
        // Clean up the data based on entity type
        const cleanData = {
            ...data,
            // Clear highNetWorthCompanySubType if not high net worth company
            highNetWorthCompanySubType:
                data.entityType === "high_net_worth_company"
                    ? data.highNetWorthCompanySubType
                    : null
        };

        updateFormData({ entityDetails: cleanData });
        nextStep();
    };

    // Show formatted error messages
    const getErrorMessage = (fieldName) => {
        if (!errors[fieldName]) return null;

        // Map enum errors to user-friendly messages
        if (errors[fieldName].type === "invalid_enum_value") {
            return "Please select an option";
        }

        return errors[fieldName].message;
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h2 className="primary-heading mb-1">Entity Classification</h2>
                <p className="text-gray-600 mb-6">Please select your entity classification</p>
            </div>

            {/* Entity Type Radios */}
            <div className="space-y-6">
                {/* Show entity type error if any */}
                {errors.entityType && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage("entityType")}</p>
                )}

                <label className={clsx(
                    "block rounded-lg border p-5 transition-all",
                    errors.entityType ? "border-red-500" : "border-[#979797]",
                    entityType === "investment_professional" && "border-[#2FB5B4]"
                )}>
                    <input
                        type="radio"
                        value="investment_professional"
                        {...register("entityType")}
                        className="mr-3"
                    />
                    <span className="font-semibold">Investment Professional</span>
                    <ul className="tertiary-heading mt-2 ml-6 list-disc">
                        <li>Family Offices</li>
                        <li>Private Banks</li>
                        <li>FCA and/or PRA regulated entities</li>
                    </ul>
                    {/* If selected, show details input */}
                    {entityType === "investment_professional" && (
                        <div className="mt-4 p-4 bg-[#2FB5B433]/20 w-[70%] rounded-xl">
                            <div className="font-base mb-2">Input Details</div>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        {...register("entityName")}
                                        placeholder="Entity Name"
                                        className={clsx(
                                            "mb-1 w-full bg-transparent p-2 outline-none rounded-lg border",
                                            errors.entityName ? "border-red-500" : "border-[#2C2C2E]"
                                        )}
                                    />
                                    {errors.entityName && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {getErrorMessage("entityName")}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        {...register("referenceNumber")}
                                        placeholder="Reference No (If applicable)"
                                        className={clsx(
                                            "w-full p-2 bg-transparent outline-none rounded-lg border",
                                            errors.referenceNumber ? "border-red-500" : "border-[#2C2C2E]"
                                        )}
                                    />
                                    {errors.referenceNumber && (
                                        <p className="text-red-500 text-sm">{errors.referenceNumber.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </label>

                <label className={clsx(
                    "block rounded-lg border p-5 transition-all",
                    errors.entityType ? "border-red-500" : "border-[#979797]",
                    entityType === "high_net_worth_company" && "border-[#2FB5B4]"
                )}>
                    <input
                        type="radio"
                        value="high_net_worth_company"
                        {...register("entityType")}
                        className="mr-3"
                    />
                    <span className="font-semibold">High Net Worth Companies/Unincorporated Associations</span>
                    <div className="mt-4">
                        <div className="font-medium">Body Corporate Requirements</div>
                        <ul className="tertiary-heading ml-6 list-disc">

                            <ul className="ml-5 list-disc">
                                <li>Has a called-up share capital or net assets of not less than</li>
                                <li>$500,000 (if &gt; 20 members or subsidiary of larger undertaking)</li>
                                <li>$5 million (Otherwise)</li>
                            </ul>

                        </ul>
                        <div className="font-medium mt-2">Unincorporated Association</div>
                        <ul className="tertiary-heading ml-6 list-disc">
                            <li>Net assets of not less than $5 million</li>
                        </ul>
                        <div className="font-medium mt-2">Trust</div>
                        <ul className="tertiary-heading ml-6 list-disc">
                            <li>Aggregate value of cash and investments... $10 million or more</li>
                        </ul>
                    </div>
                    {/* If selected, show subtypes */}
                    {entityType === "high_net_worth_company" && (
                        <div className="mt-6 space-y-3">
                            {/* Show subtype error if any */}
                            {errors.highNetWorthCompanySubType && (
                                <p className="text-red-500 text-sm mt-1">
                                    {getErrorMessage("highNetWorthCompanySubType")}
                                </p>
                            )}

                            {highNetWorthOptions.map(opt => (
                                <label key={opt.value} className="flex tertiary-heading items-start gap-2">
                                    <input
                                        type="radio"
                                        value={opt.value}
                                        {...register("highNetWorthCompanySubType")}
                                        className="mt-1"
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                            {/* Show details input for subtypes a/b/c/d */}
                            {["a", "b", "c", "d"].includes(subType) && (
                                <div className="mt-3 p-4 w-[70%] bg-[#D1EAED] rounded-xl">
                                    <div className="font-medium mb-2">Input Details</div>
                                    <div className="space-y-4">
                                        <div>
                                            <input
                                                {...register("entityName")}
                                                placeholder="Entity Name"
                                                className={clsx(
                                                    "mb-1 w-full bg-transparent p-2 outline-none rounded border",
                                                    errors.entityName ? "border-red-500" : "border-[#2C2C2E]"
                                                )}
                                            />
                                            {errors.entityName && (
                                                <p className="text-red-500 text-sm">{errors.entityName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                {...register("referenceNumber")}
                                                placeholder="Reference No (If applicable)"
                                                className={clsx(
                                                    "w-full bg-transparent p-2 outline-none rounded border",
                                                    errors.referenceNumber ? "border-red-500" : "border-[#2C2C2E]"
                                                )}
                                            />
                                            {errors.referenceNumber && (
                                                <p className="text-red-500 text-sm">{errors.referenceNumber.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </label>

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
                        className="flex-1 bg-[#2FB5B4] text-white py-3 px-4 rounded-lg hover:bg-[#147574] transition-colors font-medium"
                    >
                        Continue to Document Upload
                    </button>
                </div>
            </div>
        </form>
    );
}
