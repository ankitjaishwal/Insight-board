import PresetDropdown from "./PresetDropdown";
import type { FilterPreset } from "../types/preset";

interface PresetToolbarProps {
  presets: FilterPreset[];
  activePresetId: string | null;
  onSelectPreset: (preset: FilterPreset) => void;
  onSelectCustom: () => void;
  onSavePreset: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isPresetDirty: boolean;
  hasActivePreset: boolean;
  validationErrors: Record<string, string>;
}

export const PresetToolbar: React.FC<PresetToolbarProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onSelectCustom,
  onSavePreset,
  onClearFilters,
  hasActiveFilters,
  isPresetDirty,
  hasActivePreset,
}) => {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      {presets.length > 0 && (
        <PresetDropdown
          presets={presets}
          activePresetId={activePresetId}
          onSelectPreset={onSelectPreset}
          onSelectCustom={onSelectCustom}
        />
      )}

      {hasActivePreset && isPresetDirty ? (
        <button
          onClick={onSavePreset}
          className="px-3 py-2 text-sm font-medium rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
        >
          ⟳ Update
        </button>
      ) : (
        <button
          onClick={onSavePreset}
          disabled={!hasActiveFilters}
          className={`px-3 py-2 text-sm font-medium rounded transition ${
            hasActiveFilters
              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
          }`}
        >
          ★ Save
        </button>
      )}

      <button
        onClick={onClearFilters}
        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded text-sm transition whitespace-nowrap"
      >
        Clear
      </button>
    </div>
  );
};
