const CACHE_NAME = "jesus-chat-v2"; // nova versão do cache
const ASSETS_TO_CACHE = [
  "/",
  "/styles.css",
  "/icons/pray-128x.png",
  "/icons/pray-512x.png",
  "/manifest.json"
];

// Instala o SW e adiciona recursos essenciais ao cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativa o SW e remove caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercepta requisições
self.addEventListener("fetch", event => {
  const url = event.request.url;

  // JS e HTML: fetch first
  if (url.endsWith(".js") || url.endsWith(".html")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Outros arquivos: cache first
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
