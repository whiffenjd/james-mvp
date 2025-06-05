"use client"

interface DocumentPreviewProps {
    url: string
    title: string
    type?: string
}

export function DocumentPreview({ url, title, type }: DocumentPreviewProps) {
    const getFileExtension = (url: string) => {
        return url.split(".").pop()?.toLowerCase() || "file"
    }

    const isImage = (url: string) => {
        const ext = getFileExtension(url)
        return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
    }

    return (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded border flex items-center justify-center">
                    {isImage(url) ? (
                        <img src={url || "/placeholder.svg"} alt={title} className="w-10 h-10 object-cover rounded" />
                    ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                    <p className="text-xs text-gray-500">{type || getFileExtension(url).toUpperCase()}</p>
                </div>
                <button
                    onClick={() => window.open(url, "_blank")}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                    View
                </button>
            </div>
        </div>
    )
}
