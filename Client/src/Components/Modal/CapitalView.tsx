import React from 'react';
import { X, CreditCard, } from 'lucide-react';
import type { CapitalCall } from '../../API/Endpoints/Funds/capitalCall';
import type { Distribution as DistType } from '../../API/Endpoints/Funds/distributions';

type FundTransaction = CapitalCall | DistType;

interface FundTransactionViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: FundTransaction | null;
    onApprove: () => void;
    onReject: () => void;
    isLoading: boolean;
    entityType: "capital" | "distribution";
}

// Separate Modal Component
export const FundTransactionViewModal: React.FC<FundTransactionViewModalProps> = ({
    isOpen,
    onClose,
    transaction,
    onApprove,
    onReject,
    isLoading,
    entityType,
}) => {
    if (!isOpen || !transaction) return null;

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount: string): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(Number(amount));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-semibold">
                        {entityType === "capital" ? "Capital Call Bank Details" : "Distribution Bank Details"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className="mb-6">
                        <h4 className="text-lg font-medium mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                            {entityType === "capital" ? "Capital Call Card Details" : "Distribution Card Details"}
                        </h4>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <p className="text-gray-900">{transaction.recipientName}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account No/IBAN
                                </label>
                                <p className="text-gray-900">{transaction.accountNumber}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount
                                </label>
                                <p className="text-gray-900 font-semibold">{formatAmount(transaction.amount)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bank Name
                                </label>
                                <p className="text-gray-900">{transaction.bankName}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <p className="text-gray-900">{transaction.description}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <p className="text-gray-900">{formatDate(transaction.date)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer with Action Buttons */}
                <div className="flex justify-center space-x-3 p-6 border-t">
                    <button
                        onClick={onApprove}
                        disabled={isLoading}
                        className="px-6 py-2 bg-theme-sidebar-accent text-white rounded-lg hover:opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Approved'}
                    </button>
                    <button
                        onClick={onReject}
                        disabled={isLoading}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Rejected'}
                    </button>
                </div>
            </div>
        </div>
    );
};