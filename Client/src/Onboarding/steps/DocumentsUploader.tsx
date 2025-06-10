import { Eye, Trash2 } from "lucide-react";
import { StepHeader } from "../StepHeader";
import { useOnboarding } from "../../Context/OnboardingContext";
import { useEffect, useState } from "react";
import { useDocumentDelete, useDocumentUpload, useStartOnboarding, useUpdateOnboarding } from "../../API/Endpoints/Onboarding/useInvestorOnboarding";
import { useAuth } from "../../Context/AuthContext";
import toast from "react-hot-toast";
import { DocumentPreviewModal } from '../../Components/DocumentPreviewModal';

interface FileInputBlockProps {
    label: string;
    desc: string;
    ul: React.ReactNode;
    inputId: string;
    accept: string;
    fileKey: string;
}


export function DocumentUploadStepEntity() {
    const { state, updateFormData, prevStep, dispatch } = useOnboarding();
    const { user, updateOnboardingStatus } = useAuth();
    // const { mutateAsync: startOnboarding, isLoading: isStarting } = useStartOnboarding();
    // const { mutateAsync: updateOnboarding, isLoading: isUpdating } = useUpdateOnboarding();
    // const { mutateAsync: uploadDocuments, isLoading: isUploading } = useDocumentUpload();
    const { mutateAsync: startOnboarding, status: startOnboardingStatus } = useStartOnboarding();
    const isStarting = startOnboardingStatus === 'pending';
    const { mutateAsync: updateOnboarding, status: updateStatus } = useUpdateOnboarding();
    const isUpdating = updateStatus === 'pending';

    const { mutateAsync: uploadDocuments } = useDocumentUpload();

    const { mutateAsync: deleteDocument } = useDocumentDelete();
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ key: string; url: string }>>([]);
    const [existingDocuments, setExistingDocuments] = useState<Array<{ url: string; filename: string }>>([]);
    const [previewModal, setPreviewModal] = useState<{
        isOpen: boolean;
        url: string;
        type: string;
    }>({
        isOpen: false,
        url: '',
        type: ''
    });

    const handleFileSelect = (type: string, files: FileList | null) => {
        if (!files) return;
        setSelectedFiles(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), ...Array.from(files)]
        }));
    };

    const handlePreview = (type: string, fileIdx: number) => {
        const file = selectedFiles[type]?.[fileIdx];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPreviewModal({
            isOpen: true,
            url,
            type: file.type
        });
    };

    const handleClosePreview = () => {
        if (previewModal.url && !previewModal.url.includes('amazonaws.com')) {
            URL.revokeObjectURL(previewModal.url);
        }
        setPreviewModal({
            isOpen: false,
            url: '',
            type: ''
        });
    };

    const handleDelete = (type: string, fileIdx: number) => {
        setSelectedFiles(prev => ({
            ...prev,
            [type]: prev[type].filter((_, idx) => idx !== fileIdx)
        }));
    };

    const handleSubmit = async () => {
        if (!selectedFiles.kyc?.length) return;

        try {
            // Prepare and upload files
            const formData = new FormData();
            selectedFiles.kyc.forEach(file => {
                formData.append('documents', file);
            });

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

                // Create document URLs array
                const documentUrls = uploadResponse.data.map(doc => ({
                    url: doc.url,
                    type: 'entity_document'
                }));

                // Wait for form data update to complete
                await new Promise<void>(resolve => {
                    updateFormData({ entityDocuments: documentUrls });
                    setTimeout(resolve, 100);
                });

                // Submit onboarding with updated form data
                try {
                    const updatedFormData = {
                        ...state.formData,
                        entityDocuments: documentUrls
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

    // Add useEffect to set existing documents when form data changes
    useEffect(() => {
        if (state.formData?.entityDocuments?.length) {
            setExistingDocuments(
                state.formData.entityDocuments.map(doc => ({
                    url: doc.url,
                    filename: doc.url.split('/').pop() || 'Document'
                }))
            );
        }
    }, [state.formData]);

    // For reusable file input + preview row
    function FileInputBlock({ label, desc, ul, inputId, accept, fileKey }: FileInputBlockProps) {
        const isPending = user?.onboardingStatus?.status === 'pending';
        const isRejected = user?.onboardingStatus?.status === 'rejected';

        return (
            <div className="border border-[#979797] rounded-lg p-6 space-y-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">{label}</h3>
                <p className="text-sm text-gray-600 mb-3">{desc}</p>
                <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-2">{ul}</ul>

                {isRejected && (
                    <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            <strong>Action Required:</strong> Please upload new documents to resubmit your application.

                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        accept={accept}
                        id={inputId}
                        multiple
                        onChange={e => handleFileSelect(fileKey, e.target.files)}
                        className="hidden"
                        disabled={isPending}
                    />

                    {/* Show existing documents if any */}
                    {existingDocuments.length > 0 && (
                        <div className="space-y-1 mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {isRejected ? 'Previously Submitted Documents:' : 'Existing Documents:'}
                            </p>
                            {existingDocuments.map((doc, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center border rounded px-2 py-1 ${isRejected ? 'border-red-200 bg-red-50' : 'border-[#2FB5B4] bg-[#2FB5B410]'
                                        }`}
                                >
                                    <span className="flex-1 truncate">{doc.filename}</span>
                                    <button
                                        type="button"
                                        title="Preview"
                                        onClick={() => setPreviewModal({
                                            isOpen: true,
                                            url: doc.url,
                                            type: doc.filename.toLowerCase().endsWith('.pdf')
                                                ? 'application/pdf'
                                                : 'image/*'
                                        })}
                                        className="text-[#2FB5B4] hover:text-[#145D5D] p-1"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Always show file input in rejected state */}
                    <label
                        htmlFor={inputId}
                        className={`
                            flex items-center justify-between border border-gray-400 rounded-lg px-4 py-3 
                            ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            bg-white text-gray-800
                            transition-colors hover:border-[#2FB5B4]
                            ${selectedFiles[fileKey]?.length ? 'border-[#2FB5B4]' : ''}
                            ${isRejected && !selectedFiles[fileKey]?.length ? 'border-red-400' : ''}
                        `}
                    >
                        <span>
                            {selectedFiles[fileKey]?.length
                                ? `${selectedFiles[fileKey].length} file(s) selected`
                                : isRejected
                                    ? "Upload new documents"
                                    : "Choose File  No file chosen"}
                        </span>
                        <span className="text-xs text-gray-500 ml-3">
                            (PDF, JPG, PNG up to 10MB each)
                        </span>
                    </label>

                    {/* List of newly selected files */}
                    {selectedFiles[fileKey]?.length > 0 && (
                        <div className="space-y-1 mt-2">
                            {selectedFiles[fileKey].map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center border border-gray-200 rounded px-2 py-1 bg-gray-50"
                                >
                                    <span className="flex-1 truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        title="Preview"
                                        onClick={e => {
                                            e.preventDefault();
                                            handlePreview(fileKey, idx);
                                        }}
                                        className="text-[#2FB5B4] hover:text-[#145D5D] p-1"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        title="Delete"
                                        onClick={e => {
                                            e.preventDefault();
                                            handleDelete(fileKey, idx);
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <StepHeader
                    step={4}
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
                            label="Entity Professional Documentation"
                            desc="Please provide the following documents for your organization:"
                            ul={
                                <>
                                    <li>Certificate of incorporation or equipment</li>
                                    <li>Register of Directors</li>
                                    <li>Register of Members/Shareholders</li>
                                    <li>Regularity licenses or registration (If applicable)</li>
                                    <li>Proof of required status (for FCA/PRA regulated entities)</li>
                                </>
                            }
                            inputId="kyc-upload"
                            accept=".pdf,.jpg,.jpeg,.png"
                            fileKey="kyc"
                        />
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
                            onClick={handleSubmit}
                            disabled={
                                isStarting ||
                                isUpdating ||
                                user?.onboardingStatus?.status === 'pending' ||
                                (user?.onboardingStatus?.status === 'rejected' && !selectedFiles.kyc?.length)
                            }
                            className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {user?.onboardingStatus?.status === 'rejected' ? 'Resubmit' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add DocumentPreviewModal */}
            <DocumentPreviewModal
                isOpen={previewModal.isOpen}
                onClose={handleClosePreview}
                fileUrl={previewModal.url}
                fileType={previewModal.type}
            />
        </>
    );
}
