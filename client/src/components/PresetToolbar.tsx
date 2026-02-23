import PresetDropdown from "./PresetDropdown";
import type { FilterPreset } from "../types/preset";
import { useState } from "react";

interface PresetToolbarProps {
  presets: FilterPreset[];
  activePresetId: string | null;
  onSelectPreset: (preset: FilterPreset) => void;
  onSelectCustom: () => void;
  onSavePreset: () => void;
  onDeletePreset: () => void;
  onRenamePreset: (newName: string, closeModal: () => void) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isPresetDirty: boolean;
  hasActivePreset: boolean;
  validationErrors: Record<string, string>;
  isCreatingPreset: boolean;
  isUpdatingPreset: boolean;
  isDeletingPreset: boolean;
}

export const PresetToolbar: React.FC<PresetToolbarProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onSelectCustom,
  onSavePreset,
  onDeletePreset,
  onRenamePreset,
  onClearFilters,
  hasActiveFilters,
  isPresetDirty,
  hasActivePreset,
  isCreatingPreset,
  isUpdatingPreset,
  isDeletingPreset,
}) => {
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const activePreset = presets.find((p) => p.id === activePresetId);

  const handleRenameClick = () => {
    setRenameValue(activePreset?.name || "");
    setShowRenameModal(true);
    setShowPresetMenu(false);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      onRenamePreset(renameValue.trim(), () => setShowRenameModal(false));
      setRenameValue("");
    }
  };

  const handleDeleteClick = () => {
    onDeletePreset();
    setShowPresetMenu(false);
  };

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

      {hasActivePreset && (
        <div className="relative">
          <button
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            disabled={isDeletingPreset || isUpdatingPreset}
            className="px-2 py-2 text-sm border rounded hover:bg-gray-100"
          >
            ⋮
          </button>
          {showPresetMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-md text-sm z-50">
              <button
                onClick={handleRenameClick}
                disabled={isUpdatingPreset}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 border-b"
              >
                Rename
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeletingPreset}
                className="block w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
              >
                {isDeletingPreset ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}

      {showRenameModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Rename Preset</h3>

            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
              }}
              placeholder="Enter new name"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameValue("");
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
              >
                Cancel
              </button>

              <button
                onClick={handleRenameSubmit}
                disabled={!renameValue.trim() || isUpdatingPreset}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUpdatingPreset ? "Renaming..." : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!hasActivePreset && hasActiveFilters && (
        <button
          onClick={onSavePreset}
          disabled={isCreatingPreset}
          className="px-3 py-2 text-sm font-medium rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
        >
          {isCreatingPreset ? "Saving..." : "★ Save"}
        </button>
      )}

      {hasActivePreset && isPresetDirty && (
        <button
          onClick={onSavePreset}
          disabled={isUpdatingPreset}
          className="px-3 py-2 text-sm font-medium rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
        >
          {isUpdatingPreset ? "Updating..." : "⟳ Update"}
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
