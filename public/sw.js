// Service Worker for Quantum Computer Timeline - TESTING MODE
// ALL CACHING DISABLED - Forces fresh content from network

const CACHE_NAME = 'qpu-timeline-v1';

// Install event - clear all caches for testing
self.addEventListener('install', (event) => {
  console.log('Service Worker installing - CLEARING ALL CACHES for testing');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clear all existing caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating - CLEARING ALL CACHES for testing');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - BYPASS CACHE for testing - always fetch from network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  console.log('TESTING MODE: Bypassing cache for:', event.request.url);
  
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store', // Force fresh fetch
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    .then((response) => {
      console.log('Fetched fresh from network:', event.request.url);
      return response;
    })
    .catch((error) => {
      console.error('Network fetch failed:', error);
      throw error;
    })
  );
});
