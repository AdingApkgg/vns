// Tombstone: 清缓存并注销自身。可在所有旧用户更新后一并删除此文件、
// hugo.toml 的 [outputFormats.SW] 与 outputs.home 中的 "SW"。
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
  })());
});
