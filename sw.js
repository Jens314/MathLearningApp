// Define a name for the cache
const CACHE_NAME = 'math-exercise-pwa-v1';

// List the files to be cached
const urlsToCache = [
  '/',
  '/index.html'
  // In a real app with separate CSS/JS, you'd add them here:
  // '/style.css',
  // '/script.js'
];

// --- INSTALL Event ---
// This event is triggered when the service worker is first installed.
self.addEventListener('install', event => {
  // We wait until the caching is complete before finishing the installation.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all the specified files to the cache
        return cache.addAll(urlsToCache);
      })
  );
});

// --- FETCH Event ---
// This event is triggered for every network request made by the page.
self.addEventListener('fetch', event => {
  event.respondWith(
    // Check if the requested resource is already in the cache
    caches.match(event.request)
      .then(response => {
        // If we found a match in the cache, return the cached version
        if (response) {
          return response;
        }
        // Otherwise, proceed with the actual network request
        return fetch(event.request);
      })
  );
});
