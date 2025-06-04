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
import { DocumentPreviewModal } from '../../Components/DocumentPreviewModal';

export function DocumentUploadStep() {
    const { state, updateFormData, prevStep, dispatch } = useOnboarding();
    const { user, updateOnboardingStatus } = useAuth();
    const { mutateAsync: startOnboarding, status: startOnboardingStatus } = useStartOnboarding();
    const isStarting = startOnboardingStatus === 'pending';
    const { mutateAsync: updateOnboarding, status: updateStatus } = useUpdateOnboarding();
    const isUpdating = updateStatus === 'pending';

    const { mutateAsync: uploadDocuments, status: uploadeDocumentStatus } = useDocumentUpload();
    const isUploading = uploadeDocumentStatus === 'pending';

    const { mutateAsync: deleteDocument } = useDocumentDelete();
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ key: string; url: string }>>([]);
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
        url: '',
        type: ''
    });


    const handleFileSelect = (type: string, file: File | null) => {
        setSelectedFiles(prev => ({ ...prev, [type]: file }));
    };

    // Update preview handler
    const handlePreview = (type: string) => {
        const file = selectedFiles[type];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPreviewModal({
            isOpen: true,
            url,
            type: file.type
        });
    };

    // Add cleanup function
    const handleClosePreview = () => {
        if (previewModal.url) {
            URL.revokeObjectURL(previewModal.url);
        }
        setPreviewModal({
            isOpen: false,
            url: '',
            type: ''
        });
    };

    const handleDelete = (type: string) => {
        handleFileSelect(type, null);
    };

    const handleSubmit = async () => {
        if (!selectedFiles.kyc || !selectedFiles.address) return;

        try {
            // Prepare and upload files - order matters here
            const formData = new FormData();
            formData.append('documents', selectedFiles.kyc);
            formData.append('documents', selectedFiles.address);

            const uploadResponse = await toast.promise(
                uploadDocuments(formData),
                {
                    loading: 'Uploading documents...',
                    success: 'Documents uploaded successfully',
                    error: 'Failed to upload documents'
                }
            );

            if (uploadResponse.success) {
                setUploadedFiles(uploadResponse.data.map(doc => ({
                    key: doc.key,
                    url: doc.url
                })));

                // Create document URLs
                const documentUrls = {
                    kycDocumentUrl: uploadResponse.data[0]?.url,
                    proofOfAddressUrl: uploadResponse.data[1]?.url
                };

                // Wait for form data update to complete
                await new Promise<void>(resolve => {
                    updateFormData(documentUrls);
                    // Give time for state to update
                    setTimeout(resolve, 100);
                });

                // Submit onboarding with updated form data
                try {
                    const updatedFormData = {
                        ...state.formData,
                        ...documentUrls
                    };

                    const onboardingPromise = user?.onboardingStatus?.status === 'rejected'
                        ? updateOnboarding({ formData: updatedFormData })
                        : startOnboarding({ formData: updatedFormData });

                    const response = await toast.promise(onboardingPromise, {
                        loading: 'Submitting onboarding information...',
                        success: 'Onboarding submitted successfully',
                        error: 'Failed to submit onboarding'
                    });

                    // Update onboarding status to pending
                    updateOnboardingStatus('pending');

                    // Reset files
                    setUploadedFiles([]);
                    setSelectedFiles({});

                    // Clear form data and reset to initial state
                    dispatch({ type: 'RESET_FORM' });

                    // Load new onboarding data
                    if (response.data?.formData) {
                        await new Promise<void>(resolve => {
                            updateFormData(response.data.formData);
                            setTimeout(resolve, 100);
                        });
                    }


                } catch (error) {
                    // Clean up uploaded files on failure
                    await Promise.all(
                        uploadedFiles.map(file =>
                            deleteDocument(file.key).catch(err =>
                                console.error(`Failed to delete file ${file.key}:`, err)
                            )
                        )
                    );
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error in submission:', error);
            toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    };

    // For reusable file input + preview row
    function FileInputBlock({ label, desc, ul, inputId, accept, fileKey }) {
        const hasExistingDocument = existingDocuments[fileKey]?.url;
        const isPending = user?.onboardingStatus?.status === 'pending';

        return (
            <div className="border border-[#979797] rounded-lg p-6 space-y-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">{label}</h3>
                <p className="text-sm text-gray-600 mb-3">{desc}</p>
                <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-2">{ul}</ul>
                {/* File input */}
                {fileKey == "kyc" && (

                    <p className="text-sm text-gray-600 mb-3">The documents must be certified by a professional person or someone well-respected in
                        your community (such as a bank official, solicitor, accountant or public notary).</p>

                )}
                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        accept={accept}
                        id={inputId}
                        onChange={e => {
                            const file = e.target.files?.[0] || null;
                            handleFileSelect(fileKey, file);
                        }}
                        className="hidden"
                        disabled={isPending}
                    />

                    {/* Show existing document if available */}
                    {hasExistingDocument && !selectedFiles[fileKey] && (
                        <div className="flex items-center justify-between border border-[#2FB5B4] rounded-lg px-4 py-3 bg-white">
                            <span className="truncate">
                                {existingDocuments[fileKey]?.filename}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                                <button
                                    type="button"
                                    title="View Document"
                                    onClick={() => setPreviewModal({
                                        isOpen: true,
                                        url: existingDocuments[fileKey]?.url || '',
                                        type: existingDocuments[fileKey]?.filename.toLowerCase().endsWith('.pdf')
                                            ? 'application/pdf'
                                            : 'image/*'
                                    })}
                                    className="text-[#2FB5B4] hover:text-[#145D5D] p-1"
                                >
                                    <Eye size={20} />
                                </button>
                                {!isPending && (
                                    <button
                                        type="button"
                                        title="Replace Document"
                                        onClick={() => document.getElementById(inputId)?.click()}
                                        className="text-orange-500 hover:text-orange-700 p-1"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Only show file input if not pending and either no existing document or new file selected */}
                    {(!isPending && (!hasExistingDocument || selectedFiles[fileKey])) && (
                        <label
                            htmlFor={inputId}
                            className={`
                                flex items-center justify-between border border-gray-400 rounded-lg px-4 py-3 cursor-pointer
                                bg-white text-gray-800
                                transition-colors hover:border-[#2FB5B4]
                                ${selectedFiles[fileKey] ? 'border-[#2FB5B4]' : ''}
                                ${isPending ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                        >
                            <span>
                                {selectedFiles[fileKey]
                                    ? selectedFiles[fileKey].name
                                    : "Choose File  No file chosen"}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                                {selectedFiles[fileKey] && (
                                    <>
                                        <button
                                            type="button"
                                            title="Preview"
                                            onClick={e => {
                                                e.preventDefault();
                                                handlePreview(fileKey);
                                            }}
                                            className="text-[#2FB5B4] hover:text-[#145D5D] p-1"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            title="Delete"
                                            onClick={e => {
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

                    <span className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG up to 10MB
                    </span>
                </div>
            </div>
        );
    }

    // Add useEffect to set existing documents when form data changes
    useEffect(() => {
        if (state.formData?.kycDocumentUrl || state.formData?.proofOfAddressUrl) {
            setExistingDocuments({
                kyc: state.formData.kycDocumentUrl ? {
                    url: state.formData.kycDocumentUrl,
                    filename: state.formData.kycDocumentUrl.split('/').pop() || 'KYC Document'
                } : undefined,
                address: state.formData.proofOfAddressUrl ? {
                    url: state.formData.proofOfAddressUrl,
                    filename: state.formData.proofOfAddressUrl.split('/').pop() || 'Proof of Address'
                } : undefined
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
                />
                <div className="space-y-6 max-w-8xl">
                    {/* Show pending notice if status is pending */}
                    {user?.onboardingStatus?.status === 'pending' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Pending Approval:</strong> Your onboarding submission is currently under review. You cannot make changes until the review is complete.
                            </p>
                        </div>
                    )}

                    {/* Show rejection notice if status is rejected */}
                    {user?.onboardingStatus?.status === 'rejected' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                                <strong>Update Required:</strong> Please review and update your documents based on the feedback provided.
                            </p>
                        </div>
                    )}

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                            <strong>Important Notice:</strong> KYC document verification is required before signing subscription document. You can complete this step later, but please note that investment opportunities will be limited until verification is complete.
                        </p>
                    </div>
                    <div className="space-y-8">
                        <FileInputBlock
                            label="ID Document (Certified)"
                            desc="Please provide one of the following certified documents:"
                            ul={
                                <>
                                    <li>Current passport/national identity card with photograph</li>
                                    <li>Current photographic identity card which includes photograph</li>
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
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={isUploading || isStarting || isUpdating}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={
                                !selectedFiles.kyc ||
                                !selectedFiles.address ||
                                isUploading ||
                                isStarting ||
                                isUpdating ||
                                user?.onboardingStatus?.status === 'pending'
                            }
                            className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {(isUploading || isStarting || isUpdating) && (
                                <Loader2 className="animate-spin h-4 w-4" />
                            )}
                            {user?.onboardingStatus?.status === 'rejected' ? 'Update' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add modal */}
            <DocumentPreviewModal
                isOpen={previewModal.isOpen}
                onClose={handleClosePreview}
                fileUrl={previewModal.url}
                fileType={previewModal.type}
            />
        </>
    );
}
