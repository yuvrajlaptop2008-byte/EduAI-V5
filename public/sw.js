// EduAI Service Worker — cache-first for static assets, network-first for API
const CACHE = "eduai-v1";
const STATIC = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Skip Firebase, analytics, and non-GET
  if (e.request.method !== "GET" || url.hostname.includes("firebase") || url.hostname.includes("googleapis") || url.hostname.includes("anthropic")) return;

  if (e.request.destination === "document") {
    // Network-first for navigation
    e.respondWith(fetch(e.request).catch(() => caches.match("/index.html")));
    return;
  }

  // Cache-first for static JS/CSS/fonts/images
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
