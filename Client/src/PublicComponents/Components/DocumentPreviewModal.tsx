interface DocumentPreviewModalProps {
    open: boolean;
    url: string;
    onClose: () => void;
    fileName?: string;
}

export function DocumentPreviewModal({ open, url, onClose, fileName }: DocumentPreviewModalProps) {
    if (!open) return null;
    if (!url) return null;

    const isPDF = url.toLowerCase().endsWith(".pdf") || url.includes("application/pdf");
    const isImage = /\.(png|jpe?g|gif|bmp|webp)$/i.test(url);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-full max-h-full p-6 relative flex flex-col">
                <button
                    className="absolute top-2 right-2 text-gray-700 hover:text-red-500 text-2xl"
                    onClick={onClose}
                    title="Close"
                >
                    &times;
                </button>
                <div className="mb-2 font-medium text-lg">{fileName || "Document Preview"}</div>
                <div className="flex-1 flex items-center justify-center min-w-[300px] min-h-[300px]">
                    {isPDF ? (
                        <iframe
                            src={url}
                            title="PDF Preview"
                            className="w-[80vw] h-[80vh] rounded shadow border"
                        />
                    ) : isImage ? (
                        <img
                            src={url}
                            alt={fileName || "Image preview"}
                            className="max-w-[80vw] max-h-[80vh] rounded shadow border"
                        />
                    ) : (
                        <div className="text-gray-600">Cannot preview this file type.</div>
                    )}
                </div>
                <div className="flex mt-4 gap-2 justify-end">
                    <a
                        href={url}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
                    >
                        Download
                    </a>
                </div>
            </div>
        </div>
    );
}