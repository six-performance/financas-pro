// Service Worker Minimalista - Apenas para permitir instalação PWA
// Sem cache offline - apenas o necessário para ser um PWA válido
const CACHE_VERSION = 'v2'; // Atualizado para forçar nova instalação

self.addEventListener('install', (event) => {
  console.log('Service Worker instalado - PWA pronto para instalação');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado - Limpando caches antigos');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deletando cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch simples - sempre busca da rede (sem cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.log('Erro no fetch:', error);
      // Retorna uma resposta básica se o fetch falhar
      return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});

