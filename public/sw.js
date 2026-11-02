const CACHE_VERSION = "duartois-pwa-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
// Only what the offline fallback needs. The home page used to be cached here
// too, but it is never served from the cache (navigations go to /offline), so
// it was just an extra document download on every install.
const APP_SHELL = ["/offline", "/manifest.webmanifest", "/Logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Navigation preload: the network request for a page starts in parallel
    // with the worker's boot instead of after it.
    (self.registration.navigationPreload
      ? self.registration.navigationPreload.enable()
      : Promise.resolve()
    )
      .catch(() => undefined)
      .then(() => caches.keys())
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloaded = await event.preloadResponse;
          return preloaded || (await fetch(request));
        } catch {
          const staticCache = await caches.open(STATIC_CACHE);
          return staticCache.match("/offline");
        }
      })(),
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  const canCacheRuntime = ["image", "font"].includes(request.destination);
  if (!canCacheRuntime) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (!response.ok) {
          return response;
        }

        const responseClone = response.clone();
        caches
          .open(RUNTIME_CACHE)
          .then((cache) => cache.put(request, responseClone));
        return response;
      });
    }),
  );
});
