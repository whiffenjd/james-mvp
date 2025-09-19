import React, { useEffect, useState } from "react";
import { X, FileText, Trash2, Plus, PenLine } from "lucide-react";
import toast from "react-hot-toast";
import { useInvestors } from "../../FundManager/hooks/useInvestors";
import { useCreateFund, useUpdateFund } from "../../API/Endpoints/Funds/funds";

interface FormData {
  name: string;
  fundSize: string;
  fundType: string;
  targetGeographies: string;
  targetSectors: string;
  targetMOIC: string;
  targetIRR: string;
  minimumInvestment: string;
  fundLifetime: string;
  fundDescription: string;
  id?: string;
  investors?: Investor[];
  documents?: Document[];
}

interface SubmitData {
  name: string;
  fundSize: string;
  fundType: string;
  targetGeographies: string;
  targetSectors: string;
  targetMOIC: string;
  targetIRR: string;
  minimumInvestment: string;
  fundLifetime: string;
  fundDescription: string;
  documents: Document[];
  investors: Investor[];
}

interface Document {
  id: number;
  name: string;
  size: string;
  uploaded: boolean;
  file?: File; // Add this
  url: string; // Add this
  fileUrl: string; // Add this
}

interface Investor {
  id: string;
  name: string;
  amount: string | number;
  files: File[];
  documentUrl?: string;
  addedAt?: string;
  investorId?: string;
}

interface InvestorOption {
  id: string;
  name: string;
}

// interface FundModalProps {
//   isOpen?: boolean;
//   onClose?: () => void;
//   onSubmit?: (data: SubmitData) => void;
//   initialData?: any;
//   mode?: "create" | "edit";
// }
interface FundModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: SubmitData) => void;
  initialData?: any;
  mode?: "create" | "edit";
}

const FundModal: React.FC<FundModalProps> = ({
  isOpen = true,
  onClose = () => { },
  initialData = null,
  mode = "create",
}) => {
  const [formData, setFormData] = useState<any>({
    name: initialData?.name || "",
    fundSize: initialData?.fundSize || "",
    fundType: initialData?.fundType || "",
    targetGeographies: initialData?.targetGeographies || "",
    targetSectors: initialData?.targetSectors || "",
    targetMOIC: initialData?.targetMOIC || "",
    targetIRR: initialData?.targetIRR || "",
    minimumInvestment: initialData?.minimumInvestment || "",
    fundLifetime: initialData?.fundLifetime || "",
    fundDescription: initialData?.fundDescription || "",
  });

  const createFundMutation = useCreateFund();
  const UpdateFund = useUpdateFund();

  const [documents, setDocuments] = useState<any[]>([]);

  const [investors, setInvestors] = useState<any[]>([]);
  const [investorOptions, setInvestorOptions] = useState<InvestorOption[]>([]);
  const [isCreateInvestorOpen, setIsCreateInvestorOpen] =
    useState<boolean>(false);
  const [investor, setInvestor] = useState<any>(null);
  // const [investor, setInvestor] = useState<InvestorOption | null>(null);
  const [amount, setAmount] = useState<string | number>("");
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [previewSrc, setPreviewSrc] = useState<any>("");
  const [creating, setCreating] = useState<boolean>(false);

  const { investors: investorsData } = useInvestors();

  useEffect(() => {
    if (investorsData) {
      const options = investorsData?.map((investor) => ({
        id: investor.id,
        name: investor.name,
      }));
      setInvestorOptions(options);
    }
  }, [investorsData]);

  const handleReset = () => {
    setFormData({
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
    });
    setAmount("");
    setInvestor({
      name: "",
      id: "",
    });
    setInvestors([]);
    setFiles([]);
    setDocuments([]);
  };

  useEffect(() => {
    if (isOpen === false) {
      handleReset();
    }
    if (mode === "edit") {
      setFormData({
        name: initialData?.name || "",
        fundSize: initialData?.fundSize || "",
        fundType: initialData?.fundType || "",
        targetGeographies: initialData?.targetGeographies || "",
        targetSectors: initialData?.targetSectors || "",
        targetMOIC: initialData?.targetMOIC || "",
        targetIRR: initialData?.targetIRR || "",
        minimumInvestment: initialData?.minimumInvestment || "",
        fundLifetime: initialData?.fundLifetime || "",
        fundDescription: initialData?.fundDescription || "",
      });

      if (initialData?.investors) {
        const mappedInvestors = initialData?.investors?.map(
          (inv: any, index: any) => ({
            id: inv.investorId,
            name: inv.name,
            amount: inv.amount,
            files: [
              {
                id: 0,
                name: inv?.documentUrl?.split("/").pop() || `Document ${index}`,
                size: "N/A",
                uploaded: true,
                url: inv.documentUrl,
              },
            ],
          })
        );
        setInvestors(mappedInvestors);
      }
      if (initialData?.documents) {
        const mappedDocuments = initialData.documents.map(
          (doc: any, index: any) => ({
            id: index,
            name: doc?.fileUrl?.split("/")?.pop() || `Document ${index}`,
            size: "N/A",
            uploaded: true,
            url: doc.fileUrl || doc,
          })
        );
        setDocuments(mappedDocuments);
      }
    }
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleAdd = () => {
    if (!investor?.id || !amount || files?.length === 0) {
      toast.error("Please fill all the fields before submitting the form");
      return;
    }

    setInvestors((prev) => [
      ...prev,
      {
        id: investor.id,
        name: investor.name,
        amount: amount,
        files,
      },
    ]);

    // Reset form
    setInvestor({ name: "", id: "" });
    setAmount("");
    setFiles([]);
    setIsCreateInvestorOpen(false);
  };

  const handleEditInvestor = (id: string): void => {
    const selected = investors.find((inv) => inv.id === id);
    if (selected) {
      setInvestor({ id: selected.id, name: selected.name });
      setAmount(selected.amount);
      setFiles(selected.files);
      setIsCreateInvestorOpen(true);

      // Remove the old version from list to replace on re-add
      setInvestors((prev) => prev.filter((inv) => inv.id !== id));
    }
  };

  const handleDeleteInvestor = (id: string): void => {
    setInvestors((prev) => prev.filter((investor) => investor.id !== id));
  };

  const handleInputChange = (field: any, value: any): void => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate required fields
    const requiredFields: Array<keyof FormData> = [
      "name",
      "fundSize",
      "fundType",
      "targetGeographies",
      "targetSectors",
      "targetMOIC",
      "targetIRR",
      "minimumInvestment",
      "fundLifetime",
      "fundDescription",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
        toast.error(`${field} is required`);
      }
    });

    // Validate documents
    if (documents.length === 0) {
      toast.error("At least one document is required");
      return false;
    }

    //TODO : WHILE REMOVING INVESTOR REQUIREMENT, I HAVE COMMENTED THE REQUIREMENT FOR INVESTOR DOCS AS WELL
    // // Validate investor documents
    // for (const investor of investors) {
    //   if (!investor.files || investor.files.length === 0) {
    //     toast.error(`Document required for investor ${investor.name}`);
    //     return false;
    //   }
    // }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setCreating(true);

    try {
      await createFundMutation.mutateAsync({
        ...formData,
        documents,
        investors,
      });

      // Reset form and close modal on success
      handleReset();
      onClose();
      setCreating(true);
    } catch (error) {
      // toast.error(error.message || "Failed to create fund");
      toast.error((error as Error).message || "Failed to create fund");
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setCreating(true);

    try {
      // Build structured data
      const updateData = {
        name: formData.name,
        fundSize: formData.fundSize,
        fundType: formData.fundType,
        targetGeographies: formData.targetGeographies,
        targetSectors: formData.targetSectors,
        targetMOIC: formData.targetMOIC,
        targetIRR: formData.targetIRR,
        minimumInvestment: formData.minimumInvestment,
        fundLifetime: formData.fundLifetime,
        fundDescription: formData.fundDescription,
        existingDocuments: documents
          .filter((doc) => doc.url)
          .map((doc) => doc.url),
        investors: investors.map((investor) => ({
          investorId: investor.id,
          name: investor.name,
          amount: investor.amount,
          documentUrl:
            investor.files?.[0] instanceof File
              ? investor.files[0].name
              : investor.files?.[0]?.url || "",
          addedAt: new Date().toISOString(),
        })),
      };

      // Prepare files
      const fundDocuments = documents
        .filter((doc) => doc.file)
        .map((doc) => doc.file);

      const investorDocuments: { [index: number]: File } = {};
      investors.forEach((investor, index) => {
        if (
          investor.files &&
          investor.files.length > 0 &&
          investor.files[0] instanceof File
        ) {
          investorDocuments[index] = investor.files[0];
        }
      });

      await UpdateFund.mutateAsync({
        id: initialData?.id,
        data: updateData,
        fundDocuments,
        investorDocuments,
      });

      handleReset();
      onClose();
      setCreating(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update fund"
      );
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        if (!previewFile) {
          onClose();
        }
      }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] relative py-8 font-poppins"
      >
        {/* Header */}
        <div className="flex items-center justify-center pb-8">
          <h2 className="text-xl font-semibold text-theme-primary-text ">
            {mode === "create" ? "Fund Creation" : "Edit Fund"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded absolute right-5 top-5"
          >
            <X className="w-6 h-6 text-theme-primary-text" />
          </button>
        </div>

        <div className="p-6 px-12 pt-2 overflow-y-auto max-h-[70vh]">
          {/* Enter Details Section */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-theme-primary-text mb-6">
              {mode === "create" ? "Enter Details" : "Update Details"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData?.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Fund Size"
                  value={formData?.fundSize}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("fundSize", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Fund Type"
                  value={formData?.fundType}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("fundType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Target Geographies"
                  value={formData?.targetGeographies}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("targetGeographies", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Target Sectors"
                  value={formData?.targetSectors}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("targetSectors", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Target MOIC"
                  value={formData?.targetMOIC}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("targetMOIC", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Target IRR"
                  value={formData?.targetIRR}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("targetIRR", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Minimum Investment"
                  value={formData?.minimumInvestment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("minimumInvestment", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Fund Lifetime"
                  value={formData?.fundLifetime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("fundLifetime", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Fund Description"
                  value={formData?.fundDescription}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("fundDescription", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-theme-secondary-text mb-4">
              Let's Add some Documents!
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Upload Area */}
              <div
                className={`bg-gray-50 max-h-[300px] border rounded-[10px] p-8 text-center relative min-h-[300px] flex flex-col items-center justify-center border-dashed transition-all ${dragActive ? "border-theme-sidebar-accent bg-gray-100" : ""
                  }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const droppedFiles = Array.from(e.dataTransfer.files || []);
                  const newDocs = droppedFiles.map((file) => ({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                    uploaded: true,
                    file,
                  }));
                  setDocuments((prev) => [...prev, ...newDocs]);
                }}
              >
                <FileText
                  className="w-12 h-12 text-theme-secondary-text mx-auto mb-4"
                  strokeWidth={1}
                />
                <p className="text-sm text-theme-secondary-text mb-2">
                  Fund Raising Document
                </p>
                <p className="text-xs text-theme-secondary-text mb-4">
                  Click or drag & drop files here (max 50MB each)
                </p>
                <input
                  id="fileUploadInput"
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    const MAX_SIZE_MB = 50;

                    const validFiles = selectedFiles.filter((file) => {
                      const isPdf = file?.type === "application/pdf";
                      const originalName = file?.name;
                      const truncatedName =
                        originalName.length > 25
                          ? originalName.slice(0, 23) + "..."
                          : originalName;

                      if (!isPdf) {
                        toast.error(`"${truncatedName}" is not a PDF file.`);
                        return false;
                      }

                      if (file?.size > MAX_SIZE_MB * 1024 * 1024) {
                        toast.error(
                          `File limit exceeded:File "${truncatedName}" exceeds 50MB and was not added. `
                        );

                        return false;
                      }
                      return true;
                    });

                    const newDocs = validFiles?.map((file) => ({
                      id: Date.now() + Math.random(),
                      name: file.name,
                      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                      uploaded: true,
                      file,
                    }));

                    setDocuments((prev) => [...prev, ...newDocs]);
                  }}
                />
                <button
                  onClick={() =>
                    document.getElementById("fileUploadInput")?.click()
                  }
                  className="bg-theme-sidebar-accent text-white px-4 py-2 rounded-md transition-colors"
                >
                  Upload Docs
                </button>
              </div>

              {/* Document List */}
              <div className="space-y-2 bg-gray-50 border rounded-[10px] max-h-[300px] overflow-y-auto p-4">
                {documents.length === 0 ? (
                  <p className="text-sm text-theme-secondary-text text-center pt-12">
                    No documents uploaded yet
                  </p>
                ) : (
                  documents.map((doc, index) => (
                    <div
                      key={doc?.id}
                      className="flex items-center justify-between p-3 "
                    >
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => setPreviewFile(doc?.file || doc)}
                      >
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-theme-primary-text">
                            {/* {doc.name} */}
                            {doc?.name.length > 25
                              ? doc?.name.slice(0, 23) + "..."
                              : doc?.name}
                          </p>
                          <p className="text-xs text-gray-500">{doc?.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {mode === "edit" ? (
                          <button
                            onClick={() => {
                              setPreviewSrc(doc?.url);
                              setPreviewFile(doc?.file);
                            }}
                            className="px-3 py-0.5 text-xs bg-theme-sidebar-accent rounded-[10px] text-white cursor-pointer"
                          >
                            View
                          </button>
                        ) : (
                          <button
                            onClick={() => setPreviewFile(doc?.file || doc)}
                            className="px-3 py-0.5 text-xs bg-theme-sidebar-accent rounded-[10px] text-white cursor-pointer"
                          >
                            View
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setDocuments((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h3 className="text-lg font-medium text-theme-secondary-text mb-4">
                Add Investors
              </h3>
              {isCreateInvestorOpen ? (
                <button
                  onClick={() => {
                    setIsCreateInvestorOpen(false);
                    setInvestor({
                      name: "",
                      id: "",
                    });
                    setFiles([]);
                    setAmount("");
                  }}
                  className="flex items-center space-x-2 px-6 py-2 border border-theme-primary-text rounded-[10px] hover:bg-gray-50 transition-colors"
                >
                  <span>Close </span>
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsCreateInvestorOpen(true)}
                  className="flex items-center space-x-2 px-6 py-2 border border-theme-primary-text rounded-[10px] hover:bg-gray-50 transition-colors"
                >
                  <span>Add </span>
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Investors Section */}

          {isCreateInvestorOpen && (
            <div className="p-6 bg-gray-100 rounded-[10px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <select
                      value={investor?.id || ""}
                      onChange={(e) => {
                        const selected = investorOptions.find(
                          (opt) => opt.id === e.target.value
                        );
                        setInvestor(selected || {});
                      }}
                      className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text text-theme-primary-text bg-white"
                    >
                      <option value="">Select Investor</option>
                      {investorOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-theme-primary-text rounded-md focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:border-transparent placeholder:text-theme-secondary-text"
                    />
                  </div>
                </div>

                <div className="relative">
                  {files.length === 0 ? (
                    <div
                      className={`w-full h-full border-2 border-dashed rounded-[10px] transition-colors ${dragActive
                        ? "border-theme-sidebar-accent bg-gray-50"
                        : "border-gray-300 bg-gray-50"
                        } flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        const dropped = e.dataTransfer.files?.[0];
                        const MAX_SIZE_MB = 50;

                        if (!dropped) return;
                        if (dropped.type !== "application/pdf") {
                          toast.error("Only PDF files are allowed.");
                          return;
                        }
                        if (dropped.size > MAX_SIZE_MB * 1024 * 1024) {
                          toast.error("File exceeds the 50MB limit.");
                          return;
                        }

                        setFiles([dropped]);
                      }}
                      onClick={() =>
                        document.getElementById("fileInput")?.click()
                      }
                    >
                      <FileText
                        className="w-12 h-12 text-theme-secondary-text mx-auto mb-4"
                        strokeWidth={1}
                      />
                      <p className="text-sm text-theme-secondary-text text-center px-2">
                        Click or drag a PDF here to upload (max 50MB)
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full border-2  shadow-sm rounded-[10px] transition-colors  flex flex-col items-start justify-start cursor-pointer hover:bg-gray-100 p-1`}
                    >
                      <div className=" rounded-[10px] px-4 py-3 flex justify-between items-center w-full">
                        <span
                          onClick={() => setPreviewFile(files[0])}
                          className="text-sm truncate max-w-[80%]"
                        >
                          {files[0]?.name.length > 30
                            ? `${files[0]?.name.slice(0, 27)}...`
                            : files[0]?.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          {mode === "edit" ? (
                            <button
                              onClick={() => {
                                setPreviewFile(files[0]);
                                setPreviewSrc(files[0]?.url);
                              }}
                              className="px-3 py-0.5 text-xs bg-theme-sidebar-accent rounded-[10px] text-white cursor-pointer"
                            >
                              View
                            </button>
                          ) : (
                            <button
                              onClick={() => setPreviewFile(files[0])}
                              className="px-3 py-0.5 text-xs bg-theme-sidebar-accent rounded-[10px] text-white cursor-pointer"
                            >
                              View
                            </button>
                          )}

                          <button
                            onClick={() => setFiles([])}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    id="fileInput"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="mt-10 mb-4 flex justify-center items-center">
                <button
                  onClick={handleAdd}
                  className="w-full bg-theme-sidebar-accent max-w-[322px] text-white font-medium py-3 px-4 rounded-[10px] transition-colors focus:outline-none focus:ring-2 focus:ring-theme-sidebar-accent focus:ring-offset-2  "
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {investors.length > 0 && (
            <div className="mb-6 mt-6 font-poppins">
              <div className="bg-gray-100 rounded-[10px] p-4 px-3">
                <div className="grid grid-cols-3 gap-4 mb-6 mt-2 text-base">
                  <div className="font-medium text-gray-700">Investor Name</div>
                  <div className="font-medium text-gray-700">Amount</div>
                  <div className="font-medium text-gray-700">Actions</div>
                </div>

                {investors.map((investor: Investor) => (
                  <div
                    key={investor.id}
                    className="grid grid-cols-3 gap-4 py-3"
                  >
                    <div className="text-theme-primary-text">
                      {investor.name}
                    </div>
                    <div className="text-theme-primary-text">
                      {investor.amount}
                    </div>
                    <div className="flex space-x-5">
                      <button
                        onClick={() => handleEditInvestor(investor.id)}
                        className="px-4 py-3 bg-theme-sidebar-accent text-white text-sm rounded-[10px] flex justify-center items-center transition-colors  min-w-[100px]"
                      >
                        <PenLine strokeWidth={2} size={16} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInvestor(investor.id)}
                        className="px-4 py-3 bg-theme-sidebar-accent text-white text-sm rounded-[10px] flex justify-center items-center transition-colors min-w-[100px]"
                      >
                        <Trash2 strokeWidth={2} size={16} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {/* <div className="flex justify-end">
            {mode === "edit" ? (
              <button
                onClick={handleUpdate}
                disabled={mode === "create" || creating}
                className="w-full bg-theme-sidebar-accent text-white py-3 rounded-[10px] transition-colors font-medium"
              >
                {creating ? "updating..." : "Update"}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={mode === "edit" || creating}
                className="w-full bg-theme-sidebar-accent text-white py-3 rounded-[10px] transition-colors font-medium"
              >
                {creating ? "submitting..." : "Submit"}
              </button>
            )}
          </div> */}
          <div className="flex justify-end">
            {mode === "edit" ? (
              <button
                onClick={handleUpdate}
                disabled={creating} // Only need to check creating state since we're already in edit mode
                className="w-full bg-theme-sidebar-accent text-white py-3 rounded-[10px] transition-colors font-medium"
              >
                {creating ? "updating..." : "Update"}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={creating} // Only need to check creating state since we're already in create mode
                className="w-full bg-theme-sidebar-accent text-white py-3 rounded-[10px] transition-colors font-medium"
              >
                {creating ? "submitting..." : "Submit"}
              </button>
            )}
          </div>
        </div>
      </div>
      {(previewFile || previewSrc) && (
        <div
          onClick={() => {
            setPreviewFile(null);
            setPreviewSrc("");
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="bg-white rounded-[40px] w-[70%] max-w-2xl max-h-[70vh] relative p-8 py-8  font-poppins"
          >
            <button
              onClick={() => {
                setPreviewFile(null);
                setPreviewSrc("");
              }}
              className="p-1 hover:bg-gray-100 rounded absolute right-5 top-5"
            >
              <X className="w-6 h-6 text-theme-primary-text" />
            </button>

            <h2 className="text-lg font-semibold mb-4 text-theme-primary-text">
              Preview: {previewFile?.name || "Document"}
            </h2>
            {mode === "edit" && !previewFile ? (
              <div className="flex-1 p-4 h-full">
                <iframe
                  src={previewSrc || undefined}
                  className="w-full h-[60vh] border-0 rounded"
                  title="Fundraising Document"
                />
              </div>
            ) : (
              <>
                {previewFile?.type?.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(previewFile)}
                    alt="Preview"
                    className="max-w-full max-h-[70vh] h-full object-contain"
                  />
                ) : previewFile?.type === "application/pdf" ? (
                  <iframe
                    // src={URL.createObjectURL(previewFile)}
                    src={
                      previewFile ? URL.createObjectURL(previewFile) : undefined
                    }
                    className="w-full h-[60vh] border rounded"
                    title="PDF Preview"
                  />
                ) : (
                  <>
                    {previewSrc ? (
                      <div className="flex-1 p-4 h-full">
                        <iframe
                          src={previewSrc || undefined}
                          className="w-full h-[55vh] border-0 rounded"
                          title="Fundraising Document"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">
                        Cannot preview this file type. Please download to view.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundModal;
