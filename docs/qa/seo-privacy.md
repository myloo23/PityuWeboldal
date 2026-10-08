# SEO és adatvédelmi működés – 2026. október 7.

## Megvalósítás és ellenőrzés

- 22 oldal: egyedi title/description, cegforma.hu canonical, megosztási metaadatok, parse-olható JSON-LD, oldalanként egy H1 és létező belső fájlhivatkozások.
- 17 sitemap URL: kezdőlap, katalógus, 15 termék. Mind megegyezik a canonical URL-lel. A termék színparamétere nem módosítja a canonicalt.
- A dist csomag nem tartalmazza az ügyfél leveleit vagy a belső dokumentumokat.
- A dist oldalain böngészve: nulla külső hálózati kérés, nulla süti, üres localStorage és sessionStorage, nulla konzolhiba vagy hibás HTTP-válasz.
- A négy jogi oldal 320, 390 és 1440 px szélességen nem lóg túl. Mobilos sütitájékoztató képernyőképe vizuálisan ellenőrizve.
- A meglévő check-site teszt is sikeres: termékek, színek, szűrés, menü, ajánlatkérő, minimum 5 darab, 10 képernyőszélesség.

Futtatás:

```sh
python3 scripts/build.py
python3 scripts/package-site.py
python3 -m http.server 8080 --bind 127.0.0.1
# Másik terminálban, elérhető Playwright + Chrome környezetből:
NODE_PATH=/Users/takacsmilan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/check-site.cjs
NODE_PATH=/Users/takacsmilan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/check-seo-privacy.cjs
```

## Korlátok

Helyi Chrome-ellenőrzés, nem a Rackhost éles konfigurációjának vizsgálata. A tárhely sütijei, naplói, HTTPS és átirányításai még ellenőrizendők. A Google indexelése, Search Console tulajdonjog és rangsorolás nem lett ellenőrizve; az oldal nincs e munkával publikálva. A jogi szövegek tervezetek; az üzemeltetői és adatkezelési hiányokat a külön kérdéslista tartalmazza. Az ajánlatkérő továbbra is csak helyi összesítőt készít.
