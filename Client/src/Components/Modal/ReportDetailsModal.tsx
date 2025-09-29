import React from 'react';
import { Download, X } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

interface Report {
    id: string;
    fundId: string;
    projectName: string;
    createdBy: string;
    year: string;
    quarter: string;
    description: string;
    createdAt: string;
    documentUrl?: string;
    createdByName?: string;
}

interface ReportDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedReport: Report | null;
    onDownload?: (report: Report) => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
    isOpen,
    onClose,
    selectedReport,
    onDownload
}) => {
    if (!isOpen || !selectedReport) return null;


    const handleDownload = (): void => {
        if (onDownload && selectedReport) {
            onDownload(selectedReport);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Fund and Tax Report</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-2">

                        {/* Project Name and Date (first line) */}
                        <div className='p-3'>


                            <div className="text-lg flex justify-between text-[#2C2C2EE5]   rounded-lg">
                                {selectedReport.projectName} <span>
                                    {formatDateToDDMMYYYY(selectedReport.createdAt)}
                                </span>
                            </div>
                            {/* Fund Manager Name (second line) */}
                            <div className="text-sm text-gray-900 rounded-lg mt-1">
                                By {selectedReport.createdByName || "Example"}
                            </div>
                        </div>

                        {/* Description (third block) */}
                        <div className="text-sm text-gray-900 p-3 rounded-lg leading-relaxed mt-2">
                            {selectedReport.description || "Lorem ipsum dolor sit amet consectetur. Scelerisque aliquet orci tortor viverra est sit interdum lobortis. Gravida sit nisl molestie neque enim pro in netus. Adipiscing egestas vitae quis enim placerat. Libero feugiat purus adipiscing et. Semper. Lorem ipsum dolor sit amet consectetur. Scelerisque aliquet orci tortor viverra est sit interdum lobortis. Gravida sit nisl molestie neque enim proin netus. Adipiscing egestas vitae quis enim placerat. Libero feugiat purus adipiscing et. Semper. Semper. Lorem ipsum dolor sit"}
                        </div>




                        <div className="grid grid-cols-2 gap-4 p-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <p className="text-sm text-gray-900   rounded-lg">
                                    {selectedReport.year}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
                                <p className="text-sm text-gray-900      rounded-lg">
                                    {selectedReport.quarter}
                                </p>
                            </div>
                        </div>

                        {/* Document Preview */}
                        {selectedReport.documentUrl && (
                            <div className='p-6'>

                                <div className="max-h-[800px] overflow-auto rounded border border-gray-200">
                                    {selectedReport.documentUrl.endsWith('.pdf') ? (
                                        <iframe
                                            src={selectedReport.documentUrl}
                                            title="PDF Preview"
                                            className="w-full h-[800px]"
                                        />
                                    ) : (
                                        <img
                                            src={selectedReport.documentUrl}
                                            alt="Document"
                                            className="w-full object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer with Download Button */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Download File below
                        </div>
                        <button
                            onClick={handleDownload}
                            className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailsModal;