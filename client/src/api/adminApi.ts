import { fetchWithAuth } from "./fetchWithAuth";

export async function resetDemoData(): Promise<{ success: boolean }> {
  const res = await fetchWithAuth(
    "http://localhost:4000/api/admin/reset-demo",
    {
      method: "POST",
    },
  );

  if (!res.ok) {
    let message;

    try {
      const data = await res.json();
      if (typeof data?.error === "string") {
        message = data.error;
      }
    } catch {
      message = `Failed to reset demo data: ${res.status} ${res.statusText}`;
    }

    throw new Error(message);
  }

  return res.json();
}
