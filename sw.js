const CACHE_NAME = 'ourtales-cache-v1';
const IMAGE_CACHE_NAME = 'stories-images';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icons/placeholder.png',
  '/styles/styles.css',
  '/scripts/main.js',
  '/scripts/router/router.js',
  '/scripts/utils/db.js',
  '/scripts/utils/map.js',
  '/scripts/models/story-model.js',
  '/scripts/view/detail-view.js',
  '/scripts/view/home-view.js',
  '/scripts/view/map-view.js',
  '/scripts/view/saved-view.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)),
      caches.open(IMAGE_CACHE_NAME)
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle story API images with CacheFirst strategy
  if (url.hostname === 'story-api.dicoding.dev' && url.pathname.includes('/images/stories')) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => 
        cache.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request).then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return caches.match('/icons/placeholder.png');
            }
            
            // Cache the successful response
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            return caches.match('/icons/placeholder.png');
          });
        })
      )
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Don't cache API responses except for images
        if (url.hostname === 'story-api.dicoding.dev' && !url.pathname.includes('/images/stories')) {
          return networkResponse;
        }

        // Cache the response
        const responseToCache = networkResponse.clone();
        const cacheToUse = url.pathname.includes('/images/stories') ? IMAGE_CACHE_NAME : CACHE_NAME;
        
        caches.open(cacheToUse).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Return appropriate fallback based on request type
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        if (event.request.headers.get('accept').includes('image')) {
          return caches.match('/icons/placeholder.png');
        }
        return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/placeholder.png',
    badge: '/icons/placeholder.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Cerita',
        icon: '/icons/placeholder.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/placeholder.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('OurTales', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 