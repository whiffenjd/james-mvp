import { Eye, Trash2 } from "lucide-react";
import { StepHeader } from "../StepHeader";
import { useOnboarding } from "../../Context/OnboardingContext";
import { useState } from "react";

export function DocumentUploadStep() {
    const { state, updateFormData, nextStep, prevStep } = useOnboarding();
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});

    const handleFileSelect = (type: string, file: File | null) => {
        setSelectedFiles(prev => ({ ...prev, [type]: file }));
    };

    const handlePreview = (type: string) => {
        const file = selectedFiles[type];
        if (!file) return;

        const url = URL.createObjectURL(file);

        if (file.type === 'application/pdf') {
            // Open PDF in new tab
            window.open(url, "_blank");
        } else if (file.type.startsWith("image/")) {
            // Open image in new tab
            window.open(url, "_blank");
        } else {
            alert("Preview available only for PDFs and images.");
        }

        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    const handleDelete = (type: string) => {
        handleFileSelect(type, null);
    };

    const handleSubmit = () => {
        const documentUrls = {
            kycDocumentUrl: selectedFiles.kyc ? 'uploaded-kyc-url' : undefined,
            proofOfAddressUrl: selectedFiles.address ? 'uploaded-address-url' : undefined
        };
        console.log("form data", state.formData);
        updateFormData(documentUrls);
        // nextStep();
    };

    // For reusable file input + preview row
    function FileInputBlock({ label, desc, ul, inputId, accept, fileKey }) {
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
                    />
                    {/* Custom file box */}
                    <label
                        htmlFor={inputId}
                        className={`
                            flex items-center justify-between border border-gray-400 rounded-lg px-4 py-3 cursor-pointer
                            bg-white text-gray-800
                            transition-colors hover:border-[#2FB5B4]
                            ${selectedFiles[fileKey] ? 'border-[#2FB5B4]' : ''}
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


                    <span className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG up to 10MB
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <StepHeader
                step={5}
                title="Document Upload"
                subtitle="Please upload required documents"
            />
            <div className="space-y-6 max-w-8xl">
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
                        className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedFiles.kyc || !selectedFiles.address}
                        className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
