import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";

// Types for API payloads and responses
export type Distribution = {
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

export type CreateDistributionPayload = {
  fundId: string;
  investorId: string;
  amount: string;
  date: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  description: string;
};

export type UpdateDistributionStatusPayload = {
  id: string;
  status: "approved" | "rejected";
};

export type UpdateDistributionPayload = Partial<CreateDistributionPayload>;

export type PaginatedDistributions = {
  data: Distribution[];
  totalItems: number;
  totalPages: number;
};

// Hook to fetch paginated distributions for the logged-in user
export const useGetDistributions = ({
  page,
  limit,
  fundId,
}: {
  page: number;
  limit: number;
  fundId?: string; // Optional fundId parameter
}) => {
  return useQuery<PaginatedDistributions, Error>({
    queryKey: ["distributions", page, limit, fundId], // Include fundId in queryKey
    queryFn: async () => {
      const params = { page, limit };
      if (fundId) {
        params.fundId = fundId; // Add fundId to params if provided
      }
      const response = await axiosPrivate.get("/distribution/list", {
        params,
      });
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch distributions");
    },
  });
};

// Hook to create a new distribution
export const useCreateDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation<Distribution, Error, CreateDistributionPayload>({
    mutationFn: async (payload) => {
      const response = await axiosPrivate.post("/distribution/create", payload);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Distribution created successfully");
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create distribution");
    },
  });
};

// Hook to update distribution status
export const useUpdateDistributionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<Distribution, Error, UpdateDistributionStatusPayload>({
    mutationFn: async ({ id, status }) => {
      const response = await axiosPrivate.patch(`/distribution/${id}/status`, {
        status,
      });
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Distribution status updated");
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update distribution status");
    },
  });
};

// Hook to update a distribution
export const useUpdateDistribution = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Distribution,
    Error,
    { id: string; payload: UpdateDistributionPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const response = await axiosPrivate.patch(`/distribution/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Distribution updated successfully");
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update distribution");
    },
  });
};
