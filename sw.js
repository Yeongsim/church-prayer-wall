// A basic service worker to make the app installable.

self.addEventListener('install', (event) => {
  // console.log('Service Worker installing.');
  // Perform install steps
});

self.addEventListener('fetch', (event) => {
  // console.log('Fetching:', event.request.url);
  // This basic fetch handler can be extended to allow the app to work offline
  // by serving cached resources.
  // For now, we'll just pass through network requests.
  event.respondWith(fetch(event.request));
});
