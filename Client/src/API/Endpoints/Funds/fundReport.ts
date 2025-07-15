import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";

// Types for API payloads and responses
export type FundReport = {
  id: string;
  fundId: string;
  createdBy: string;
  projectName: string;
  description: string;
  documentUrl: string;
  year: string;
  quarter: string;
  createdAt: string;
};

export type CreateFundReportPayload = {
  fundId: string;
  projectName: string;
  description: string;
  year: string;
  quarter: string;
  document: File; // For file upload
};

export type PaginatedFundReports = {
  results: FundReport[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Hook to fetch paginated fund reports by fund
export const useGetFundReports = ({
  fundId,
  page = 1,
  limit = 10,
}: {
  fundId: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<PaginatedFundReports, Error>({
    queryKey: ["fundReports", fundId, page, limit],
    queryFn: async () => {
      const params = { page, limit };
      const response = await axiosPrivate.get(
        `/fund-report/by-fund/${fundId}`,
        {
          params,
        }
      );
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    onError: (error) => {
      toast.error(error.message || "Failed to fetch fund reports");
    },
  });
};

// Hook to create a new fund report
export const useCreateFundReport = () => {
  const queryClient = useQueryClient();
  return useMutation<FundReport, Error, CreateFundReportPayload>({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("fundId", payload.fundId);
      formData.append("projectName", payload.projectName);
      formData.append("description", payload.description);
      formData.append("year", payload.year);
      formData.append("quarter", payload.quarter);
      formData.append("document", payload.document);

      const response = await axiosPrivate.post(
        "/fund-report/create",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success("Fund report created successfully");
      queryClient.invalidateQueries({ queryKey: ["fundReports", data.fundId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create fund report");
    },
  });
};
