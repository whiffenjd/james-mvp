import { Check } from "lucide-react";

export const ThemePreview = ({
  theme,
  isSelected,
  onClick,
  onDelete,
  canDelete = true,
}) => {
  return (
    <div
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 shadow-lg"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">{theme.name}</div>

        {/* Theme Preview */}
        <div
          className="w-full h-20 rounded-lg p-3 flex items-center justify-between"
          style={{ backgroundColor: theme.primary }}
        >
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: theme.secondary }}
          />
          <div
            className="w-8 h-8 rounded"
            style={{ backgroundColor: theme.accent }}
          />
        </div>

        {/* Color Swatches */}
        <div className="flex justify-between">
          {[
            theme.primary,
            theme.secondary,
            theme.accent,
            theme.background,
            theme.text,
          ].map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
              title={
                ["Primary", "Secondary", "Accent", "Background", "Text"][index]
              }
            />
          ))}
        </div>
      </div>

      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
          <Check className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
