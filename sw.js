/* Metadat · service worker: funciona sin conexión */
const CACHE = 'metadat-1.2.1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/metadat.css?v=1.2.1', 'js/exif.js?v=1.2.1', 'js/img.js?v=1.2.1', 'js/frames.js?v=1.2.1', 'js/video.js?v=1.2.1', 'js/app.js?v=1.2.1',
  'img/logo_negro.png', 'img/logo_blanco.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/inter-400.woff', 'fonts/inter-500.woff', 'fonts/inter-600.woff', 'fonts/interd-300.woff', 'fonts/interd-500.woff', 'fonts/interd-600.woff', 'fonts/lora.woff', 'fonts/lora-i.woff', 'fonts/mono.woff'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: false }).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res; }).catch(() => caches.match('index.html'))));
});
