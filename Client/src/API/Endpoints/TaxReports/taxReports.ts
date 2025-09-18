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

export interface TaxReport {
  id: string;
  projectName: string;
  reportURL: string;
  createdBy: string;
  year: string;
  quarter: "Quarter1" | "Quarter2" | "Quarter3" | "Quarter4";
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTaxReportResponse {
  data: TaxReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TaxReportsApiResponse = ApiResponse<PaginatedTaxReportResponse>;

export interface CreateTaxReportPayload {
  projectName: string;
  year: string;
  quarter: "Quarter1" | "Quarter2" | "Quarter3" | "Quarter4";
  document: File;
}

export interface UpdateTaxReportPayload {
  projectName?: string;
  year?: string;
  quarter?: "Quarter1" | "Quarter2" | "Quarter3" | "Quarter4";
  document?: File;
}

// ---------- API Hooks ----------

// Paginated Tax Reports List
interface UseTaxReportsParams {
  page?: number;
  limit?: number;
  year?: string;
  quarter?: string;
}

export const useTaxReports = (params: UseTaxReportsParams = {}) =>
  useQuery<TaxReportsApiResponse, Error>({
    queryKey: [
      "tax-reports",
      params.page ?? 1,
      params.limit ?? 10,
      params.year ?? null,
      params.quarter ?? null,
    ],
    queryFn: async () => {
      console.log("Fetching tax reports with params:", params);
      // Map quarter values from Q1-Q4 to Quarter1-Quarter4
      const mappedParams = {
        ...params,
        quarter: params.quarter
          ? `Quarter${params.quarter.replace("Q", "")}`
          : undefined,
      };
      const res = await axiosPrivate.get("/tax-report", {
        params: mappedParams,
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

// Create Tax Report
export const useCreateTaxReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<TaxReport>, Error, CreateTaxReportPayload>({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("projectName", payload.projectName);
      formData.append("year", payload.year);
      formData.append("quarter", payload.quarter);
      formData.append("document", payload.document);

      const res = await axiosPrivate.post("/tax-report/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-reports"] });
    },
  });
};

// Update Tax Report
export const useUpdateTaxReport = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<TaxReport>,
    Error,
    { id: string; data: UpdateTaxReportPayload }
  >({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();
      if (data.projectName) formData.append("projectName", data.projectName);
      if (data.year) formData.append("year", data.year);
      if (data.quarter) formData.append("quarter", data.quarter);
      if (data.document) formData.append("document", data.document);

      const res = await axiosPrivate.put(`/tax-report/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-reports"] });
    },
  });
};

// Delete Tax Report
export const useDeleteTaxReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, string>({
    mutationFn: async (id) => {
      const res = await axiosPrivate.delete(`/tax-report/delete/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-reports"] });
    },
  });
};

// Download Tax Report
export const useDownloadTaxReport = () => {
  return useMutation<string, Error, string>({
    mutationFn: async (id) => {
      const res = await axiosPrivate.get(`/tax-report/${id}/download`);
      const { url } = res.data.data; // assuming sendSuccessResponse packs it in { data: { url } }
      return url;
    },
    onSuccess: (url) => {
      // Trigger file download in browser
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", ""); // filename comes from S3 Content-Disposition
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });
};
