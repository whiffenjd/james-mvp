import { useState } from "react";
import { X, Upload, FileText, Building, Calendar, User, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { formatDateToDDMMYYYY } from "../../utils/dateUtils";
import type { KycDocument } from "../../API/Endpoints/Documents/document";

interface KycUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        investorType: 'individual' | 'entity';
        kycDocument: File | null;
        proofOfAddress: File | null;
        entityDocuments: File[];
        documentStatus?: string;
        documentNote?: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        investorType: 'individual' | 'entity';
        kycDocument: File | null;
        proofOfAddress: File | null;
        entityDocuments: File[];
    }>>;
    onSubmit: () => void;
    isSubmitting: boolean;
    document?: KycDocument | null;
    investorType: 'individual' | 'entity';
}

export const KycUploadModal: React.FC<KycUploadModalProps> = ({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
    investorType,
}) => {
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
        setFormData({
            investorType: 'individual',
            kycDocument: null,
            proofOfAddress: null,
            entityDocuments: [],
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-theme-sidebar-accent/20 rounded-full flex items-center justify-center">
                            <Upload className="w-5 h-5 text-theme-sidebar-accent" />
                        </div>

                        <h3 className="text-xl font-semibold text-theme-primary-text">
                            {formData.kycDocument || formData.proofOfAddress || formData.entityDocuments.length
                                ? 'Reupload KYC Documents'
                                : 'Upload KYC Documents'}
                            {formData?.documentNote}
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-card-hover transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5 text-theme-secondary-text" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {investorType === 'individual' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary-text mb-2">
                                    KYC Document (PDF, JPG, PNG) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setFormData({ ...formData, kycDocument: e.target.files?.[0] || null })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent transition-all 
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                    file:bg-theme-sidebar-accent/10 file:text-theme-sidebar-accent hover:file:bg-theme-sidebar-accent/20"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-theme-secondary-text mb-2">
                                    Proof of Address (PDF, JPG, PNG) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setFormData({ ...formData, proofOfAddress: e.target.files?.[0] || null })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent transition-all 
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                    file:bg-theme-sidebar-accent/10 file:text-theme-sidebar-accent hover:file:bg-theme-sidebar-accent/20"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary-text mb-2">
                                Entity Documents (PDF, JPG, PNG) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                onChange={(e) => setFormData({ ...formData, entityDocuments: Array.from(e.target.files || []) })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent transition-all 
                  file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                  file:bg-theme-sidebar-accent/10 file:text-theme-sidebar-accent hover:file:bg-theme-sidebar-accent/20"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 bg-theme-card-hover text-theme-secondary-text rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="flex-1 px-4 py-3 bg-theme-sidebar-accent text-white rounded-xl font-medium hover:bg-theme-sidebar-accent-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                {formData.kycDocument || formData.proofOfAddress || formData.entityDocuments.length ? 'Reupload' : 'Upload'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface KycViewModalProps {
    isOpen: boolean
    onClose: () => void
    document: KycDocument | null
}



const getStatusConfig = (status: string) => {
    const configs = {
        pending_upload: {
            label: "Pending Upload",
            icon: Upload,
            bgColor: "bg-muted",
            textColor: "text-muted-foreground",
            iconColor: "text-muted-foreground",
        },
        submitted: {
            label: "Submitted",
            icon: FileText,
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
            textColor: "text-blue-700 dark:text-blue-300",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        under_review: {
            label: "Under Review",
            icon: Clock,
            bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
            textColor: "text-yellow-700 dark:text-yellow-300",
            iconColor: "text-yellow-600 dark:text-yellow-400",
        },
        approved: {
            label: "Approved",
            icon: CheckCircle,
            bgColor: "bg-green-50 dark:bg-green-950/20",
            textColor: "text-green-700 dark:text-green-300",
            iconColor: "text-green-600 dark:text-green-400",
        },
        reupload_requested: {
            label: "Reupload Requested",
            icon: AlertCircle,
            bgColor: "bg-red-50 dark:bg-red-950/20",
            textColor: "text-red-700 dark:text-red-300",
            iconColor: "text-red-600 dark:text-red-400",
        },
    }
    return configs[status as keyof typeof configs] || configs.pending_upload
}

export const KycViewModal: React.FC<KycViewModalProps> = ({ isOpen, onClose, document }) => {
    if (!isOpen) return null

    const statusConfig = document ? getStatusConfig(document.formData.documentStatus) : null
    const StatusIcon = statusConfig?.icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-theme-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">KYC Document Details</h3>
                            {document && <p className="text-sm text-muted-foreground">{document.investorName}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {document ? (
                        <div className="space-y-6">
                            {/* Status Section */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                                    Document Status
                                </h4>
                                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg `}>
                                    {StatusIcon && <StatusIcon className={`w-4 h-4 ${statusConfig?.iconColor}`} />}
                                    <span className={`text-sm font-medium ${statusConfig?.textColor}`}>{statusConfig?.label}</span>
                                </div>

                                {document.formData.documentNote && (
                                    <div className="bg-muted/50 border border-border rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground mb-1">Note</p>
                                                <p className="text-sm text-muted-foreground">{document.formData.documentNote}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Basic Information */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                                    Basic Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Investor Type</p>
                                            <p className="text-sm font-medium text-foreground capitalize">{document.formData.investorType}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Created</p>
                                            <p className="text-sm font-medium text-foreground">{formatDateToDDMMYYYY(document.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                                    Uploaded Documents
                                </h4>
                                <div className="space-y-2">
                                    {document.formData.kycDocumentUrl && (
                                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground">KYC Document</span>
                                            </div>
                                            <a
                                                href={document.formData.kycDocumentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                            >
                                                View
                                            </a>
                                        </div>
                                    )}

                                    {document.formData.proofOfAddressUrl && (
                                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Building className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground">Proof of Address</span>
                                            </div>
                                            <a
                                                href={document.formData.proofOfAddressUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                            >
                                                View
                                            </a>
                                        </div>
                                    )}

                                    {document.formData.entityDocuments?.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground">{doc.type || `Entity Document ${index + 1}`}</span>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                            >
                                                View
                                            </a>
                                        </div>
                                    ))}

                                    {!document.formData.kycDocumentUrl &&
                                        !document.formData.proofOfAddressUrl &&
                                        (!document.formData.entityDocuments || document.formData.entityDocuments.length === 0) && (
                                            <div className="text-center py-8">
                                                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="pt-4 border-t border-border">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Last updated: {formatDateToDDMMYYYY(document.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No document selected</p>
                        </div>
                    )}
                </div>


            </div>
        </div>
    )
}

interface RequestReuploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (note: string) => void;
    isSubmitting: boolean;
}

export const RequestReuploadModal: React.FC<RequestReuploadModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}) => {
    const [reuploadNote, setReuploadNote] = useState("");

    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
        setReuploadNote("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-theme-sidebar-accent/20 rounded-full flex items-center justify-center">
                            <Upload className="w-5 h-5 text-theme-sidebar-accent" />
                        </div>
                        <h3 className="text-xl font-semibold text-theme-primary-text">Request Reupload</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-card-hover transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5 text-theme-secondary-text" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-theme-secondary-text mb-2">
                            Reason for Reupload <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reuploadNote}
                            onChange={(e) => setReuploadNote(e.target.value)}
                            placeholder="Enter reason for requesting reupload"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent transition-all text-theme-primary-text"
                            rows={4}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 bg-theme-card-hover text-theme-secondary-text rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(reuploadNote)}
                        className="flex-1 px-4 py-3 bg-theme-sidebar-accent text-white rounded-xl font-medium hover:bg-theme-sidebar-accent-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={isSubmitting || !reuploadNote}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Submit
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};