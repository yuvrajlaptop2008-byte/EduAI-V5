import { lazy, ComponentType, LazyExoticComponent } from "react";

/**
 * Enhanced lazy component loader that gracefully handles stale chunk hashes
 * after a new production deployment. If a dynamically imported module fails
 * to fetch (404 due to new bundle hash), it automatically reloads the page
 * to fetch the latest application bundle.
 */
export function lazyRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 1,
  intervalMs = 800
): LazyExoticComponent<T> {
  return lazy(async () => {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        return await factory();
      } catch (err: any) {
        attempt++;
        const message = String(err?.message || err || "");
        const isChunkError =
          message.includes("Failed to fetch dynamically imported module") ||
          message.includes("Importing a module script failed") ||
          message.includes("error loading dynamically imported module") ||
          err?.name === "ChunkLoadError";

        if (isChunkError) {
          console.warn("[EduAI] Chunk fetch failed for dynamic route. Reloading for newest deployment...", err);
          const reloadKey = "eduai_chunk_recovery_timestamp";
          const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
          // If we haven't reloaded in the last 15 seconds, trigger a reload to get new index.html
          if (Date.now() - lastReload > 15000) {
            sessionStorage.setItem(reloadKey, String(Date.now()));
            window.location.reload();
            return new Promise<{ default: T }>(() => {}); // Keep in pending state while page reloads
          }
        }

        if (attempt > retries) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
    throw new Error("Failed to load component");
  });
}
