# Élesítés előtti ellenőrzés – 2026. október 12.

Az ellenőrzött helyi működés rendben, de a teljes éles indulás még nem kész. Nem történt feltöltés, Rackhost-beállítás módosítása vagy külső levélküldés.

## Frissen lefuttatott ellenőrzések

- `check-all.cjs`: PASS. Katalógus, 15 termék, 70 színváltozat, keresés/szűrés, navigáció, ajánlatkérő, minimum darabszám, összesítő, UTF-8 letöltés, JavaScript nélküli tartalom, metaadatok és belső linkek. A résztesztek 320–1440 px nézeteket vizsgálnak.
- `check-handover.cjs`: PASS. Mind a 22 oldal öt szélességen; nincs képletöltési hiba vagy vízszintes túlcsordulás. Fájlválasztó, billentyűzetes fókusz, behúzás, fájlkorlátok, törlés és hosszú fájlnevek felületi ellenőrzése.
- `check-delivery.py`: PASS. Helyi PHP és SMTP-szimulátor; csatolmányok, szerveroldali validálás, ismétlésvédelem, elveszett válasz utáni újrapróbálás, hibás feltöltések és kikapcsolt mód. Valódi Gmail-kézbesítést ez nem igazol.
- A kezdőlap asztali és az ajánlatkérő mobilképernyőjének vizuális áttekintése megtörtént.
- `check-release.py`: továbbra is két nyitott feltétel: `legal_approved=false`, `quote_enabled=false`.

## Csomag rendbetétele

A korábbi `dist/` 196 olyan extra fájlt tartalmazott, amelynek nem volt azonos elérési útjú forrása; sok névben ` 2`/` 3` másolatsorszám szerepelt. A forráshoz tartozó fájlok tartalma nem tért el.

A korábbi csomagról ideiglenes mentés készült: `/var/folders/58/_ysrydg92sgfspn2pyhr9hcm0000gn/T/cegforma-pre-audit-gbsy1srq/dist`.

A meglévő `package-site.py` újrafuttatása után 205 fájl, 10,07 MiB a csomag, minden fájl bájtra azonos a megfelelő forrással. Az új csomagon a 22 oldalas, öt szélességes handover teszt ismét sikeres. A tartalom és az aktiválási kapcsolók nem változtak.

## A Rackhost-fiókban ténylegesen látott állapot

- Aktív `WP Tárhely Mini 2 GB` előfizetés, lejárat 2027-08-18.
- A tárhely domainlistája `0 / 1 DB`, „Nincs találat!” állapotú: nincs hozzárendelt domain.
- A DNS-zónák listájában a `cegforma.hu` szerepel, „Rendben” állapottal. Ez önmagában nem bizonyít megfelelő webes DNS-rekordot vagy működő HTTPS-t.
- A felület 1024 MB webes keretet mutat; a helyi csomag ebbe elfér.
- PHP-verzió, PHP-modulok, privát mappa, SMTP, cron és HTTPS tényleges működése még nincs igazolva.

A [Rackhost WP-csomagleírása](https://www.rackhost.hu/wordpress-webtarhely) 1 GB webes és 1 GB e-mail-tárhelyet ír a Mini csomaghoz. A nyilvános funkciólistában PHP 8.1 szerepel, miközben a projekt telepítési előírása PHP 8.2+. Ez ellenőrizendő eltérés, nem bizonyíték a konkrét fiók tényleges PHP-verziójára. [PHP-verzió módosítási útmutató](https://www.rackhost.hu/tudasbazis/webtarhely/php-verzio-modositas/).

## Indulás előtt rendezendő

1. Domain hozzárendelése, webgyökér és DNS ellenőrzése, HTTPS és HTTP/www átirányítások beállítása; szükséges PHP-képességek ellenőrzése.
2. Privát SMTP-konfiguráció, megfelelő feladó, levélhitelesítés és feltöltési limitek; online küldés aktiválása mindkét oldalon. Valódi próbaküldés és beérkezés ellenőrzése a címzettel egyeztetve.
3. A jogi tervezetek tartalmi véglegesítése: impresszum tárhelyszolgáltatói adatai; adatkezelésben jelzett szolgáltatói, megőrzési és jogalapi nyitott pontok. A kapcsoló átállítása önmagában nem véglegesítés.
4. Beszállítói képek/adatlapok felhasználásának dokumentálása. A korábbi feljegyzések szerint különösen a Falk & Ross feltételeinek ellenőrzése nyitott; új engedély ebben az ellenőrzésben nem került elő.
5. Feltöltés után hozzáférésvédelem (`server/`, privát konfiguráció), biztonsági fejlécek és böngészős működés ellenőrzése a valódi tárhelyen. Privát állapotadatok időzített törlésének megoldása.

## Kisebb hiányok és korlátok

- Soft Padded Jacket Black/Black: hiányzó termékfotó, jelzett helyőrzővel. Nem hibás képlink.
- Original Patch Beanie és Ultimate 5 Panel Cap: a beszállítói PDF termékadatlap, részletes méretsor nélkül.
- Fizikai iPhone/Android és Safari/Firefox teszt még nem történt. A mostani automatizált tesztek Chrome-alapúak.
- Search Console és sitemap beküldése indulás utáni teendő.

Feltölteni kizárólag a `dist/` tartalmát kell, a rejtett `.htaccess` fájlokkal együtt. Az `Emailek/`, `docs/`, `.git/` és a privát SMTP-beállítás nem kerülhet a publikus webgyökérbe.
