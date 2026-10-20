/* MiraKel Ventas: guarda la app en el teléfono para que abra rápido y funcione sin internet.
   Las ventas y gastos no se guardan aquí: viven en el almacenamiento de la app (localStorage). */
importScripts('./version.js');
const VERSION = 'mk-ventas-' + self.APP_VERSION;
const ARCHIVOS = ['./','./index.html','./version.js','./manifest.webmanifest',
  './fonts/plus-jakarta-sans.woff2','./assets/logo.webp','./assets/wings.webp','./assets/firma.webp','./assets/flores.webp','./assets/peonias.webp',
  './icons/icon-192.png','./icons/apple-touch-icon.png','./icons/favicon.png'];
// Se descarga la versión nueva sin usar la caché del navegador; queda en espera hasta que la usuaria toca "Actualizar".
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' }))))); });
self.addEventListener('message', e => { if (e.data === 'activar') self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // la nube (Cloudflare) va directo a internet
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then(hit => hit || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); } return r; })));
});
