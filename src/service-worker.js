const CACHE_NAME = 'ourtales-image-cache-v1';

// Install event - cache the placeholder image
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching placeholder image');
      return cache.add('/icons/placeholder.png');
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[Service Worker] Current caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle image requests
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
  
    const isPhotoRequest = 
      url.hostname === 'story-api.dicoding.dev' && 
      url.pathname.startsWith('/images/stories/photos-');
  
    if (isPhotoRequest) {
      console.log('[SW] Intercept image request:', event.request.url);
  
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving from cache:', event.request.url);
              return cachedResponse;
            }
  
            console.log('[SW] Not cached, fetching from network:', event.request.url);
            return fetch(event.request)
              .then((networkResponse) => {
                if (!networkResponse || !networkResponse.ok) {
                  throw new Error('Network error');
                }
  
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              })
              .catch((error) => {
                console.log('[SW] Failed fetch, using placeholder:', error);
                return cache.match('/icons/placeholder.png');
              });
          });
        })
      );
    }
  });  