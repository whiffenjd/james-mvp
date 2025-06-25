import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../../Context/ThemeContext";
import {
  dashboardAssetsApi,
  themesApi,
} from "../../../API/Endpoints/FundManager/Themes&Asset";
import type {
  CreateThemeData,
  DashboardAsset,
} from "../../Types/DashboardSettings";
import { useAuth } from "../../../Context/AuthContext";
import type { Theme } from "../../Types/DashboardSettings";
import AssetsSection from "../Components/AssetsSection";
import ThemesSection from "../Components/ThemeSection";
import CreateThemeModal from "../Components/CreateThemeModal";

interface UserContext {
  userId?: string;
}

const DashboardSettings: React.FC = () => {
  const { currentTheme, selectedThemeId, applyTheme } = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCreateThemeModalOpen, setIsCreateThemeModalOpen] = useState(false);

  const getCurrentUser = (): UserContext => {
    return { userId: user?.id };
  };

  const currentUser = getCurrentUser();

  // User-specific query keys
  const dashboardAssetsQueryKey = ["dashboardAssets"];
  const themesQueryKey = ["themes", currentUser.userId];

  // Clear cache when user changes
  useEffect(() => {
    queryClient.removeQueries({ queryKey: dashboardAssetsQueryKey });
    queryClient.removeQueries({ queryKey: themesQueryKey });
  }, [currentUser.userId, queryClient]);

  // Queries with optimistic updates and refetching
  const { data: dashboardAssets, isLoading: assetsLoading } = useQuery({
    queryKey: dashboardAssetsQueryKey,
    queryFn: dashboardAssetsApi.get,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const { data: themes, isLoading: themesLoading } = useQuery({
    queryKey: themesQueryKey,
    queryFn: themesApi.list,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  // Mutations with optimistic updates
  const upsertAssetMutation = useMutation({
    mutationFn: dashboardAssetsApi.upsert,
    onMutate: async (formData: FormData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: dashboardAssetsQueryKey });
      const previousAssets = queryClient.getQueryData(dashboardAssetsQueryKey);

      // Get current data to preserve existing logoUrl if no new logo is uploaded
      const currentData = queryClient.getQueryData(dashboardAssetsQueryKey) as
        | { data?: DashboardAsset }
        | undefined;

      const logoFile = formData.get("logo") as File | null;
      let optimisticLogoUrl = currentData?.data?.logoUrl;

      // Only create blob URL if a new logo file is provided
      if (logoFile && logoFile.size > 0) {
        optimisticLogoUrl = URL.createObjectURL(logoFile);
      }

      const optimisticData = {
        data: {
          projectName: formData.get("projectName") as string,
          projectDescription: formData.get("projectDescription") as string,
          logoUrl: optimisticLogoUrl,
        },
      };

      queryClient.setQueryData(dashboardAssetsQueryKey, optimisticData);

      return {
        previousAssets,
        blobUrl: logoFile && logoFile.size > 0 ? optimisticLogoUrl : null,
      };
    },
    onError: (
      _error,
      _variables,
      context: { previousAssets?: unknown; blobUrl?: string | null } | undefined
    ) => {
      // Clean up blob URL if it was created
      if (context?.blobUrl) {
        URL.revokeObjectURL(context.blobUrl);
      }

      // Revert to previous state on error
      queryClient.setQueryData(
        dashboardAssetsQueryKey,
        context?.previousAssets
      );
    },
    onSuccess: (_data, _variables, context) => {
      // Clean up blob URL after successful upload
      if (context?.blobUrl) {
        URL.revokeObjectURL(context.blobUrl);
      }

      // Invalidate to refetch actual data from server
      queryClient.invalidateQueries({ queryKey: dashboardAssetsQueryKey });
    },
    onSettled: () => {
      // Ensure queries are invalidated regardless of success/error
      queryClient.invalidateQueries({ queryKey: dashboardAssetsQueryKey });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: dashboardAssetsApi.delete,
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: dashboardAssetsQueryKey });
      const previousAssets = queryClient.getQueryData(dashboardAssetsQueryKey);

      queryClient.setQueryData(dashboardAssetsQueryKey, { data: null });

      return { previousAssets };
    },
    onError: (
      _error,
      _variables,
      context: { previousAssets?: unknown } | undefined
    ) => {
      queryClient.setQueryData(
        dashboardAssetsQueryKey,
        context?.previousAssets
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardAssetsQueryKey });
    },
  });

  const createThemeMutation = useMutation<
    { success: boolean; data: Theme },
    Error,
    CreateThemeData,
    unknown
  >({
    mutationFn: themesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: themesQueryKey });
      // Apply the returned theme directly
      if (data.data) {
        applyTheme(data.data);
      }
    },
  });

  const deleteThemeMutation = useMutation({
    mutationFn: themesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themesQueryKey });
    },
  });

  const handleThemeSelect = (theme: Theme) => {
    applyTheme(theme);
  };

  const handleCreateThemeClick = () => {
    setIsCreateThemeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateThemeModalOpen(false);
  };

  if (assetsLoading || themesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-theme-sidebar-accent"></div>
      </div>
    );
  }

  return (
    <div className="py-6 px-14">
      <AssetsSection
        dashboardAssets={dashboardAssets}
        upsertAssetMutation={upsertAssetMutation}
        deleteAssetMutation={deleteAssetMutation}
      />

      <ThemesSection
        themes={themes}
        selectedThemeId={selectedThemeId ?? undefined}
        currentTheme={currentTheme}
        onThemeSelect={handleThemeSelect}
        onCreateThemeClick={handleCreateThemeClick}
        deleteThemeMutation={deleteThemeMutation}
      />

      <CreateThemeModal
        isOpen={isCreateThemeModalOpen}
        onClose={handleCloseModal}
        createThemeMutation={createThemeMutation}
      />
    </div>
  );
};

export default DashboardSettings;
