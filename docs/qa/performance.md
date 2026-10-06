# Betöltési optimalizálás – 2026. október 6.

Helyi Chrome/Playwright mérés: 390×844 px, 150 ms késleltetés, 200 000 bájt/s letöltés, üres gyorsítótár. Egy előtte/utána futás; az idők tájékoztató jellegűek. A helyi Python-kiszolgáló nem alkalmazza az Apache tömörítési és cache-szabályait. Az éles tárhely válaszidejét ez a mérés nem vizsgálja.

| Oldal | Letöltés előtte → utána | LCP előtte → utána | load előtte → utána |
|---|---|---|---|
| index.html | 330 → 289 kB | 2.06 → 1.16 s | 2.10 → 1.57 s |
| katalogus.html | 547 → 337 kB | 2.61 → 1.24 s | 3.11 → 2.36 s |
| termekek/classic-new-132.html | 338 → 202 kB | 1.13 → 0.89 s | 1.91 → 1.45 s |
| ajanlatkeres.html | 302 → 161 kB | 1.10 → 0.92 s | 1.78 → 1.23 s |

Változások: újrahasznosított külső színminták; csak a böngésző által használt termékmezők; termékoldalanként külön adatfájl; egyetlen közös CSS-fájl; azonos fontfájlok közös URL-je; képernyőméret szerint előtöltött nyitókép; tartalomhash alapú CSS/JS verziózás; opcionális Apache tömörítés és cache.

Sikeres ellenőrzés: check-site.cjs, check-quote.cjs, check-responsive.cjs. A build és a publikus csomag újragenerálva.
