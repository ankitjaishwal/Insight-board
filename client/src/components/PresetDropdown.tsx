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
      className={`ui-select cursor-pointer ${
        activePresetId
          ? "border-blue-300 bg-blue-50 font-medium dark:border-blue-500/40 dark:bg-blue-500/10"
          : ""
      }`}
    >
      {/* Placeholder (never selectable) */}
      <option value="" disabled>
        {presets.length === 0 ? "No saved presets" : "Select preset"}
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
