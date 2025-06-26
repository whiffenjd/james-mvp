// src/api/funds.ts
import toast from "react-hot-toast";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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



interface UpdateFundParams {
  id: string;
  data: {
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
    existingDocuments: string[];
    investors: FundInvestor[];
  };
  fundDocuments?: File[];
  investorDocuments?: Record<number, File>;
}

interface InvestorFundSummary {
  id: string;
  name: string;
  fundType: string;
  fundDescription: string;
  investorCount: number;
  createdAt: string;
}

interface InvestorFundsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: InvestorFundSummary[];
}

export const useGetInvestorFunds = () => {
  return useQuery<InvestorFundSummary[]>({
    queryKey: ['investorFunds'],
    queryFn: async () => {
      const response = await axiosPrivate.get<InvestorFundsResponse>('/fund/getAllInvestorFunds');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch investor funds');
      }
      return response.data.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to fetch investor funds');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnMount: true,     // Refetch on every mount
    refetchOnWindowFocus: false,
  });
};

export const useUpdateFund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: UpdateFundParams) => {
      const formData = new FormData();
      
      // Stringify and append the data object exactly as backend expects
      formData.append('data', JSON.stringify({
        name: params.data.name,
        fundSize: params.data.fundSize,
        fundType: params.data.fundType,
        targetGeographies: params.data.targetGeographies,
        targetSectors: params.data.targetSectors,
        targetMOIC: params.data.targetMOIC,
        targetIRR: params.data.targetIRR,
        minimumInvestment: params.data.minimumInvestment,
        fundLifetime: params.data.fundLifetime,
        fundDescription: params.data.fundDescription,
        existingDocuments: params.data.existingDocuments,
        investors: params.data.investors.map(investor => ({
          investorId: investor.investorId,
          name: investor.name,
          amount: investor.amount,
          documentUrl: investor.documentUrl,
          addedAt: investor.addedAt
        }))
      }));

      // Handle fund documents - single field with multiple files
      if (params.fundDocuments) {
        params.fundDocuments.forEach(file => {
          formData.append('fundDocuments', file);
        });
      }

      // Handle investor documents - indexed fields
      if (params.investorDocuments) {
        Object.entries(params.investorDocuments).forEach(([index, file]) => {
          formData.append(`investorDocument_${index}`, file);
        });
      }

      const response = await axiosPrivate.patch(
        `/fund/updateFund/${params.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success('Fund updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['fund'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Failed to update fund';
      toast.error(errorMessage);
    }
  });
};

export const useCreateFund = () => {
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: ['funds'] });
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
    staleTime: 0,            
    refetchOnMount: true,     
    refetchOnWindowFocus: false, 
  });
};

export const useGetFundByIdQuery = (id: string) => {
  return useQuery<FundDetail>({
    queryKey: ['fund', id],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/fund/getFundById/${id}`);
      return response.data;
    },
    enabled: !!id, 
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,     
    refetchOnWindowFocus: false,
    
  });
};