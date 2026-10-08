# Cégforma – éles bekötés és üzemeltetés

## Jelenlegi állapot

A kód elkészült, az online küldés kikapcsolva. A jogi oldalak tervezetek. Nincs valódi SMTP-hozzáférés, éles kézbesítési teszt vagy tárhely-ellenőrzés. A helyi teszt SMTP-szimulátorba küld, az ügyfél postafiókját nem éri el.

## Tárhely

- PHP 8.2+; fileinfo, mbstring, DOM/libxml, OpenSSL. Az SMTP-szolgáltatóhoz kimenő kapcsolat szükséges.
- `upload_max_filesize=5M`, `post_max_size=12M`, `max_file_uploads=10` vagy több, `max_input_vars=1000` vagy több; 128 MB PHP memóriakeret. A webszerver kérésméret-limitje legalább 12 MB. Az alkalmazás 5 fájlt, összesen 10 MiB-ot enged.
- Csak a `dist/` tartalma kerüljön a nyilvános webgyökérbe. A `.htaccess` rejtett fájlokat is fel kell tölteni. A `server/` könyvtár HTTP-hozzáférését a mellékelt `.htaccess` tiltja. Nginx/eltérő kiszolgáló esetén ezt külön meg kell valósítani.
- A PHP ideiglenes feltöltési mappája a nyilvános webgyökéren kívül legyen, a tárhely felhasználói között elkülönítve. Az alkalmazás nem másol grafikákat a publikus mappába. A fájlok PHP-kérés végén törlődnek; a levelezési szolgáltatók példányait ez nem törli.
- A fő `.htaccess` biztonsági fejléceket, tömörítést/cache-t és a cegforma.hu HTTP/www → HTTPS átirányítását tartalmazza. Apache-modulok és AllowOverride szükségesek. Fordított proxy esetén a HTTPS-felismerést a szolgáltatóval ellenőrizzük; átirányítási hurok esetén a kanonizálást a tárhely kezelőfelületén állítsuk be.

## Privát beállítások

1. Hozz létre a webgyökéren kívül egy csak a PHP-felhasználó számára hozzáférhető mappát (0700). A `config/quote.example.php` másolata kerüljön ide `quote.php` néven (0600). A minta nem kerül bele a dist-be.
2. Az alapértelmezett hely a webgyökér szülőjében `cegforma-private/quote.php`. Más elérési út a PHP-folyamat `CEGFORMA_CONFIG` környezeti változójával adható meg. Apache/FPM alatt a szolgáltató által támogatott módot kell használni.
3. `private_dir`: létező, abszolút útvonal a privát állapotmappához. `secret`: 64 hexadecimális karakter, például `php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'` kimenete. Titkok nem kerülhetnek Gitbe, naplóba vagy a publikus csomagba.
4. `origin=https://cegforma.hu`; SMTP host/port/felhasználónév/jelszó és saját domainen hitelesített `from_email`. Port 587 + `tls`, vagy 465 + `ssl`. Tanúsítvány-ellenőrzést ne kapcsoljuk ki. `development=false` élesben. Az ügyfél címe kizárólag Reply-To; a címzett fix `cegforma@gmail.com`.
5. SPF/DKIM/DMARC a kiválasztott levélküldő szolgáltató pontos értékei szerint. Ellenőrizzük a szolgáltató melléklet- és üzenetméret-limitjét: a 10 MiB csatolmány Base64-kódolva nagyobb levelet eredményez.
6. Az új konfiguráció betöltését OPcache mellett is ellenőrizzük (szükség szerint PHP-folyamat újraindítása a kezelőfelületen).

## Működés és korlátok

- Csak a külön küldés gomb indít hálózati beküldést; összesítés/fájlkiválasztás helyi marad. Nincs automatikus adatmentés.
- A szerver ellenőrzi a termékazonosítót, színt, darabszámot, mezőhosszakat, e-mailt, csatolmánydarabszámot, méretet és MIME-típust. Az SVG csak passzív elemeket fogadhat; a nem támogatott grafikát PDF/PNG formában lehet újraexportálni. Ez nem víruskereső; a beérkező mellékleteket megbízhatatlan ügyfélfájlként kell kezelni.
- Origin-ellenőrzés, aláírt, IP-hez kötött egyórás token, rejtett botmező. Alapkorlát: IP-nként 5 próbálkozás/óra, összesen 30/óra. A hibás tartalmi próbák is fogyasztják a keretet. Forgalom függvényében hangolandó; publikus proxy/CDN mögött az IP-azonosítást külön ellenőrizni kell, tetszőleges forwarded fejlécet nem fogadunk el.
- Az ismételt kérés ugyanazzal a tokennel nem küld újra levelet. SMTP-átvétel utáni hálózati hiba esetén ugyanazt az azonosítót kapja vissza. Bizonytalan SMTP-hibánál kézi egyeztetést kérünk, mert a levél már átkerülhetett a kiszolgálóhoz. Nincs háttérsor vagy automatikus újraküldés.
- Az állapotfájl kizárólag kérésazonosítót, állapotot, időpontokat és HMAC IP-lenyomatot tartalmaz. Nincs benne kapcsolattartási adat, grafika, fájlnév vagy levélszöveg. A titkos kulcsot bizalmasan kell kezelni; a lenyomat nem állítás anonimitásról.

## Aktiválás és átadási próba

1. Ügyfél üzleti döntései, szolgáltatói ellenőrzések, végleges jogi szövegek; majd `legal_approved=true`. A státuszjelző önmagában nem véglegesíti a tartalmat.
2. Privát SMTP-konfiguráció `enabled=true`, publikus `config/site.json` fájlban `quote_enabled=true`; build és csomagolás. A megjelenő működésleírások a buildkapcsolót követik.
3. `python3 scripts/check-release.py`. A helyi ellenőrzés nem ellenőrzi az éles hitelesítő adatokat, DNS-t vagy kézbesítést.
4. HTTP/www átirányítás, érvényes TLS, biztonsági fejlécek, tömörítés, cache, 404, `server/catalog.json` elérésére 403/404, privát konfiguráció nyilvános elérhetetlensége. JavaScript/képek működése CSP mellett.
5. Előre egyeztetett valódi ajánlatpróba csatolmányokkal. Ellenőrizzük a Gmail beérkező és spam mappáját, ékezeteket, Reply-To-t, mellékletek tartalmát, a kapcsolati hibát és dupla kattintást. Az SMTP-átvétel önmagában nem végponttól végpontig igazolás.
6. Valódi mobil Safari/Chrome, asztali Firefox/Safari; a helyi automatizált tesztek Chrome-alapúak.
7. Search Console domainigazolás és sitemap beküldés a tulajdonos fiókjában.

## Mentés, visszaállítás és megfigyelés

- Minden telepítés előtt tartsuk meg az előző publikus csomagot dátummal, a webgyökéren kívül. A titkok külön, korlátozott hozzáférésű mentésben legyenek. Új fájlokat ideiglenes kiadási mappába töltsünk, ellenőrzés után váltsunk rá, ha a tárhely támogatja.
- Visszaállításkor az előző csomag kerüljön vissza; a privát állapotfájlt és titkos kulcsot ne állítsuk vissza régi verzióra, mert elveszne a friss ismétlésvédelem. Küldési hiba esetén a privát `enabled=false`, majd a publikus `quote_enabled=false` új buildje biztosítja az e-mailes tartalék utat.
- A `scripts/prune-quote.php` fájlt a privát mappába telepítsük, napi CLI-futtatással és `CEGFORMA_CONFIG` beállítással. Ez forgalom nélkül is törli az elavult technikai állapotokat (kérésállapot 24 óra után, órás korlátszámláló 1 óra után; napi futásból adódó késéssel). A cron nincs még beállítva.
- Az üzemeltető figyelje az oldal elérhetőségét és a szerver `Cegforma SMTP failure` / `Cegforma endpoint failure` eseményeit. Külső monitor nincs még bekötve; monitorozáshoz ne küldjünk automatikus valódi ajánlatokat.
- A tárhely hozzáférési/error naplóinak megőrzését és hozzáférését a szolgáltatói beállításokkal együtt kell rögzíteni. Request body, SMTP-jelszó és csatolmány ne kerüljön diagnosztikai naplóba.
