const V='palestra-v1-12';
const FILES=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  const key=r.mode==='navigate'?'./index.html':r;
  const net=fetch(r).then(async res=>{if(res&&res.ok){const c=await caches.open(V);await c.put(key,res.clone())}return res}).catch(()=>null);
  e.waitUntil(net.then(()=>{}));
  e.respondWith((async()=>{const c=await caches.open(V);const hit=await c.match(key,{ignoreSearch:true});return hit||(await net)||new Response('Offline',{status:503,headers:{'Content-Type':'text/plain'}})})());
});
