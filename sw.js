const CACHE='clip-sizer-shell-v46';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Re-serve the app's own responses with COOP/COEP added so the page can use the multithreaded encoder.
// Cross-origin requests are not touched (no respondWith): they go to the network exactly as before.
const isolate=r=>{
  if(!r||r.status===0||r.type==='opaque'||r.type==='opaqueredirect')return r;
  const h=new Headers(r.headers);
  h.set('Cross-Origin-Opener-Policy','same-origin');
  h.set('Cross-Origin-Embedder-Policy','require-corp');
  return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h});
};
self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)).then(isolate))});
