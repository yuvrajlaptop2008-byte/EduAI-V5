import { StrictMode } from"react";
import { createRoot } from"react-dom/client";
import"./index.css";
import App from"./App.tsx";
import { UserProvider } from"./context/UserContext.tsx";

// Auto-recovery for stale dynamic module imports when a new build is deployed
window.addEventListener("vite:preloadError", (event) => {
  console.warn("[EduAI] New version deployed or dynamic import failed. Reloading...");
  event.preventDefault();
  const reloadKey = "eduai_preload_retry";
  const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
  if (Date.now() - lastReload > 10000) {
    sessionStorage.setItem(reloadKey, String(Date.now()));
    window.location.reload();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const msg = String(event.reason?.message || event.reason || "");
  if (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module")
  ) {
    console.warn("[EduAI] Unhandled dynamic import error detected, auto-recovering...", msg);
    const reloadKey = "eduai_preload_retry";
    const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
    if (Date.now() - lastReload > 10000) {
      sessionStorage.setItem(reloadKey, String(Date.now()));
      window.location.reload();
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
);
