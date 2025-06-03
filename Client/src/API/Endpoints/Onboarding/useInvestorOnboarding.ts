import { useMutation, useQuery } from "@tanstack/react-query";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";
import type { InvestorOnboardingPayload } from "../../../Onboarding/types";
// Update this import path as needed

// --------------- API response types ---------------
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

interface OnboardingStatusResponse {
  status: string;
  rejectionNote?: string;
}
interface OnboardingInfoResponse {
  id: string;
  userId: string;
  formData: InvestorOnboardingPayload;
  status: string;
  createdAt: string;
  updatedAt: string;
  documents?: Array<{
    id: string;
    type: string;
    url: string;
    fileName: string;
  }>;
}

// Add new types for document uploads
interface UploadedDocument {
  url: string;
  key: string;
  fileName: string;
  type: string;
}

interface DocumentUploadResponse extends ApiResponse {
  data: UploadedDocument[];
}

// --------------- API hooks ---------------

// Start onboarding (POST)
export const useStartOnboarding = () =>
  useMutation<ApiResponse, Error, { formData: InvestorOnboardingPayload }>({
    mutationFn: async (payload) => {
      // Decode URLs before sending
      const formData = {
        ...payload.formData,
        kycDocumentUrl: payload.formData.kycDocumentUrl
          ? decodeURIComponent(payload.formData.kycDocumentUrl)
          : undefined,
        proofOfAddressUrl: payload.formData.proofOfAddressUrl
          ? decodeURIComponent(payload.formData.proofOfAddressUrl)
          : undefined,
      };

      const res = await axiosPrivate.post("/onboarding/investor/start", {
        formData,
      });
      return res.data;
    },
  });

// Update onboarding (PUT)
export const useUpdateOnboarding = () =>
  useMutation<ApiResponse, Error, { formData: InvestorOnboardingPayload }>({
    mutationFn: async (payload) => {
      // Decode URLs before sending
      const formData = {
        ...payload.formData,
        kycDocumentUrl: payload.formData.kycDocumentUrl
          ? decodeURIComponent(payload.formData.kycDocumentUrl)
          : undefined,
        proofOfAddressUrl: payload.formData.proofOfAddressUrl
          ? decodeURIComponent(payload.formData.proofOfAddressUrl)
          : undefined,
      };

      const res = await axiosPrivate.put("/onboarding/investor/update", {
        formData,
      });
      return res.data;
    },
  });

// Get onboarding status (GET)
export const useOnboardingStatus = () =>
  useQuery<ApiResponse<OnboardingStatusResponse>, Error>({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/onboarding/investor/status");
      return res.data;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });

export const useOnboardingInfo = (options?: { enabled?: boolean }) =>
  useQuery<ApiResponse<OnboardingInfoResponse>, Error>({
    queryKey: ["onboarding-info"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/onboarding/investor/info");
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
  });

// Add document upload mutation
export const useDocumentUpload = () =>
  useMutation<DocumentUploadResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const res = await axiosPrivate.post("/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
  });

// Add document deletion mutation
export const useDocumentDelete = () =>
  useMutation<ApiResponse, Error, string>({
    mutationFn: async (fileKey) => {
      const res = await axiosPrivate.delete(`/api/documents/${fileKey}`);
      return res.data;
    },
  });

// Helper function to prepare document FormData
export const prepareDocumentUpload = (files: { [key: string]: File }) => {
  const formData = new FormData();

  Object.entries(files).forEach(([type, file]) => {
    // Append each file with field name 'documents'
    formData.append("documents", file);
    // Append document type to identify the file
    formData.append("documentTypes[]", type);
  });

  return formData;
};
