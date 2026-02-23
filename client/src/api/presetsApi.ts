import { fetchWithAuth } from "./fetchWithAuth";
import type { FilterPreset } from "../types/preset";

const PRESETS_URL = "http://localhost:4000/api/presets";

type PresetDto = {
  id: string;
  name: string;
  filters: unknown;
  createdAt: number | string;
};

function toPreset(dto: PresetDto): FilterPreset {
  return {
    id: dto.id,
    name: dto.name,
    filters: dto.filters as FilterPreset["filters"],
    createdAt:
      typeof dto.createdAt === "number"
        ? dto.createdAt
        : new Date(dto.createdAt).getTime(),
  };
}

async function parseApiError(res: Response, fallback: string): Promise<never> {
  let message = fallback;

  try {
    const payload = await res.json();
    if (payload?.error && typeof payload.error === "string") {
      message = payload.error;
    }
  } catch {
    // Keep fallback message when JSON parse fails.
  }

  throw new Error(`${message} (status ${res.status})`);
}

export async function fetchPresets(): Promise<FilterPreset[]> {
  const res = await fetchWithAuth(PRESETS_URL);
  if (!res.ok) {
    return parseApiError(res, "Failed to fetch presets");
  }

  const data = (await res.json()) as PresetDto[];
  return data.map(toPreset);
}

export async function createPreset(
  newPreset: FilterPreset,
): Promise<FilterPreset> {
  const res = await fetchWithAuth(PRESETS_URL, {
    method: "POST",
    body: JSON.stringify(newPreset),
  });
  if (!res.ok) {
    return parseApiError(res, "Failed to create preset");
  }

  return toPreset((await res.json()) as PresetDto);
}

export async function updatePreset(
  nextPreset: FilterPreset,
): Promise<FilterPreset> {
  const res = await fetchWithAuth(`${PRESETS_URL}/${nextPreset.id}`, {
    method: "PUT",
    body: JSON.stringify(nextPreset),
  });
  if (!res.ok) {
    return parseApiError(res, "Failed to update preset");
  }

  return toPreset((await res.json()) as PresetDto);
}

export async function deletePreset(presetId: string): Promise<string> {
  const res = await fetchWithAuth(`${PRESETS_URL}/${presetId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    return parseApiError(res, "Failed to delete preset");
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

// Legacy test helper kept for compatibility after moving to API-backed presets.
export function resetPresetsStore() {}
