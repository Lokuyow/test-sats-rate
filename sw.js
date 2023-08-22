// Cache name
const SW_CACHE_NAME = 'sats-rate-caches-v1.30-test15';
const RATE_CACHE_NAME = 'rate-cache';
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=jpy%2Cusd%2Ceur&include_last_updated_at=true&precision=3';
// Cache targets
const urlsToCache = [
    './index.html',
    './styles.css',
    './main.js',
    './manifest.json',
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
            .then(() => {
                return caches.open(RATE_CACHE_NAME);
            })
            .then((cache) => {
                return fetch(COINGECKO_URL)
                    .then((response) => {
                        return cache.put(COINGECKO_URL, response);
                    });
            })
    );
});

self.addEventListener('fetch', (event) => {
    console.log('Fetch event triggered for:', event.request.url);
    if (event.request.url.includes(COINGECKO_URL)) {
        console.log('Rate URL detected:', COINGECKO_URL);
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // レスポンスをクローン
                    const clonedResponse = response.clone();
                    caches.open(RATE_CACHE_NAME).then((cache) => {
                        cache.keys().then((keys) => {
                            console.log('1Cache keys:', keys); // キャッシュ内の全てのキーを表示
                        });
                    });
                    // クローンをキャッシュに保存
                    caches.open(RATE_CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse).catch((error) => {
                            console.error('Failed to put cache:', error);
                        });
                    }).catch((error) => {
                        console.error('Failed to open cache:', error);
                    });                    
                    // 元のレスポンスを返す
                    return response;
                })
                .catch(() => {
                    // オフライン時のみキャッシュから取得を試みる
                    return caches.open(RATE_CACHE_NAME).then((cache) => {
                        return cache.match(event.request).then((response) => {
                            if (response) {
                                return response;
                            } else {
                                // キャッシュが存在しない場合の処理
                                return new Response("Offline data not available");
                            }
                        });
                    });
                })
        );
    } else {
        event.respondWith(
            caches.open(SW_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        if (event.request.method === 'GET') {
                            cache.put(event.request, networkResponse.clone());
                        }                        
                        return networkResponse;
                    }).catch(() => {
                        return new Response("Offline data not available");
                    });
                });
            })
        );
    }    
});

self.addEventListener('activate', (event) => {
    var cacheWhitelist = [SW_CACHE_NAME, RATE_CACHE_NAME];

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