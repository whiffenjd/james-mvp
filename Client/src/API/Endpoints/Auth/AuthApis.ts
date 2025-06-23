// src/api/auth.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosPublic from "../../AxiosInstances/PublicAxiosInstance";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";

type LoginPayload = {
  email: string;
  password: string;
};

type ResetRequestPayload = {
  email: string;
};

type ResetPasswordPayload = {
  email: string;
  token: string;
  newPassword: string;
};

// Login
export const useLogin = () =>
  useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await axiosPublic.post("/auth/user/login", data);
      return res.data;
    },
  });

// Logout (even though it's "protected", you mentioned no token is needed)
export const useLogout = () =>
  useMutation({
    mutationFn: async () => {
      const res = await axiosPrivate.post("/auth/user/logout");
      return res.data;
    },
  });

// Send reset password link
export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: async (data: ResetRequestPayload) => {
      const res = await axiosPublic.post(
        "/auth/user/resetPasswordRequest",
        data
      );
      return res.data;
    },
  });

// Update password
export const useResetPassword = () =>
  useMutation({
    mutationFn: async (data: ResetPasswordPayload) => {
      const res = await axiosPublic.post("/auth/user/resetPassword", data);
      return res.data;
    },
  });
export const useGetUserProfile = () =>
  useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/profile/user/Userprofile");
      return res.data.data; // Assuming your API returns { success: true, data: user }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
