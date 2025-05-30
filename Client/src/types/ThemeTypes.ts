export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface DashboardAsset {
  id: string;
  logoUrl: string;
  projectName: string;
  projectDescription: string;
}

// Default themes
export const defaultThemes: Theme[] = [
  {
    id: "be3f9jd2-2488-4ed8-afa6-2dhh4fe3464c",
    name: "Teal Theme",
    primary: "#14B8A6",
    secondary: "#FFFFFF",
    accent: "#0F766E",
    background: "#F8FAFC",
    text: "#1E293B",
  },
  {
    id: "be6f9jd2-2488-49d8-afa6-2dh2hhe3463c",
    name: "Blue Theme",
    primary: "#3B82F6",
    secondary: "#FFFFFF",
    accent: "#1D4ED8",
    background: "#F1F5F9",
    text: "#1E293B",
  },
  {
    id: "be613ld2-2488-49d8-a9y6-2dh2llk3463c",
    name: "Orange Theme",
    primary: "#F59E0B",
    secondary: "#FFFFFF",
    accent: "#D97706",
    background: "#FFFBEB",
    text: "#1E293B",
  },
  {
    id: "ht6f9jd2-0987-49d8-afa6-lko9hhe3463c",
    name: "Green Theme",
    primary: "#10B981",
    secondary: "#FFFFFF",
    accent: "#047857",
    background: "#F0FDF4",
    text: "#1E293B",
  },
];
