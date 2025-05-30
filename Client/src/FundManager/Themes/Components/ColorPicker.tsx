const ColorPicker = ({ color, onChange, label, disabled = false }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer disabled:cursor-not-allowed"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
