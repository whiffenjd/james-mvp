"use client";

import { useState } from "react";
import { Table } from "../../Components/Table/Table";
import type { TableColumn, TableAction, PaginationInfo } from "../../types/table";
import { useDeleteOnboarding, useInvestorsList, useUpdateOnboardingStatus } from "../../API/Endpoints/FundManager/useInvestors";
import { RotateCw } from "lucide-react";
import { formatDateToDDMMYYYY } from "../../utils/dateUtils";
import { InvestorDetailsModal } from "../../API/Endpoints/Investor/componnents/InvestorModal/InvestorDetailsModal";
import toast from "react-hot-toast";



interface Investor {
    id: string;
    name: string;
    email: string;
    onboardingStatus: "pending" | "approved" | "rejected";
    createdAt: string;
    status: "pending" | "approved" | "rejected";
}

const TABS = [
    { label: "All", value: "all" },
    { label: "Onboarded", value: "approved" },
    { label: "In Progress", value: "pending" },
];

function InvestorsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTab, setSelectedTab] = useState<"all" | "approved" | "pending">("all");
    const [canRefetch, setCanRefetch] = useState(true);
    const [justRefetched, setJustRefetched] = useState(false);
    const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null)
    const updateStatus = useUpdateOnboardingStatus();
    const deleteOnboarding = useDeleteOnboarding();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Get status param for API call
    const statusParam = selectedTab === "all" ? undefined : selectedTab;

    // API call
    const {
        data: apiData,
        isLoading,
        isFetching,
        refetch,
    } = useInvestorsList({ page: currentPage, limit: 5, status: statusParam });

    // Data to render
    const investors = apiData?.data?.data ?? [];
    const totalItems = apiData?.data?.total ?? 0;
    const totalPages = apiData?.data?.totalPages ?? 1;

    // Define columns
    const columns: TableColumn<Investor>[] = [
        { key: "name", header: "Investor Name", sortable: false },
        { key: "email", header: "Email Address", sortable: false },
        {
            key: "createdAt",
            header: "Created At",
            sortable: false,
            render: (value: string) => (
                <span>{formatDateToDDMMYYYY(value)}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (value: "pending" | "approved" | "rejected") => (
                <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
            ${value === "approved"
                            ? "bg-green-100 text-green-800"
                            : value === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-700"
                        }`}
                >
                    {value === "approved" ? "Onboarded" : value === "pending" ? "In Progress" : "Rejected"}
                </span>
            ),
        },
    ];

    // Actions (example)
    const actions: TableAction<Investor>[] = [
        {
            label: "View Details",
            variant: "primary",
            onClick: (row) => {
                setSelectedInvestorId(row?.id) // Mock ID
                setShowDetailsModal(true)
            },
        },
        {
            label: "",
            variant: "secondary",
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            ),
            onClick: (row) => {
                setShowDeleteModal(true)
                setSelectedInvestorId(row?.id) // Mock ID
            },
        },
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
    const handleTabChange = (value: "all" | "approved" | "pending") => {
        setSelectedTab(value);
        setCurrentPage(1); // reset to first page on tab change
    };

    const handleRefetch = async () => {
        if (!canRefetch) return;
        setCanRefetch(false);
        await refetch();
        setJustRefetched(true);
        setTimeout(() => setJustRefetched(false), 1500); // Brief feedback
        setTimeout(() => setCanRefetch(true), 60 * 1000); // 1 minute lock
    };

    const handleApprove = () => {
        if (!selectedInvestorId) return;
        updateStatus.mutate(
            {
                onboardingId: selectedInvestorId,
                data: { status: "approved" },
            },
            {
                onSuccess: () => {
                    setSelectedInvestorId(null);
                    toast.success("Investor approved successfully!");
                },
                onError: (err) => {
                    toast.error("Approval failed! " + err.message);
                },
            }
        );
    };

    const handleReject = (rejectedNote: string) => {
        if (!selectedInvestorId) return;
        updateStatus.mutate(
            {
                onboardingId: selectedInvestorId,
                data: { status: "rejected", rejectionNote: rejectedNote },
            },
            {
                onSuccess: () => {
                    setSelectedInvestorId(null); // closes modal
                    toast.success("Investor rejected successfully!");
                },
                onError: (err) => {

                    toast.error("Rejection failed! " + err.message);
                },
            }
        );
    };
    const handleDelete = () => {
        if (!selectedInvestorId) return;
        deleteOnboarding.mutate(selectedInvestorId, {
            onSuccess: () => {
                toast.success("Investor deleted successfully!");
                setSelectedInvestorId(null);
                setShowDeleteModal(false)
            },
            onError: (err: Error) => {
                toast.error("Deletion failed! " + err.message);
            },
        });
    };


    return (
        <div>
            <div className="max-w-8xl ">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-theme-primary-text">Investor Management</h1>
                        <p className="mt-2 text-theme-secondary-text">Manage and track investor information</p>
                    </div>
                    <button
                        onClick={handleRefetch}
                        disabled={!canRefetch || isFetching}
                        className={`flex items-center gap-2 px-4 py-1 rounded-md border transition 
              ${canRefetch && !isFetching ? "bg-theme-card hover:bg-theme-sidebar-accent hover:text-white border-theme-sidebar-accent text-theme-primary-text"
                                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            }
            `}
                        title={canRefetch ? "Refetch investors list" : "Please wait before refetching"}
                    >
                        <RotateCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Refreshing..." : justRefetched ? "Refetched!" : "Refetch"}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            className={`px-4 py-2 rounded-md font-medium transition
                ${selectedTab === tab.value
                                    ? "bg-theme-sidebar-accent text-white shadow"
                                    : "bg-theme-card text-theme-primary-text border border-theme-sidebar-accent hover:bg-theme-sidebar-accent hover:text-white"
                                }`}
                            onClick={() => handleTabChange(tab.value as any)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Table
                    data={investors}
                    columns={columns}
                    actions={actions}
                    pagination={paginationInfo}
                    onPageChange={handlePageChange}
                    loading={isLoading || isFetching}
                    emptyMessage="No investors found"
                    className="mb-8"
                />

                {selectedInvestorId && showDetailsModal && (
                    <InvestorDetailsModal
                        investorId={selectedInvestorId}
                        isOpen={!!selectedInvestorId}
                        onClose={() => { setShowDetailsModal(false); setSelectedInvestorId(null) }}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
            </div>
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">Delete Investor OnBoarding</h3>
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete the invsetor onboaring details , this action cannot be undone
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedInvestorId("");

                                }}
                                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-70"
                                disabled={deleteOnboarding.status === 'pending'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded font-medium disabled:opacity-70"
                                disabled={deleteOnboarding.status === 'pending'}
                            >
                                {deleteOnboarding.status === 'pending' ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InvestorsPage;
