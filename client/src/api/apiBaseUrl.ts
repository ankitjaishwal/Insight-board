const DEFAULT_API_BASE_URL = "http://localhost:4000";

function normalizeBaseUrl(value: string | undefined): string {
  if (!value) {
    return DEFAULT_API_BASE_URL;
  }

  return value.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);
