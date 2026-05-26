/**
 * Per-browser pseudo-anonymous id, used so the server can avoid re-serving
 * recently-seen questions to the same user. No auth, no PII — just a UUID in
 * localStorage. Survives reloads, resets if the user clears site data.
 */
const BROWSER_ID_KEY = 'a2_prep_browser_id';

export function getBrowserId(): string {
  try {
    let id = localStorage.getItem(BROWSER_ID_KEY);
    if (!id) {
      id = (crypto as any).randomUUID
        ? crypto.randomUUID()
        : `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(BROWSER_ID_KEY, id);
    }
    return id;
  } catch {
    return `transient_${Math.random().toString(36).slice(2, 10)}`;
  }
}
