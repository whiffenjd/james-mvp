import { X } from 'lucide-react';

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileType: string;
}

export function DocumentPreviewModal({ isOpen, onClose, fileUrl, fileType }: DocumentPreviewModalProps) {
    if (!isOpen) return null;
    console.log("url ", fileUrl, fileType)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full m-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium">Document Preview</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
                    {fileType.startsWith('image/') ? (
                        <img
                            src={fileUrl}
                            alt="Document preview"
                            className="max-w-full h-auto mx-auto"
                        />
                    ) : fileType === 'application/pdf' ? (
                        <object
                            data={`${fileUrl}#toolbar=0`}
                            type="application/pdf"
                            className="w-full h-[calc(90vh-12rem)]"
                        >
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-600 mb-4">Unable to display PDF directly.</p>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                >
                                    Open PDF
                                </a>
                            </div>
                        </object>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">Unsupported file type</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}