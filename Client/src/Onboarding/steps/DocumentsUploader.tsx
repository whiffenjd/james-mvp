import { Eye, Trash2 } from "lucide-react";
import { StepHeader } from "../StepHeader";
import { useOnboarding } from "../../Context/OnboardingContext";
import { useEffect, useState } from "react";
import { useStartOnboarding, useUpdateOnboarding } from "../../API/Endpoints/Onboarding/useInvestorOnboarding";
import { useAuth } from "../../Context/AuthContext";

export function DocumentUploadStepEntity() {
    const { state, updateFormData, nextStep, prevStep } = useOnboarding();
    const { mutate: startOnboarding, isLoading: isStarting } = useStartOnboarding();
    const { mutate: updateOnboarding, isLoading: isUpdating } = useUpdateOnboarding();
    const { user } = useAuth();
    // Now selectedFiles[type] is an array of File objects
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});

    const handleFileSelect = (type: string, files: FileList | null) => {
        if (!files) return;
        setSelectedFiles(prev => ({
            ...prev,
            [type]: [
                ...(Array.isArray(prev[type]) ? prev[type] : []),
                ...Array.from(files)
            ]
        }));
    };


    const handlePreview = (type: string, fileIdx: number) => {
        const file = selectedFiles[type]?.[fileIdx];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (file.type === 'application/pdf' || file.type.startsWith("image/")) {
            window.open(url, "_blank");
        } else {
            alert("Preview available only for PDFs and images.");
        }
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    const handleDelete = (type: string, fileIdx: number) => {
        setSelectedFiles(prev => ({
            ...prev,
            [type]: prev[type].filter((_, idx) => idx !== fileIdx)
        }));
    };

    const handleSubmit = () => {
        const entityDocuments = Object.entries(selectedFiles).flatMap(([type, files]) =>
            files.map(file => ({
                type,
                url: "uploaded-file-url",
                fileName: file.name
            }))
        );

        updateFormData({ entityDocuments });

        // If rejected, use update mutation, otherwise use start mutation
        if (user?.onboardingStatus?.status === 'rejected') {
            updateOnboarding({ formData: state.formData });
        } else if (!user?.onboardingStatus?.status) {
            startOnboarding({ formData: state.formData });
        }
    };

    // For reusable file input + preview row
    function FileInputBlock({ label, desc, ul, inputId, accept, fileKey }) {
        return (
            <div className="border border-[#979797] rounded-lg p-6 space-y-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">{label}</h3>
                <p className="text-sm text-gray-600 mb-3">{desc}</p>
                <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-2">{ul}</ul>
                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        accept={accept}
                        id={inputId}
                        multiple
                        onChange={e => handleFileSelect(fileKey, e.target.files)}
                        className="hidden"
                    />
                    <label
                        htmlFor={inputId}
                        className={`
                            flex items-center justify-between border border-gray-400 rounded-lg px-4 py-3 cursor-pointer
                            bg-white text-gray-800
                            transition-colors hover:border-[#2FB5B4]
                            ${(selectedFiles[fileKey]?.length) ? 'border-[#2FB5B4]' : ''}
                        `}
                    >
                        <span>
                            {selectedFiles[fileKey]?.length
                                ? `${selectedFiles[fileKey].length} file(s) selected`
                                : "Choose File  No file chosen"}
                        </span>
                        <span className="text-xs text-gray-500 ml-3">
                            (PDF, JPG, PNG up to 10MB each)
                        </span>
                    </label>
                    {/* List of uploaded files */}
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
                        disabled={isStarting || isUpdating || user?.onboardingStatus?.status === 'pending'}
                        className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {user?.onboardingStatus?.status === 'rejected' ? 'Update' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
