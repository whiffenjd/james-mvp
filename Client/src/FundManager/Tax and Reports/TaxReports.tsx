"use client";

import { useState } from "react";
import { Table } from "../../Components/Table/Table";
import type { TableColumn, TableAction, PaginationInfo } from "../../types/table";
import {
    useTaxReports,
    useCreateTaxReport,
    useUpdateTaxReport,
    useDeleteTaxReport,
    type TaxReport,
    useDownloadTaxReport,
    type UpdateTaxReportPayload,
    type CreateTaxReportPayload,
} from "../../API/Endpoints/TaxReports/taxReports";
import { RotateCw, XCircle } from "lucide-react";
import { formatDateToDDMMYYYY } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import { EnhancedYearQuarterDropdowns } from "../../Components/Modal/EnhancedYearQuarterDropdowns";
import { UploadModal, ViewModal } from "./TaxModals";
import RestrictedAccessMessage from "../../Components/RestrictedAccessMessage";


interface TaxReportRow {
    id: string;
    projectName: string;
    year: string;
    quarter: "Quarter1" | "Quarter2" | "Quarter3" | "Quarter4";
    reportURL: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
}

function TaxReportsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<{ year: string; quarter: string }>({ year: "", quarter: "" });
    const [canRefetch, setCanRefetch] = useState(true);
    const [justRefetched, setJustRefetched] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewReport, setViewReport] = useState<TaxReport | null>(null);

    const [editingReport, setEditingReport] = useState<TaxReport | null>(null);
    const [formData, setFormData] = useState({
        projectName: "",
        year: "",
        quarter: "Quarter1" as "Quarter1" | "Quarter2" | "Quarter3" | "Quarter4",
        document: null as File | null,
        investorIds: [],

    });

    // Get user role (replace with your actual implementation)
    const { user } = useAuth()
    const isFundManager = user?.role === "fundManager";

    const createTaxReport = useCreateTaxReport();
    const updateTaxReport = useUpdateTaxReport();
    const deleteTaxReport = useDeleteTaxReport();



    // Map quarter to API format
    const apiParams = {
        page: currentPage,
        limit: 5,
        year: filters.year || undefined,
        quarter: filters.quarter ? `${filters.quarter.replace('Quarter', '')}` : undefined,
    };
    const { data: apiData, isLoading, isFetching, refetch } = useTaxReports(apiParams);
    const { mutate: downloadReport } = useDownloadTaxReport();


    // Data to render
    const taxReports = apiData?.data?.data ?? [];
    const totalItems = apiData?.data?.total ?? 0;
    const totalPages = apiData?.data?.totalPages ?? 1;

    // Define columns
    const columns: TableColumn<TaxReportRow>[] = [
        {
            key: "projectName",
            header: "Project Name",
            sortable: false,
            align: "left",
            render: (value: string) => (
                <div className="truncate" title={value}>
                    {value}
                </div>
            ),
        },
        {
            key: "year",
            header: "Year",
            sortable: false,
            align: "left",
        },
        {
            key: "quarter",
            header: "Quarter",
            sortable: false,

            align: "left",
            render: (value: string) => (
                <div className="truncate">{value.replace("Quarter", "Q")}</div>
            ),
        },

        {
            key: "createdAt",
            header: "Created At",
            sortable: false,

            align: "left",
            render: (value: string) => (
                <div className="truncate">{formatDateToDDMMYYYY(value)}</div>
            ),
        },
    ];

    // Actions (only for fund managers)
    const actions: TableAction<TaxReportRow>[] = [
        {
            label: "View",
            variant: "secondary" as const, // ✅ force string literal type
            onClick: (row) => {
                setViewReport(row);
                setShowViewModal(true);
            },
        },
        {
            label: "Download",
            variant: "secondary" as const,
            onClick: (row) => {
                if (row.reportURL) {
                    downloadReport(row.id, {
                        onError: (err) => toast.error(`Download failed! ${err.message}`),
                    });
                } else {
                    toast.error("Report URL not found!");
                }
            },
        },
        ...(isFundManager
            ? [
                {
                    label: "Edit",
                    variant: "primary" as const,
                    onClick: (row: TaxReportRow) => {
                        setEditingReport(row);
                        setFormData({
                            projectName: row.projectName,
                            year: row.year,
                            quarter: row.quarter,
                            document: null,
                        });
                        setShowUploadModal(true);
                    },
                },
                {
                    label: "",
                    variant: "danger" as const, // ✅ better to mark delete as danger
                    icon: (
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    ),
                    onClick: (row: TaxReportRow) => {
                        if (window.confirm("Are you sure you want to delete this tax report?")) {
                            deleteTaxReport.mutate(row.id, {
                                onSuccess: () => toast.success("Tax report deleted successfully!"),
                                onError: (err) => toast.error(`Deletion failed! ${err.message}`),
                            });
                        }
                    },
                },
            ]
            : []),
    ];

    // Pagination info
    const paginationInfo: PaginationInfo = {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: 5,
    };

    // Handlers
    const handlePageChange = (page: number) => setCurrentPage(page);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleRefetch = async () => {
        if (!canRefetch) return;
        setCanRefetch(false);
        await refetch();
        setJustRefetched(true);
        setTimeout(() => setJustRefetched(false), 1500);
        setTimeout(() => setCanRefetch(true), 60 * 1000);
    };

    const handleFormSubmit = () => {
        if (!formData.projectName || !formData.year || (!formData.document && !editingReport)) {
            toast.error('Please fill all required fields and select a document');
            return;
        }

        if (editingReport) {
            const payload: UpdateTaxReportPayload = {
                projectName: formData.projectName,
                year: formData.year,
                quarter: formData.quarter,
                document: formData.document ?? undefined,
                investorIds: formData.investorIds,
            };

            updateTaxReport.mutate(
                { id: editingReport.id, data: payload },
                {
                    onSuccess: () => {
                        toast.success('Tax report updated successfully!');
                        setShowUploadModal(false);
                        setEditingReport(null);
                        setFormData({ projectName: '', year: '', quarter: 'Quarter1', document: null, investorIds: [] });
                    },
                    onError: (err) => toast.error(`Update failed! ${err.message}`),
                }
            );
        } else {
            if (!formData.document) {
                toast.error('Please upload a document before creating a tax report');
                return;
            }

            const payload: CreateTaxReportPayload = {
                projectName: formData.projectName,
                year: formData.year,
                quarter: formData.quarter,
                document: formData.document,
                investorIds: formData.investorIds,
            };

            createTaxReport.mutate(payload, {
                onSuccess: () => {
                    toast.success('Tax report created successfully!');
                    setShowUploadModal(false);
                    setFormData({ projectName: '', year: '', quarter: 'Quarter1', document: null, investorIds: [] });
                },
                onError: (err) => toast.error(`Creation failed! ${err.message}`),
            });
        }
    };
    const isSubmitting = isLoading || createTaxReport.isPending || updateTaxReport.isPending || deleteTaxReport.isPending;
    if (user?.onboardingStatus?.status === 'complete_later') {
        return (<RestrictedAccessMessage />)
    }

    return (
        <div className="">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-theme-primary-text">Tax Reports</h1>
                    <p className="mt-2 text-theme-secondary-text">Manage and view tax reports</p>
                </div>
                <div className="flex gap-4">
                    {isFundManager && (
                        <button
                            onClick={() => {
                                setEditingReport(null);
                                setFormData({ projectName: "", year: "", quarter: "Quarter1", document: null });
                                setShowUploadModal(true);
                            }}
                            className="px-4 py-1 rounded-md bg-theme-sidebar-accent text-white hover:bg-theme-sidebar-accent-dark"
                        >
                            Upload Report
                        </button>
                    )}
                    <button
                        onClick={handleRefetch}
                        disabled={!canRefetch || isFetching}
                        className={`flex items-center gap-2 px-4 py-1 rounded-md border transition 
              ${canRefetch && !isFetching
                                ? "bg-theme-card hover:bg-theme-sidebar-accent hover:text-white border-theme-sidebar-accent text-theme-primary-text"
                                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                        title={canRefetch ? "Refetch tax reports" : "Please wait before refetching"}
                    >
                        <RotateCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Refreshing..." : justRefetched ? "Refetched!" : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex items-end gap-4 ">
                <div className="flex-1">
                    <EnhancedYearQuarterDropdowns
                        formData={filters}
                        handleInputChange={handleFilterChange}
                    />
                </div>

                {(filters.year || filters.quarter) && (
                    <button
                        onClick={() => {
                            setFilters({ year: "", quarter: "" });
                            setCurrentPage(1);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg mb-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 shadow-sm"
                    >
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Clear Filters</span>
                    </button>
                )}
            </div>
            <Table
                data={taxReports}
                columns={columns}
                actions={actions}
                pagination={paginationInfo}
                onPageChange={handlePageChange}
                loading={isLoading || isFetching}
                emptyMessage="No tax reports found"
                className="mb-8"
            />
            <UploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setEditingReport(null);
                }}
                editingReport={editingReport}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
            />

            <ViewModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                report={viewReport}
            />

        </div>
    );
}

export default TaxReportsPage;