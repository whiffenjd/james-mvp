// src/api/managerOnboarding.ts

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";
import type { InvestorOnboardingPayload } from "../../../Onboarding/types";

// ---------- API Types ----------
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface InvestorListItem {
  id: string;
  name: string;
  email: string;
  onboardingStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface PaginatedInvestorResponse {
  data: InvestorListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type InvestorsApiResponse = ApiResponse<PaginatedInvestorResponse>;

export interface InvestorOnboardingDetails {
  id: string;
  userId: string;
  formData: InvestorOnboardingPayload;
  status: string;
  rejectionNote: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
  documents?: Array<{
    id: string;
    type: string;
    url: string;
    fileName: string;
  }>;
}
export type InvestorDetailsApiResponse = ApiResponse<InvestorOnboardingDetails>;

export interface UpdateOnboardingStatusRequest {
  status: "pending" | "approved" | "rejected";
  rejectionNote?: string;
}

// ---------- API Hooks ----------

// Paginated Investors List
interface UseInvestorsListParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
}
export const useInvestorsList = (params: UseInvestorsListParams = {}) =>
  useQuery<InvestorsApiResponse, Error>({
    queryKey: [
      "manager-investors",
      params.page ?? 1,
      params.limit ?? 10,
      params.status ?? null,
    ],
    queryFn: async () => {
      const res = await axiosPrivate.get("/list/investors", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

// Single Investor Details
export const useInvestorDetails = (
  investorId: string,
  options?: { enabled?: boolean }
) =>
  useQuery<InvestorDetailsApiResponse, Error>({
    queryKey: ["manager-investor-details", investorId],
    queryFn: async () => {
      const res = await axiosPrivate.get(`/list/investors/${investorId}`);
      return res.data;
    },
    enabled: options?.enabled ?? !!investorId,
    staleTime: 60 * 1000,
  });

// Update Onboarding Status
export const useUpdateOnboardingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse,
    Error,
    { onboardingId: string; data: UpdateOnboardingStatusRequest }
  >({
    mutationFn: async ({ onboardingId, data }) => {
      const res = await axiosPrivate.put(
        `/list/onboarding/${onboardingId}/status`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-investors"] });
    },
  });
};

// Delete Onboarding
export const useDeleteOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, string>({
    mutationFn: async (onboardingId) => {
      const res = await axiosPrivate.delete(`/list/onboarding/${onboardingId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-investors"] });
    },
  });
};
