const CACHE_NAME = 'darwin-lab-v5';
const CORE_FILES = ['./', 'index.html', 'src/styles.css', 'src/content.js', 'src/app.js', 'manifest.webmanifest', 'manus-routes.json', 'assets/darwin-mark.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('darwin-lab-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && (request.destination === 'image' || request.destination === 'audio' || new URL(request.url).pathname.includes('/src/'))) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const offlineIndex = await cache.match('index.html');
        if (offlineIndex) return offlineIndex;
      }
      return new Response('Este recurso aún no se guardó en el dispositivo. Conéctate para cargarlo.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
