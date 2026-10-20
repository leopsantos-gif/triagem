// Service Worker — MAVI Triagem Cardiovascular e Histórico de Saúde
// - Páginas (HTML): busca primeiro a versão nova na rede; sem internet, usa a cópia guardada.
//   Assim o app instalado recebe atualizações e continua funcionando offline.
// - Demais arquivos (ícones, manifest): usa a cópia guardada primeiro.
// - Nenhum dado de questionário passa por aqui: os registros ficam no IndexedDB do aparelho.

const CACHE_NAME = 'mavi-triagem-v15';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isPage) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
