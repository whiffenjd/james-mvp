import React, { useEffect, useState } from 'react';
import { X, FileText, Calendar, Upload, Eye, Edit2, Download } from 'lucide-react';
import { useDownloadTaxReport } from '../../API/Endpoints/TaxReports/taxReports';
import { EnhancedYearQuarterDropdowns } from '../../Components/Modal/EnhancedYearQuarterDropdowns';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';
import { useInvestors } from '../hooks/useInvestors';

// Types
interface TaxReport {
    id: string;
    projectName: string;
    reportURL: string;
    createdBy: string;
    year: string;
    quarter: 'Quarter1' | 'Quarter2' | 'Quarter3' | 'Quarter4';
    createdAt: string;
    updatedAt: string;
    investors: { id: string; name: string }[];

}

interface FormData {
    projectName: string;
    year: string;
    quarter: 'Quarter1' | 'Quarter2' | 'Quarter3' | 'Quarter4';
    document: File | null;
    investorIds: string[] | 'all';

}
interface InvestorOption {
    id: string;
    name: string;
}

// Upload/Edit Modal Component
interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingReport: TaxReport | null;
    formData: FormData;
    setFormData: (data: FormData) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    editingReport,
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
}) => {
    const { investors: investorsData } = useInvestors();
    const [investorOptions, setInvestorOptions] = useState<InvestorOption[]>([]);

    useEffect(() => {
        if (investorsData) {
            const options = investorsData.map((investor) => ({
                id: investor.id,
                name: investor.name,
            }));
            setInvestorOptions(options);
        }
    }, [investorsData]);

    useEffect(() => {
        if (editingReport && editingReport.investors) {
            const allInvestorsSelected = investorOptions.length > 0 &&
                editingReport.investors.length === investorOptions.length &&
                investorOptions.every(opt => editingReport.investors.some(inv => inv.id === opt.id));
            setFormData({
                ...formData,
                investorIds: allInvestorsSelected ? 'all' : editingReport.investors.map(inv => inv.id),
            });
        }
    }, [editingReport, investorOptions]);

    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
        setFormData({
            projectName: '',
            year: '',
            quarter: 'Quarter1',
            document: null,
            investorIds: [],
        });
    };

    const quarterToEnhancedFormat = (quarter: FormData['quarter']): string => {
        const quarterMap: Record<FormData['quarter'], string> = {
            Quarter1: 'Q1',
            Quarter2: 'Q2',
            Quarter3: 'Q3',
            Quarter4: 'Q4',
        };
        return quarterMap[quarter];
    };

    const enhancedToQuarterFormat = (quarter: string): FormData['quarter'] => {
        const quarterMap: Record<string, FormData['quarter']> = {
            Q1: 'Quarter1',
            Q2: 'Quarter2',
            Q3: 'Quarter3',
            Q4: 'Quarter4',
        };
        return quarterMap[quarter] || 'Quarter1';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'quarter' ? enhancedToQuarterFormat(value) : value,
        });
    };

    const handleInvestorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'all') {
            setFormData({ ...formData, investorIds: 'all' });
        } else {
            const selectedIds = Array.from(e.target.selectedOptions).map(option => option.value);
            setFormData({ ...formData, investorIds: selectedIds });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-theme-sidebar-accent/20 rounded-full flex items-center justify-center">
                            {editingReport ? (
                                <Edit2 className="w-5 h-5 text-theme-sidebar-accent" />
                            ) : (
                                <Upload className="w-5 h-5 text-theme-sidebar-accent" />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-theme-primary-text">
                            {editingReport ? 'Edit Tax Report' : 'Upload Tax Report'}
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
                    <div>
                        <label className="block text-sm font-medium text-theme-secondary-text mb-2">
                            Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent transition-all text-theme-primary-text"
                            placeholder="Enter project name"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <EnhancedYearQuarterDropdowns
                        formData={{
                            year: formData.year,
                            quarter: quarterToEnhancedFormat(formData.quarter),
                        }}
                        handleInputChange={handleInputChange}
                    />

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary-text mb-2">
                            Assign to Investors
                        </label>
                        <select
                            multiple
                            value={Array.isArray(formData.investorIds) ? formData.investorIds : formData.investorIds === 'all' ? ['all'] : []}
                            onChange={handleInvestorChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent transition-all text-theme-primary-text"
                            disabled={isSubmitting}
                        >
                            <option value="all">All Investors</option>
                            {investorOptions.map((investor) => (
                                <option key={investor.id} value={investor.id}>
                                    {investor.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-theme-secondary-text mt-1">
                            Hold Ctrl/Cmd or Shift to select multiple investors
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary-text mb-2">
                            Document (PDF Only) {!editingReport && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        document: e.target.files?.[0] || null,
                                    })
                                }
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent transition-all 
                                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                                file:bg-theme-sidebar-accent/10 file:text-theme-sidebar-accent hover:file:bg-theme-sidebar-accent/20"
                                required={!editingReport}
                                disabled={isSubmitting}
                                accept=".pdf"
                            />
                        </div>
                        {editingReport && (
                            <p className="text-sm text-theme-secondary-text mt-1">
                                Leave empty to keep current document
                            </p>
                        )}
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
                                {editingReport ? (
                                    <Edit2 className="w-4 h-4" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                {editingReport ? 'Update' : 'Upload'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
// View Modal Component (Only for user.role)
interface ViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: TaxReport | null;

}

export const ViewModal: React.FC<ViewModalProps> = ({
    isOpen,
    onClose,
    report,
}) => {
    const { mutate: downloadReport, isPending } = useDownloadTaxReport();
    if (!isOpen || !report) return null;

    const formatQuarter = (quarter: string) => {
        const quarterMap = {
            Quarter1: "Q1",
            Quarter2: "Q2",
            Quarter3: "Q3",
            Quarter4: "Q4",
        };
        return quarterMap[quarter as keyof typeof quarterMap] || quarter;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-theme-card rounded-2xl shadow-2xl w-full h-[calc(100vh-96px)] max-w-3xl flex flex-col transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-theme-sidebar-accent/20 rounded-full flex items-center justify-center">
                            <Eye className="w-5 h-5 text-theme-sidebar-accent" />
                        </div>
                        <h3 className="text-xl font-semibold text-theme-primary-text">
                            Tax Report Details
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-card-hover transition-colors"
                    >
                        <X className="w-5 h-5 text-theme-secondary-text" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Project Info */}
                    <div className="bg-theme-card-hover rounded-xl p-4 flex items-center gap-40">
                        {/* Project */}
                        <div className="flex items-center gap-5">
                            <FileText className="w-5 h-5 text-theme-sidebar-accent" />
                            <div>
                                <h4 className="font-semibold text-theme-primary-text">
                                    {report.projectName}
                                </h4>
                                <p className="text-sm text-theme-secondary-text">Project Name</p>
                            </div>
                        </div>

                        {/* Year */}
                        <div className="flex items-center gap-5">
                            <Calendar className="w-6 h-6 text-theme-sidebar-accent" />
                            <div>
                                <h4 className="font-semibold text-theme-primary-text">
                                    {report.year}
                                </h4>
                                <p className="text-sm text-theme-secondary-text">Year</p>
                            </div>
                        </div>

                        {/* Quarter */}
                        <div className="flex items-center gap-5">
                            <div className="w-6 h-6 bg-theme-sidebar-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {formatQuarter(report.quarter).replace('Q', '')}
                            </div>
                            <div>
                                <h4 className="font-semibold text-theme-primary-text">
                                    {formatQuarter(report.quarter)}
                                </h4>
                                <p className="text-sm text-theme-secondary-text">Quarter</p>
                            </div>
                        </div>
                    </div>
                    {/* Document Preview */}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                        <h4 className="font-medium text-theme-primary-text mb-3">
                            Tax Report Document
                        </h4>
                        <div className="w-full h-[500px]">
                            <iframe
                                src={report.reportURL}
                                className="w-full h-full rounded-lg border border-gray-200"
                                title="Tax Report PDF"
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => downloadReport(report.id)} disabled={isPending}
                                className="px-4 py-2 bg-theme-sidebar-accent text-white rounded-lg hover:bg-theme-sidebar-accent-dark transition-colors flex items-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-theme-card-hover rounded-xl p-4 space-y-2">
                        <div className="text-sm text-theme-secondary-text">
                            Created: {formatDateToDDMMYYYY(report.createdAt)}
                        </div>
                        {report.updatedAt !== report.createdAt && (
                            <div className="text-sm text-theme-secondary-text">
                                Updated: {formatDateToDDMMYYYY(report.updatedAt)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-theme-card-hover text-theme-secondary-text rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
