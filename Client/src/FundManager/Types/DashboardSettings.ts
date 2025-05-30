export interface DashboardAsset {
  projectName?: string;
  projectDescription?: string;
  logoUrl?: string;
}

export interface Theme {
  id?: string;
  dashboardBackground: string;
  cardBackground: string;
  primaryText: string;
  secondaryText: string;
  sidebarAccentText: string;
}

export interface CreateThemeData {
  dashboardBackground: string;
  cardBackground: string;
  primaryText: string;
  secondaryText: string;
  sidebarAccentText: string;
}

export interface AssetFormData {
  projectName: string;
  projectDescription: string;
  logo: File | null;
}
