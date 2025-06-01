import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../../Context/ThemeContext";
import {
  dashboardAssetsApi,
  themesApi,
} from "../../../API/Endpoints/FundManager/Themes&Asset";
import type { CreateThemeData } from "../../Types/DashboardSettings";
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
  const dashboardAssetsQueryKey = ["dashboardAssets", currentUser.userId];
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

      const optimisticData = {
        data: {
          projectName: formData.get("projectName") as string,
          projectDescription: formData.get("projectDescription") as string,
          logoUrl: formData.get("logo")
            ? URL.createObjectURL(formData.get("logo") as Blob)
            : dashboardAssets?.data?.logoUrl,
        },
      };

      queryClient.setQueryData(dashboardAssetsQueryKey, optimisticData);

      return { previousAssets };
    },
    onError: (err, variables, context) => {
      // Revert to previous state on error
      queryClient.setQueryData(
        dashboardAssetsQueryKey,
        context?.previousAssets
      );
    },
    onSuccess: () => {
      // Invalidate to refetch actual data
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
    onError: (err, variables, context) => {
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
      applyTheme(data.data[0]);
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
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary"></div>
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
