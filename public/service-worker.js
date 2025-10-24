// Defina a versão aqui
const version = 'v8'; // Troque para cada atualização

// Recebe mensagem do front-end
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // ativa imediatamente o SW novo
  }
});

// Garante que o SW novo controle todas as janelas abertas
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Passa todas as requisições diretamente para o servidor
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
