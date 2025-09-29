import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, Eye, X, ChevronDown } from 'lucide-react';
import { Table, type PaginationInfo, type TableAction, type TableColumn } from '../../../Components/Table';
import { useCreateFundReport, useGetFundReports, type CreateFundReportPayload, type FundReport } from '../../../API/Endpoints/Funds/fundReport';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import ReportDetailsModal from '../../../Components/Modal/ReportDetailsModal';
import { EnhancedYearQuarterDropdowns } from '../../../Components/Modal/EnhancedYearQuarterDropdowns';
import type { FundDetail } from '../../../Redux/features/Funds/fundsSlice';
import { useAppSelector } from '../../../Redux/hooks';
import { formatDateToDDMMYYYY } from '../../../utils/dateUtils';

interface FormData {
  projectName: string;
  description: string;
  year: string;
  quarter: string;
  investorIds?: string[];      // Will be sent to backend
  selectedInvestors: string[]; // For UI selection
}
interface FetchFormData {

  year: string;
  quarter: string;
}


const FundReports = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    description: '',
    year: new Date().getFullYear().toString(),
    quarter: 'Q1',
    selectedInvestors: [] as string[], // New field
  });
  const [fundData, setFundData] = useState<FundDetail | null>(null);
  const fund = useAppSelector((state) => state.funds.currentFund);
  useEffect(() => {
    if (fund) {
      setFundData(fund?.result);
    }
  }, [fund]);
  const investors = fundData?.investors || [];

  const [fetchFormData, setFetchFormData] = useState<FetchFormData>({
    year: '',
    quarter: '',
  });



  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FundReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createFundReport } = useCreateFundReport(user?.id || '');
  const { data } = useGetFundReports({
    fundId: id || '',
    page: currentPage,
    limit: itemsPerPage,
    ...(fetchFormData.year ? { year: fetchFormData.year } : {}),
    ...(fetchFormData.quarter ? { quarter: fetchFormData.quarter } : {}),
  });
  const [isInvestorDropdownOpen, setIsInvestorDropdownOpen] = useState(false);
  const investorDropdownRef = useRef<HTMLDivElement>(null);
  const handleInvestorSelect = (id: string) => {
    setFormData((prev) => {
      const selectedInvestors = prev.selectedInvestors.includes(id)
        ? prev.selectedInvestors.filter((investorId) => investorId !== id)
        : [...prev.selectedInvestors, id];
      return { ...prev, selectedInvestors };
    });
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFetchInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFetchFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedFile || !id) {
      alert('Please select a document to upload and ensure fund ID is available');
      return;
    }

    setIsLoading(true);

    const payload: CreateFundReportPayload = {
      fundId: id,
      projectName: formData.projectName,
      description: formData.description,
      year: formData.year,
      quarter: formData.quarter,
      document: selectedFile,
      investorIds: formData.selectedInvestors.length ? formData.selectedInvestors : undefined,
    };

    createFundReport(payload, {
      onSuccess: () => {
        setFormData({
          projectName: '',
          description: '',
          year: new Date().getFullYear().toString(),
          quarter: 'Q1',
          selectedInvestors: [], // Reset
        });
        setSelectedFile(null);
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
      },
    });
  };


  const handleViewReport = (report: FundReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDownload = async (report: FundReport) => {
    if (!report.documentUrl) {
      console.error('No document URL available');
      return;
    }

    try {
      const response = await fetch(report.documentUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch the PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;

      // Optionally name the file
      const filename =
        report.projectName?.replace(/\s+/g, '_') || `fund-report-${report.id}`;
      link.download = `${filename}.pdf`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  const columns: TableColumn<FundReport>[] = [
    {
      key: 'projectName',
      header: 'Project Name',
      sortable: false,

      align: 'left',
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'createdByName',
      header: 'Created By',
      sortable: false,
      align: 'left',
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'year',
      header: 'Year',
      sortable: false,
      align: 'left',
      render: (value: number | string) => (
        <div className="truncate" title={value.toString()}>
          {value}
        </div>
      ),
    },
    {
      key: 'quarter',
      header: 'Quarter',
      sortable: false,
      align: 'left',
      render: (value: string) => (
        <div className="truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: false,
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
  ];
  const actions: TableAction<FundReport>[] = [
    {
      label: 'View',
      variant: "primary" as "primary" | "secondary" | "danger" | undefined,
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: FundReport) => handleViewReport(row),
      show: () => true,
    },
    ...(user?.role === 'investor'
      ? [
        {
          label: '',
          variant: "primary" as "primary" | "secondary" | "danger" | undefined,
          icon: <Download className="w-5 h-5" />,
          onClick: (row: FundReport) => handleDownload(row),
          show: () => true,
        },
      ]
      : []),

    // // 👇 Optional: Only show for fund managers
    // ...(user?.role === 'fundManager'
    //   ? [
    //     {
    //       label: 'Delete',
    //       variant: "danger" as "primary" | "secondary" | "danger" | undefined,
    //       icon: <Trash2 className="w-4 h-4" />,
    //       onClick: (row: FundReport) => {
    //         if (confirm('Are you sure you want to delete this report?')) {
    //           console.log('Delete report:', row);
    //         }
    //       },
    //       show: () => false,
    //     },
    //   ]
    //   : []),
  ];
  const paginationInfo: PaginationInfo = {
    currentPage: data?.currentPage || 1,
    totalPages: data?.totalPages || 1,
    totalItems: data?.totalCount || 0,
    itemsPerPage
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const setFetchField = (name: keyof FetchFormData, value: string) => {
    setFetchFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        investorDropdownRef.current &&
        !investorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsInvestorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="w-full">
      <div className="">
        {/* Upload Section */}
        {user?.role === 'fundManager' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Fund Report</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Fund Report Document</h3>
                  <div className="text-sm text-gray-500 mb-4">File Size should be 5MB</div>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                      ? 'border-theme-sidebar-accent bg-teal-50'
                      : selectedFile
                        ? ' bg-teal-50'
                        : 'border-gray-300 bg-gray-50'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      {selectedFile ? (
                        <>
                          <FileText className="w-16 h-16 text-teal-600" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-16 h-16 text-gray-400" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              Drop your document here, or{' '}
                              <button
                                type="button"
                                className="text-theme-sidebar-accent underline"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                browse
                              </button>
                            </p>
                            <p className="text-xs text-gray-500">Supports PDF files</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-theme-sidebar-accent text-white py-3 px-4 rounded-lg  transition-colors font-medium"
                  >
                    Upload Document
                  </button>
                </div>

                {/* Right Side - Form Fields */}
                <div className="space-y-6">
                  {/* Project Name Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-theme-sidebar-accent">
                        Project Name
                      </label>

                    </div>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-theme-sidebar-accent/30 rounded-lg outline-none
                focus:ring-2 focus:ring-theme-sidebar-accent focus:border-theme-sidebar-accent
                bg-white/90 text-gray-700 placeholder-theme-sidebar-accent/50"
                      placeholder="Enter project name"
                      required
                    />
                  </div>

                  {/* Description Section */}
                  <div>
                    <label className="block text-sm font-medium text-theme-sidebar-accent mb-2">
                      Project Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-theme-sidebar-accent/30 rounded-lg outline-none
                focus:ring-2 focus:ring-theme-sidebar-accent focus:border-theme-sidebar-accent
                bg-white/90 text-gray-700 placeholder-theme-sidebar-accent/50"
                      placeholder="Enter project description"
                      required
                    />
                  </div>
                  <EnhancedYearQuarterDropdowns
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                  <div>
                    <label className="block text-sm font-medium text-theme-sidebar-accent mb-2">
                      Investors
                    </label>
                    <div className="relative" ref={investorDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsInvestorDropdownOpen(!isInvestorDropdownOpen)}
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl outline-none
        focus:ring-2 focus:ring-theme-sidebar-accent focus:border-theme-sidebar-accent
        bg-white text-gray-700 shadow-sm
        hover:border-theme-sidebar-accent hover:shadow-md transition-all duration-200
        flex items-center justify-between font-medium"
                      >
                        <span
                          className={
                            formData.selectedInvestors.length ? 'text-gray-900' : 'text-gray-500'
                          }
                        >
                          {formData.selectedInvestors.length
                            ? investors
                              .filter((inv) =>
                                formData.selectedInvestors.includes(inv.investorId)
                              )
                              .map((inv) => inv.name)
                              .join(', ') || 'Select Investors'
                            : 'All Investors'}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isInvestorDropdownOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </button>
                      {isInvestorDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          <div className="py-2">
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, selectedInvestors: [] });
                                setIsInvestorDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-150 font-medium ${formData.selectedInvestors.length === 0
                                ? 'text-theme-sidebar-accent bg-gray-200 border-r-2'
                                : 'text-gray-700'
                                }`}
                            >
                              All Investors
                            </button>
                            {investors.map((investor) => (
                              <div key={investor.investorId} className="flex items-center px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedInvestors.includes(investor.investorId)}
                                  onChange={() => handleInvestorSelect(investor.investorId)}
                                  className="mr-2 accent-theme-sidebar-accent"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleInvestorSelect(investor.investorId)}
                                  className={`w-full text-left transition-colors duration-150 font-medium ${formData.selectedInvestors.includes(investor.investorId)
                                    ? 'text-theme-sidebar-accent'
                                    : 'text-gray-700'
                                    }`}
                                >
                                  {investor.name}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedFile}
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="w-[60%] my-4 relative ">
          <EnhancedYearQuarterDropdowns
            formData={fetchFormData}
            handleInputChange={handleFetchInputChange}
          />
          {/* Clear Filter Icon */}
          {(fetchFormData.year || fetchFormData.quarter) && (
            <button
              type="button"
              onClick={() => {
                setFetchField('year', '');
                setFetchField('quarter', '');
              }}
              className="absolute top-11 -right-11 text-gray-500 hover:text-red-500 transition-colors"
              title="Clear Filters"
            >
              <X className="w-5 h-5" />
            </button>

          )}
        </div>
        <Table
          data={data?.results || []}
          columns={columns}
          actions={actions}
          pagination={paginationInfo}
          onPageChange={handlePageChange}
          loading={isLoading}
          emptyMessage="No Fund Reports found"
          className="mb-8"
        />
        <ReportDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedReport={selectedReport}
          onDownload={(report) => {
            handleDownload(report);
          }}
        />
      </div>
    </div>
  );
};

export default FundReports;