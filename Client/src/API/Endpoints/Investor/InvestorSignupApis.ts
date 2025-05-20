// hooks/useInvestorSignup.ts
import { useMutation } from "@tanstack/react-query";
import axiosPublic from "../../AxiosInstances/PublicAxiosInstance";

interface InvestorSignupData {
  name: string;
  email: string;
  password: string;
}

interface InvestorSignupResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export const useInvestorSignup = () =>
  useMutation<InvestorSignupResponse, Error, InvestorSignupData>({
    mutationFn: async (data) => {
      const response = await axiosPublic.post(
        "/auth/investor/investorSignup",
        data
      );
      return response.data;
    },
  });
