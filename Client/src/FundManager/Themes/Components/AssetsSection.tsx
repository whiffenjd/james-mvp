import React, { useState, useRef, useEffect } from "react";
import { Edit2, Upload, X } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import imageCompression from "browser-image-compression"; // Added for image compression
import type {
  AssetFormData,
  DashboardAsset,
} from "../../Types/DashboardSettings";

interface AssetsSectionProps {
  dashboardAssets?: { data: DashboardAsset };
  upsertAssetMutation: UseMutationResult<any, Error, FormData, unknown>;
  deleteAssetMutation: UseMutationResult<any, Error, void, unknown>;
}

const AssetsSection: React.FC<AssetsSectionProps> = ({
  dashboardAssets,
  upsertAssetMutation,
  deleteAssetMutation,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingAsset, setEditingAsset] = useState(false);
  const [assetForm, setAssetForm] = useState<AssetFormData>({
    projectName: "",
    projectDescription: "",
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false); // Added for image loading state

  // Update form when dashboardAssets changes
  useEffect(() => {
    if (!editingAsset && dashboardAssets?.data) {
      setAssetForm({
        projectName: dashboardAssets.data.projectName || "",
        projectDescription: dashboardAssets.data.projectDescription || "",
        logo: null,
      });
      setLogoPreview(dashboardAssets.data.logoUrl || null); // Set initial logo preview
    }
  }, [dashboardAssets, editingAsset]);

  // Compress image before upload
  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1, // Limit to 1MB
        maxWidthOrHeight: 800, // Resize to max 800px
        useWebWorker: true,
      };
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression failed:", error);
      return file; // Fallback to original file
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImageLoading(true); // Start image loading
      const compressedFile = await compressImage(file); // Compress image
      setAssetForm((prev) => ({ ...prev, logo: compressedFile }));

      // Create preview URL for the selected file
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
        setIsImageLoading(false); // End image loading
      };
      reader.readAsDataURL(compressedFile);
    }
  };

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("projectName", assetForm.projectName);
    formData.append("projectDescription", assetForm.projectDescription);
    if (assetForm.logo) {
      formData.append("logo", assetForm.logo);
    }
    upsertAssetMutation.mutate(formData, {
      onSuccess: () => {
        setEditingAsset(false);
        setAssetForm({ projectName: "", projectDescription: "", logo: null });
        setLogoPreview(null);
      },
    });
  };

  const startEditingAsset = () => {
    if (dashboardAssets?.data) {
      setAssetForm({
        projectName: dashboardAssets.data.projectName || "",
        projectDescription: dashboardAssets.data.projectDescription || "",
        logo: null,
      });
      setLogoPreview(dashboardAssets.data.logoUrl || null); // Keep existing logo preview
    }
    setEditingAsset(true);
  };

  const cancelEditing = () => {
    setEditingAsset(false);
    setAssetForm({
      projectName: "",
      projectDescription: "",
      logo: null,
    });
    setLogoPreview(null);
  };

  const handleDelete = () => {
    deleteAssetMutation.mutate(undefined, {
      onSuccess: () => {
        setEditingAsset(false);
        setAssetForm({
          projectName: "",
          projectDescription: "",
          logo: null,
        });
        setLogoPreview(null);
      },
    });
  };

  const removeSelectedLogo = () => {
    setAssetForm((prev) => ({ ...prev, logo: null }));
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getCurrentLogo = () => {
    if (editingAsset) {
      return logoPreview || dashboardAssets?.data?.logoUrl;
    }
    return dashboardAssets?.data?.logoUrl;
  };

  const currentLogo = getCurrentLogo();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-theme-primary">
          Logo and Project Info
        </h2>
        {!editingAsset && (
          <button
            onClick={startEditingAsset}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
          >
            <Edit2 size={16} />
            Edit
          </button>
        )}
      </div>

      {!editingAsset ? (
        <div className="flex gap-6">
          <div className="w-52 h-[140px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-theme-card relative">
            {isImageLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : currentLogo ? (
              <img
                src={currentLogo}
                alt="Logo"
                className="w-full h-full object-contain rounded-lg"
                loading="lazy" // Enable lazy loading
              />
            ) : (
              <div className="text-center">
                <Upload
                  size={24}
                  className="mx-auto mb-2 text-theme-secondary"
                />
                <span className="text-sm text-theme-secondary">No Logo</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={dashboardAssets?.data?.projectName || "Project Name"}
              readOnly
              className="w-full p-3 border rounded-lg mb-3 font-medium bg-theme-card text-theme-primary"
            />
            <textarea
              value={
                dashboardAssets?.data?.projectDescription ||
                "Project description goes here..."
              }
              readOnly
              className="w-full p-3 border rounded-lg flex-1 resize-none bg-theme-card text-theme-secondary"
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleAssetSubmit} className="flex gap-6">
          <div className="w-32 h-[140px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative bg-theme-card overflow-hidden">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {isImageLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : currentLogo ? (
              <div className="relative w-full h-full group">
                <img
                  src={currentLogo}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-lg"
                  loading="lazy" // Enable lazy loading
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-gray-800 px-2 py-1 rounded text-xs mr-1 hover:bg-gray-100"
                  >
                    Change
                  </button>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={removeSelectedLogo}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {logoPreview && (
                  <div className="absolute top-1 right-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded shadow">
                    New
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Upload size={24} className="mb-2 text-theme-secondary" />
                <span className="text-sm text-theme-secondary text-center px-2">
                  Upload Logo
                </span>
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={assetForm.projectName}
              onChange={(e) =>
                setAssetForm((prev) => ({
                  ...prev,
                  projectName: e.target.value,
                }))
              }
              placeholder="Project Name"
              className="w-full p-3 border rounded-lg mb-3 bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <textarea
              value={assetForm.projectDescription}
              onChange={(e) =>
                setAssetForm((prev) => ({
                  ...prev,
                  projectDescription: e.target.value,
                }))
              }
              placeholder="Project Description"
              className="w-full p-3 border rounded-lg flex-1 resize-none mb-3 bg-theme-card text-theme-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />

            <div className="flex gap-2 flex-wrap justify-between">
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={upsertAssetMutation.isPending || isImageLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {upsertAssetMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {dashboardAssets?.data && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteAssetMutation.isPending}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {deleteAssetMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssetsSection;
