// hooks/useResendOtp.ts
import { useMutation } from "@tanstack/react-query";
import axiosPublic from "../../AxiosInstances/PublicAxiosInstance";

interface ResendOtpInput {
  email: string;
}

interface ResendOtpResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export const useResendOtp = () =>
  useMutation<ResendOtpResponse, Error, ResendOtpInput>({
    mutationFn: async (payload) => {
      const response = await axiosPublic.post("/auth/otp/resendOtp", payload);
      return response.data;
    },
  });
