
import { useState } from "react";
import { Table } from "../../Components/Table/Table";
import type { TableColumn, TableAction, PaginationInfo } from "../../types/table";
import { useGetFundManagers, useDeleteFundManager, useGetInvestors, useDeleteInvestor, type AdminUser } from "../../API/Endpoints/Admin/admin";
import { formatDateToDDMMYYYY } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import { defaultTheme } from "../../Context/ThemeContext";
import { FundManagerModal } from "./fund-manager-modal";
import { useAuth } from "../../Context/AuthContext";

const TABS = [
  { label: "Fund Managers", value: "fundManagers" },
  { label: "Investors", value: "investors" },
];

function AdminUsersPage() {
  const { token } = useAuth()
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState<"fundManagers" | "investors">("fundManagers");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false)


  // Fetch data using hooks
  const {
    data: fundManagersData,
    isLoading: isLoadingFundManagers,
    isFetching: isFetchingFundManagers,
  } = useGetFundManagers({ page: currentPage, limit: 5 });

  const {
    data: investorsData,
    isLoading: isLoadingInvestors,
    isFetching: isFetchingInvestors,
  } = useGetInvestors({ page: currentPage, limit: 5 });

  const deleteFundManager = useDeleteFundManager();
  const deleteInvestor = useDeleteInvestor();

  // Data to render based on selected tab
  const data = selectedTab === "fundManagers" ? fundManagersData : investorsData;
  const isLoading = selectedTab === "fundManagers" ? isLoadingFundManagers || isFetchingFundManagers : isLoadingInvestors || isFetchingInvestors;
  const users = data?.data ?? [];
  const totalItems = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Define columns
  const columns: TableColumn<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      sortable: false,
      width: "10vh",
      align: "left",
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email Address",
      sortable: false,
      width: "25vh",
      align: "left",
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: false,
      width: "15vh",
      align: "left",
      render: (value: string) => {
        const formattedDate = formatDateToDDMMYYYY(value);
        return (
          <div className="truncate" title={formattedDate}>
            {formattedDate}
          </div>
        );
      },
    },
    {
      key: "projectCount",
      header: "Projects",
      sortable: false,
      width: "15vh",
      align: "left",
      render: (value: number) => <div>{value}</div>,
    },
    {
      key: "investorCount",
      header: "Investors",
      sortable: false,
      width: "15vh",
      align: "left",
      render: (value: number) => <div>{value}</div>,
    },
    {
      key: "subdomain",
      header: "Subdomain",
      sortable: false,
      width: "18vh",
      align: "left",
      render: (value: string) => {
        const baseDomain = import.meta.env.VITE_FRONTEND_URL.replace(/^https?:\/\//, "");
        const fullDomain = `${value}.${baseDomain}`;

        return (
          <div className="truncate" title={fullDomain}>
            {fullDomain}
          </div>
        );
      },
    }

  ];

  // Actions
  const actions: TableAction<AdminUser>[] = [
    {
      label: "View Details",
      variant: "primary",
      onClick: (row) => {
        const userId = row.id;
        const subdomain = row.subdomain || 'www';
        const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
        const loginAsUrl = `${baseUrl.replace('://', `://${subdomain}.`)}/login-as/${userId}?token=${encodeURIComponent(token!)}`;

        window.open(loginAsUrl, '_blank');
      },
    },
    {
      label: "",
      variant: "primary",
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
        setSelectedUserId(row?.id);
        setShowDeleteModal(true);
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
  const handleTabChange = (value: "fundManagers" | "investors") => {
    setSelectedTab(value);
    setCurrentPage(1); // Reset to first page on tab change
  };

  const handleDelete = () => {
    if (!selectedUserId) return;
    const deleteMutation = selectedTab === "fundManagers" ? deleteFundManager : deleteInvestor;
    deleteMutation.mutate(selectedUserId, {
      onSuccess: () => {
        toast.success(`${selectedTab === "fundManagers" ? "Fund Manager" : "Investor"} deleted successfully!`);
        setSelectedUserId(null);
        setShowDeleteModal(false);
      },
      onError: (err: Error) => {
        toast.error(`Deletion failed! ${err.message}`);
      },
    });
  };

  return (
    <div>
      <div
        className="max-w-8xl  ">
        <div className="flex w-full justify-between mb-8">
          <div>

            <h1 className="text-3xl font-bold text-theme-primary-text" style={{ color: defaultTheme.primaryText }}
            >User Management</h1>
            <p className="mt-2 text-theme-secondary-text">Manage and track fund managers and investors</p>
          </div>
          <div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-md font-medium transition bg-primary text-white shadow hover:bg-primary/90"
            >
              Create Fund Manager
            </button>
          </div>

          <FundManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-2 rounded-md font-medium transition
                ${selectedTab === tab.value
                  ? "bg-primary text-white shadow"
                  : "bg-theme-card text-bgPrimary border border-bgPrimary hover:bg-primary hover:text-white"
                }`}
              onClick={() => handleTabChange(tab.value as "fundManagers" | "investors")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="h-[calc(100vh-400px)] overflow-y-auto">
          <Table
            data={users}
            columns={columns}
            actions={actions}
            pagination={paginationInfo}
            onPageChange={handlePageChange}
            loading={isLoading}
            emptyMessage={`No ${selectedTab === "fundManagers" ? "fund managers" : "investors"} found`}
            className="mb-8"
            useThemeStyles={false}
          />
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full">
              <h3 className="text-lg font-semibold mb-2">Delete {selectedTab === "fundManagers" ? "Fund Manager" : "Investor"}</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this {selectedTab === "fundManagers" ? "fund manager" : "investor"}?. All the related data to this user will be deleted as well. This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUserId(null);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-70"
                  disabled={selectedTab === "fundManagers" ? deleteFundManager.isPending : deleteInvestor.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded font-medium disabled:opacity-70"
                  disabled={selectedTab === "fundManagers" ? deleteFundManager.isPending : deleteInvestor.isPending}
                >
                  {(selectedTab === "fundManagers" ? deleteFundManager.isPending : deleteInvestor.isPending) ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsersPage;