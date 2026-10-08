# Ajánlatküldés ellenőrzése – 2026. október 8.

Sikeres helyi ellenőrzés PHP 8.5.10, Chrome/Playwright környezetben. A megvalósítás PHP 8.2+ szintaxist használ; a tényleges Rackhost PHP-verzióval külön próba kell.

- Az öt meglévő böngészős teszt sikeres: oldalak, termékváltozatok, reszponzivitás, ajánlatösszesítő, keresés, SEO, helyi adatkezelés.
- Valódi helyi HTTP → PHP → SMTP protokoll → MIME-levél folyamat tesztelve, két melléklet byte-pontos ellenőrzésével. Címzett, Reply-To, ékezetek és grafikai elhelyezés ellenőrizve.
- Közvetlen HTTP-kérésekkel ellenőrizve: hibás/minimum alatti/tört/negatív mennyiség, ismeretlen termék/szín/technológia, üres kötelező mező, e-mail-fejlécinjektálás, hibás grafikai elhelyezés, botmező, Origin és token.
- Tiltott kiterjesztés, hamis képtartalom, üres/túlméretes/túl sok fájl, aktív SVG, külső SVG-hivatkozás és XML-entitás elutasítása ellenőrizve.
- Két különböző termék összevont minimuma működik. IP-küldési keret és ismételt token ellenőrizve.
- Böngészős próba: fájlválasztás, elhelyezés, törlés, összesítő érvénytelenítése, 320/390/768/1440 px nézet. A CSP érvényesítése mellett nincs script- vagy CSP-hiba.
- Szándékosan elveszítettük a sikeres HTTP-választ, majd újrakattintottunk: az SMTP-szimulátor pontosan egy levelet kapott, a böngésző megőrizte az adatokat és visszakapta a sikeres azonosítót.
- SMTP-kapcsolati hibánál bizonytalan állapot, azonos tokennel nincs újraküldés. Kikapcsolt konfigurációnál 503.
- A napi karbantartó törli az elavult állapotokat, megtartja a friss ismétlésvédelmet. A technikai állapotfájl nem tartalmaz ügyfélmezőket vagy nyers IP-címet.
- PHP/JavaScript szintaxis-ellenőrzés és `git diff --check` sikeres.
- A release-ellenőrzés szándékosan két hiányt jelez: jogi jóváhagyás és online küldés aktiválása.

Nem történt külső levélküldés, publikálás, éles Apache-/TLS-/DNS-teszt, Gmail-kézbesítési próba vagy fizikai készülékes ellenőrzés. A teszt SMTP kizárólag loopback címen működik. A frontend képernyőképek ideiglenes mappában készültek, a korábbi QA-képeket nem írtuk felül.

Újrafuttatás: `node scripts/check-all.cjs` a 8080-as helyi előnézet mellett; `python3 scripts/check-delivery.py` önálló helyi PHP-/SMTP-kiszolgálókkal. A Playwright modulnak a Node keresési útvonalában kell lennie; a jelenlegi gépen a README korábbi NODE_PATH beállítása használható.
