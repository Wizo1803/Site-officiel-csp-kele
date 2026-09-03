/* =========================================================
   SERVICE WORKER — CSP KELE
   Version 3 — correction mobile / Google Apps Script
   ========================================================= */

const CACHE_NAME = "csp-kele-v3";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json"
];


/* =========================================================
   INSTALLATION
   ========================================================= */

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

});


/* =========================================================
   ACTIVATION
   ========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames.map(cacheName => {

                    if (cacheName !== CACHE_NAME) {

                        return caches.delete(cacheName);

                    }

                    return Promise.resolve();

                })

            );

        }).then(() => {

            return self.clients.claim();

        })

    );

});


/* =========================================================
   REQUÊTES
   ========================================================= */

self.addEventListener("fetch", event => {

    const request = event.request;
    const url = new URL(request.url);


    /* -----------------------------------------------------
       1. Ne jamais intercepter les requêtes POST
       ----------------------------------------------------- */

    if (request.method !== "GET") {

        return;

    }


    /* -----------------------------------------------------
       2. Ne pas intercepter les sites externes
          notamment Google Apps Script
       ----------------------------------------------------- */

    if (url.origin !== self.location.origin) {

        return;

    }


    /* -----------------------------------------------------
       3. Pour les fichiers du site :
          réseau d'abord, cache en secours
       ----------------------------------------------------- */

    event.respondWith(

        fetch(request)

            .then(response => {

                if (response && response.ok) {

                    const responseClone = response.clone();

                    caches.open(CACHE_NAME).then(cache => {

                        cache.put(request, responseClone);

                    });

                }

                return response;

            })

            .catch(() => {

                return caches.match(request);

            })

    );

});
