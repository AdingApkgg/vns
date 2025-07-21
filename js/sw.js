const CACHE_NAME = "i";
const urlsToCache = [
  "/index.html",
  "/css/main.css",
  "/js/main.js",
  "/manifest.json",
  "/img/logo.svg",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) => {
          return fetch(url, { mode: "no-cors" })
            .then((response) => {
              if (!response.ok) {
                console.warn(`无法缓存 ${url}`);
                return;
              }
              return cache.put(url, response);
            })
            .catch((err) => console.warn(`请求 ${url} 失败: ${err}`));
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
