const CACHE_NAME = "jesus-chat-v4"; // nova versão do cache
const ASSETS_TO_CACHE = [
  "/",
  "/styles.css",
  "/manifest.json",
  "/icons/pray-128x.png",
  "/icons/pray-512x.png"
];

// Instala o SW e adiciona ao cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // força ativação imediata
});

// Ativa e limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Intercepta as requisições
self.addEventListener("fetch", event => {
  const request = event.request;

  // Sempre buscar HTML e JS do servidor (para pegar atualizações)
  if (request.url.endsWith(".js") || request.url.endsWith(".html")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  } else {
    // Cache-first para os demais (CSS, imagens, etc.)
    event.respondWith(
      caches.match(request).then(response => response || fetch(request))
    );
  }
});

// --- Detecta novas versões e avisa o cliente ---
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});  } else {
    // Para CSS, imagens e outros, usa cache primeiro
    event.respondWith(
      caches.match(request).then(response => response || fetch(request))
    );
  }
});
