# Ellenőrzés – 2026. október 6.

Eredmény: sikeres. Helyi Chrome/Playwright teszt és vizuális ellenőrzés.

- 1440, 768, 390 és 320 px széles nézetben nincs oldalirányú dokumentumkilógás. A kategóriasáv mobilon szándékosan vízszintesen görgethető.
- Kezdőlap, katalógus, kétféle termékoldal, ajánlatkérő és adatkezelési helyőrző ellenőrizve mind a négy szélességen.
- Mind a 15 termékoldal és mind a 70 előírt színválasztás ellenőrizve. A választás a helyes képet/helyőrzőt és ajánlatkérő-paramétert állítja be.
- Az egyetlen hiányzó kép felismerhető helyőrzőt mutat: Soft Padded Jacket / Black/Black.
- A Malfini teljes katalógus blokk a 9 Malfini-terméknél megjelenik, a 6 Falk & Ross terméknél hiányzik.
- Kategóriaszűrés, cikkszámkeresés és üres találati állapot működik.
- Mobilmenü nyitás, bezárás és Escape-billentyű működik.
- A termék/szín paraméterek átkerülnek az ajánlatkérőbe.
- A 3 darabos igény nem érvényes; 3 + 2 különböző termék együtt érvényes. Sor eltávolítása után a minimum újraszámolódik.
- Egyedi termék/cikkszám és szín is megadható (pl. további katalógusból választott termék).
- Az elülső és hátsó magasságmezők megfelelően váltanak; a rejtett mezők nem kerülnek az összesítőbe.
- Az összesítő a megadott termékeket és az összes mennyiséget tartalmazza. Adatmódosítás után az előző összesítő elrejtőzik.
- Fájlfeltöltő mező nincs. A felület nem állítja, hogy az ajánlatkérés elküldésre került.
- Nincs JavaScript-hiba vagy hibás helyi HTTP-erőforrás.
- A dist/ összes HTML-hivatkozása és képfájl-hivatkozása meglévő helyi fájlra mutat.
- A 141 fájlos, kb. 9,39 MiB-os publikus csomagban nincs .eml, belső dokumentáció vagy eredeti ügyféllevél.

Vizuálisan ellenőrzött képernyőképek: home-desktop.png, home-mobile.png, catalog-mobile.png, product-desktop.png, quote-mobile.png. A táblázatok az eredeti beszállítói PDF-ek alapján jelennek meg; két sapkához a beszállító tényleges méretsor helyett termékadatlapot adott, amit helyőrzővel jelöltünk.

Nem történt nyilvános publikálás, valódi e-mail-küldés vagy tárhelyoldali teszt. A Rackhost-csomag és a PHP-s küldés a következő ütem része.

A teszt újrafuttatásához a 8080-as porton futó helyi szerver, Playwright és Chrome szükséges:

```sh
NODE_PATH=/Users/takacsmilan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/check-site.cjs
```

## Arculati átdolgozás ellenőrzése

A végleges új arculattal ismét sikeres a teljes 19 oldalas ellenőrzés, 320/390/768/1440 px szélességen. Az új betűtípusok betöltése után sincs vízszintes dokumentumkilógás. Vizuálisan ellenőrizve a kezdőlap asztali és mobil nézete, a katalógus, a termékoldal és az ajánlatkérő.

Külön teszt: kezdőlapi színváltás és választást megőrző terméklink; kategória-előnézet egérrel és billentyűzetfókusszal; mindhárom SVG-elhelyezési mód; natív technológia-részletező nyitása; a DTF-opció elérhetősége az űrlapon. A helyi fontok bekerülnek a publikus csomagba. Az alkalmazáson belüli meglévő előnézet frissítve az új verzióra.

## Mobilos javítások – 2026. október 6.

- A választék hibája reprodukálva: 1440 px-en a következő szekció dokumentumon belüli kezdete a különböző képek hatására 1556–1899 px között változott.
- Javítás után mind a 8 kategória valódi hoverével, a képek dekódolását megvárva és billentyűzetes fókusszal is 0 px változás: 1440, 1024 és 768 px-en.
- Általános regresszió: 320, 360, 375, 390, 430, 600, 768, 820, 1024, 1440 px. Nincs vízszintes kilógás vagy hibás termékkép a vizsgált oldaltípusokon. A 15 termék összes színváltozata, valamint az ajánlatkérő működése sikeresen ellenőrizve.
- Mobilos Chromium-emuláció: menü és horgony, összecsukható szűrő, valódi tap események, 44×44 px-es színválasztók, kiválasztott szín átadása az adatlapnak és űrlapnak, legalább 16 px-es űrlapmezők, méretváltás, 667×375-ös fekvő menü és JavaScript nélküli kategóriaelérés sikeres.
- Friss vizuális ellenőrzés: `mobile-home-optimized.png`, `mobile-about-optimized.png`, `mobile-catalog-optimized.png`, `mobile-quote-optimized.png`.
