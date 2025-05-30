import React, { useState } from "react";

import { X } from "lucide-react";
import type { CreateThemeData } from "../../Types/DashboardSettings";
import type { UseMutationResult } from "@tanstack/react-query";

interface CreateThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  createThemeMutation: UseMutationResult<any, Error, CreateThemeData, unknown>;
}

const CreateThemeModal: React.FC<CreateThemeModalProps> = ({
  isOpen,
  onClose,
  createThemeMutation,
}) => {
  const [themeForm, setThemeForm] = useState<CreateThemeData>({
    dashboardBackground: "#14B8A6",
    cardBackground: "#FFFFFF",
    primaryText: "#000000",
    secondaryText: "#6B7280",
    sidebarAccentText: "#14B8A6",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createThemeMutation.mutate(themeForm, {
      onSuccess: () => {
        onClose();
        setThemeForm({
          dashboardBackground: "#14B8A6",
          cardBackground: "#FFFFFF",
          primaryText: "#000000",
          secondaryText: "#6B7280",
          sidebarAccentText: "#14B8A6",
        });
      },
    });
  };

  const handleClose = () => {
    onClose();
    setThemeForm({
      dashboardBackground: "#14B8A6",
      cardBackground: "#FFFFFF",
      primaryText: "#000000",
      secondaryText: "#6B7280",
      sidebarAccentText: "#14B8A6",
    });
  };

  const updateThemeForm = (field: keyof CreateThemeData, value: string) => {
    setThemeForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Custom Theme</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Dashboard Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={themeForm.dashboardBackground}
                onChange={(e) =>
                  updateThemeForm("dashboardBackground", e.target.value)
                }
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeForm.dashboardBackground}
                onChange={(e) =>
                  updateThemeForm("dashboardBackground", e.target.value)
                }
                className="flex-1 p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Card Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={themeForm.cardBackground}
                onChange={(e) =>
                  updateThemeForm("cardBackground", e.target.value)
                }
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeForm.cardBackground}
                onChange={(e) =>
                  updateThemeForm("cardBackground", e.target.value)
                }
                className="flex-1 p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Primary Text
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={themeForm.primaryText}
                onChange={(e) => updateThemeForm("primaryText", e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeForm.primaryText}
                onChange={(e) => updateThemeForm("primaryText", e.target.value)}
                className="flex-1 p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Secondary Text
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={themeForm.secondaryText}
                onChange={(e) =>
                  updateThemeForm("secondaryText", e.target.value)
                }
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeForm.secondaryText}
                onChange={(e) =>
                  updateThemeForm("secondaryText", e.target.value)
                }
                className="flex-1 p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Sidebar Accent
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={themeForm.sidebarAccentText}
                onChange={(e) =>
                  updateThemeForm("sidebarAccentText", e.target.value)
                }
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={themeForm.sidebarAccentText}
                onChange={(e) =>
                  updateThemeForm("sidebarAccentText", e.target.value)
                }
                className="flex-1 p-2 border rounded"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={createThemeMutation.isPending}
              className="flex-1 py-2 bg-theme-dashboard text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {createThemeMutation.isPending ? "Creating..." : "Create Theme"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThemeModal;
