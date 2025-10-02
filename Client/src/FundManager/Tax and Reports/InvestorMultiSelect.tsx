import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function InvestorMultiSelect({
    investorOptions,
    formData,
    setFormData,
    isSubmitting,
}: {
    investorOptions: { id: string; name: string }[];
    formData: any;
    setFormData: (data: any) => void;
    isSubmitting: boolean;
}) {
    const [open, setOpen] = useState(false);

    const handleToggle = (id: string) => {
        let newIds = Array.isArray(formData.investorIds)
            ? [...formData.investorIds]
            : [];

        if (id === "all") {
            // Select or deselect all investors
            if (newIds.length === investorOptions.length) {
                newIds = []; // deselect all
            } else {
                newIds = investorOptions.map((inv) => inv.id); // select all uuids
            }
        } else {
            if (newIds.includes(id)) {
                newIds = newIds.filter((x) => x !== id);
            } else {
                newIds.push(id);
            }

            // If after toggling, all investors are selected
            if (newIds.length === investorOptions.length) {
                newIds = investorOptions.map((inv) => inv.id);
            }
        }

        setFormData({ ...formData, investorIds: newIds });
    };

    const handleClear = () => {
        setFormData({ ...formData, investorIds: [] });
    };

    const selected = Array.isArray(formData.investorIds)
        ? formData.investorIds
        : [];

    return (
        <div>
            <label className="block text-sm font-medium text-theme-secondary-text mb-2">
                Assign to Investors
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl flex justify-between items-center text-theme-primary-text focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent transition-all"
                >
                    <span className="truncate">
                        {selected.length === 0
                            ? "Select Investors"
                            : selected.length === investorOptions.length
                                ? "All Investors"
                                : `${selected.length} selected`}
                    </span>
                    <div className="flex items-center space-x-2">
                        {selected.length > 0 && (
                            <X
                                size={16}
                                className="text-gray-400 hover:text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                            />
                        )}
                        <ChevronDown
                            size={18}
                            className={`transition-transform ${open ? "rotate-180" : ""
                                } text-gray-500`}
                        />
                    </div>
                </button>

                {open && (
                    <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                        <div className="p-2">
                            {/* All Investors */}
                            <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer font-semibold">
                                <input
                                    type="checkbox"
                                    checked={selected.length === investorOptions.length}
                                    onChange={() => handleToggle("all")}
                                    disabled={isSubmitting}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-theme-primary-text">All Investors</span>
                            </label>

                            {/* Individual Investors */}
                            {investorOptions.map((investor) => (
                                <label
                                    key={investor.id}
                                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(investor.id)}
                                        onChange={() => handleToggle(investor.id)}
                                        disabled={isSubmitting}
                                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-theme-primary-text">
                                        {investor.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <p className="text-sm text-theme-secondary-text mt-1">
                Select multiple investors using checkboxes
            </p>
        </div>
    );
}
