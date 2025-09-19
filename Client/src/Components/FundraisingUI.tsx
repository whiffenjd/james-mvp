import React, { useState } from 'react';
import { Users, TrendingUp, FileText } from 'lucide-react';

interface Document {
    fileUrl: string;
}

interface FundData {
    documents?: Document[];
    investors?: any[];
    fundSize?: number;
    fundsCollected?: number;
}

interface TooltipProps {
    children: React.ReactNode;
    text: string;
}
export const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
    const [showTooltip, setShowTooltip] = useState<boolean>(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10">
                    {text}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
            )}
        </div>
    );
};

interface FundraisingUIProps {
    fundData?: FundData;
    openPdfModal?: (url: string, index: number) => void;
}

const FundraisingUI: React.FC<FundraisingUIProps> = ({
    fundData = {
        documents: [{ fileUrl: '#' }, { fileUrl: '#' }],
        investors: new Array(200).fill({}),
        fundSize: 18000,
        fundsCollected: 84
    },
    openPdfModal = (url: string, index: number) => {
        console.log('Opening PDF:', url, index);
    }
}) => {

    // Format large numbers
    const formatNumber = (num?: number): string => {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Fundraising Documents */}
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Fundraising Documents
                            </h3>
                        </div>

                        <div className="bg-teal-50 rounded-lg p-6 mb-6 min-h-[200px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-20 bg-teal-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-teal-600" />
                                </div>
                                <p className="text-sm text-teal-700 mb-4">Document Preview</p>
                            </div>
                        </div>

                        <button
                            onClick={() => openPdfModal(fundData?.documents[0]?.fileUrl, 0)}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            disabled={!fundData?.documents?.length}
                        >
                            View Documents ({fundData?.documents?.length || 0})
                        </button>
                    </div>

                    {/* All Investors */}
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                All Investors
                            </h3>
                        </div>

                        <div className="text-center mb-8">
                            <Tooltip text={`${fundData?.investors?.length || 0} total investors`}>
                                <div className="text-6xl font-bold text-teal-600 mb-2 cursor-help">
                                    {formatNumber(fundData?.investors?.length || 0)}
                                </div>
                            </Tooltip>
                            <p className="text-gray-500 text-sm">Total Investors</p>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full border-2 border-white"></div>
                                ))}
                            </div>
                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                25+
                            </span>
                        </div>
                    </div>

                    {/* Total Funds Needed */}
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Total Funds Needed
                            </h3>
                        </div>

                        <div className="text-center mb-8">
                            <Tooltip text={`${fundData?.fundSize?.toLocaleString() || 0} total needed`}>
                                <div className="text-6xl font-bold text-teal-600 mb-2 cursor-help">
                                    ${formatNumber(fundData?.fundSize || 0)}
                                </div>
                            </Tooltip>
                            <p className="text-gray-500 text-sm">Funding Goal</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Funds Collected</span>
                                <span className="font-semibold text-gray-800">{fundData?.fundsCollected || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(fundData?.fundsCollected || 0, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FundraisingUI;