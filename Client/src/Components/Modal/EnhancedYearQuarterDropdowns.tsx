import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FormData {
    year: string;
    quarter: string;
}

interface DropdownProps {
    formData: FormData;
    handleInputChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
}

export const EnhancedYearQuarterDropdowns: React.FC<DropdownProps> = ({ formData, handleInputChange }) => {
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [isQuarterDropdownOpen, setIsQuarterDropdownOpen] = useState(false);
    const yearDropdownRef = useRef<HTMLDivElement>(null);
    const quarterDropdownRef = useRef<HTMLDivElement>(null);

    // Generate years from 2000 to 2030
    const generateYears = () => {
        const years = [];
        for (let year = 2030; year >= 2000; year--) {
            years.push(year);
        }
        return years;
    };

    const years = generateYears();
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
                setIsYearDropdownOpen(false);
            }
            if (quarterDropdownRef.current && !quarterDropdownRef.current.contains(event.target as Node)) {
                setIsQuarterDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleYearSelect = (year: number) => {
        const event = {
            target: {
                name: 'year',
                value: year.toString()
            }
        } as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(event);
        setIsYearDropdownOpen(false);
    };

    const handleQuarterSelect = (quarter: string) => {
        const event = {
            target: {
                name: 'quarter',
                value: quarter
            }
        } as React.ChangeEvent<HTMLSelectElement>;
        handleInputChange(event);
        setIsQuarterDropdownOpen(false);
    };

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Enhanced Year Dropdown */}
            <div>
                <label className="block text-sm font-medium text-theme-sidebar-accent mb-2">
                    Year
                </label>
                <div className="relative" ref={yearDropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl outline-none
                      focus:ring-2 focus:ring-theme-sidebar-accent focus:border-theme-sidebar-accent
                      bg-white text-gray-700 shadow-sm
                      hover:border-theme-sidebar-accent hover:shadow-md transition-all duration-200
                      flex items-center justify-between font-medium"
                    >
                        <span className={formData.year ? 'text-gray-900' : 'text-gray-500'}>
                            {formData.year || 'Select Year'}
                        </span>
                        <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </button>

                    {isYearDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            <div className="py-2">
                                {years.map((year) => (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => handleYearSelect(year)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-150 font-medium ${formData.year === year.toString()
                                            ? 'text-theme-sidebar-accent bg-gray-200 border-r-2 '
                                            : 'text-gray-700'
                                            }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Quarter Dropdown */}
            <div>
                <label className="block text-sm font-medium text-theme-sidebar-accent mb-2">
                    Quarter
                </label>
                <div className="relative" ref={quarterDropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsQuarterDropdownOpen(!isQuarterDropdownOpen)}
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl outline-none
                      focus:ring-2 focus:ring-theme-sidebar-accent focus:border-theme-sidebar-accent
                      bg-white text-gray-700 shadow-sm
                      hover:border-theme-sidebar-accent hover:shadow-md transition-all duration-200
                      flex items-center justify-between font-medium"
                    >
                        <span className={formData.quarter ? 'text-gray-900' : 'text-gray-500'}>
                            {formData.quarter || 'Select Quarter'}
                        </span>
                        <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isQuarterDropdownOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </button>

                    {isQuarterDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg">
                            <div className="py-2">
                                {quarters.map((quarter) => (
                                    <button
                                        key={quarter}
                                        type="button"
                                        onClick={() => handleQuarterSelect(quarter)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-150 font-medium${formData.quarter === quarter
                                            ? ' text-theme-sidebar-accent bg-gray-200 border-r-2'
                                            : 'text-gray-700'
                                            }`}
                                    >
                                        {quarter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

