// Defina a versão aqui (padrão semântico)
const version = '1.2.0'; // 🔁 Atualize conforme mudança 

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION_INFO', version });
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
