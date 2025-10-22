const CACHE_NAME = "jesus-chat-v2"; // nova versão para forçar atualização
const ASSETS_TO_CACHE = [
  "/",
  "/styles.css",
  "/manifest.json",
  "/icons/pray-128x.png",
  "/icons/pray-512x.png"
];

// Instala o Service Worker e armazena os arquivos no cache
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
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Intercepta requisições
self.addEventListener("fetch", event => {
  const request = event.request;

  // Sempre busca JS e HTML diretamente do servidor
  if (request.url.endsWith(".js") || request.url.endsWith(".html")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request)) // fallback para cache se offline
    );
  } else {
    // Para CSS, imagens e outros, usa cache primeiro
    event.respondWith(
      caches.match(request).then(response => response || fetch(request))
    );
  }
});
