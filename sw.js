// This is a basic service worker file.
// It's required for the PWA to be installable and provides a base for offline functionality.

const CACHE_NAME = 'math-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // You can add paths to your CSS and other assets here if they were in separate files
  // '/style.css',
  // '/app.js' 
  // Add icon paths if you want them to be cached
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event: fires when the browser installs the service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  // waitUntil() ensures that the service worker will not install until the code inside has successfully completed.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: fires when the service worker is activated
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  // This can be used to clean up old caches
});


// Fetch event: fires every time the app requests a resource
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  // This strategy returns the cached version first, and if not found, fetches from the network.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If the request is in the cache, return it
        if (response) {
          return response;
        }
        // Otherwise, fetch the request from the network
        return fetch(event.request);
      })
  );
});
