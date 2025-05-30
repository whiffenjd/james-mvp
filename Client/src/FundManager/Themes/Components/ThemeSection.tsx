import React from "react";

import { Plus, Trash2 } from "lucide-react";
import type { Theme } from "../../Types/DashboardSettings";
import type { UseMutationResult } from "@tanstack/react-query";
import { useTheme } from "../../../Context/ThemeContext";

interface ThemesSectionProps {
  themes?: { data: Theme[] };
  selectedThemeId?: string;
  currentTheme: Theme;
  onThemeSelect: (theme: Theme) => void;
  onCreateThemeClick: () => void;
  deleteThemeMutation: UseMutationResult<any, Error, string, unknown>;
}

const ThemesSection: React.FC<ThemesSectionProps> = ({
  themes,
  selectedThemeId,
  currentTheme,
  onThemeSelect,
  onCreateThemeClick,
  deleteThemeMutation,
}) => {
  const { handleThemeDeleted } = useTheme();

  const isThemeSelected = (theme: Theme): boolean => {
    // 1. First check by ID for custom themes
    if (theme.id && selectedThemeId) {
      return theme.id === selectedThemeId;
    }

    // 2. Check if it's the default theme (no ID)
    if (!theme.id && !selectedThemeId) {
      return (
        theme.dashboardBackground === currentTheme.dashboardBackground &&
        theme.cardBackground === currentTheme.cardBackground &&
        theme.primaryText === currentTheme.primaryText &&
        theme.secondaryText === currentTheme.secondaryText &&
        theme.sidebarAccentText === currentTheme.sidebarAccentText
      );
    }

    return false;
  };

  const handleDeleteTheme = async (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation();

    try {
      // Delete the theme
      await deleteThemeMutation.mutateAsync(themeId);

      // Get remaining themes after deletion
      const remainingThemes =
        themes?.data?.filter((theme) => theme.id !== themeId) || [];

      // Handle the theme deletion in context (this will auto-switch if needed)
      await handleThemeDeleted(themeId, remainingThemes);

      console.log("Theme deleted successfully and fallback applied");
    } catch (error) {
      console.error("Failed to delete theme:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-y-2">
          <h2 className="text-xl font-semibold text-theme-primary">
            Color Themes
          </h2>
        </div>

        <button
          onClick={onCreateThemeClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
        >
          <Plus size={16} />
          Create Theme
        </button>
      </div>
      <div className="flex flex-col gap-y-2">
        <h2 className="text-sm font-semibold text-theme-secondary mb-2">
          Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {themes?.data?.map((theme) => {
            const isSelected = isThemeSelected(theme);
            return (
              <div
                key={theme.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all relative group ${
                  isSelected
                    ? "border-green-500 ring-2 ring-green-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onThemeSelect(theme)}
              >
                {theme.id && (
                  <button
                    onClick={(e) => handleDeleteTheme(e, theme.id!)}
                    disabled={deleteThemeMutation.isPending}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                <div className="space-y-2 mb-3">
                  <div
                    className="h-6 rounded"
                    style={{ backgroundColor: theme.dashboardBackground }}
                  ></div>
                  <div
                    className="h-4 rounded"
                    style={{
                      backgroundColor: theme.cardBackground,
                      border: "1px solid #e5e7eb",
                    }}
                  ></div>
                  <div className="flex gap-1">
                    <div
                      className="h-2 w-1/3 rounded"
                      style={{ backgroundColor: theme.primaryText }}
                    ></div>
                    <div
                      className="h-2 w-2/3 rounded"
                      style={{ backgroundColor: theme.secondaryText }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-theme-primary">
                    {theme.id ? "Custom Theme" : "Default Theme"}
                  </p>
                  {isSelected && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })}{" "}
        </div>
      </div>
    </div>
  );
};

export default ThemesSection;
