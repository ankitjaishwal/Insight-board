import type { FilterPreset } from "../types/preset";

type Props = {
  presets: FilterPreset[];
  activePresetId: string | null;
  onSelectPreset: (preset: FilterPreset) => void;
  onSelectCustom: () => void;
};

const PresetDropdown: React.FC<Props> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onSelectCustom,
}) => {
  if (presets.length === 0) return null;

  const value = activePresetId || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;

    if (selected === "custom") {
      onSelectCustom();
      return;
    }

    const preset = presets.find((p) => p.id === selected);

    if (preset) {
      onSelectPreset(preset);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`
        border rounded px-3 py-2 text-sm cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${
          activePresetId
            ? "border-blue-300 bg-blue-50 font-medium"
            : "border-gray-300 bg-white"
        }
      `}
    >
      {/* Placeholder (never selectable) */}
      <option value="" disabled>
        Select preset
      </option>

      {/* Custom mode */}
      <option value="custom">Custom</option>

      {/* Presets */}
      {presets.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
};

export default PresetDropdown;
