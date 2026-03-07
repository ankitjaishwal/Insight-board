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
      <PresetDropdown
        presets={presets}
        activePresetId={activePresetId}
        onSelectPreset={onSelectPreset}
        onSelectCustom={onSelectCustom}
      />

      {hasActivePreset && (
        <div className="relative">
          <button
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            disabled={isDeletingPreset || isUpdatingPreset}
            className="ui-button-secondary px-2 py-2"
          >
            ⋮
          </button>
          {showPresetMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white text-sm shadow-md dark:border-slate-700 dark:bg-slate-900">
              <button
                onClick={handleRenameClick}
                disabled={isUpdatingPreset}
                className="block w-full border-b border-slate-200 px-3 py-2 text-left hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Rename
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeletingPreset}
                className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                {isDeletingPreset ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}

      {showRenameModal && (
        <div className="ui-modal-backdrop">
          <div className="ui-modal-card max-w-md">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Rename Preset
            </h3>

            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
              }}
              placeholder="Enter new name"
              className="ui-input mb-4 w-full"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameValue("");
                }}
                className="ui-button-secondary"
              >
                Cancel
              </button>

              <button
                onClick={handleRenameSubmit}
                disabled={!renameValue.trim() || isUpdatingPreset}
                className="ui-button-primary"
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
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200"
        >
          {isCreatingPreset ? "Saving..." : "★ Save"}
        </button>
      )}

      {hasActivePreset && isPresetDirty && (
        <button
          onClick={onSavePreset}
          disabled={isUpdatingPreset}
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 shadow-sm hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
        >
          {isUpdatingPreset ? "Updating..." : "⟳ Update"}
        </button>
      )}

      <button
        onClick={onClearFilters}
        className="ui-button-secondary whitespace-nowrap px-4 py-2"
      >
        Clear
      </button>
    </div>
  );
};
