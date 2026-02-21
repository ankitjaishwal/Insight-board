import { type FilterPreset } from "../types/preset";

const STORAGE_KEY = "tx_filter_presets";

function readStorage(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(presets: FilterPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export const presetService = {
  getAll(): FilterPreset[] {
    return readStorage();
  },

  save(preset: FilterPreset): FilterPreset {
    const presets = readStorage();
    const updated = [...presets, preset];
    writeStorage(updated);
    return preset;
  },

  delete(id: string): void {
    const presets = readStorage();
    const updated = presets.filter((p) => p.id !== id);
    writeStorage(updated);
  },

  update(updatedPreset: FilterPreset): void {
    const presets = readStorage();
    const updated = presets.map((p) =>
      p.id === updatedPreset.id ? updatedPreset : p,
    );
    writeStorage(updated);
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
