import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";

// Types for API payloads and responses
export type CapitalCall = {
  id: string;
  fundId: string;
  investorId: string;
  createdBy: string;
  amount: string;
  date: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type CreateCapitalCallPayload = {
  fundId: string;
  investorId: string;
  amount: string;
  date: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  description: string;
};

export type UpdateCapitalCallStatusPayload = {
  id: string;
  status: "approved" | "rejected";
};

export type UpdateCapitalCallPayload = Partial<CreateCapitalCallPayload>;

export type PaginatedCapitalCalls = {
  data: CapitalCall[];
  totalItems: number;
  totalPages: number;
};

// Hook to fetch paginated capital calls for the logged-in user
export const useGetCapitalCalls = ({
  page,
  limit,
  fundId,
}: {
  page: number;
  limit: number;
  fundId?: string; // Optional fundId parameter
}) => {
  return useQuery<PaginatedCapitalCalls, Error>({
    queryKey: ["capitalCalls", page, limit, fundId], // Include fundId in queryKey
    queryFn: async () => {
      const params = { page, limit };
      if (fundId) {
        params.fundId = fundId; // Add fundId to params if provided
      }
      const response = await axiosPrivate.get("/capital-call/list", {
        params,
      });
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch capital calls");
    },
  });
};

// Hook to create a new capital call
export const useCreateCapitalCall = () => {
  const queryClient = useQueryClient();
  return useMutation<CapitalCall, Error, CreateCapitalCallPayload>({
    mutationFn: async (payload) => {
      const response = await axiosPrivate.post("/capital-call/create", payload);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Capital call created successfully");
      queryClient.invalidateQueries({ queryKey: ["capitalCalls"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create capital call");
    },
  });
};

// Hook to update capital call status
export const useUpdateCapitalCallStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<CapitalCall, Error, UpdateCapitalCallStatusPayload>({
    mutationFn: async ({ id, status }) => {
      const response = await axiosPrivate.patch(`/capital-call/${id}/status`, {
        status,
      });
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Capital call status updated");
      queryClient.invalidateQueries({ queryKey: ["capitalCalls"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update capital call status");
    },
  });
};

// Hook to update a capital call
export const useUpdateCapitalCall = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CapitalCall,
    Error,
    { id: string; payload: UpdateCapitalCallPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const response = await axiosPrivate.patch(`/capital-call/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Capital call updated successfully");
      queryClient.invalidateQueries({ queryKey: ["capitalCalls"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update capital call");
    },
  });
};
