const CACHE_NAME = "softservice-v3";

// Universal safe relative paths (works locally + GitHub)
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALL SW
self.addEventListener("install", event => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ASSETS_TO_CACHE)
    )
  );
  self.skipWaiting();
});

// ACTIVATE SW
self.addEventListener("activate", event => {
  console.log("[SW] Activated");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => (k === CACHE_NAME ? null : caches.delete(k)))
      )
    )
  );
  self.clients.claim();
});

// FETCH HANDLER
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(res => {
          // Cache new network responses
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, res.clone());
          });
          return res;
        })
        .catch(() => caches.match("./offline.html"));
    })
  );
});