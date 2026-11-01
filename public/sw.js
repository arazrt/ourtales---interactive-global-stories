importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.setConfig({ debug: true });

const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { registerRoute, NavigationRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;

// Skip waiting for new SW activation
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Precache static assets (including placeholder)
precacheAndRoute([
  { url: "/", revision: "1" },
  { url: "/index.html", revision: "1" },
  { url: "/manifest.json", revision: "1" },
  { url: "/favicon.png", revision: "1" },
  { url: "/icons/placeholder.png", revision: "1" },
  { url: "/icons/icon-72x72.png", revision: "1" },
  { url: "/icons/icon-96x96.png", revision: "1" },
  { url: "/icons/icon-128x128.png", revision: "1" },
  { url: "/icons/icon-144x144.png", revision: "1" },
  { url: "/icons/icon-152x152.png", revision: "1" },
  { url: "/icons/icon-192x192.png", revision: "1" },
  { url: "/icons/icon-384x384.png", revision: "1" },
  { url: "/icons/icon-512x512.png", revision: "1" },
  { url: "/icons/badge-72x72.png", revision: "1" }
]);

// Clean old caches
cleanupOutdatedCaches();

// Navigation requests - NetworkFirst for SPA
registerRoute(
  new NavigationRoute(
    workbox.precaching.createHandlerBoundToURL("index.html"),
    {
      allowlist: [/^\/$/, /^\/#/, /^\/index\.html$/],
      denylist: [/^\/api\//]
    }
  )
);

// Cache JS with StaleWhileRevalidate
registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'app-scripts',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })]
  })
);

// Cache CSS with StaleWhileRevalidate
registerRoute(
  ({ request }) => request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'app-styles',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })]
  })
);

// Cache Google Fonts with CacheFirst + Expiration
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 })
    ]
  }),
  "GET"
);

// Cache Font Awesome from cdnjs
registerRoute(
  ({ url }) => url.origin === "https://cdnjs.cloudflare.com",
  new CacheFirst({
    cacheName: "font-awesome",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 })
    ]
  }),
  "GET"
);

// Cache Leaflet resources
registerRoute(
  ({ url }) => url.origin === "https://unpkg.com",
  new CacheFirst({
    cacheName: "leaflet-resources",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 })
    ]
  }),
  "GET"
);

// API request cache with NetworkFirst (except images)
registerRoute(
  ({ request, url }) =>
    url.origin === "https://story-api.dicoding.dev" &&
    !url.pathname.startsWith('/images/') &&
    request.destination !== "image",
  new NetworkFirst({
    cacheName: "stories-api",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })]
  }),
  "GET"
);

// Cache story images with CacheFirst + fallback placeholder
registerRoute(
  ({ url }) =>
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/images/stories/"),
  new CacheFirst({
    cacheName: 'stories-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }) // 30 days
    ],
    fetchOptions: {
      mode: 'no-cors',
      credentials: 'omit',
      cache: 'force-cache'
    },
    matchOptions: {
      ignoreSearch: true // Ignore query parameters when matching cache
    }
  }),
  'GET'
);

// Install event: warm cache placeholder + leaflet
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache the placeholder image immediately
      caches.open('stories-images').then((cache) => {
        console.log('[SW] Caching placeholder image');
        return cache.add('/icons/placeholder.png');
      }),
      // Cache Leaflet resources
      caches.open('leaflet-resources').then((cache) => {
        return Promise.all([
          cache.add('https://unpkg.com/leaflet/dist/leaflet.css'),
          cache.add('https://unpkg.com/leaflet/dist/leaflet.js')
        ]);
      })
    ])
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Cerita',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(self.registration.showNotification('Our Tales', options));
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});
