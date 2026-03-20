var CACHE_NAME = 'moriah-v3';
var URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // No cachear llamadas a la API de Anthropic ni a Google Sheets
  if (e.request.url.includes('api.anthropic.com') || 
      e.request.url.includes('script.google.com') ||
      e.request.url.includes('wa.me')) {
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(res) {
      // Guardar copia en cache
      if (res.status === 200) {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return res;
    }).catch(function() {
      // Si no hay red, servir desde cache
      return caches.match(e.request);
    })
  );
});
