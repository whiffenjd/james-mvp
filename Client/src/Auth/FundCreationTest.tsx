import React, { useState, useEffect, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Upload,
  X,
  Plus,
  ChevronDown,
  FileText,
  User,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

// Types
interface Investor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface Fund {
  id: string;
  name: string;
  fundSize: string;
  fundType: string;
  targetGeographies: string;
  targetSectors: string;
  targetMOIC: string;
  targetIRR: string;
  minimumInvestment: string;
  fundLifetime: string;
  fundDescription?: string;
  documents: Array<{
    fileUrl: string;
    uploadedAt: string;
  }>;
  investors: Array<{
    investorId: string;
    name: string;
    amount: number;
    documentUrl: string;
    addedAt: string;
  }>;
  createdAt: string;
}

interface CreateFundRequest {
  name: string;
  fundSize: string;
  fundType: string;
  targetGeographies: string;
  targetSectors: string;
  targetMOIC: string;
  targetIRR: string;
  minimumInvestment: string;
  fundLifetime: string;
  fundDescription?: string;
  investors: Array<{
    investorId: string;
    name: string;
    amount: number;
    documentUrl: string;
    addedAt: string;
  }>;
}

interface InvestorFormData {
  investorId: string;
  name: string;
  amount: number;
  document: File | null;
  addedAt: string;
  isExisting?: boolean;
  existingDocumentUrl?: string;
}

// API Configuration
const API_BASE_URL = "http://localhost:5000";
const token = Cookies.get("authToken");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// API Functions
const investorAPI = {
  getAllInvestors: async (): Promise<Investor[]> => {
    const response = await api.get("/fund/investors");
    return response.data.data;
  },
};

const fundAPI = {
  getAllFunds: async (): Promise<Fund[]> => {
    const response = await api.get("/fund/getAllFunds");
    return response.data.data;
  },

  getFundById: async (id: string): Promise<Fund> => {
    const response = await api.get(`/fund/getFundById/${id}`);
    return response.data.result;
  },

  createFund: async (
    data: CreateFundRequest,
    files: File[] | null,
    investorFiles: { [key: string]: File }
  ): Promise<Fund> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    // Add main fund documents with 'fundDocuments' fieldname
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("fundDocuments", file);
      });
    }

    // Add investor documents with specific fieldnames
    Object.entries(investorFiles).forEach(([investorIndex, file]) => {
      formData.append(`investorDocument_${investorIndex}`, file);
    });

    const response = await api.post("/fund/createFund", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateFund: async (
    id: string,
    data: Partial<CreateFundRequest>,
    files: File[] | null,
    investorFiles: { [key: string]: File }
  ): Promise<Fund> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    // Add main fund documents with 'fundDocuments' fieldname
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("fundDocuments", file);
      });
    }

    // Add investor documents with specific fieldnames
    Object.entries(investorFiles).forEach(([investorIndex, file]) => {
      formData.append(`investorDocument_${investorIndex}`, file);
    });

    const response = await api.patch(`/fund/updateFund/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteFund: async (id: string): Promise<void> => {
    await api.delete(`/fund/deleteFund/${id}`);
  },
};

const FundTestComponent: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedFundId, setSelectedFundId] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const formInitializedRef = useRef(false);
  // Form states
  const [createFormData, setCreateFormData] = useState<CreateFundRequest>({
    name: "",
    fundSize: "",
    fundType: "",
    targetGeographies: "",
    targetSectors: "",
    targetMOIC: "",
    targetIRR: "",
    minimumInvestment: "",
    fundLifetime: "",
    fundDescription: "",
    investors: [],
  });

  const [updateFormData, setUpdateFormData] = useState<
    Partial<CreateFundRequest>
  >({
    name: "",
    fundSize: "",
    fundType: "",
    targetGeographies: "",
    targetSectors: "",
    targetMOIC: "",
    targetIRR: "",
    minimumInvestment: "",
    fundLifetime: "",
    fundDescription: "",
    investors: [],
  });
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [updateFiles, setUpdateFiles] = useState<File[]>([]);

  // Investor form states
  const [createInvestorForms, setCreateInvestorForms] = useState<
    InvestorFormData[]
  >([]);
  const [updateInvestorForms, setUpdateInvestorForms] = useState<
    InvestorFormData[]
  >([]);
  const [createInvestorFiles, setCreateInvestorFiles] = useState<{
    [key: string]: File;
  }>({});
  const [updateInvestorFiles, setUpdateInvestorFiles] = useState<{
    [key: string]: File;
  }>({});

  // Queries
  const {
    data: investors,
    isLoading: investorsLoading,
    error: investorsError,
  } = useQuery({
    queryKey: ["investors"],
    queryFn: investorAPI.getAllInvestors,
  });

  const {
    data: funds,
    isLoading: fundsLoading,
    error: fundsError,
  } = useQuery({
    queryKey: ["funds"],
    queryFn: fundAPI.getAllFunds,
  });

  const { data: selectedFund, isLoading: fundLoading } = useQuery({
    queryKey: ["fund", selectedFundId],
    queryFn: () => fundAPI.getFundById(selectedFundId),
    enabled: !!selectedFundId,
  });

  // Effect to populate update form when selectedFund changes and update modal is open
  useEffect(() => {
    if (selectedFund) {
      // Always keep the form data in sync with selected fund

      setUpdateFormData({
        name: selectedFund.name,
        fundSize: selectedFund.fundSize,
        fundType: selectedFund.fundType,
        targetGeographies: selectedFund.targetGeographies,
        targetSectors: selectedFund.targetSectors,
        targetMOIC: selectedFund.targetMOIC,
        targetIRR: selectedFund.targetIRR,
        minimumInvestment: selectedFund.minimumInvestment,
        fundLifetime: selectedFund.fundLifetime,
        fundDescription: selectedFund.fundDescription || "",
      });

      const existingInvestorForms =
        selectedFund?.investors?.map((investor) => ({
          investorId: investor.investorId,
          name: investor.name,
          amount: investor.amount,
          document: null,
          addedAt: investor.addedAt,
          isExisting: true,
          existingDocumentUrl: investor.documentUrl,
        })) || [];

      setUpdateInvestorForms(existingInvestorForms);
    }
  }, [selectedFund]); // Only depend on selectedFund, not showUpdateForm

  useEffect(() => {}, [updateFormData]); // Only depend on selectedFund, not showUpdateForm
  const handleEditFund = (fundId: string) => {
    setSelectedFundId(fundId);
    setShowUpdateForm(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: ({
      data,
      files,
      investorFiles,
    }: {
      data: CreateFundRequest;
      files: File[] | null;
      investorFiles: { [key: string]: File };
    }) => fundAPI.createFund(data, files, investorFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      setShowCreateForm(false);
      resetCreateForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      files,
      investorFiles,
    }: {
      id: string;
      data: Partial<CreateFundRequest>;
      files: File[] | null;
      investorFiles: { [key: string]: File };
    }) => fundAPI.updateFund(id, data, files, investorFiles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["fund", selectedFundId] });
      setShowUpdateForm(false);
      resetUpdateForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fundAPI.deleteFund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      setSelectedFundId("");
    },
  });

  // Helper functions
  const resetCreateForm = () => {
    setCreateFormData({
      name: "",
      fundSize: "",
      fundType: "",
      targetGeographies: "",
      targetSectors: "",
      targetMOIC: "",
      targetIRR: "",
      minimumInvestment: "",
      fundLifetime: "",
      fundDescription: "",
      investors: [],
    });
    setCreateFiles([]);
    setCreateInvestorForms([]);
    setCreateInvestorFiles({});
  };

  const resetUpdateForm = () => {
    setUpdateFiles([]);
    setUpdateInvestorForms([]);
    setUpdateInvestorFiles({});
  };

  // Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process investor forms to create investors array
    const processedInvestors = createInvestorForms.map((form) => ({
      investorId: form.investorId,
      name: form.name,
      amount: form.amount,
      documentUrl: "", // Will be populated by backend after upload
      addedAt: form.addedAt,
    }));

    const formDataWithInvestors = {
      ...createFormData,
      investors: processedInvestors,
    };

    createMutation.mutate({
      data: formDataWithInvestors,
      files: createFiles.length > 0 ? createFiles : null,
      investorFiles: createInvestorFiles,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFundId && selectedFund) {
      // Process investor forms to create investors array
      const processedInvestors = updateInvestorForms.map((form) => ({
        investorId: form.investorId,
        name: form.name,
        amount: form.amount,
        documentUrl: form.existingDocumentUrl || "", // Keep existing document URL if no new document
        addedAt: form.addedAt,
      }));

      const formDataWithInvestors = {
        ...updateFormData,
        investors: processedInvestors,
        // Include existing documents info so backend knows what to preserve
        existingDocuments: selectedFund.documents || [],
        existingInvestors: selectedFund.investors || [],
      };

      updateMutation.mutate({
        id: selectedFundId,
        data: formDataWithInvestors,
        files: updateFiles.length > 0 ? updateFiles : null,
        investorFiles: updateInvestorFiles,
      });
    }
  };
  const handleAddInvestor = (formType: "create" | "update") => {
    const newInvestorForm: InvestorFormData = {
      investorId: "",
      name: "",
      amount: 0,
      document: null,
      addedAt: new Date().toISOString(),
      isExisting: false,
    };

    if (formType === "create") {
      setCreateInvestorForms((prev) => [...prev, newInvestorForm]);
    } else {
      setUpdateInvestorForms((prev) => [...prev, newInvestorForm]);
    }
  };

  const handleRemoveInvestor = (
    index: number,
    formType: "create" | "update"
  ) => {
    if (formType === "create") {
      setCreateInvestorForms((prev) => prev.filter((_, i) => i !== index));
      // Remove associated file
      setCreateInvestorFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[index.toString()];
        return newFiles;
      });
    } else {
      setUpdateInvestorForms((prev) => prev.filter((_, i) => i !== index));
      // Remove associated file
      setUpdateInvestorFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[index.toString()];
        return newFiles;
      });
    }
  };

  const handleInvestorSelect = (
    index: number,
    investorId: string,
    formType: "create" | "update"
  ) => {
    const selectedInvestor = investors?.find((inv) => inv.id === investorId);

    if (selectedInvestor) {
      const updateForms =
        formType === "create" ? setCreateInvestorForms : setUpdateInvestorForms;

      updateForms((prev) => {
        const newForms = [...prev];
        newForms[index] = {
          ...newForms[index],
          investorId: selectedInvestor.id,
          name: selectedInvestor.name,
        };
        return newForms;
      });
    }
  };

  const handleInvestorDocumentUpload = (
    index: number,
    file: File | null,
    formType: "create" | "update"
  ) => {
    const setFiles =
      formType === "create" ? setCreateInvestorFiles : setUpdateInvestorFiles;

    if (file) {
      setFiles((prev) => ({
        ...prev,
        [index.toString()]: file,
      }));
    } else {
      setFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[index.toString()];
        return newFiles;
      });
    }
  };

  const fillSampleData = () => {
    setCreateFormData({
      name: "Alpha Growth Fund",
      fundSize: "500M USD",
      fundType: "Private Equity",
      targetGeographies: "Asia, Europe",
      targetSectors: "Healthcare, Technology",
      targetMOIC: "2.5x",
      targetIRR: "20%",
      minimumInvestment: "50,000 USD",
      fundLifetime: "8 years",
      fundDescription:
        "This fund targets high-growth startups in emerging markets.",
      investors: [],
    });
  };

  const InvestorDropdown = ({
    value,
    onChange,
    placeholder = "Select Investor",
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedInvestor = investors?.find((inv) => inv.id === value);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-left bg-white flex items-center justify-between hover:border-gray-400 focus:border-blue-500 focus:outline-none"
        >
          <span
            className={selectedInvestor ? "text-gray-900" : "text-gray-500"}
          >
            {selectedInvestor ? selectedInvestor.name : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {investorsLoading ? (
              <div className="px-3 py-2 text-gray-500">
                Loading investors...
              </div>
            ) : investors && investors.length > 0 ? (
              investors.map((investor) => (
                <button
                  key={investor.id}
                  type="button"
                  onClick={() => {
                    onChange(investor.id);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div>
                    <div className="font-medium">{investor.name}</div>
                    <div className="text-sm text-gray-500">
                      {investor.email}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">No investors found</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const MultipleFileUploadArea = ({
    files,
    onChange,
    accept = "*/*",
    maxFiles = 10,
  }: {
    files: File[];
    onChange: (files: File[]) => void;
    accept?: string;
    maxFiles?: number;
  }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const uploadId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const totalFiles = [...files, ...droppedFiles].slice(0, maxFiles);
      onChange(totalFiles);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const totalFiles = [...files, ...selectedFiles].slice(0, maxFiles);
        onChange(totalFiles);
      }
    };

    const removeFile = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      onChange(newFiles);
    };

    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Maximum {maxFiles} files allowed
          </p>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={uploadId}
          />
          <label
            htmlFor={uploadId}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Files
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files ({files.length})
            </h4>
            <div className="grid gap-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Fund Management Dashboard
        </h1>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Fund
          </button>
          <button
            onClick={fillSampleData}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Fill Sample Data
          </button>
        </div>

        {/* Loading and Error States */}
        {investorsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">
              Error loading investors: {(investorsError as Error).message}
            </p>
          </div>
        )}

        {/* Funds List */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">All Funds</h2>
          {fundsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-blue-500">Loading funds...</div>
            </div>
          )}
          {fundsError && (
            <p className="text-red-500 bg-red-50 p-4 rounded-lg">
              Error loading funds: {(fundsError as Error).message}
            </p>
          )}

          {funds && (
            <div className="grid gap-4">
              {funds.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No funds created yet. Create your first fund!
                </div>
              ) : (
                funds.map((fund) => (
                  <div
                    key={fund.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">
                          {fund.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Size:</span>{" "}
                            {fund.fundSize}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {fund.fundType}
                          </div>
                          <div>
                            <span className="font-medium">Target IRR:</span>{" "}
                            {fund.targetIRR}
                          </div>
                          <div>
                            <span className="font-medium">MOIC:</span>{" "}
                            {fund.targetMOIC}
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>📄 {fund.documents.length} documents</span>
                          <span>👥 {fund.investors.length} investors</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setSelectedFundId(fund.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm transition-colors font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditFund(fund.id)}
                          className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-2 rounded text-sm transition-colors font-medium flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(fund.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded text-sm transition-colors font-medium flex items-center gap-1"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                          {deleteMutation.isPending ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Fund Details */}
        {selectedFund && !showUpdateForm && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Fund Details</h2>
            {fundLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-blue-500">Loading fund details...</div>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {selectedFund.name}
                </h3>
                <button
                  onClick={() => handleEditFund(selectedFund.id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Fund
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-6">
                <div>
                  <strong className="text-gray-700">Fund Size:</strong>
                  <div className="text-gray-600">{selectedFund.fundSize}</div>
                </div>
                <div>
                  <strong className="text-gray-700">Fund Type:</strong>
                  <div className="text-gray-600">{selectedFund.fundType}</div>
                </div>
                <div>
                  <strong className="text-gray-700">Target Geographies:</strong>
                  <div className="text-gray-600">
                    {selectedFund.targetGeographies}
                  </div>
                </div>
                <div>
                  <strong className="text-gray-700">Target Sectors:</strong>
                  <div className="text-gray-600">
                    {selectedFund.targetSectors}
                  </div>
                </div>
                <div>
                  <strong className="text-gray-700">Target MOIC:</strong>
                  <div className="text-gray-600">{selectedFund.targetMOIC}</div>
                </div>
                <div>
                  <strong className="text-gray-700">Target IRR:</strong>
                  <div className="text-gray-600">{selectedFund.targetIRR}</div>
                </div>
                <div>
                  <strong className="text-gray-700">Minimum Investment:</strong>
                  <div className="text-gray-600">
                    {selectedFund.minimumInvestment}
                  </div>
                </div>
                <div>
                  <strong className="text-gray-700">Fund Lifetime:</strong>
                  <div className="text-gray-600">
                    {selectedFund.fundLifetime}
                  </div>
                </div>
              </div>

              {selectedFund.fundDescription && (
                <div className="mb-4">
                  <strong className="text-gray-700">Description:</strong>
                  <div className="text-gray-600 mt-1">
                    {selectedFund.fundDescription}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <strong className="text-gray-700">
                    Documents ({selectedFund?.documents?.length})
                  </strong>
                  {selectedFund?.documents?.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedFund?.documents?.map((doc, index) => (
                        <div
                          key={index}
                          className="text-sm bg-white p-3 rounded border"
                        >
                          <div className="text-blue-600 font-medium">
                            Document {index + 1}
                          </div>
                          <div className="text-gray-500">
                            Uploaded:{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm mt-2">
                      No documents uploaded
                    </div>
                  )}
                </div>

                <div>
                  <strong className="text-gray-700">
                    Investors ({selectedFund?.investors?.length})
                  </strong>
                  {selectedFund?.investors?.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedFund?.investors?.map((investor, index) => (
                        <div
                          key={index}
                          className="text-sm bg-white p-3 rounded border"
                        >
                          <div className="font-medium text-gray-800">
                            {investor.name}
                          </div>
                          <div className="text-gray-600">
                            Amount: ${investor.amount.toLocaleString()}
                          </div>
                          <div className="text-gray-500">
                            Added:{" "}
                            {new Date(investor.addedAt).toLocaleDateString()}
                          </div>
                          {investor.documentUrl && (
                            <div className="text-blue-600 text-xs">
                              📄 Document available
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm mt-2">
                      No investors added
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Fund Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Create New Fund</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-6">
                {/* Basic Fund Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Fund Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Fund Name"
                      value={createFormData.name}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Fund Size (e.g., 500M USD)"
                      value={createFormData.fundSize}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          fundSize: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Fund Type"
                      value={createFormData.fundType}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          fundType: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Target Geographies"
                      value={createFormData.targetGeographies}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          targetGeographies: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Target Sectors"
                      value={createFormData.targetSectors}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          targetSectors: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Target MOIC (e.g., 2.5x)"
                      value={createFormData.targetMOIC}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          targetMOIC: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Target IRR (e.g., 20%)"
                      value={createFormData.targetIRR}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          targetIRR: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Minimum Investment"
                      value={createFormData.minimumInvestment}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          minimumInvestment: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Fund Lifetime (e.g., 8 years)"
                      value={createFormData.fundLifetime}
                      onChange={(e) =>
                        setCreateFormData((prev) => ({
                          ...prev,
                          fundLifetime: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <textarea
                    placeholder="Fund Description (optional)"
                    value={createFormData.fundDescription}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        fundDescription: e.target.value,
                      }))
                    }
                    className="w-full mt-4 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Documents Upload */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Fund Documents</h3>
                  <MultipleFileUploadArea
                    files={createFiles}
                    onChange={setCreateFiles}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    maxFiles={10}
                  />
                </div>

                {/* Investors Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Investors</h3>
                    <button
                      type="button"
                      onClick={() => handleAddInvestor("create")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Add Investor
                    </button>
                  </div>

                  {createInvestorForms.map((form, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Investor {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveInvestor(index, "create")}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Investor
                          </label>
                          <InvestorDropdown
                            value={form.investorId}
                            onChange={(investorId) =>
                              handleInvestorSelect(index, investorId, "create")
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Investment Amount ($)
                          </label>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={form.amount || ""}
                            onChange={(e) => {
                              setCreateInvestorForms((prev) => {
                                const newForms = [...prev];
                                newForms[index].amount = Number(e.target.value);
                                return newForms;
                              });
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Investor Document
                        </label>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleInvestorDocumentUpload(
                              index,
                              e.target.files?.[0] || null,
                              "create"
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          accept=".pdf,.doc,.docx"
                        />
                        {createInvestorFiles[index.toString()] && (
                          <p className="text-sm text-green-600 mt-1">
                            📄 {createInvestorFiles[index.toString()].name}{" "}
                            selected
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {createInvestorForms.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No investors added yet</p>
                      <p className="text-sm text-gray-400">
                        Click "Add Investor" to get started
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 justify-end pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Fund"}
                  </button>
                </div>
              </form>

              {createMutation.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">
                    Error: {(createMutation.error as Error).message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Fund Modal */}
      {showUpdateForm && selectedFundId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Update Fund</h2>
                <button
                  onClick={() => {
                    setShowUpdateForm(false);
                    resetUpdateForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                {/* Basic Fund Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Fund Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Fund Name"
                      value={updateFormData.name || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Fund Size"
                      value={updateFormData.fundSize || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          fundSize: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Fund Type"
                      value={updateFormData.fundType || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          fundType: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Target Geographies"
                      value={updateFormData.targetGeographies || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          targetGeographies: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Target Sectors"
                      value={updateFormData.targetSectors || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          targetSectors: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Target MOIC"
                      value={updateFormData.targetMOIC || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          targetMOIC: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Target IRR"
                      value={updateFormData.targetIRR || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          targetIRR: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Minimum Investment"
                      value={updateFormData.minimumInvestment || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          minimumInvestment: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Fund Lifetime"
                      value={updateFormData.fundLifetime || ""}
                      onChange={(e) =>
                        setUpdateFormData((prev) => ({
                          ...prev,
                          fundLifetime: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <textarea
                    placeholder="Fund Description"
                    value={updateFormData.fundDescription || ""}
                    onChange={(e) =>
                      setUpdateFormData((prev) => ({
                        ...prev,
                        fundDescription: e.target.value,
                      }))
                    }
                    className="w-full mt-4 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Current Documents Display */}
                {selectedFund?.documents &&
                  selectedFund.documents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Current Documents
                      </h3>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="grid gap-2">
                          {selectedFund.documents.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white p-3 rounded border"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Document {index + 1}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Uploaded:{" "}
                                    {new Date(
                                      doc.uploadedAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-sm"
                              >
                                View
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Additional Documents Upload */}
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Add New Documents
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload additional documents to add to this fund. Existing
                    documents will be preserved.
                  </p>
                  <MultipleFileUploadArea
                    files={updateFiles}
                    onChange={setUpdateFiles}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    maxFiles={10}
                  />
                </div>

                {/* Investors Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Investors</h3>
                    <button
                      type="button"
                      onClick={() => handleAddInvestor("update")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Add Investor
                    </button>
                  </div>

                  {updateInvestorForms?.map((form, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 mb-4 ${
                        form.isExisting
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-700 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {form.isExisting
                            ? "Existing Investor"
                            : `New Investor ${index + 1}`}
                          {form.isExisting && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </h4>
                        {!form.isExisting && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveInvestor(index, "update")
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {form.isExisting ? "Investor" : "Select Investor"}
                          </label>
                          {form.isExisting ? (
                            <div className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900">
                              {form.name}
                            </div>
                          ) : (
                            <InvestorDropdown
                              value={form.investorId}
                              onChange={(investorId) =>
                                handleInvestorSelect(
                                  index,
                                  investorId,
                                  "update"
                                )
                              }
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Investment Amount ($)
                          </label>
                          <input
                            type="number"
                            placeholder="Enter amount"
                            value={form.amount || ""}
                            onChange={(e) => {
                              setUpdateInvestorForms((prev) => {
                                const newForms = [...prev];
                                newForms[index].amount = Number(e.target.value);
                                return newForms;
                              });
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Investor Document
                        </label>
                        {form.isExisting && form.existingDocumentUrl && (
                          <div className="mb-2 p-2 bg-white rounded border">
                            <p className="text-sm text-gray-600">
                              📄 Current document available -{" "}
                              <a
                                href={form.existingDocumentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                View Current
                              </a>
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          onChange={(e) =>
                            handleInvestorDocumentUpload(
                              index,
                              e.target.files?.[0] || null,
                              "update"
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          accept=".pdf,.doc,.docx"
                        />
                        {updateInvestorFiles[index.toString()] && (
                          <p className="text-sm text-green-600 mt-1">
                            📄 {updateInvestorFiles[index.toString()].name}{" "}
                            selected{" "}
                            {form.isExisting &&
                              "(will replace current document)"}
                          </p>
                        )}
                        {form.isExisting &&
                          !updateInvestorFiles[index.toString()] && (
                            <p className="text-xs text-gray-500 mt-1">
                              Leave empty to keep current document
                            </p>
                          )}
                      </div>
                    </div>
                  ))}

                  {updateInvestorForms?.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No investors</p>
                      <p className="text-sm text-gray-400">
                        Click "Add Investor" to add investors to this fund
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 justify-end pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateForm(false);
                      resetUpdateForm();
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    {updateMutation.isPending ? "Updating..." : "Update Fund"}
                  </button>
                </div>
              </form>

              {updateMutation.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">
                    Error: {(updateMutation.error as Error).message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FundTestComponent />
    </QueryClientProvider>
  );
}

export default App;
