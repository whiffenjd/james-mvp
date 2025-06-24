// src/api/funds.ts
import toast from "react-hot-toast";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";
import { useQuery, useMutation } from "@tanstack/react-query";

interface Investor {
  id: string;
  name: string;
  amount: string;
  files?: File[];
}

interface Document {
  id: string;
  name: string;
  size: string;
  uploaded: boolean;
  file?: File;
}

interface CreateFundPayload {
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
  investors: Investor[];
  documents: Document[];
}

interface FundSummary {
  id: string;
  name: string;
  fundType: string;
  fundDescription: string;
  investorCount: number;
  createdAt: string;
}

interface FundSummary {
  id: string;
  name: string;
  fundType: string;
  fundDescription: string;
  investorCount: number;
  createdAt: string;
}

interface FundDocument {
  fileUrl: string;
  uploadedAt: string;
}

interface FundInvestor {
  investorId: string;
  name: string;
  amount: number;
  documentUrl: string;
  addedAt: string;
}

interface FundDetail {
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
  investors: FundInvestor[];
  documents: FundDocument[];
}

interface FundDetail {
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
  investors: FundInvestor[];
  documents: FundDocument[];
}

export const useCreateFund = () => {
  return useMutation({
    mutationFn: async (payload: CreateFundPayload) => {
      const formData = new FormData();
      
      // Add fund data as JSON string
      formData.append('data', JSON.stringify({
        name: payload.name,
        fundSize: payload.fundSize,
        fundType: payload.fundType,
        targetGeographies: payload.targetGeographies,
        targetSectors: payload.targetSectors,
        targetMOIC: payload.targetMOIC,
        targetIRR: payload.targetIRR,
        minimumInvestment: payload.minimumInvestment,
        fundLifetime: payload.fundLifetime,
        fundDescription: payload.fundDescription,
        investors: payload.investors.map(investor => ({
          investorId: investor.id,
          name: investor.name,
          amount: investor.amount
        }))
      }));

      // Add fund documents
      payload.documents.forEach((doc) => {
        if (doc.file) {
          formData.append(`fundDocuments`, doc.file);
        }
      });

      // Add investor documents
      payload.investors.forEach((investor, index) => {
        if (investor.files) {
          investor.files.forEach(file => {
            formData.append(`investorDocument_${index}`, file);
          });
        }
      });

      const response = await axiosPrivate.post('/fund/createFund', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Fund created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create fund');
    }
  });
};

export const useGetAllFundsQuery = () => {
  return useQuery<FundSummary[]>({
    queryKey: ['funds'],
    queryFn: async () => {
      const response = await axiosPrivate.get('/fund/getAllFundsSpecificData');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useGetFundByIdQuery = (id: string) => {
  return useQuery<FundDetail>({
    queryKey: ['fund', id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/fund/getFundById/${id}`);
      return response.data;
    },
    enabled: !!id, // Only fetch when ID is available
    staleTime: 5 * 60 * 1000
  });
};