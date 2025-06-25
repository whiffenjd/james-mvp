"use client";

import { ProgressBar } from "./ProgressBar";
import { DocumentPreview } from "./DocumentPreview";
import { useInvestorDetails } from "../../../FundManager/useInvestors";
import { useState } from "react";

interface InvestorDetailsModalProps {
  investorId: string;
  isOpen: boolean;
  onClose: () => void;
  onReject?: (rejectedNote: string) => Promise<void> | void;
  onApprove?: () => Promise<void> | void;
}
const highNetWorthOptions = [
  {
    value: "a",
    label: (
      <>
        (a) Any body corporate which has, or which is a member of the same group
        as an undertaking which has, a called-up share capital or net assets of
        not less than £500,000 if the body corporate has more than 20 members or
        is a subsidiary undertaking of an undertaking which has more than 20
        members
      </>
    ),
    showDetails: true,
  },
  {
    value: "b",
    label: (
      <>
        (b)Any body corporate which has, or which is a member of the same group
        as an undertaking which has, a called-up share capital or net assets of
        not less than £5,000,000
      </>
    ),
    showDetails: true,
  },
  {
    value: "c",
    label: (
      <>
        (c)Any unincorporated association or partnership which has net assets of
        not less than £5 million
      </>
    ),
    showDetails: true,
  },
  {
    value: "d",
    label: <>(d)The trustee of a high value trust</>,
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

export function InvestorDetailsModal({
  investorId,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: InvestorDetailsModalProps) {
  const { data, isLoading, error } = useInvestorDetails(investorId, {
    enabled: isOpen,
  });
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState("");

  if (!isOpen) return null;

  const formatJurisdiction = (jurisdiction: string) => {
    return jurisdiction
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatBoolean = (value: boolean | string | undefined) => {
    if (typeof value === "string") {
      return value === "true" ? "Yes" : "No";
    }
    return value ? "Yes" : "No";
  };

  const handleReject = async () => {
    setRejectError("");

    if (!rejectNote.trim()) {
      setRejectError("Please provide a rejection reason");
      return;
    }

    if (rejectNote.trim().length < 10) {
      setRejectError("Please provide at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject?.(rejectNote);
      setShowRejectModal(false);
      setRejectNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove?.();
      setShowApproveConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderJurisdictionSection = (formData: any) => (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-theme-sidebar-accent text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
          1
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Jurisdiction Selection
        </h3>
      </div>
      <div className="ml-11">
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700">
            Jurisdiction
          </span>
          <div className="mt-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
              {formatJurisdiction(formData?.jurisdiction)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvestorCategorizationSection = (formData: any) => (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-theme-sidebar-accent text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
          2
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Investor Categorization
        </h3>
      </div>
      <div className="ml-11 space-y-6">
        {/* Individual Investor Type */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Individual Investor Type
          </h4>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-theme-sidebar-accent rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-sm text-gray-900">
              {formData?.individualInvestorType === "high_net_worth"
                ? "High Net Worth Individual"
                : "Self Certified Sophisticated Investor"}
            </span>
          </div>
        </div>

        {/* High Net Worth Qualification */}
        {formData?.individualInvestorType === "high_net_worth" &&
          formData?.highNetWorthQualification && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                High Net Worth Individual Qualification
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Annual Income</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formData?.highNetWorthQualification?.incomeQualified ===
                      "true"
                        ? "Yes"
                        : "No"}
                      {formData?.highNetWorthQualification?.incomeAmount &&
                        ` - $${formData?.highNetWorthQualification?.incomeAmount?.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Net Assets</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formData?.highNetWorthQualification
                        ?.netAssetsQualified === "true"
                        ? "Yes"
                        : "No"}
                      {formData?.highNetWorthQualification?.netAssetsAmount &&
                        ` - $${formData?.highNetWorthQualification?.netAssetsAmount.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Self Certified Sophisticated Investor */}
        {formData?.individualInvestorType ===
          "self_certified_sophisticated_investor" &&
          formData?.selfCertifiedSophisticatedInvestor && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Self Certified Sophisticated Investor Details
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">
                    Professional Capacity
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formatBoolean(
                        formData?.selfCertifiedSophisticatedInvestor
                          ?.professionalCapacity
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Director</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formatBoolean(
                        formData?.selfCertifiedSophisticatedInvestor?.director
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    Unlisted Investments
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formatBoolean(
                        formData?.selfCertifiedSophisticatedInvestor
                          ?.unlistedInvestments
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Business Angel</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-900">
                      {formatBoolean(
                        formData?.selfCertifiedSophisticatedInvestor
                          ?.businessAngel
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Entity Classification */}
        {formData?.investorType === "entity" && formData?.entityDetails && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Entity Classification
            </h4>

            {/* Entity Type Display */}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm text-gray-900">
                {formData?.entityDetails?.entityType ===
                "investment_professional"
                  ? "Investment Professional"
                  : formData?.entityDetails?.entityType ===
                    "high_net_worth_company"
                  ? "High Net Worth Company"
                  : "Other"}
              </span>
            </div>

            {/* Optional Subtype for High Net Worth Company */}
            {formData?.entityDetails?.entityType === "high_net_worth_company" &&
              formData?.entityDetails?.highNetWorthCompanySubType && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Subtype: </span>
                  {highNetWorthOptions.find(
                    (opt) =>
                      opt.value ===
                      formData.entityDetails.highNetWorthCompanySubType
                  )?.label ?? "Unknown"}
                </div>
              )}

            {/* Entity Name */}
            {formData?.entityDetails?.entityName && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Entity Name: </span>
                {formData?.entityDetails?.entityName}
              </div>
            )}

            {/* Reference Number */}
            {formData?.entityDetails?.referenceNumber && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">Reference Number: </span>
                {formData?.entityDetails?.referenceNumber}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderDocumentsSection = (formData: any) => (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-theme-sidebar-accent text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
          3
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          AML/KYC Documents
        </h3>
      </div>
      <div className="ml-11">
        <h4 className="text-sm font-medium text-gray-700 mb-4">
          Uploaded Documents
        </h4>
        <div className="space-y-3">
          {formData?.investorType === "individual" ? (
            !formData?.kycDocumentUrl && !formData?.proofOfAddressUrl ? (
              <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
                No documents have been uploaded
              </div>
            ) : (
              <>
                {formData?.kycDocumentUrl && (
                  <DocumentPreview
                    url={formData.kycDocumentUrl}
                    title="ID Document (Certified)"
                    type="1.7 MB"
                  />
                )}
                {formData?.proofOfAddressUrl && (
                  <DocumentPreview
                    url={formData.proofOfAddressUrl}
                    title="Proof of Address (Certified)"
                    type="1.2 MB"
                  />
                )}
              </>
            )
          ) : formData?.investorType === "entity" ? (
            !formData?.entityDocuments?.length ? (
              <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
                No entity documents have been uploaded
              </div>
            ) : (
              <>
                {formData.entityDocuments.map((doc: any, index: number) => (
                  <DocumentPreview
                    key={index}
                    url={doc.url}
                    title={doc?.fileName || `${doc?.type} Document`}
                    type={doc.type}
                  />
                ))}
              </>
            )
          ) : (
            <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
              No documents available
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-card rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-theme-primary-text">
                Fund Manager
              </h2>
              <p className="text-sm text-theme-secondary-text">
                Investor Onboarding Progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-sidebar-accent"></div>
              <span className="ml-3 text-gray-600">
                Loading investor details...
              </span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Failed to load investor details</p>
            </div>
          ) : data?.data ? (
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {data?.data?.userName || "John Smith"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {data?.data?.userEmail}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full capitalize text-sm bg-green-100 text-green-800">
                    {data.data.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                currentStep={2}
                steps={[
                  "Jurisdiction Selection",
                  "Investor Categorization",
                  "AML/KYC Documents",
                ]}
              />

              {/* Sections */}
              {renderJurisdictionSection(data.data?.formData)}
              {renderInvestorCategorizationSection(data.data?.formData)}
              {renderDocumentsSection(data.data?.formData)}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {data?.data && (
          <div className="p-6 border-t border-gray-200">
            {/* Approved */}
            {data?.data?.status === "approved" && (
              <div className="flex flex-row justify-around items-center space-x-2">
                <span className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-800 font-bold">
                  Approved
                </span>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="w-1/2 bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium border border-red-300 transition-colors disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  Reject
                </button>
              </div>
            )}

            {/* Rejected */}
            {data.data.status === "rejected" && (
              <div className="flex flex-row justify-around items-center space-x-2">
                <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-700 font-bold">
                  Rejected
                </span>
                {data?.data?.rejectionNote && (
                  <div className="text-sm text-red-800 bg-red-50 rounded p-2">
                    Reason: {data?.data?.rejectionNote}
                  </div>
                )}
                <button
                  onClick={() => setShowApproveConfirm(true)}
                  className="w-1/7 bg-theme-sidebar-accent text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  Approve
                </button>
              </div>
            )}

            {/* Pending: Approve/Reject buttons */}
            {data.data.status === "pending" && (
              <div className="flex flex-row gap-3">
                <button
                  onClick={() => setShowApproveConfirm(true)}
                  className="w-full bg-theme-sidebar-accent text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="w-full bg-red-100 text-red-700 py-3 px-4 rounded-lg font-medium border border-red-300 transition-colors disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}

        {/* Approve Confirmation Dialog */}
        {showApproveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">Confirm Approval</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to approve this investor? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowApproveConfirm(false)}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-theme-sidebar-accent text-white rounded font-medium disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Approving..." : "Yes, Approve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal Dialog */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">Reject Investor</h3>
              <p className="text-gray-700 mb-4">
                Please provide a reason for rejecting this investor (minimum 10
                characters).
              </p>

              <textarea
                className="w-full rounded border border-gray-300 p-3 text-sm mb-2"
                rows={4}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Enter rejection reason..."
                minLength={10}
                maxLength={500}
                disabled={isSubmitting}
              />

              {rejectError && (
                <p className="text-sm text-red-600 mb-3">{rejectError}</p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectNote("");
                    setRejectError("");
                  }}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded font-medium disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
