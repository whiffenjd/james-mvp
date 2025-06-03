export interface DashboardAsset {
  projectName?: string;
  projectDescription?: string;
  logoUrl?: string;
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
}

export interface CreateThemeData {
  name: string;
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
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "fundmanager" | "investor";
  isEmailVerified: boolean;
  isActive: boolean;
  metadata: {
    assignedFundManagerId?: string;
    assignmentDate?: string;
    lastUnassignmentDate?: string;
    assignmentCount?: number;
    [key: string]: any;
  };
  assignedFundManagerId?: string | null; // For backward compatibility
  createdAt: string;
  updatedAt: string;
}
