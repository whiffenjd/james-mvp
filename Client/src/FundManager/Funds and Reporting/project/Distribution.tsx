import { useEffect, useState } from 'react';

import { useGetDistributions as useGetDistCalls, useUpdateDistribution as useUpdateDist, useUpdateDistributionStatus as useUpdateDistStatus, type Distribution as DistType, type UpdateDistributionPayload as UpdateDistPayload } from '../../../API/Endpoints/Funds/distributions';
import { useAuth } from '../../../Context/AuthContext';
import type { PaginationInfo, TableAction, TableColumn } from '../../../types/table';
import { formatDateToDDMMYYYY } from '../../../utils/dateUtils';
import { Table } from '../../../Components/Table';
import { useParams } from 'react-router-dom';
import DistributionModal from '../../../Components/Modal/DistributionModal'; // Renamed modal
import { useAppSelector } from '../../../Redux/hooks';
import type { FundDetail } from '../../../Redux/features/Funds/fundsSlice';
import { DistributionViewModal } from '../../../Components/Modal/DistributionView'; // Renamed view modal

const Distribution = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { user } = useAuth(); // Assumed hook providing { role: string }
  const fund = useAppSelector((state) => state.funds.currentFund);
  const [fundData, setFundData] = useState<FundDetail | null>(null);
  const [distribution, setDistribution] = useState<DistType | null>(null); // Changed from capitalCall
  const [isDistModalOpen, setIsDistModalOpen] = useState<boolean>(false); // Changed from isCapitalModalOpen
  const { data, isLoading, isFetching } = useGetDistCalls({
    page: currentPage,
    limit: itemsPerPage,
    fundId: id, // Pass the fundId from your context or state
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false); // Changed from isModalOpen

  const { mutateAsync: updateDistribution } = useUpdateDist(); // Changed from updateCapitalCall
  const updateMutation = useUpdateDistStatus(); // Changed from updateCapitalCallStatus

  const columns: TableColumn<DistType>[] = [
    {
      key: 'fundId',
      header: 'Fund ID',
      sortable: false,
      width: '15vh',
      align: 'left',
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'investorId',
      header: 'Investor ID',
      sortable: false,
      width: '15vh',
      align: 'left',
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: false,
      width: '15vh',
      align: 'left',
      render: (value: string) => (
        <div className="truncate" title={value}>
          ${value}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: false,
      width: '15vh',
      align: 'left',
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
      key: 'recipientName',
      header: 'Recipient',
      sortable: false,
      width: '20vh',
      align: 'left',
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '15vh',
      align: 'left',
      render: (value: 'pending' | 'approved' | 'rejected') => (
        <div className="truncate">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
              ${value === 'approved'
                ? 'bg-green-100 text-green-800'
                : value === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-700'
              }`}
          >
            {value === 'approved' ? 'Approved' : value === 'pending' ? 'Pending' : 'Rejected'}
          </span>
        </div>
      ),
    },
  ];

  const actions: TableAction<DistType>[] = [
    // Investor actions (Approve / Reject)
    ...(user?.role === 'investor'
      ? [
        {
          label: 'View',
          variant: 'primary',
          onClick: (row: DistType) => {
            console.log('View distribution:', row);
            setDistribution(row);
            setIsViewModalOpen(true);
          },
          show: (row: DistType) => row.status === 'pending',
        },
        {
          label: '',
          variant: 'primary',
          icon: (
            <div className="w-6 h-6 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ),
          onClick: () => { },
          show: (row: DistType) => row.status === 'approved',
        },
        {
          label: '',
          variant: 'danger',
          icon: (
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ),
          onClick: () => { },
          show: (row: DistType) => row.status === 'rejected',
        },
      ]
      : []),
    // Fund Manager actions
    ...(user?.role === 'fundManager'
      ? [
        {
          label: 'Edit',
          variant: 'secondary',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
          onClick: (row: DistType) => {
            setDistribution(row);
            setIsDistModalOpen(true);
            console.log('Edit distribution:', row);
          },
          show: (row: DistType) => row.status !== 'approved',
        },
        {
          label: '',
          variant: 'primary',
          icon: (
            <div className="w-6 h-6 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ),
          onClick: () => { },
          show: (row: DistType) => row.status === 'approved',
        },
        {
          label: '',
          variant: 'danger',
          icon: (
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ),
          onClick: () => { },
          show: (row: DistType) => row.status === 'rejected',
        },
      ]
      : []),
  ];

  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages: data?.totalPages || 1,
    totalItems: data?.totalItems || 0,
    itemsPerPage,
  };

  useEffect(() => {
    if (fund) {
      setFundData(fund?.result);
    }
  }, [fund]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpdateDistribution = async (data: any) => {
    console.log('fund', fundData, distribution);
    if (!fundData?.id) {
      console.error('❌ Fund ID is missing!');
      return;
    }
    if (!distribution?.id) {
      console.error('❌ Distribution ID is missing!');
      return;
    }

    // Validate and parse the date
    let parsedDate: string;
    try {
      const dateValue = data.date ? new Date(data.date) : new Date();
      if (isNaN(dateValue.getTime())) {
        throw new Error('Invalid date format');
      }
      parsedDate = dateValue.toISOString();
    } catch (error) {
      console.error('❌ Date parsing failed:', error);
      return;
    }

    const payload: UpdateDistPayload = {
      ...data,
      fundId: fundData.id,
      date: parsedDate,
    };

    try {
      await updateDistribution({ id: distribution.id, payload });
      setIsDistModalOpen(false);
    } catch (error) {
      console.error('Distribution update failed:', error);
    }
  };

  const handleApprove = (): void => {
    if (!distribution) return;

    updateMutation.mutate(
      {
        id: distribution.id,
        status: 'approved',
      },
      {
        onSuccess: () => {
          setIsViewModalOpen(false);
        },
      }
    );
  };

  const handleReject = (): void => {
    if (!distribution) return;

    updateMutation.mutate(
      {
        id: distribution.id,
        status: 'rejected',
      },
      {
        onSuccess: () => {
          setIsViewModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="rounded-lg">
      <Table
        data={data?.data || []}
        columns={columns}
        actions={actions}
        pagination={paginationInfo}
        onPageChange={handlePageChange}
        loading={isLoading || isFetching}
        emptyMessage="No distributions found"
        className="mb-8"
      />

      <DistributionModal
        isOpen={isDistModalOpen}
        onClose={() => setIsDistModalOpen(false)}
        onSubmit={handleUpdateDistribution}
        mode={'edit'}
        initialData={distribution ?? undefined} // ✅ not null
        fund={fundData || null}
      />
      <DistributionViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        distribution={distribution} // Changed from capitalCall
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default Distribution;