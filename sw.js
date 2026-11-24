const V='palestra-v1-13';
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
/* Timer di recupero anche con l'app in background: notifica che vibra alla fine */
let tmr=null;
function stopT(){if(tmr){clearTimeout(tmr.id);tmr.res();tmr=null}}
self.addEventListener('message',e=>{
  const d=e.data||{};
  if(d.t==='timer'){
    stopT();
    e.waitUntil(new Promise(res=>{
      const id=setTimeout(async()=>{
        tmr=null;
        try{
          const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
          if(!cl.some(c=>c.visibilityState==='visible'))
            await self.registration.showNotification(d.title||'Recupero finito',{body:d.body||'Vai con la prossima serie 💪',tag:'timer',renotify:true,vibrate:[500,200,500,200,800],icon:'icon-192.png',badge:'icon-192.png'});
        }catch(x){}
        res();
      },Math.max(0,d.end-Date.now()));
      tmr={id,res};
    }));
  }else if(d.t==='stop')stopT();
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cl=>cl.length?cl[0].focus():self.clients.openWindow('./')));
});
