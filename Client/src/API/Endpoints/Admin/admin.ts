import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";
import axios from "axios";

// Types for API responses
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  projectCount: number;
  investorCount: number;
  subdomain: string;
};

export type PaginatedAdminUsers = {
  data: AdminUser[];
  totalItems: number;
  totalPages: number;
};

export type SubdomainCheckResponse = {
  subdomain: string;
  isAvailable: boolean;
};

export type FundManagerInput = {
  name: string;
  email: string;
  password: string;
  subdomain: string;
};

export type FundManagerResponse = {
  id: string;
  name: string;
  email: string;
  subdomain: string;
  createdAt: string;
};

// Hook to check subdomain availability
export const useCheckSubdomain = () => {
  const queryClient = useQueryClient();

  return {
    checkSubdomain: async (subdomain: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ["checkSubdomain", subdomain],
        queryFn: async () => {
          console.log("calling subdomain checker", subdomain);
          const response = await axiosPrivate.get("/admin/check-subdomain", {
            params: { subdomain },
          });
          return response.data.data;
        },
        staleTime: 0,
      });
      return data;
    },
  };
};

// Hook to create a fund manager
export const useCreateFundManager = () => {
  const queryClient = useQueryClient();
  return useMutation<FundManagerResponse, Error, FundManagerInput>({
    mutationFn: async (input) => {
      const response = await axiosPrivate.post("/admin/fund-managers", input);
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success(`Fund manager ${data.name} created successfully`);
      // Invalidate fund managers query to refresh list
      queryClient.invalidateQueries({ queryKey: ["fundManagers"] });
    },
    onError: (error) => {
      let errorMessage = "Failed to create fund manager";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};

// Hook to fetch paginated fund managers
export const useGetFundManagers = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery<PaginatedAdminUsers, Error>({
    queryKey: ["fundManagers", page, limit],
    queryFn: async () => {
      const response = await axiosPrivate.get("/admin/fund-managers", {
        params: { page, limit },
      });
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

// Hook to delete a fund manager
export const useDeleteFundManager = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await axiosPrivate.delete(`/admin/fund-managers/${id}`);
    },
    onSuccess: () => {
      toast.success("Fund manager deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["fundManagers"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete fund manager");
    },
  });
};

// Hook to fetch paginated investors
export const useGetInvestors = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery<PaginatedAdminUsers, Error>({
    queryKey: ["investors", page, limit],
    queryFn: async () => {
      const response = await axiosPrivate.get("/admin/investors", {
        params: { page, limit },
      });
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

// Hook to delete an investor
export const useDeleteInvestor = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await axiosPrivate.delete(`/admin/investors/${id}`);
    },
    onSuccess: () => {
      toast.success("Investor deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["investors"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete investor");
    },
  });
};
