const CACHE_NAME = 'erp-k9-v1';

// Cachear archivos principales
const urlsToCache = ['/', '/index.html', '/manifest.json'];

// Instalación
self.addEventListener('install', event => {
  console.log('🔨 SW instalando...');
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', event => {
  console.log('✅ SW activado');
  event.waitUntil(self.clients.claim());
});

// Fetch - INTERCEPTAR TODAS LAS PETICIONES
self.addEventListener('fetch', event => {
  // Caché primero, network fallback, offline.html
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
