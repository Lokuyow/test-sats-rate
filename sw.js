// Cache name
const SW_CACHE_NAME = 'sats-rate-caches-v1.30-test2';
const RATE_CACHE_NAME = 'rate-cache-v1';
const RATE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=jpy%2Cusd%2Ceur&include_last_updated_at=true&precision=3';
// Cache targets
const urlsToCache = [
  './index.html',
  './styles.css',
  './main.js',
  './favicons/favicon.ico',
  './images/icon_x192.png',
  './images/icon_x512.png',
  './images/maskable_icon_x192.png',
  './images/maskable_icon_x512.png',
  './images/title.svg',
  './images/copy-regular.svg',
  './images/paste-regular.svg',
  './images/白抜きのビットコインアイコン.svg',
  './images/白抜きの円アイコン.svg',
  './images/白抜きのドルアイコン.svg',
  './images/白抜きのユーロアイコン.svg',
  './images/square-x-twitter.svg',
  './images/nostr-icon-purple-on-white.svg',
  './images/cloud-solid.svg',
  './images/share-nodes-solid.svg',
  './images/clipboard-solid.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SW_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes(RATE_URL)) {
      event.respondWith(
          caches.open(RATE_CACHE_NAME).then((cache) => {
              return fetch(event.request)
                  .then((response) => {
                      cache.put(event.request, response.clone());
                      return response;
                  })
                  .catch(() => caches.match(event.request));
          })
      );
  } else {
      event.respondWith(
          caches
              .match(event.request)
              .then((response) => {
                  return response ? response : fetch(event.request);
              })
      );
  }
});

self.addEventListener('activate', (event) => {
  var cacheWhitelist = [SW_CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});