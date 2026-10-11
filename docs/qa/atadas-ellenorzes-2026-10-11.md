# Átadás előtti felületi és működési ellenőrzés – 2026. október 11.

## Elkészült

- Arculathoz illő, teljes felületén kattintható fájlválasztó, feltöltési ikonnal, billentyűzetes fókusszal és fájlbehúzással.
- Csatolt fájlok számának és összméretének kijelzése, rendezett csatolmánykártyák. A hosszú fájlnevek 320 px-en sem lógnak ki.
- Törlés után eltűnik a korábbi feltöltési hibaüzenet.
- A feltöltési súgó követi az online küldés állapotát: kikapcsolt küldésnél külön jelzi, hogy a grafikákat a saját levélhez kell csatolni.
- A generált HTML/CSS és a dist csomag frissítve. Nem történt éles publikálás.

## Sikeres ellenőrzések

- `scripts/check-all.cjs`: termékek, mind a 70 színváltozat, navigáció, szűrés, keresés és előzmények, termék–ajánlatkérő átadás, minimum darabszám, feltételes mezők, összesítő, UTF-8 letöltés, mobilmenü, JavaScript nélküli tartalom, SEO, belső linkek. A meglévő reszponzív tesztek tíz szélességet fednek le 320–1440 px között.
- `scripts/check-handover.cjs`: mind a 22 oldal 320, 390, 768, 1024 és 1440 px-en; nincs vízszintes túlcsordulás vagy hibás képletöltés. Valós kattintásra megnyíló fájlválasztó, billentyűzetes fókusz, behúzás, tiltott kiterjesztés, üres/túlméretes fájl, darabszám- és összméretkorlát, törlés utáni helyreállás, hosszú fájlnevek.
- `scripts/check-delivery.py`: helyi PHP/SMTP és böngészős küldés; csatolmányok és elhelyezések, elveszett válasz utáni újrapróbálás, ismételt küldés elleni védelem, szerveroldali validálás, feltöltési támadások, korlátozás, kikapcsolt mód. Külső e-mail nem ment ki.
- Képernyőképes felületi áttekintés: kezdőlap, katalógus, termékoldal, ajánlatkérő és jogi oldal asztali, tablet- és mobilnézetben; a feltöltő külön részletes ellenőrzése.

Helyi futtatás: 127.0.0.1:8080 előnézet mellett `NODE_PATH=/tmp/cegforma-qa/node_modules node scripts/check-handover.cjs`. A NODE_PATH csak ezen a gépen lévő Playwright-telepítés útvonala. A teszt képernyőképei alapértelmezetten `/tmp/cegforma-handover` alá kerülnek; a hely `QA_OUTPUT` változóval megadható.

## Élesítés előtt még szükséges

A `scripts/check-release.py` két nyitott feltételt jelez: jogi véglegesítés/jóváhagyás és az online ajánlatküldés aktiválása. Az éles tárhely és SMTP beállítása, valamint valódi kézbesítési próba továbbra is szükséges. A helyi teszt nem igazolja a valódi postafiókba érkezést.

A böngészős tesztek Chrome-ban, emulált képernyőméretekkel futottak; fizikai iOS/Android készülékes, Safari- és Firefox-ellenőrzés nem történt. Az ismert Soft Padded Jacket Black/Black termékfotóhiány továbbra is jelzett helyőrző, nem hibás képlink. A beszállítói tartalmak felhasználási és az üzleti/jogi kérdések státuszát a kapcsolódó átadási dokumentumok tartalmazzák.
