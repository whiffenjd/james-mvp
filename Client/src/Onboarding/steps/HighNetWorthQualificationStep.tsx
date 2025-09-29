import { useForm } from "react-hook-form";
import { useOnboarding } from "../../Context/OnboardingContext";
import { highNetWorthSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { StepHeader } from "../StepHeader";
import { useState } from "react";
import { SignatureModal } from "../../Components/Modal/SignatureModal";

export function HighNetWorthQualificationStep() {
  const { state, updateFormData, nextStep, prevStep } = useOnboarding();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(highNetWorthSchema),
    defaultValues: {
      highNetWorthQualification: state.formData.highNetWorthQualification || {},
      signature: state.formData.signature || "",
      signatureDate: state.formData.signatureDate || "",
    },
    mode: "onChange", // This will trigger validation on change
  });
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  const handleSignatureSave = (signatureDataUrl: string) => {
    setValue("signature", signatureDataUrl);
  };

  const watched = watch("highNetWorthQualification");
  const noneApply = watched?.noneApply === true;

  // Handle mutually exclusive logic: If "None Apply" is true, reset A and B
  React.useEffect(() => {
    if (noneApply) {
      setValue("highNetWorthQualification.incomeQualified", "false");
      setValue("highNetWorthQualification.incomeAmount", undefined);
      setValue("highNetWorthQualification.netAssetsQualified", "false");
      setValue("highNetWorthQualification.netAssetsAmount", undefined);
    }
  }, [noneApply, setValue]);

  const onSubmit = (data: any) => {
    updateFormData(data);
    nextStep();
  };
  useEffect(() => {
    // Set the signatureDate to today's date on mount
    setValue("signatureDate", new Date().toISOString().split("T")[0]);
  }, [setValue]);

  return (
    <div className="p-2 mx-auto space-y-8">
      <StepHeader
        step={4}
        title="Investor Categorisation"
        subtitle="Determine your investor classification"
      />
      <div>
        <h2 className="primary-heading mb-2">
          High Net Worth Individual Qualification
        </h2>
        <p className="secondary-heading">
          If you meet condition <b>A</b> or <b>B</b> below, you may choose to be
          classified as a high net worth individual for the purposes of the
          Financial Services and Markets Act 2000 (Financial Promotion) Order
          2005.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* (A) Annual income */}
        <div className=" border border-[#979797] rounded-xl p-5 space-y-4">
          <div className="tertiary-heading">
            (A) In the last financial year, did you have an annual income of
            £100,000 or more? Income does NOT include any one-off pension
            withdrawals
          </div>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="true"
                disabled={noneApply}
                {...register("highNetWorthQualification.incomeQualified")}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="false" // Changed from "no"
                disabled={noneApply}
                {...register("highNetWorthQualification.incomeQualified")}
              />{" "}
              No
            </label>
          </div>
          {/* Input if Yes */}
          {watched?.incomeQualified == "true" && (
            <div className="mt-2">
              <label className="tertiary-heading">
                Please specify your income (as defined above) to the nearest
                £10,000 in the last financial year
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-lg">£</span>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  {...register("highNetWorthQualification.incomeAmount", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g. 100000"
                  className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#2FB5B4] 
                                        ${errors.highNetWorthQualification
                      ?.incomeAmount
                      ? "border-red-500"
                      : "border-gray-300"
                    }`}
                />
              </div>
              {errors.highNetWorthQualification?.incomeAmount && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.highNetWorthQualification.incomeAmount.message}
                </p>
              )}
            </div>
          )}
          {errors.highNetWorthQualification?.incomeQualified && (
            <p className="text-sm text-red-600 mt-1">
              {errors.highNetWorthQualification.incomeQualified.message}
            </p>
          )}
        </div>

        {/* (B) Net assets */}
        <div className=" border border-[#979797] rounded-xl p-5 space-y-4">
          <div className="tertiary-heading">
            (B) Net assets of £250,000 or more? Net assets do NOT include: your
            home (primary residence), any loan secured on it or any equity
            released from it; your pension (or any pension withdrawals) or any
            rights under insurance contracts. Net assets are total assets minus
            any debts you owe.
          </div>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="true" // Changed from "yes"
                disabled={noneApply}
                {...register("highNetWorthQualification.netAssetsQualified")}
                className="accent-[#2FB5B4]"
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="false" // Changed from "no"
                disabled={noneApply}
                {...register("highNetWorthQualification.netAssetsQualified")}
                className="accent-gray-400"
              />{" "}
              No
            </label>
          </div>
          {/* Input if Yes */}
          {watched?.netAssetsQualified === "true" && !noneApply && (
            <div className="mt-2">
              <label className="tertiary-heading">
                Please specify your net assets (as defined above) to the nearest
                £100,000 in the last financial year{" "}
              </label>
              <input
                type="number"
                min={0}
                {...register("highNetWorthQualification.netAssetsAmount", {
                  valueAsNumber: true,
                })}
                placeholder="Specify your net assets (£), nearest £100,000"
                className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#2FB5B4] 
                                    ${errors.highNetWorthQualification
                    ?.netAssetsAmount
                    ? "border-red-500"
                    : "border-gray-300"
                  }`}
              />
              {errors.highNetWorthQualification?.netAssetsAmount && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.highNetWorthQualification.netAssetsAmount.message}
                </p>
              )}
            </div>
          )}
          {errors.highNetWorthQualification?.netAssetsQualified && (
            <p className="text-sm text-red-600 mt-1">
              {errors.highNetWorthQualification.netAssetsQualified.message}
            </p>
          )}
        </div>

        {/* (C) None apply */}
        <div className=" border border-[#979797] rounded-xl p-5 space-y-2">
          <div className="tertiary-heading">(C) None of these apply to me.</div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("highNetWorthQualification.noneApply")}
              checked={noneApply}
              className="accent-[#2FB5B4]"
            />
            <span>Yes</span>
          </label>
        </div>

        {/* Declaration */}
        <div className="rounded-xl  ">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              {...register("highNetWorthQualification.declarationAccepted")}
              className="accent-[#2FB5B4] mt-1"
            />
            <div className="tertiary-heading space-y-3">
              <div>
                I declare that I have answered yes to A and/or B, and wish to be
                treated as a high net worth individual.
              </div>
              <div>
                I understand that this means:
                <ul className="list-none mt-1 ml-6 space-y-2">
                  <li>
                    <span>
                      a) I can receive financial promotions where the contents
                      may not comply with rules made by the Financial Conduct
                      Authority (FCA);
                    </span>
                  </li>
                  <li>
                    <span>
                      b) I can expect no protection from the FCA, the Financial
                      Ombudsman Service or the Financial Services Compensation
                      Scheme.
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                I am aware that it is open to me to seek advice from someone who
                specialises in advising on investments.
              </div>
              <div>I accept that I could lose all of the money I invest.</div>
            </div>
          </label>
          {errors.highNetWorthQualification?.declarationAccepted && (
            <p className="text-sm text-red-600 mt-1">
              {errors.highNetWorthQualification.declarationAccepted.message}
            </p>
          )}
        </div>

        {/* Signature & Date */}
        <div className="flex  gap-6 flex-wrap">
          <div className="flex-1">
            <label className="block mb-1 font-medium text-gray-800">
              Signature
            </label>

            {watch("signature")?.startsWith("data:image") ? (
              <div className="space-y-2 ">
                <img
                  src={watch("signature")}
                  alt="Signature preview"
                  className=" border max-h-20 object-contain border-gray-300 rounded w-full p-3"
                />
                <button
                  type="button"
                  onClick={() => setSignatureModalOpen(true)}
                  className="text-sm text-[#2FB5B4] underline"
                >
                  Edit Signature
                </button>
              </div>
            ) : (
              <input
                type="text"
                {...register("signature")}
                required
                placeholder="Add your Signature"
                onClick={() => setSignatureModalOpen(true)}
                className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#2FB5B4] 
        ${errors.signature ? "border-red-500" : "border-gray-300"}`}
              />
            )}

            {errors.signature && (
              <p className="text-sm text-red-600 mt-1">
                {errors.signature.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium text-gray-800">Date</label>
            <input
              type="date"
              {...register("signatureDate")}
              required
              disabled
              className="w-full p-2 outline-none border border-gray-300 rounded focus:ring-2 focus:ring-[#2FB5B4]"
            />
          </div>
        </div>

        {/* Buttons */}
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
      </form>
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSave={handleSignatureSave}
      />
    </div>
  );
}
