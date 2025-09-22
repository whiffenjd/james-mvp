import { useState } from "react";
import { Table } from "../../Components/Table/Table";
import type { TableColumn, TableAction, PaginationInfo } from "../../types/table";
import {
    useKycDocuments,

    useUpdateKycDocument,
    useApproveKycDocument,
    useRequestReupload,
    useDownloadKycDocument,
    type KycDocument,
    type UpdateKycDocumentPayload,
    // type RequestReuploadPayload,
    // type DocumentUploadApiResponse,
} from "../../API/Endpoints/Documents/document";
import { RotateCw } from "lucide-react";
import { formatDateToDDMMYYYY } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import { KycUploadModal, KycViewModal, RequestReuploadModal } from "./KycModal";
import { useDocumentUpload } from "../../API/Endpoints/Onboarding/useInvestorOnboarding";

interface KycDocumentRow {
    id: string;
    userId: string;
    formData: {
        investorType: 'individual' | 'entity';
        kycDocumentUrl?: string;
        proofOfAddressUrl?: string;
        entityDocuments?: { url: string; type: string }[];
        documentStatus: 'pending_upload' | 'submitted' | 'under_review' | 'approved' | 'reupload_requested';
        documentNote?: string | null;
    };
    createdAt: string;
    updatedAt: string;
    investorName: string;
}

function Documents() {
    const [currentPage, setCurrentPage] = useState(1);
    type KycStatus = "pending_upload" | "submitted" | "under_review" | "approved" | "reupload_requested";

    const [filters, setFilters] = useState<{
        status: KycStatus | "";   // empty string means "no filter"
        investorName: string;
    }>({
        status: "",
        investorName: "",
    });
    const [canRefetch, setCanRefetch] = useState(true);
    const [justRefetched, setJustRefetched] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showReuploadModal, setShowReuploadModal] = useState(false);

    const [viewDocument, setViewDocument] = useState<KycDocument | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<KycDocument | null>(null);
    const [reuploadDocument, setReuploadDocument] = useState<KycDocument | null>(null);
    const [formData, setFormData] = useState({
        investorType: 'individual' as 'individual' | 'entity',
        kycDocument: null as File | null,
        proofOfAddress: null as File | null,
        entityDocuments: [] as File[],
    });
    const { user } = useAuth();
    const isInvestor = user?.role === "investor";
    const isFundManager = user?.role === "fundManager";
    const isAdmin = user?.role === "admin";

    const { mutateAsync: uploadDocuments, isPending } = useDocumentUpload();
    const updateKycDocument = useUpdateKycDocument();
    const approveKycDocument = useApproveKycDocument();
    const requestReupload = useRequestReupload();
    const downloadKycDocument = useDownloadKycDocument();

    // Map status to API format
    const apiParams = {
        page: currentPage,
        limit: 5,
        status: filters.status || undefined,
        investorName: filters.investorName || undefined,
    };
    const { data: apiData, isLoading, isFetching, refetch } = useKycDocuments(apiParams);
    const kycDocuments = apiData?.data?.data ?? [];
    const totalItems = apiData?.data?.total ?? 0;
    const totalPages = apiData?.data?.totalPages ?? 1;

    //status colors for docuement status
    const statusColors: Record<KycDocumentRow["formData"]["documentStatus"], string> = {
        pending_upload: "bg-gray-200 text-gray-700",
        submitted: "bg-blue-100 text-blue-700",
        under_review: "bg-yellow-100 text-yellow-700",
        approved: "bg-green-100 text-green-700",
        reupload_requested: "bg-red-100 text-red-700",
    };

    // Define columns
    const columns: TableColumn<KycDocumentRow>[] = [
        {
            key: "investorName",
            header: "Investor Name",
            sortable: false,
            width: "20vh",
            align: "left",
            render: (value: string) => (
                <div className="truncate" title={value}>
                    {value}
                </div>
            ),
        },
        {
            key: "formData.investorType",
            header: "Investor Type",
            sortable: false,
            width: "20vh",
            align: "left",
            render: (value: string) => (
                <div className="truncate">
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </div>
            ),
        },
        {
            key: "formData.documentStatus",
            header: "Document Status",
            sortable: false,
            width: "30vh",
            align: "left",
            render: (value: KycDocumentRow["formData"]["documentStatus"]) => (
                <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[value]}`}
                >
                    {value.replace("_", " ").toUpperCase()}
                </span>
            ),
        },
        {
            key: "createdAt",
            header: "Created At",
            sortable: false,
            width: "20vh",
            align: "left",
            render: (value: string) => (
                <div className="truncate">{formatDateToDDMMYYYY(value)}</div>
            ),
        },
    ];

    // Actions (role-based)
    const actions: TableAction<KycDocumentRow>[] = [
        {
            label: "View",
            variant: "secondary",
            onClick: (row: KycDocumentRow) => {
                setViewDocument(row);
                setShowViewModal(true);
            },
        },
        ...(isFundManager || isAdmin
            ? [
                {
                    label: "Approve",
                    variant: "primary" as const,
                    onClick: (row: KycDocumentRow) => {
                        if (row.formData.documentStatus !== "approved") {
                            approveKycDocument.mutate(row.id, {
                                onSuccess: () =>
                                    toast.success("KYC documents approved successfully!"),
                                onError: (err) =>
                                    toast.error(`Approval failed! ${err.message}`),
                            });
                        } else {
                            toast.error("Documents already approved!");
                        }
                    },
                    show: (row: KycDocumentRow) =>
                        row.formData.documentStatus !== "approved",
                },
                {
                    label: "Request Reupload",
                    variant: "danger" as const,
                    onClick: (row: KycDocumentRow) => {
                        setReuploadDocument(row);
                        setShowReuploadModal(true);
                    },
                    show: (row: KycDocumentRow) =>
                        row.formData.documentStatus !== "pending_upload" &&
                        row.formData.documentStatus !== "reupload_requested",
                },
            ]
            : []),
        ...(isInvestor
            ? [
                {
                    label: "Upload Documents", // static, but we’ll adjust behavior inside
                    variant: "primary" as const,
                    onClick: (row: KycDocumentRow) => {
                        setFormData({
                            investorType: row.formData.investorType || "individual",
                            kycDocument: null,
                            proofOfAddress: null,
                            entityDocuments: [],
                        });
                        setSelectedDocument(row);
                        setShowUploadModal(true);
                    },
                    show: (row: KycDocumentRow) =>
                        row.formData.documentStatus === "reupload_requested" || row.formData.documentStatus === "pending_upload",
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

    // const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    //     const { name, value } = e.target;
    //     setFilters((prev) => ({ ...prev, [name]: value }));
    //     setCurrentPage(1);
    // };

    const handleRefetch = async () => {
        if (!canRefetch) return;
        setCanRefetch(false);
        await refetch();
        setJustRefetched(true);
        setTimeout(() => setJustRefetched(false), 1500);
        setTimeout(() => setCanRefetch(true), 60 * 1000);
    };
    const handleUploadSubmit = async () => {
        if (
            !formData.kycDocument &&
            !formData.proofOfAddress &&
            !formData.entityDocuments.length
        ) {
            toast.error("Please upload at least one document");
            return;
        }

        try {
            const formDataPayload = new FormData();
            if (formData.kycDocument) formDataPayload.append("documents", formData.kycDocument);
            if (formData.proofOfAddress) formDataPayload.append("documents", formData.proofOfAddress);
            formData.entityDocuments.forEach((file) =>
                formDataPayload.append("documents", file)
            );
            formDataPayload.append(
                "documentType",
                formData.investorType === "individual" ? "kyc" : "entityDocument"
            );

            // ✅ using mutateAsync instead of mutate
            const response = await uploadDocuments(formDataPayload);

            const uploadedDocs = response.data;
            const updatePayload: UpdateKycDocumentPayload = {
                formData: {
                    investorType: formData.investorType,
                    kycDocumentUrl: uploadedDocs.find((doc) => doc.type === "kyc")?.url,
                    proofOfAddressUrl: uploadedDocs.find(
                        (doc) =>
                            doc.type === "kyc" &&
                            doc.url !==
                            uploadedDocs.find((d) => d.type === "kyc")?.url
                    )?.url,
                    entityDocuments: uploadedDocs
                        .filter((doc) => doc.type === "entityDocument")
                        .map((doc) => ({
                            url: doc.url,
                            type: doc.type,
                        })),
                },
            };

            await updateKycDocument.mutateAsync({
                id: kycDocuments[0]?.id,
                data: updatePayload,
            });

            toast.success("KYC documents updated successfully!");
            setShowUploadModal(false);
            setFormData({
                investorType: "individual",
                kycDocument: null,
                proofOfAddress: null,
                entityDocuments: [],
            });
        } catch (err: any) {
            toast.error(`Operation failed! ${err.message}`);
        }
    };


    const handleReuploadSubmit = (reuploadNote: string) => {
        if (!reuploadDocument) return;
        requestReupload.mutate(
            { id: reuploadDocument.id, data: { reuploadNote } },
            {
                onSuccess: () => {
                    toast.success("Reupload requested successfully!");
                    setShowReuploadModal(false);
                    setReuploadDocument(null);
                },
                onError: (err) => toast.error(`Reupload request failed! ${err.message}`),
            }
        );
    };

    const isSubmitting = isLoading || isFetching || isPending || updateKycDocument.isPending || approveKycDocument.isPending || requestReupload.isPending;

    return (
        <div className="">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-theme-primary-text">KYC Documents</h1>
                    <p className="mt-2 text-theme-secondary-text">Manage and view KYC documents</p>
                </div>
                <div className="flex gap-4">
                    {/* {isInvestor && kycDocuments[0]?.formData.documentStatus !== 'approved' && (
                        <button
                            onClick={() => {
                                setFormData({
                                    investorType: kycDocuments[0]?.formData.investorType || 'individual',
                                    kycDocument: null,
                                    proofOfAddress: null,
                                    entityDocuments: [],
                                });
                                setShowUploadModal(true);
                            }}
                            className="px-4 py-1 rounded-md bg-theme-sidebar-accent text-white hover:bg-theme-sidebar-accent-dark"
                        >
                            {kycDocuments[0]?.formData.documentStatus === 'reupload_requested' ? 'Reupload Documents' : 'Upload Documents'}
                        </button>
                    )} */}
                    <button
                        onClick={handleRefetch}
                        disabled={!canRefetch || isFetching}
                        className={`flex items-center gap-2 px-4 py-1 rounded-md border transition 
              ${canRefetch && !isFetching
                                ? "bg-theme-card hover:bg-theme-sidebar-accent hover:text-white border-theme-sidebar-accent text-theme-primary-text"
                                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                        title={canRefetch ? "Refetch KYC documents" : "Please wait before refetching"}
                    >
                        <RotateCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Refreshing..." : justRefetched ? "Refetched!" : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Filters */}
            {/* <div className="mb-4 flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-theme-secondary-text">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="mt-1 block w-full rounded-md border border-theme-border bg-theme-card text-theme-primary-text focus:ring-theme-sidebar-accent"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending_upload">Pending Upload</option>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="reupload_requested">Reupload Requested</option>
                    </select>
                </div>
                {(isFundManager || isAdmin) && (
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-theme-secondary-text">Investor Name</label>
                        <input
                            type="text"
                            name="investorName"
                            value={filters.investorName}
                            onChange={handleFilterChange}
                            placeholder="Search by investor name"
                            className="mt-1 block w-full rounded-md border border-theme-border bg-theme-card text-theme-primary-text focus:ring-theme-sidebar-accent"
                        />
                    </div>
                )}
                {(filters.status || filters.investorName) && (
                    <button
                        onClick={() => {
                            setFilters({ status: "", investorName: "" });
                            setCurrentPage(1);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg mb-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 shadow-sm"
                    >
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Clear Filters</span>
                    </button>
                )}
            </div> */}

            <Table
                data={kycDocuments}
                columns={columns}
                actions={actions}
                pagination={paginationInfo}
                onPageChange={handlePageChange}
                loading={isSubmitting}
                emptyMessage="No KYC documents found"
                className="mb-8"
            />

            <KycUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUploadSubmit}
                isSubmitting={isSubmitting}
                investorType={kycDocuments[0]?.formData.investorType || 'individual'}
                document={selectedDocument}
            />
            <KycViewModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                document={viewDocument}
            />
            {(isFundManager || isAdmin) && (
                <RequestReuploadModal
                    isOpen={showReuploadModal}
                    onClose={() => setShowReuploadModal(false)}
                    onSubmit={handleReuploadSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}

export default Documents;

