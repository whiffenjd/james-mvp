// hooks/useVerifyInvestorOtp.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import axiosPublic from "../../AxiosInstances/PublicAxiosInstance";

interface VerifyOtpInput {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export const useVerifyInvestorOtp = () =>
  useMutation<VerifyOtpResponse, Error, VerifyOtpInput>({
    mutationFn: async (payload) => {
      const response = await axiosPublic.post("/auth/otp/verifyOtp", payload);
      return response.data;
    },
  });
