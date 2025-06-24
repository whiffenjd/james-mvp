// src/api/investors.ts
import { useQuery } from "@tanstack/react-query";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";

export type Investor = {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
};

export const useGetInvestors = () => {
  return useQuery<Investor[]>({
    queryKey: ["investors"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/fund/investors");
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};