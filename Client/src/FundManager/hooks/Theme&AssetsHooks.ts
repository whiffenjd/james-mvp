// hooks/useApi.ts - Custom hooks for API calls
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dashboardAssetsApi,
  themesApi,
  type CreateThemeData,
} from "../../API/Endpoints/FundManager/Themes&Asset";

// Dashboard Assets Hooks
export const useDashboardAssets = () => {
  return useQuery({
    queryKey: ["dashboardAssets"],
    queryFn: dashboardAssetsApi.get,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpsertDashboardAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardAssetsApi.upsert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardAssets"] });
    },
    onError: (error) => {
      console.error("Error upserting dashboard asset:", error);
    },
  });
};

export const useDeleteDashboardAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardAssetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardAssets"] });
    },
    onError: (error) => {
      console.error("Error deleting dashboard asset:", error);
    },
  });
};

// Theme Hooks
export const useThemes = () => {
  return useQuery({
    queryKey: ["themes"],
    queryFn: () => themesApi.list(), // Fetch all themes using the 'list' method
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: themesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      return data;
    },
    onError: (error) => {
      console.error("Error creating theme:", error);
    },
  });
};

export const useUpdateTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateThemeData }) =>
      themesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
    onError: (error) => {
      console.error("Error updating theme:", error);
    },
  });
};

export const useDeleteTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: themesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
    onError: (error) => {
      console.error("Error deleting theme:", error);
    },
  });
};

export const useThemeById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["theme", id],
    queryFn: () => themesApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
export const useApplyTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: themesApi.applySelectedTheme,
    onSuccess: (data) => {
      // Invalidate and refetch selected theme query
      queryClient.invalidateQueries({ queryKey: ["selectedTheme"] });

      // You can also update the cache directly
      if (data.success && data.data?.selectedThemeId) {
        queryClient.setQueryData(["selectedTheme"], {
          success: true,
          data: { selectedThemeId: data.data.selectedThemeId },
        });
      }
    },
    onError: (error) => {
      console.error("Error applying theme:", error);
    },
  });
};

export const useSelectedTheme = () => {
  return useQuery({
    queryKey: ["selectedTheme"],
    queryFn: themesApi.getSelectedTheme,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when user switches back to tab
    refetchOnMount: true, // Always refetch on mount
  });
};

export const useClearTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: themesApi.clearSelectedTheme,
    onSuccess: () => {
      // Invalidate selected theme query
      queryClient.invalidateQueries({ queryKey: ["selectedTheme"] });

      // Clear the cache
      queryClient.setQueryData(["selectedTheme"], {
        success: true,
        data: { selectedThemeId: undefined },
      });
    },
    onError: (error) => {
      console.error("Error clearing theme:", error);
    },
  });
};
