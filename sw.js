// ============================================================
//  サービスワーカー（最小構成）
//  ・入口ページとアイコンをキャッシュして、PWAとして成立させる
//  ・GASアプリ本体（iframeの中身）はキャッシュしない（常に最新を表示）
// ============================================================
var CACHE = 'gelato-shell-v1';

// インストール時：入口ページ一式をキャッシュ
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll([
        './',
        './index.html',
        './manifest.json',
        './icons/apple-touch-icon.png',
        './icons/icon-192.png',
        './icons/icon-512.png'
      ]);
    })
  );
  self.skipWaiting();
});

// 有効化時：古いキャッシュを掃除
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== CACHE) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

// 取得時：入口ページ一式はキャッシュ優先、それ以外は通常通り
self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // GAS（script.google.com 等）へのリクエストは触らずそのまま通す
  if (url.indexOf('script.google.com') > -1 || url.indexOf('googleusercontent.com') > -1) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request);
    })
  );
});
