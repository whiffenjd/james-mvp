import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { selfCertifiedSophisticatedSchema } from "../schema"; // Adjust path
import { useOnboarding } from "../../Context/OnboardingContext";
import { useEffect } from "react";
import { useState } from "react";
import { SignatureModal } from "../../Components/Modal/SignatureModal";
import { useTheme } from "../../Context/ThemeContext";

export function SelfCertifiedSophisticatedStep() {
  const { state, updateFormData, nextStep, prevStep } = useOnboarding();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(selfCertifiedSophisticatedSchema),
    defaultValues: {
      selfCertifiedSophisticatedInvestor: {
        ...state.formData.selfCertifiedSophisticatedInvestor,
        professionalCapacity:
          typeof state.formData.selfCertifiedSophisticatedInvestor
            ?.professionalCapacity === "boolean"
            ? String(
                state.formData.selfCertifiedSophisticatedInvestor
                  .professionalCapacity
              )
            : state.formData.selfCertifiedSophisticatedInvestor
                ?.professionalCapacity || undefined,
        director:
          typeof state.formData.selfCertifiedSophisticatedInvestor?.director ===
          "boolean"
            ? String(state.formData.selfCertifiedSophisticatedInvestor.director)
            : state.formData.selfCertifiedSophisticatedInvestor?.director ||
              undefined,
        unlistedInvestments:
          typeof state.formData.selfCertifiedSophisticatedInvestor
            ?.unlistedInvestments === "boolean"
            ? String(
                state.formData.selfCertifiedSophisticatedInvestor
                  .unlistedInvestments
              )
            : state.formData.selfCertifiedSophisticatedInvestor
                ?.unlistedInvestments || undefined,
        businessAngel:
          typeof state.formData.selfCertifiedSophisticatedInvestor
            ?.businessAngel === "boolean"
            ? String(
                state.formData.selfCertifiedSophisticatedInvestor.businessAngel
              )
            : state.formData.selfCertifiedSophisticatedInvestor
                ?.businessAngel || undefined,
        noneApply:
          state.formData.selfCertifiedSophisticatedInvestor?.noneApply ?? false,
        professionalCapacityDetails:
          state.formData.selfCertifiedSophisticatedInvestor
            ?.professionalCapacityDetails || "",
        directorDetails:
          state.formData.selfCertifiedSophisticatedInvestor?.directorDetails ||
          {},
        unlistedInvestmentsCount:
          state.formData.selfCertifiedSophisticatedInvestor
            ?.unlistedInvestmentsCount || "",
        businessAngelNetwork:
          state.formData.selfCertifiedSophisticatedInvestor
            ?.businessAngelNetwork || "",
        declarationAccepted:
          state.formData.selfCertifiedSophisticatedInvestor
            ?.declarationAccepted ?? false,
      },
      signature: state.formData.signature || "",
      signatureDate: state.formData.signatureDate || "",
    },
    mode: "onChange",
  });

  const watched = watch("selfCertifiedSophisticatedInvestor");
  const noneApply = watched?.noneApply === true;
  const { currentTheme } = useTheme();
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  const handleSignatureSave = (signatureDataUrl: string) => {
    setValue("signature", signatureDataUrl);
  };

  // Mutually exclusive: If "None Apply" is checked, reset other fields
  useEffect(() => {
    if (noneApply) {
      setValue(
        "selfCertifiedSophisticatedInvestor.professionalCapacity",
        "false"
      );
      setValue(
        "selfCertifiedSophisticatedInvestor.professionalCapacityDetails",
        ""
      );
      setValue("selfCertifiedSophisticatedInvestor.director", "false");
      setValue("selfCertifiedSophisticatedInvestor.directorDetails", {});
      setValue(
        "selfCertifiedSophisticatedInvestor.unlistedInvestments",
        "false"
      );
      setValue(
        "selfCertifiedSophisticatedInvestor.unlistedInvestmentsCount",
        ""
      );
      setValue("selfCertifiedSophisticatedInvestor.businessAngel", "false");
      setValue("selfCertifiedSophisticatedInvestor.businessAngelNetwork", "");
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
      <div>
        <h2
          className="primary-heading mb-2"
          style={{ color: currentTheme.primaryText }}
        >
          SELF-CERTIFIED SOPHISTICATED INVESTOR STATEMENT
        </h2>
        <p
          className="secondary-heading "
          style={{ color: currentTheme.secondaryText }}
        >
          If you meet condition <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b> below,
          you may choose to be classified as a self-certified sophisticated
          investor for the purposes of the Financial Services and Markets Act
          2000 (Financial Promotion) Order 2005.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* A. Professional Capacity */}
        <div className="border border-[#979797] rounded-xl p-5 space-y-4">
          <div
            className="tertiary-heading"
            style={{ color: currentTheme.secondaryText }}
          >
            (A) Worked in a professional capacity in the private equity sector,
            or in the provision of finance for small and medium enterprises, in
            the last two years?
          </div>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="true"
                disabled={noneApply}
                {...register(
                  "selfCertifiedSophisticatedInvestor.professionalCapacity"
                )}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="false"
                disabled={noneApply}
                {...register(
                  "selfCertifiedSophisticatedInvestor.professionalCapacity"
                )}
              />{" "}
              No
            </label>
          </div>
          {errors.selfCertifiedSophisticatedInvestor?.professionalCapacity && (
            <p className="text-sm text-red-600">
              {
                errors.selfCertifiedSophisticatedInvestor.professionalCapacity
                  .message
              }
            </p>
          )}
          {watched?.professionalCapacity === "true" && !noneApply && (
            <div className="mt-2">
              <label
                className="block mb-1 tertiary-heading"
                style={{ color: currentTheme.secondaryText }}
              >
                What is/was the name of the business/organization?
              </label>
              <input
                type="text"
                {...register(
                  "selfCertifiedSophisticatedInvestor.professionalCapacityDetails"
                )}
                placeholder="Enter business/organization name"
                className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#2FB5B4] 
                  ${
                    errors.selfCertifiedSophisticatedInvestor
                      ?.professionalCapacityDetails
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                style={{
                  // dynamic ring color
                  boxShadow: `0 0 0 2px transparent`, // default when not focused
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${currentTheme.dashboardBackground}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px transparent`;
                }}
              />
              {errors.selfCertifiedSophisticatedInvestor
                ?.professionalCapacityDetails && (
                <p className="text-sm text-red-600 mt-1">
                  {
                    errors.selfCertifiedSophisticatedInvestor
                      .professionalCapacityDetails.message
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* B. Director */}
        <div className="border border-[#979797] rounded-xl p-5 space-y-4">
          <div
            className="tertiary-heading"
            style={{ color: currentTheme.secondaryText }}
          >
            (B) Been the director of a company with an annual turnover of at
            least £1 million, in the last two years?
          </div>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="true"
                disabled={noneApply}
                {...register("selfCertifiedSophisticatedInvestor.director")}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="false"
                disabled={noneApply}
                {...register("selfCertifiedSophisticatedInvestor.director")}
              />{" "}
              No
            </label>
          </div>
          {errors.selfCertifiedSophisticatedInvestor?.director && (
            <p className="text-sm text-red-600">
              {errors.selfCertifiedSophisticatedInvestor.director.message}
            </p>
          )}
          {watched?.director === "true" && !noneApply && (
            <div className="mt-2 flex gap-2 flex-wrap">
              <div className="flex-1">
                <label className="block mb-1 tertiary-heading">
                  Company Name
                </label>
                <input
                  type="text"
                  {...register(
                    "selfCertifiedSophisticatedInvestor.directorDetails.companyName"
                  )}
                  placeholder="Enter company name"
                  className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#2FB5B4] 
                    ${
                      errors.selfCertifiedSophisticatedInvestor?.directorDetails
                        ?.companyName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  style={{
                    // dynamic ring color
                    boxShadow: `0 0 0 2px transparent`, // default when not focused
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${currentTheme.dashboardBackground}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px transparent`;
                  }}
                />
                {errors.selfCertifiedSophisticatedInvestor?.directorDetails
                  ?.companyName && (
                  <p className="text-sm text-red-600 mt-1">
                    {
                      errors.selfCertifiedSophisticatedInvestor.directorDetails
                        .companyName.message
                    }
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label
                  className="block mb-1 tertiary-heading"
                  style={{ color: currentTheme.secondaryText }}
                >
                  Companies House number (or international equivalent)
                </label>
                <input
                  type="text"
                  {...register(
                    "selfCertifiedSophisticatedInvestor.directorDetails.companyNumber"
                  )}
                  placeholder="Enter company number"
                  className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#2FB5B4] 
                    ${
                      errors.selfCertifiedSophisticatedInvestor?.directorDetails
                        ?.companyNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  style={{
                    // dynamic ring color
                    boxShadow: `0 0 0 2px transparent`, // default when not focused
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${currentTheme.dashboardBackground}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px transparent`;
                  }}
                />
                {errors.selfCertifiedSophisticatedInvestor?.directorDetails
                  ?.companyNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    {
                      errors.selfCertifiedSophisticatedInvestor.directorDetails
                        .companyNumber.message
                    }
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* C. Unlisted Investments */}
        <div className="border border-[#979797] rounded-xl p-5 space-y-4">
          <div
            className="tertiary-heading"
            style={{ color: currentTheme.secondaryText }}
          >
            (C) Made two or more investments in an unlisted company, in the last
            two years?
          </div>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="true"
                disabled={noneApply}
                {...register(
                  "selfCertifiedSophisticatedInvestor.unlistedInvestments"
                )}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="false"
                disabled={noneApply}
                {...register(
                  "selfCertifiedSophisticatedInvestor.unlistedInvestments"
                )}
              />{" "}
              No
            </label>
          </div>
          {errors.selfCertifiedSophisticatedInvestor?.unlistedInvestments && (
            <p className="text-sm text-red-600">
              {
                errors.selfCertifiedSophisticatedInvestor.unlistedInvestments
                  .message
              }
            </p>
          )}
          {watched?.unlistedInvestments === "true" && !noneApply && (
            <div className="mt-2">
              <label
                className="block mb-1 tertiary-heading"
                style={{ color: currentTheme.secondaryText }}
              >
                How many investments in unlisted companies have you made in the
                last two years?
              </label>
              <input
                type="number"
                min={2}
                {...register(
                  "selfCertifiedSophisticatedInvestor.unlistedInvestmentsCount",
                  { valueAsNumber: true }
                )}
                placeholder="e.g. 2"
                className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#2FB5B4] 
                  ${
                    errors.selfCertifiedSophisticatedInvestor
                      ?.unlistedInvestmentsCount
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                style={{
                  // dynamic ring color
                  boxShadow: `0 0 0 2px transparent`, // default when not focused
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${currentTheme.dashboardBackground}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px transparent`;
                }}
              />
              {errors.selfCertifiedSophisticatedInvestor
                ?.unlistedInvestmentsCount && (
                <p className="text-sm text-red-600 mt-1">
                  {
                    errors.selfCertifiedSophisticatedInvestor
                      .unlistedInvestmentsCount.message
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* D. Business Angel */}
        <div className="border border-[#979797] rounded-xl p-5 space-y-4">
          <div
            className="tertiary-heading"
            style={{ color: currentTheme.secondaryText }}
          >
            (D) Been a member of a network or syndicate of business angels for
            more than six months, and are still a member?
          </div>
          <div className="flex gap-6 mt-1">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="true"
                disabled={noneApply}
                {...register(
                  "selfCertifiedSophisticatedInvestor.businessAngel"
                )}
              />{" "}
              Yes
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="false"
                disabled={noneApply}
                {...register(
                  "selfCertifiedSophisticatedInvestor.businessAngel"
                )}
              />{" "}
              No
            </label>
          </div>
          {errors.selfCertifiedSophisticatedInvestor?.businessAngel && (
            <p className="text-sm text-red-600">
              {errors.selfCertifiedSophisticatedInvestor.businessAngel.message}
            </p>
          )}
          {watched?.businessAngel === "true" && !noneApply && (
            <div className="mt-2">
              <label
                className="tertiary-heading"
                style={{ color: currentTheme.secondaryText }}
              >
                What is the name of the network or syndicate?
              </label>
              <input
                type="text"
                {...register(
                  "selfCertifiedSophisticatedInvestor.businessAngelNetwork"
                )}
                placeholder="Enter name of network or syndicate"
                className={`w-full p-2 border rounded outline-none focus:ring-2 focus:ring-[#2FB5B4] 
                  ${
                    errors.selfCertifiedSophisticatedInvestor
                      ?.businessAngelNetwork
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                style={{
                  // dynamic ring color
                  boxShadow: `0 0 0 2px transparent`, // default when not focused
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${currentTheme.dashboardBackground}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px transparent`;
                }}
              />
              {errors.selfCertifiedSophisticatedInvestor
                ?.businessAngelNetwork && (
                <p className="text-sm text-red-600 mt-1">
                  {
                    errors.selfCertifiedSophisticatedInvestor
                      .businessAngelNetwork.message
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* (E) None apply */}
        <div className="border border-[#979797] rounded-xl p-5 space-y-4">
          <div
            className="tertiary-heading"
            style={{ color: currentTheme.secondaryText }}
          >
            (E) None of these apply to me.
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("selfCertifiedSophisticatedInvestor.noneApply")}
              checked={noneApply}
            />
            <span>Yes</span>
          </label>
          {errors.selfCertifiedSophisticatedInvestor?.noneApply && (
            <p className="text-sm text-red-600">
              {errors.selfCertifiedSophisticatedInvestor.noneApply.message}
            </p>
          )}
        </div>

        {/* Declaration */}
        <div className="rounded-xl  ">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              {...register(
                "selfCertifiedSophisticatedInvestor.declarationAccepted"
              )}
              className="mt-1"
            />
            <div
              className="tertiary-heading space-y-3"
              style={{ color: currentTheme.secondaryText }}
            >
              <div>
                I declare that I have answered yes to A and/or B, and wish to be
                treated as a high net worth individual.
              </div>
              <div>
                I understand that this means:
                <ul className="list-none mt-1 ml-6 space-y-4">
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
          {errors.selfCertifiedSophisticatedInvestor?.declarationAccepted && (
            <p className="text-sm text-red-600 mt-1">
              {
                errors.selfCertifiedSophisticatedInvestor.declarationAccepted
                  .message
              }
            </p>
          )}
        </div>

        {/* Signature & Date */}
        <div className="flex gap-6 flex-wrap">
          <div className="flex-1">
            <label
              className="block mb-1 font-medium text-gray-800"
              style={{ color: currentTheme.primaryText }}
            >
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
                  style={{ color: currentTheme.dashboardBackground }}
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
                style={{
                  // dynamic ring color
                  boxShadow: `0 0 0 2px transparent`, // default when not focused
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${currentTheme.dashboardBackground}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px transparent`;
                }}
              />
            )}
            {errors.signature && (
              <p className="text-sm text-red-600 mt-1">
                {errors.signature.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label
              className="block mb-1 font-medium text-gray-800"
              style={{ color: currentTheme.primaryText }}
            >
              Date
            </label>
            <input
              type="date"
              {...register("signatureDate")}
              required
              disabled
              className="w-full p-2 outline-none border border-gray-300 rounded focus:ring-2 focus:ring-[#2FB5B4]"
              style={{
                // dynamic ring color
                boxShadow: `0 0 0 2px transparent`, // default when not focused
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${currentTheme.dashboardBackground}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px transparent`;
              }}
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
            style={{ backgroundColor: currentTheme.dashboardBackground }}
          >
            Continue to Document Upload
          </button>
        </div>
      </form>
      <SignatureModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSave={handleSignatureSave}
        currentTheme={currentTheme}
      />
    </div>
  );
}
