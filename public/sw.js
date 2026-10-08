const CACHE_NAME = "press-cache-v1";

self.addEventListener("install", (event) => {
  // Obliga al service worker a instalarse inmediatamente
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Toma control de las pestañas abiertas inmediatamente
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Estrategia sencilla: Network First (Intenta internet, si falla, usa caché)
  if (event.request.method === "GET") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si la respuesta es buena, la guardamos en caché
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
          return response;
        })
        .catch(() => {
          // Si falla internet, devolvemos lo que hay en caché
          return caches.match(event.request);
        })
    );
  }
});
