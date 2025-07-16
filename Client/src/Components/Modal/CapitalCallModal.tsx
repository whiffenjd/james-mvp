import type React from "react";
import { useState, useEffect } from "react";
import { X, ChevronDown, Edit } from "lucide-react";

import type { CapitalCall } from "../../API/Endpoints/Funds/capitalCall";
import type { Distribution as DistType } from "../../API/Endpoints/Funds/distributions";
import type { FundDetail } from "../../Redux/features/Funds/fundsSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type FundTransaction = CapitalCall | DistType; // Union type for both entities

type FundTransactionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    mode: "create" | "edit" | "view"; // Added view mode
    initialData?: FundTransaction; // Can be either CapitalCall or Distribution
    fund: FundDetail | null;
    entityType: "capital" | "distribution"; // To differentiate between capital call and distribution
    onEditClick?: () => void; // Optional edit handler for view mode
};

export default function FundTransactionModal({
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData,
    fund,
    entityType,
    onEditClick,
}: FundTransactionModalProps) {
    const [formData, setFormData] = useState({
        investorId: "",
        amount: "",
        date: "",
        recipientName: "",
        bankName: "",
        accountNumber: "",
        description: "",
    });
    const investors = fund?.investors || [];
    const isViewMode = mode === "view";

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            const initialDate = initialData?.date ? new Date(initialData.date) : null;
            setSelectedDate(initialDate);

            setFormData({
                investorId: initialData?.investorId || "",
                amount: initialData?.amount || "",
                date: initialData?.date ? initialData.date.split("T")[0] : "",
                recipientName: initialData?.recipientName || "",
                bankName: initialData?.bankName || "",
                accountNumber: initialData?.accountNumber || "",
                description: initialData?.description || "",
            });
            setErrors({});
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.investorId) newErrors.investorId = "Please select an investor";
        if (!formData.amount) {
            newErrors.amount = "Amount is required";
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            newErrors.amount = "Please enter a valid amount";
        }
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.recipientName.trim()) newErrors.recipientName = "Recipient name is required";
        if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required";
        if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and decimal point
        if (/^\d*\.?\d*$/.test(value) || value === "") {
            handleInputChange("amount", value);
        }
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        if (date) {
            const formattedDate = date.toISOString().split("T")[0];
            handleInputChange("date", formattedDate);
        } else {
            handleInputChange("date", "");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "view") return onClose(); // No submission in view mode

        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const selectedInvestor = investors.find((inv) => inv.investorId === formData.investorId);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
                <div className="relative flex items-center justify-center py-2 m-2">
                    {/* Centered Heading */}
                    <h2 className="text-xl font-semibold text-gray-900">
                        {mode === "create"
                            ? `Create ${entityType === "capital" ? "Capital Call" : "Distribution"}`
                            : mode === "edit"
                                ? `Edit ${entityType === "capital" ? "Capital Call" : "Distribution"}`
                                : `${entityType === "capital" ? "Capital Call" : "Distribution"} Details`}
                    </h2>

                    {/* Close Button aligned to the right */}
                    <button
                        onClick={onClose}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>

                    {/* Edit Button in view mode */}
                    {mode === "view" && onEditClick && (
                        <button
                            onClick={onEditClick}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                        >
                            <Edit className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                </div>

                <p className="text-sm text-gray-500 mb-6">
                    {mode === "view" ? "View details" : "Enter details"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Investor Selection */}
                    <div className="relative">
                        {mode === "view" ? (
                            <div className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                                <span className="text-gray-900">
                                    {selectedInvestor?.name || "No investor selected"}
                                </span>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full h-12 px-4 text-left bg-white border rounded-lg flex items-center justify-between transition-colors ${errors.investorId ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                                        } ${!formData.investorId ? "text-gray-500" : "text-gray-900"}`}
                                    disabled={isViewMode}
                                >
                                    <span>{selectedInvestor?.name || "Select Investor"}</span>
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                        {investors.map((investor) => (
                                            <button
                                                key={investor.investorId}
                                                type="button"
                                                onClick={() => {
                                                    handleInputChange("investorId", investor.investorId);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
                                            >
                                                {investor.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        {errors.investorId && <p className="text-xs text-red-500 mt-1">{errors.investorId}</p>}
                    </div>

                    {/* Amount */}
                    <div>
                        {mode === "view" ? (
                            <div className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                                <span className="text-gray-900">
                                    {formData.amount ? `$${Number(formData.amount).toLocaleString()}` : "N/A"}
                                </span>
                            </div>
                        ) : (
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={formData.amount}
                                    onChange={handleAmountChange}
                                    placeholder="Amount"
                                    className={`w-full h-12 pl-8 pr-4 border rounded-lg transition-colors ${errors.amount ? "border-red-500" : "border-gray-200 hover:border-gray-300 focus:border-teal-500"
                                        } focus:outline-none focus:ring-0`}
                                    disabled={isViewMode}
                                />
                            </div>
                        )}
                        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                    </div>

                    {/* Date */}
                    <div className="relative w-full">
                        {mode === "view" ? (
                            <div className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                                <span className="text-gray-900">
                                    {selectedDate?.toLocaleDateString() || "No date selected"}
                                </span>
                            </div>
                        ) : (
                            <div className="relative">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    dateFormat="MMMM d, yyyy"
                                    placeholderText="Select Date"
                                    className={`w-full h-12 pl-4 pr-10 border rounded-lg transition-colors ${errors.date
                                        ? "border-red-500"
                                        : "border-gray-200 hover:border-gray-300 focus:border-teal-500"
                                        } focus:outline-none focus:ring-0`}
                                    disabled={isViewMode}
                                    wrapperClassName="w-full"
                                    onKeyDown={(e) => e?.preventDefault()} // Prevent keyboard input
                                    onChangeRaw={(e) => e?.preventDefault()} // Prevent manual changes
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                    </div>

                    {/* Recipient Name */}
                    <div>
                        {mode === "view" ? (
                            <div className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                                <span className="text-gray-900">
                                    {formData.recipientName || "N/A"}
                                </span>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={formData.recipientName}
                                onChange={(e) => handleInputChange("recipientName", e.target.value)}
                                placeholder="Recipient's Full Name"
                                className={`w-full h-12 px-4 border rounded-lg transition-colors ${errors.recipientName ? "border-red-500" : "border-gray-200 hover:border-gray-300 focus:border-teal-500"
                                    } focus:outline-none focus:ring-0`}
                                disabled={isViewMode}
                            />
                        )}
                        {errors.recipientName && <p className="text-xs text-red-500 mt-1">{errors.recipientName}</p>}
                    </div>

                    {/* Bank Name */}
                    <div>
                        {mode === "view" ? (
                            <div className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                                <span className="text-gray-900">
                                    {formData.bankName || "N/A"}
                                </span>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={formData.bankName}
                                onChange={(e) => handleInputChange("bankName", e.target.value)}
                                placeholder="Bank Name"
                                className={`w-full h-12 px-4 border rounded-lg transition-colors ${errors.bankName ? "border-red-500" : "border-gray-200 hover:border-gray-300 focus:border-teal-500"
                                    } focus:outline-none focus:ring-0`}
                                disabled={isViewMode}
                            />
                        )}
                        {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>}
                    </div>

                    {/* Account Number */}
                    <div>
                        {mode === "view" ? (
                            <div className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                                <span className="text-gray-900">
                                    {formData.accountNumber || "N/A"}
                                </span>
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={formData.accountNumber}
                                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                                placeholder="Account Number/IBAN"
                                className={`w-full h-12 px-4 border rounded-lg transition-colors ${errors.accountNumber ? "border-red-500" : "border-gray-200 hover:border-gray-300 focus:border-teal-500"
                                    } focus:outline-none focus:ring-0`}
                                disabled={isViewMode}
                            />
                        )}
                        {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        {mode === "view" ? (
                            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-gray-900 whitespace-pre-line">
                                    {formData.description || "No description provided"}
                                </p>
                            </div>
                        ) : (
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Description"
                                rows={4}
                                className={`w-full px-4 py-3 border rounded-lg resize-none transition-colors ${errors.description ? "border-red-500" : "border-gray-200 hover:border-gray-300 focus:border-teal-500"
                                    } focus:outline-none focus:ring-0`}
                                disabled={isViewMode}
                            />
                        )}
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    {/* Submit Button - Hidden in view mode */}
                    {mode !== "view" && (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-theme-sidebar-accent disabled:bg-gray-400 text-white rounded-lg font-medium mt-6 transition-colors"
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : mode === "edit"
                                    ? `Update ${entityType === "capital" ? "Capital Call" : "Distribution"}`
                                    : `Create ${entityType === "capital" ? "Capital Call" : "Distribution"}`}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}