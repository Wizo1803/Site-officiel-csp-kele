/* =========================================================
   SERVICE WORKER — CSP KELE
   Version corrigée
   ========================================================= */

const CACHE_NAME = "csp-kele-v2";


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

                })

            );

        }).then(() => {

            return self.clients.claim();

        })

    );

});


/* =========================================================
   CHARGEMENT DES FICHIERS
   ========================================================= */

self.addEventListener("fetch", event => {

    event.respondWith(

        fetch(event.request)

            .then(response => {

                /*
                 * On récupère toujours la version
                 * actuelle depuis Internet.
                 */

                const responseClone = response.clone();

                caches.open(CACHE_NAME).then(cache => {

                    cache.put(event.request, responseClone);

                });

                return response;

            })

            .catch(() => {

                /*
                 * Si Internet n'est pas disponible,
                 * on utilise la version enregistrée.
                 */

                return caches.match(event.request);

            })

    );

});
