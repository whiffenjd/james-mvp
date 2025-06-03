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

// --------------- API hooks ---------------

// Start onboarding (POST)
export const useStartOnboarding = () =>
  useMutation<ApiResponse, Error, { formData: InvestorOnboardingPayload }>({
    mutationFn: async (payload) => {
      const res = await axiosPrivate.post(
        "/onboarding/investor/start",
        payload
      );
      return res.data;
    },
  });

// Update onboarding (PUT)
export const useUpdateOnboarding = () =>
  useMutation<ApiResponse, Error, { formData: InvestorOnboardingPayload }>({
    mutationFn: async (payload) => {
      const res = await axiosPrivate.put(
        "/onboarding/investor/update",
        payload
      );
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
