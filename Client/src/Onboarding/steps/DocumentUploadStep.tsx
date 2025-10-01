import { Eye, Trash2, Loader2 } from "lucide-react";
import { StepHeader } from "../StepHeader";
import { useOnboarding } from "../../Context/OnboardingContext";
import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import {
  useStartOnboarding,
  useUpdateOnboarding,
  useDocumentUpload,
  useDocumentDelete,
} from "../../API/Endpoints/Onboarding/useInvestorOnboarding";
import toast from "react-hot-toast";
import { DocumentPreviewModal } from "../../Components/DocumentPreviewModal";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Context/ThemeContext";
interface FileInputBlockProps {
  label: string;
  desc: string;
  ul: React.ReactNode;
  inputId: string;
  accept: string;
  fileKey: "kyc" | "address";
}

export function DocumentUploadStep() {
  const { state, updateFormData, prevStep, dispatch } = useOnboarding();
  const { user, updateOnboardingStatus } = useAuth();
  const { mutateAsync: startOnboarding, status: startOnboardingStatus } =
    useStartOnboarding();
  const isStarting = startOnboardingStatus === "pending";
  const { mutateAsync: updateOnboarding, status: updateStatus } =
    useUpdateOnboarding();
  const isUpdating = updateStatus === "pending";
  const { currentTheme } = useTheme();
  const { mutateAsync: uploadDocuments, status: uploadeDocumentStatus } =
    useDocumentUpload();
  const isUploading = uploadeDocumentStatus === "pending";
  const navigate = useNavigate();
  const { mutateAsync: deleteDocument } = useDocumentDelete();
  const [selectedFiles, setSelectedFiles] = useState<{
    [key: string]: File | null;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ key: string; url: string }>
  >([]);
  const [existingDocuments, setExistingDocuments] = useState<{
    kyc?: { url: string; filename: string };
    address?: { url: string; filename: string };
  }>({});

  // Add state for modal
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    url: string;
    type: string;
  }>({
    isOpen: false,
    url: "",
    type: "",
  });

  const handleFileSelect = (type: string, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [type]: file }));
  };

  // Update preview handler
  const handlePreview = (type: string) => {
    const file = selectedFiles[type];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewModal({
      isOpen: true,
      url,
      type: file.type,
    });
  };

  // Add cleanup function
  const handleClosePreview = () => {
    if (previewModal.url) {
      URL.revokeObjectURL(previewModal.url);
    }
    setPreviewModal({
      isOpen: false,
      url: "",
      type: "",
    });
  };

  const handleDelete = (type: string) => {
    handleFileSelect(type, null);
  };

  const handleSubmit = async (completeLater: boolean = false) => {
    try {
      let documentUrls = {
        kycDocumentUrl: "",
        proofOfAddressUrl: "",
      };

      if (!completeLater && (selectedFiles.kyc || selectedFiles.address)) {
        const formData = new FormData();
        if (selectedFiles.kyc) {
          formData.append("documents", selectedFiles.kyc);
        }
        if (selectedFiles.address) {
          formData.append("documents", selectedFiles.address);
        }

        const uploadResponse = await toast.promise(uploadDocuments(formData), {
          loading: "Uploading documents...",
          success: "Documents uploaded successfully",
          error: "Failed to upload documents",
        });

        if (uploadResponse.success) {
          setUploadedFiles(
            uploadResponse.data.map((doc) => ({
              key: doc.key,
              url: doc.url,
            }))
          );

          const uploadedDocs = uploadResponse.data;
          if (selectedFiles.kyc && selectedFiles.address) {
            documentUrls = {
              kycDocumentUrl: uploadedDocs[0]?.url || "",
              proofOfAddressUrl: uploadedDocs[1]?.url || "",
            };
          } else if (selectedFiles.kyc) {
            documentUrls.kycDocumentUrl = uploadedDocs[0]?.url || "";
          } else if (selectedFiles.address) {
            documentUrls.proofOfAddressUrl = uploadedDocs[0]?.url || "";
          }

          setExistingDocuments({
            kyc: documentUrls.kycDocumentUrl
              ? {
                  url: documentUrls.kycDocumentUrl,
                  filename:
                    documentUrls.kycDocumentUrl.split("/").pop() ||
                    "KYC Document",
                }
              : undefined,
            address: documentUrls.proofOfAddressUrl
              ? {
                  url: documentUrls.proofOfAddressUrl,
                  filename:
                    documentUrls.proofOfAddressUrl.split("/").pop() ||
                    "Proof of Address",
                }
              : undefined,
          });
        }
      }

      await new Promise<void>((resolve) => {
        updateFormData(documentUrls);
        setTimeout(resolve, 100);
      });

      const updatedFormData = {
        ...state.formData,
        ...documentUrls,
      };

      const onboardingPromise =
        user?.onboardingStatus?.status === "rejected" ||
        user?.onboardingStatus?.status === "complete_later"
          ? updateOnboarding({ formData: updatedFormData, completeLater })
          : startOnboarding({ formData: updatedFormData, completeLater });

      const response = await toast.promise(onboardingPromise, {
        loading: completeLater
          ? "Submitting without documents"
          : "Submitting onboarding information...",
        success: completeLater
          ? "Submitting without documents"
          : "Onboarding submitted successfully",
        error: "Failed to submit onboarding",
      });

      updateOnboardingStatus(completeLater ? "complete_later" : "pending");

      setUploadedFiles([]);
      setSelectedFiles({});

      dispatch({ type: "RESET_FORM" });

      if (response.data?.formData) {
        await new Promise<void>((resolve) => {
          updateFormData(response.data.formData);
          setTimeout(resolve, 100);
        });
      }
      if (completeLater) {
        navigate("/investor/dashboard");
      }
    } catch (error) {
      if (uploadedFiles.length > 0) {
        await Promise.all(
          uploadedFiles.map((file) =>
            deleteDocument(file.key).catch((err) =>
              console.error(`Failed to delete file ${file.key}:`, err)
            )
          )
        );
      }
      console.error("Error in submission:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  // For reusable file input + preview row
  function FileInputBlock({
    label,
    desc,
    ul,
    inputId,
    accept,
    fileKey,
  }: FileInputBlockProps) {
    const hasExistingDocument = existingDocuments[fileKey]?.url;
    const isPending = user?.onboardingStatus?.status === "pending";
    const { currentTheme } = useTheme();
    return (
      <div className="border border-[#979797] rounded-lg p-6 space-y-4 shadow-sm">
        <h3
          className="font-medium text-gray-900 mb-2"
          style={{ color: currentTheme.primaryText }}
        >
          {label}
        </h3>
        <p
          className="text-sm text-gray-600 mb-3"
          style={{ color: currentTheme.secondaryText }}
        >
          {desc}
        </p>
        <ul
          className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-2"
          style={{ color: currentTheme.secondaryText }}
        >
          {ul}
        </ul>

        {isPending && (
          <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Under Review:</strong> Your document is being reviewed.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {/* Only show file input when not pending */}
          {!isPending && (
            <input
              type="file"
              accept={accept}
              id={inputId}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileSelect(fileKey, file);
              }}
              className="hidden"
            />
          )}

          {/* Show existing document if available */}
          {hasExistingDocument && (!selectedFiles[fileKey] || isPending) && (
            <div
              className="flex items-center justify-between border rounded-lg px-4 py-3 bg-white border-[#2FB5B4]"
              style={{ borderColor: currentTheme.dashboardBackground }}
            >
              <span className="truncate">
                {existingDocuments[fileKey]?.filename}
              </span>
              <div className="flex items-center gap-2 ml-2">
                <button
                  type="button"
                  title="View Document"
                  onClick={() =>
                    setPreviewModal({
                      isOpen: true,
                      url: existingDocuments[fileKey]?.url || "",
                      type: existingDocuments[fileKey]?.filename
                        .toLowerCase()
                        .endsWith(".pdf")
                        ? "application/pdf"
                        : "image/*",
                    })
                  }
                  style={{
                    color: currentTheme.sidebarAccentText,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      currentTheme.dashboardBackground; // or keep .sidebarAccentText if you prefer
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      currentTheme.sidebarAccentText;
                  }}
                  className="text-[#2FB5B4] hover:text-[#145D5D] p-1"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Show file input label only when not pending */}
          {!isPending && (
            <label
              htmlFor={inputId}
              className={`
                                flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer
                                bg-white text-gray-800
                                transition-colors hover:border-[#2FB5B4]
                                ${selectedFiles[fileKey] ? "border-[#2FB5B4]" : "border-gray-400"}
                            `}
              style={{
                backgroundColor: "white",
                color: currentTheme.primaryText,
                borderColor: selectedFiles[fileKey]
                  ? currentTheme.dashboardBackground
                  : currentTheme.secondaryText,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLLabelElement).style.borderColor =
                  currentTheme.dashboardBackground;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLLabelElement).style.borderColor =
                  selectedFiles[fileKey]
                    ? currentTheme.dashboardBackground
                    : currentTheme.secondaryText;
              }}
            >
              <span>
                {selectedFiles[fileKey]
                  ? selectedFiles[fileKey].name
                  : hasExistingDocument
                    ? "Reupload document"
                    : "Choose File  No file chosen"}
              </span>
              <div className="flex items-center gap-2 ml-2">
                {selectedFiles[fileKey] && (
                  <>
                    <button
                      type="button"
                      title="Preview"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePreview(fileKey);
                      }}
                      className="text-[#2FB5B4] hover:text-[#145D5D] p-1"
                      style={{
                        color: currentTheme.dashboardBackground,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          currentTheme.secondaryText; // or keep dashboardBackground if you prefer
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          currentTheme.dashboardBackground;
                      }}
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(fileKey);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </label>
          )}
        </div>
      </div>
    );
  }

  // Add useEffect to set existing documents when form data changes
  useEffect(() => {
    if (state.formData?.kycDocumentUrl || state.formData?.proofOfAddressUrl) {
      setExistingDocuments({
        kyc: state.formData.kycDocumentUrl
          ? {
              url: state.formData.kycDocumentUrl,
              filename:
                state.formData.kycDocumentUrl.split("/").pop() ||
                "KYC Document",
            }
          : undefined,
        address: state.formData.proofOfAddressUrl
          ? {
              url: state.formData.proofOfAddressUrl,
              filename:
                state.formData.proofOfAddressUrl.split("/").pop() ||
                "Proof of Address",
            }
          : undefined,
      });
    }
  }, [state.formData]);

  return (
    <>
      <div className="space-y-6">
        <StepHeader
          step={5}
          title="Document Upload"
          subtitle="Please upload required documents"
          currentTheme={currentTheme}
        />
        <div className="space-y-6 max-w-8xl">
          {/* Show pending notice if status is pending */}
          {user?.onboardingStatus?.status === "pending" && (
            <div
              className="p-4 border rounded-lg"
              style={{
                backgroundColor: `${currentTheme.dashboardBackground}20`, // 20% opacity
                borderColor: currentTheme.dashboardBackground,
              }}
            >
              <p
                className="text-sm"
                style={{ color: currentTheme.primaryText }}
              >
                <strong>Pending Approval:</strong> Your onboarding submission is
                currently under review. You cannot make changes until the review
                is complete.
              </p>
            </div>
          )}

          {/* Show rejection notice if status is rejected */}
          {user?.onboardingStatus?.status === "rejected" && (
            <div
              className="p-4 border rounded-lg"
              style={{
                backgroundColor: `${currentTheme.dashboardBackground}20`,
                borderColor: currentTheme.dashboardBackground,
              }}
            >
              <p
                className="text-sm"
                style={{ color: currentTheme.primaryText }}
              >
                <strong>Update Required:</strong> Your previous submission was
                rejected. Please reupload both documents (ID Document and Proof
                of Address) to submit again.
              </p>
            </div>
          )}

          <div
            className="p-4 border rounded-lg"
            style={{
              backgroundColor: `${currentTheme.dashboardBackground}20`,
              borderColor: currentTheme.dashboardBackground,
            }}
          >
            <p className="text-sm" style={{ color: currentTheme.primaryText }}>
              <strong>Important Notice:</strong> KYC document verification is
              required before signing subscription document. You can complete
              this step later, but please note that investment opportunities
              will be limited until verification is complete.
            </p>
          </div>

          <div className="space-y-8">
            <FileInputBlock
              label="ID Document (Certified)"
              desc="Please provide one of the following certified documents:"
              ul={
                <>
                  <li>
                    Current passport/national identity card with photograph
                  </li>
                  <li>
                    Current photographic identity card which includes photograph
                  </li>
                </>
              }
              inputId="kyc-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              fileKey="kyc"
            />
            <FileInputBlock
              label="Proof of Address (Certified)"
              desc="Please provide one of the following certified documents:"
              ul={
                <>
                  <li>Valid driving license</li>
                  <li>Utility bill dated within the last 3 months</li>
                  <li>Bank statement dated within the last 3 months</li>
                  <li>Correspondence from an independent source</li>
                </>
              }
              inputId="address-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              fileKey="address"
            />
          </div>
          <div className="space-y-6">
            {/* Other form fields and steps */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={prevStep}
                disabled={isUploading || isStarting || isUpdating}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{
                  color: currentTheme.primaryText,
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={
                  isUploading ||
                  isStarting ||
                  isUpdating ||
                  user?.onboardingStatus?.status === "pending"
                }
                className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  color: currentTheme.primaryText,
                  backgroundColor: currentTheme.dashboardBackground,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    currentTheme.dashboardBackground; // or keep dashboardBackground if you prefer
                }}
              >
                {(isUploading || isStarting || isUpdating) && (
                  <Loader2 className="animate-spin h-4 w-4" />
                )}
                {user?.onboardingStatus?.status === "rejected"
                  ? "Update"
                  : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={
                  isUploading ||
                  isStarting ||
                  isUpdating ||
                  user?.onboardingStatus?.status === "pending"
                }
                className="flex-1 bg-[#797979] text-white py-3 px-4 rounded-lg  transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  color: currentTheme.primaryText,
                  backgroundColor: currentTheme.secondaryText,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    currentTheme.secondaryText; // or keep dashboardBackground if you prefer
                }}
              >
                {(isUploading || isStarting || isUpdating) && (
                  <Loader2 className="animate-spin h-4 w-4" />
                )}
                Complete Later
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add modal */}
      <DocumentPreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleClosePreview}
        fileUrl={previewModal.url}
        fileType={previewModal.type}
        currentTheme={currentTheme}
      />
    </>
  );
}
