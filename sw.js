'use strict';

let pipeGLB = null;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'STORE_GLB') {
    pipeGLB = event.data.buffer;
    if (event.ports.length > 0) event.ports[0].postMessage({ ok: true });
  }
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (!url.pathname.endsWith('/pipe.glb') || !pipeGLB) return;

  // HEAD リクエストにも対応（model-viewer の存在確認用）
  if (event.request.method === 'HEAD') {
    event.respondWith(new Response(null, {
      status: 200,
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Content-Length': String(pipeGLB.byteLength),
        'Accept-Ranges': 'bytes',
      },
    }));
    return;
  }

  event.respondWith(new Response(pipeGLB, {
    status: 200,
    headers: {
      'Content-Type': 'model/gltf-binary',
      'Cache-Control': 'no-store',
      'Content-Length': String(pipeGLB.byteLength),
      'Accept-Ranges': 'bytes',
    },
  }));
});
