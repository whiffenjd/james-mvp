// Updated services/api.ts
import axiosPrivate from "../../AxiosInstances/PrivateAxiosInstance";

// Types (make sure these match your updated types)
export interface DashboardAsset {
  id?: string;
  userId?: string;
  logoUrl?: string;
  projectName: string;
  projectDescription: string;
  createdAt?: string;
}

export interface Theme {
  id?: string;
  userId?: string;
  name?: string;
  dashboardBackground: string;
  cardBackground: string;
  primaryText: string;
  secondaryText: string;
  sidebarAccentText: string;
  createdAt?: string;
}

export interface CreateThemeData {
  name?: string;
  dashboardBackground: string;
  cardBackground: string;
  primaryText: string;
  secondaryText: string;
  sidebarAccentText: string;
}

export interface ApplyThemeRequest {
  themeId: string;
}

interface FetchSelectedThemeRequest {
  themeId: string;
}

interface ThemeApiResponse {
  success: boolean;
  message?: string;
  data?: Theme;
  error?: string;
}

interface SelectedThemeResponse {
  success: boolean;
  data?: Theme;
  error?: string;
}

// Dashboard Assets API
export const dashboardAssetsApi = {
  upsert: async (data: FormData) => {
    const response = await axiosPrivate.post(
      "/dashboard/assets/upsert-website-assets",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  get: async (): Promise<{ success: boolean; data: DashboardAsset }> => {
    const response = await axiosPrivate.get(
      "/dashboard/assets/get-website-assets"
    );
    return response.data;
  },

  delete: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axiosPrivate.delete(
      "/dashboard/assets/delete-website-assets"
    );
    return response.data;
  },
};

// Themes API
export const themesApi = {
  create: async (
    data: CreateThemeData
  ): Promise<{ success: boolean; data: Theme }> => {
    const response = await axiosPrivate.post(
      "/dashboard/theme/createTheme",
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: CreateThemeData
  ): Promise<{ success: boolean; data: Theme }> => {
    const response = await axiosPrivate.put(
      `/dashboard/theme/updateTheme/${id}`,
      data
    );
    return response.data;
  },

  delete: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosPrivate.delete(
      `/dashboard/theme/deleteTheme/${id}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Theme }> => {
    const response = await axiosPrivate.get(`/dashboard/theme/getTheme/${id}`);
    return response.data;
  },

  list: async (): Promise<{ success: boolean; data: Theme[] }> => {
    const response = await axiosPrivate.get("/dashboard/theme/listThemes");
    return response.data;
  },

  applySelectedTheme: async (
    request: ApplyThemeRequest
  ): Promise<ThemeApiResponse> => {
    const response = await axiosPrivate.post(
      "/dashboard/theme/applyTheme",
      request
    );
    return response.data;
  },

  // Get selected theme by ID
  getSelectedTheme: async (
    request: FetchSelectedThemeRequest
  ): Promise<Theme> => {
    const response = await axiosPrivate.post(
      "/dashboard/theme/selectedTheme",
      request
    );

    // Access the actual theme object inside the nested structure
    return response.data.selectedTheme;
  },

  // Clear selected theme
  clearSelectedTheme: async (): Promise<ThemeApiResponse> => {
    const response = await axiosPrivate.delete(
      "/dashboard/theme/clearSelectedTheme"
    );
    return response.data;
  },
};
