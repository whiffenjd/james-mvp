import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Eye, Trash2 } from 'lucide-react';
import { Table, type PaginationInfo, type TableAction, type TableColumn } from '../../../Components/Table';
import { useCreateFundReport, useGetFundReports, type FundReport } from '../../../API/Endpoints/Funds/fundReport';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';

interface FormData {
  projectName: string;
  description: string;
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
    quarter: 'Q1'
  });
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FundReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createFundReport } = useCreateFundReport();
  const { data } = useGetFundReports({
    fundId: id || '',
    page: currentPage,
    limit: itemsPerPage
  });

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

  const handleSubmit = async () => {
    if (!selectedFile || !id) {
      alert('Please select a document to upload and ensure fund ID is available');
      return;
    }

    setIsLoading(true);

    const payload = {
      fundId: id,
      projectName: formData.projectName,
      description: formData.description,
      year: formData.year,
      quarter: formData.quarter,
      document: selectedFile
    };

    createFundReport(payload, {
      onSuccess: () => {
        setFormData({
          projectName: '',
          description: '',
          year: new Date().getFullYear().toString(),
          quarter: 'Q1'
        });
        setSelectedFile(null);
        alert('Fund report created successfully!');
        setIsLoading(false);
      },
      onError: () => {
        alert('Failed to create fund report');
        setIsLoading(false);
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleViewReport = (report: FundReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDownload = (report: FundReport) => {
    console.log('Download report:', report);
    // Implement actual download logic here
  };

  const columns: TableColumn<FundReport>[] = [
    {
      key: 'projectName',
      header: 'Project Name',
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
      key: 'createdBy',
      header: 'Created By',
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
      key: 'year',
      header: 'Year',
      sortable: false,
      width: '10vh',
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
      width: '10vh',
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
      width: '15vh',
      align: 'left',
      render: (value: string) => {
        const formattedDate = formatDate(value);
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
      variant: 'primary',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: FundReport) => handleViewReport(row),
      show: () => true,
    },
    {
      label: 'Download',
      variant: 'secondary',
      icon: <Download className="w-4 h-4" />,
      onClick: (row: FundReport) => handleDownload(row),
      show: () => true,
    },
    ...(user?.role === 'fundManager'
      ? [
        {
          label: 'Delete',
          variant: 'danger',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: (row: FundReport) => {
            if (confirm('Are you sure you want to delete this report?')) {
              console.log('Delete report:', row);
            }
          },
          show: () => true,
        },
      ]
      : []),
  ];
  console.log("data", data)

  const paginationInfo: PaginationInfo = {
    currentPage: data.currentPage || 1,
    totalPages: data?.totalPages || 1,
    totalItems: data?.totalCount || 0,
    itemsPerPage
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  console.log("selec", selectedReport)
  return (
    <div className="w-full max-w-6xl">
      <div className="">
        {/* Upload Section */}
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
                    ? 'border-teal-400 bg-teal-50'
                    : selectedFile
                      ? 'border-teal-500 bg-teal-50'
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
                              className="text-teal-600 hover:text-teal-700 underline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              browse
                            </button>
                          </p>
                          <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX files</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Upload Document
                </button>
              </div>

              {/* Right Side - Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <div className="text-sm text-gray-500 mb-2">By Fund Manager Name</div>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter project description"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {[2024, 2023, 2022, 2021, 2020].map(year => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quarter
                    </label>
                    <select
                      name="quarter"
                      value={formData.quarter}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
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

        <Table
          data={data?.results || []}
          columns={columns}
          actions={actions}
          pagination={paginationInfo}
          onPageChange={handlePageChange}
          loading={isLoading}
          emptyMessage="No capital calls found"
          className="mb-8"
        />

        {/* View Report Modal */}
        {isModalOpen && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.projectName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created By</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.createdBy}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.year}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quarter</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.quarter}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedReport.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                  {selectedReport.documentUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attached Document</label>
                      <div className="max-h-[400px] overflow-auto rounded border border-gray-200">
                        {selectedReport.documentUrl.endsWith('.pdf') ? (
                          <iframe
                            src={selectedReport.documentUrl}
                            title="PDF Preview"
                            className="w-full h-[400px]"
                          />
                        ) : (
                          <img
                            src={selectedReport.documentUrl}
                            alt="Document"
                            className="w-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}


                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDownload(selectedReport)}
                      className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundReports;