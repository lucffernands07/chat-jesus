// Defina a versão aqui
const version = 'v1'; // *** Troque para cada atualização

const ASSETS_TO_CACHE = [
  "/styles.css",
  "/script.js",
  "/script-salmos.js",
  "/manifest.json",
  "/icons/pray-128x.png",
  "/icons/pray-512x.png",
  "/img/image-bkg-ceu.jpeg"
];


// Recebe mensagem do front-end
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // força a ativação imediata
  }
});

// Garante que o SW novo controle todas as janelas abertas
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});
