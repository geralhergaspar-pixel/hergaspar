var CACHE_NAME = 'hergaspar-v16-cache-4';
var FILES_TO_CACHE = [
  './hergaspar_v16_sync.html',
  './manifest.json',
  './logo.png',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js'
];

self.addEventListener('install', function(evt){
  evt.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(evt){
  evt.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

// Estratégia: cache-first para o "casco" da app (funciona offline),
// mas tenta sempre atualizar em segundo plano quando há rede.
self.addEventListener('fetch', function(evt){
  if(evt.request.method!=='GET')return;
  evt.respondWith(
    caches.match(evt.request).then(function(cached){
      var fetchPromise = fetch(evt.request).then(function(networkResp){
        if(networkResp && networkResp.status===200){
          var respClone = networkResp.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(evt.request, respClone); });
        }
        return networkResp;
      }).catch(function(){ return cached; });
      return cached || fetchPromise;
    })
  );
});
