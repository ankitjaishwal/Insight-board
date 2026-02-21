import { useEffect, useMemo, useState, useRef } from "react";
import { presetService } from "../services/presetService";
import type { FilterPreset } from "../types/preset";
import type { TransactionFilters as TransactionFiltersType } from "../types/transactionFilters";
import { deepEqual } from "../utils";

interface UsePresetsReturn {
  presets: FilterPreset[];
  activePresetId: string | null;
  activePreset: FilterPreset | null;
  isPresetDirty: boolean;
  showSaveModal: boolean;
  presetName: string;
  setActivePresetId: (id: string | null) => void;
  setShowSaveModal: (show: boolean) => void;
  setPresetName: (name: string) => void;
  handleSavePreset: (name: string) => void;
  handlePresetAction: () => void;
  handleApplyPreset: (
    preset: FilterPreset,
    setSearchParams: (params: URLSearchParams) => void,
  ) => void;
  handleSelectCustom: () => void;
  handleDeletePreset: (id: string) => void;
}

export const usePresets = (
  filters: TransactionFiltersType,
): UsePresetsReturn => {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const presetIdRef = useRef<string | null>(null);

  // Initialize presets on mount
  useEffect(() => {
    setPresets(presetService.getAll());
  }, []);

  // Find current active preset
  const activePreset = useMemo(() => {
    return presets.find((p) => p.id === activePresetId) || null;
  }, [presets, activePresetId]);

  // Check if current filters diverged from active preset
  const isPresetDirty = useMemo(() => {
    if (!activePreset) return false;
    return !deepEqual(filters, activePreset.filters);
  }, [filters, activePreset]);

  // Auto-detect preset on load or preset list change
  useEffect(() => {
    if (activePresetId) return;
    if (presets.length === 0) return;

    const matchingPreset = presets.find((p) => deepEqual(filters, p.filters));
    if (matchingPreset) {
      setActivePresetId(matchingPreset.id);
      presetIdRef.current = matchingPreset.id;
    }
  }, [presets]);

  // Clear activePresetId when filters diverge
  useEffect(() => {
    if (activePresetId && activePresetId === presetIdRef.current) {
      return;
    }

    if (activePresetId) {
      const preset = presets.find((p) => p.id === activePresetId);
      if (preset && !deepEqual(filters, preset.filters)) {
        setActivePresetId(null);
        presetIdRef.current = null;
      }
    }
  }, [filters, activePresetId, presets]);

  const handleSavePreset = (name: string) => {
    if (!name.trim()) {
      alert("Preset name required");
      return;
    }

    const newPreset: FilterPreset = {
      id: crypto.randomUUID(),
      name: name.trim(),
      filters,
      createdAt: Date.now(),
    };

    presetService.save(newPreset);
    setPresets(presetService.getAll());
    setActivePresetId(newPreset.id);
    presetIdRef.current = newPreset.id;

    setPresetName("");
    setShowSaveModal(false);
  };

  const handlePresetAction = () => {
    // UPDATE: direct update without modal
    if (activePreset && isPresetDirty) {
      const updatedPreset: FilterPreset = {
        ...activePreset,
        filters,
      };
      presetService.update(updatedPreset);
      setPresets(presetService.getAll());
      presetIdRef.current = activePreset.id;
      return;
    }

    // CREATE: open modal
    setShowSaveModal(true);
  };

  const handleApplyPreset = (
    preset: FilterPreset,
    setSearchParams: (params: URLSearchParams) => void,
  ) => {
    const newParams = new URLSearchParams();

    if (preset.filters.search) {
      newParams.set("search", preset.filters.search);
    }
    if (preset.filters.status && preset.filters.status.length > 0) {
      newParams.set("status", preset.filters.status.join(","));
    }
    if (preset.filters.from) {
      newParams.set("from", preset.filters.from);
    }
    if (preset.filters.to) {
      newParams.set("to", preset.filters.to);
    }
    if (preset.filters.minAmount !== undefined) {
      newParams.set("min", String(preset.filters.minAmount));
    }
    if (preset.filters.maxAmount !== undefined) {
      newParams.set("max", String(preset.filters.maxAmount));
    }

    setSearchParams(newParams);
    setActivePresetId(preset.id);
    presetIdRef.current = preset.id;
  };

  const handleSelectCustom = () => {
    setActivePresetId(null);
  };

  const handleDeletePreset = (id: string) => {
    presetService.delete(id);
    setPresets(presetService.getAll());

    if (activePresetId === id) {
      setActivePresetId(null);
      presetIdRef.current = null;
    }
  };

  return {
    presets,
    activePresetId,
    activePreset,
    isPresetDirty,
    showSaveModal,
    presetName,
    setActivePresetId,
    setShowSaveModal,
    setPresetName,
    handleSavePreset,
    handlePresetAction,
    handleApplyPreset,
    handleSelectCustom,
    handleDeletePreset,
  };
};
