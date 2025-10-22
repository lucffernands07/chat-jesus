const CACHE_NAME = "jesus-chat-v6"; // nova versão do cache
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/script.js",
  "/script-salmos.js",
  "/api/chat.js",
  "/styles.css",
  "/manifest.json",
  "/icons/pray-128x.png",
  "/icons/pray-512x.png"
];

// Instala o SW e adiciona os arquivos ao cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // ativa imediatamente
});

// Ativa e remove caches antigos
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
    request.url.endsWith(".js") ||
    request.url.endsWith(".html") ||
    request.url.includes("/api/chat")
  ) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  } else {
    // Cache-first para CSS, imagens e outros
    event.respondWith(
      caches.match(request).then(response => response || fetch(request))
    );
  }
});

// Detecta novas versões e ativa imediatamente se receber mensagem
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
