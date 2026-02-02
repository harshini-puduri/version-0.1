import { backendMode } from "@/services/storageMode";

const DEMO_USER_ID = "demo_user";

export function getDemoUserId() {
  return DEMO_USER_ID;
}

export async function ensureDemoSeeded(signal?: AbortSignal) {
  const apiUrl = backendMode.getUrl();
  try {
    await fetch(`${apiUrl}/api/demo/seed?user_id=${encodeURIComponent(DEMO_USER_ID)}`, {
      method: "POST",
      signal,
    });
  } catch {
    // swallow errors; demo can still show fallback UI
  }
}
