import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";

// ---------- API Types ----------
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface KycDocument {
  id: string;
  userId: string;
  formData: {
    investorType: "individual" | "entity";
    kycDocumentUrl?: string;
    proofOfAddressUrl?: string;
    entityDocuments?: { url: string; type: string }[];
    documentStatus:
      | "pending_upload"
      | "submitted"
      | "under_review"
      | "approved"
      | "reupload_requested";
    documentNote?: string | null;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  investorName: string;
}

export interface PaginatedKycDocumentResponse {
  data: KycDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type KycDocumentsApiResponse = ApiResponse<PaginatedKycDocumentResponse>;

export interface UpdateKycDocumentPayload {
  formData: {
    investorType: "individual" | "entity";
    kycDocumentUrl?: string;
    proofOfAddressUrl?: string;
    entityDocuments?: { url: string; type: string }[];
  };
}

export interface RequestReuploadPayload {
  reuploadNote: string;
}

// ---------- API Hooks ----------

// Paginated KYC Documents List
interface UseKycDocumentsParams {
  page?: number;
  limit?: number;
  status?:
    | "pending_upload"
    | "submitted"
    | "under_review"
    | "approved"
    | "reupload_requested";
  investorName?: string;
}

export const useKycDocuments = (params: UseKycDocumentsParams = {}) =>
  useQuery<KycDocumentsApiResponse, Error>({
    queryKey: [
      "kyc-documents",
      params.page ?? 1,
      params.limit ?? 10,
      params.status ?? null,
      params.investorName ?? null,
    ],
    queryFn: async () => {
      const res = await axiosPrivate.get("/kyc-documents", {
        params,
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

// Update KYC Document
export const useUpdateKycDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<KycDocument>,
    Error,
    { id: string; data: UpdateKycDocumentPayload }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await axiosPrivate.put(`/kyc-documents/update/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-documents"] });
    },
  });
};

// Approve KYC Document
export const useApproveKycDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<KycDocument>, Error, string>({
    mutationFn: async (id) => {
      const res = await axiosPrivate.put(`/kyc-documents/approve/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-documents"] });
    },
  });
};

// Request Reupload
export const useRequestReupload = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<KycDocument>,
    Error,
    { id: string; data: RequestReuploadPayload }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await axiosPrivate.put(
        `/kyc-documents/request-reupload/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-documents"] });
    },
  });
};

// Download KYC Document
export const useDownloadKycDocument = () => {
  return useMutation<
    string,
    Error,
    { id: string; docType: "kyc" | "proofOfAddress" | "entityDocument" }
  >({
    mutationFn: async ({ id, docType }) => {
      const res = await axiosPrivate.get(
        `/kyc-documents/${id}/download/${docType}`
      );
      const { url } = res.data.data; // Assuming sendSuccessResponse packs it in { data: { url } }
      return url;
    },
    onSuccess: (url) => {
      // Trigger file download in browser
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", ""); // Filename comes from S3 Content-Disposition
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });
};
