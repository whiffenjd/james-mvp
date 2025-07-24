// hooks/notification.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";

// Types for API payloads and responses
export type Notification = {
  id: string;
  description: string;
  timeAgo: string;
  timestamp: string;
  entityType: "capital_call" | "distribution" | "fund_report";
  action: string;
  isRead: boolean;
  fundName: string;
  fundId: string;
  performedByName: string;
  amount: number | null;
  targetUserId: string | null;
  targetUserName: string | null;
};

export type NotificationQuery = {
  limit?: number;
  offset?: number;
  entityType?: "capital_call" | "distribution" | "fund_report";
  isRead?: boolean;
};

export type PaginatedNotifications = {
  data: Notification[];
  totalItems: number;
  totalPages: number;
};

// Hook to fetch paginated notifications for the logged-in user
export const useGetNotifications = ({
  userId,
  limit = 10,
  offset = 0,
  entityType,
  isRead,
}: {
  userId: string;
} & NotificationQuery) => {
  return useQuery<PaginatedNotifications, Error>({
    queryKey: ["notifications", userId, limit, offset, entityType, isRead],
    queryFn: async () => {
      const params = { limit, offset, entityType, isRead } as NotificationQuery;
      const response = await axiosPrivate.get(`/notifications/${userId}`, {
        params,
      });
      return response.data.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId, // Only fetch if userId is provided
  });
};

// Hook to fetch unread notification count
export const useGetUnreadCount = (userId?: string) => {
  return useQuery<{ unreadCount: number }, Error>({
    queryKey: ["unreadNotifications", userId],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/notifications/${userId}/unread-count`
      );
      return response.data.data;
    },
    refetchInterval: 60000, // Poll every 60 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
    enabled: !!userId, // Only fetch if userId is provided
  });
};

// Hook to mark a notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { userId: string; notificationId: string }>({
    mutationFn: async ({ userId, notificationId }) => {
      await axiosPrivate.patch(
        `/notifications/${userId}/${notificationId}/read`
      );
    },
    onSuccess: (_, { userId }) => {
      // toast.success("Notification marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotifications", userId],
      });
    },
    // onError: (error) => {
    //   // toast.error(error.message || "Failed to mark notification as read");
    // },
  });
};

// Hook to mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      await axiosPrivate.patch(`/notifications/${userId}/mark-all-read`);
    },
    onSuccess: (_, { userId }) => {
      toast.success("All notifications marked as read");
      // Invalidate both notifications queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotifications", userId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark notifications as read");
    },
  });
};

// Hook to delete a notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { userId: string; notificationId: string }>({
    mutationFn: async ({ userId, notificationId }) => {
      await axiosPrivate.delete(`/notifications/${userId}/${notificationId}`);
    },
    onSuccess: (_, { userId }) => {
      toast.success("Notification deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({
        queryKey: ["unreadNotifications", userId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });
};
