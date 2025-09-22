import { useEffect, useState } from 'react';

import { useGetCapitalCalls, useUpdateCapitalCall, useUpdateCapitalCallStatus, type CapitalCall, type UpdateCapitalCallPayload } from '../../../API/Endpoints/Funds/capitalCall';
import { useAuth } from '../../../Context/AuthContext';
import type { PaginationInfo, TableAction, TableColumn } from '../../../types/table';
import { formatDateToDDMMYYYY } from '../../../utils/dateUtils';
import { Table } from '../../../Components/Table';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '../../../Redux/hooks';
import type { FundDetail } from '../../../Redux/features/Funds/fundsSlice';
import { FundTransactionViewModal } from '../../../Components/Modal/CapitalView';
import FundTransactionModal from '../../../Components/Modal/CapitalCallModal';


const Capital = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { user } = useAuth(); // Assumed hook providing { role: string }
  const fund = useAppSelector((state) => state.funds.currentFund);
  const [fundData, setFundData] = useState<FundDetail | null>(null);
  const [capitalCall, setCapitalCall] = useState<CapitalCall | null>(null);
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState<boolean>(false);
  const { data, isLoading, isFetching } = useGetCapitalCalls({
    page: currentPage,
    limit: itemsPerPage,
    fundId: id, // Pass the fundId from your context or state
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


  const { mutateAsync: updateCapitalCall } = useUpdateCapitalCall();
  const updateMutation = useUpdateCapitalCallStatus(user?.id || '');

  const columns: TableColumn<CapitalCall>[] = [
    {
      key: 'fundId',
      header: 'Fund ID',
      sortable: false,
      // width: '15vh',
      align: 'left',
      render: (value: string) => {
        const shortValue = value?.split('-')[0];
        return (
          <div className="truncate" title={value}>
            {shortValue}
          </div>
        );
      },
    },
    {
      key: 'InvestorName',
      header: 'Investor Name',
      sortable: false,
      // width: '20vh',
      align: 'left',
      render: (value: string) => {
        const shortValue = value?.split('-')[0];
        return (
          <div className="truncate" title={value}>
            {shortValue}
          </div>
        );
      },
    },

    {
      key: 'amount',
      header: 'Amount',
      sortable: false,
      // width: '15vh',
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
      // width: '15vh',
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
      // width: '20vh',
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
      // width: '15vh',
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

  const actions: TableAction<CapitalCall>[] = [
    // Investor actions (Approve / Reject)
    ...(user?.role === 'investor'
      ? [
        {
          label: 'View',
          variant: "primary" as "primary" | "secondary" | "danger" | undefined,
          onClick: (row: CapitalCall) => {

            // Add approve logic
            setCapitalCall(row);
            setIsModalOpen(true)
          },

          show: (row: CapitalCall) => row.status === 'pending',

        },

        {
          label: '',
          variant: "primary" as "primary" | "secondary" | "danger" | undefined,
          icon: (
            <div className="w-6 h-6 rounded  flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ),
          onClick: () => { },
          show: (row: CapitalCall) => row.status === 'approved',
        },
        {
          label: '',
          variant: "danger" as "primary" | "secondary" | "danger" | undefined,
          icon: (
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ),
          onClick: () => { },
          show: (row: CapitalCall) => row.status === 'rejected',
        },
      ]
      : []),

    // Fund Manager actions
    ...(user?.role === 'fundManager'
      ? [
        {
          label: 'Edit',
          variant: "secondary" as "primary" | "secondary" | "danger" | undefined,
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
          onClick: (row: CapitalCall) => {
            setCapitalCall(row);
            setIsCapitalModalOpen(true);

          },
          show: (row: CapitalCall) => row.status !== 'approved',
        },
        {
          label: '',
          variant: "primary" as "primary" | "secondary" | "danger" | undefined,
          icon: (
            <div className="w-6 h-6 rounded  flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ),
          onClick: () => { },
          show: (row: CapitalCall) => row.status === 'approved',
        },
        {
          label: '',
          variant: "danger" as "primary" | "secondary" | "danger" | undefined,
          icon: (
            <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ),
          onClick: () => { },
          show: (row: CapitalCall) => row.status === 'rejected',
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


  const handleUpdateCapitalCall = async (data: any) => {

    if (!fundData?.id) {
      console.error('❌ Fund ID is missing!');
      return;
    }
    if (!capitalCall?.id) {
      console.error('❌ Capital call ID is missing!');
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

    const payload: UpdateCapitalCallPayload = {
      ...data,
      fundId: fundData.id,
      date: parsedDate,
    };

    try {
      await updateCapitalCall({ id: capitalCall.id, payload });
      setIsCapitalModalOpen(false);
    } catch (error) {
      console.error('Capital call update failed:', error);
    }
  };
  const handleApprove = (): void => {
    if (!capitalCall) return;

    updateMutation.mutate(
      {
        id: capitalCall.id,
        status: 'approved',
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      }
    );
  };

  const handleReject = (): void => {
    if (!capitalCall) return;

    updateMutation.mutate(
      {
        id: capitalCall.id,
        status: 'rejected',
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
  };

  return (
    <div className=" rounded-lg ">
      {/* <div className="w-full" style={{ maxWidth: "calc(100% - 20rem)" }}> */}
      <Table
        data={data?.data || []}
        columns={columns}
        actions={actions}
        pagination={paginationInfo}
        onPageChange={handlePageChange}
        loading={isLoading || isFetching}
        emptyMessage="No capital calls found"
        className="mb-8"
      />
      {/* </div> */}


      <FundTransactionModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
        onSubmit={handleUpdateCapitalCall}
        mode={'edit'}
        initialData={capitalCall ?? undefined}
        fund={fundData || null}
        entityType="capital"

      />
      <FundTransactionViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={capitalCall}
        onApprove={handleApprove}
        onReject={handleReject}
        entityType='capital'
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default Capital;