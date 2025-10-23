const version = new URL(self.location).searchParams.get('v') || 'v1';
const CACHE_NAME = `jesus-chat-${version}`;

const ASSETS_TO_CACHE = [
  "/styles.css",
  "/script.js",
  "/script-salmos.js",
  "/manifest.json",
  "/icons/pray-128x.png",
  "/icons/pray-512x.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Intercepta requisições
self.addEventListener("fetch", event => {
  const request = event.request;

  // Network-first para HTML, JS e API
  if (
    request.url.endsWith(".html") ||
    request.url.endsWith(".js") ||
    request.url.includes("/api/chat")
  ) {
    event.respondWith(
      fetch(request)
        .then(resp => {
          // Atualiza cache para offline
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return resp;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first para CSS, imagens e ícones
    event.respondWith(
      caches.match(request).then(response => response || fetch(request))
    );
  }
});

// Recebe mensagem para ativar imediatamente
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
