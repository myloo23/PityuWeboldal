# Cégforma – egyedi textilmintakönyv-arculat

Egyszerű, adatbázis nélküli HTML/CSS/JavaScript weboldal. A tárhelyen nem kell Node.js, Python vagy buildfolyamat. Nincs kosár, fizetés, fiók, admin vagy fájlfeltöltés.

## Oldalszerkezet

- `index.html`: bemutatkozás, nyolc termékkategória, DTF/hímzés/szublimáció, folyamat, kapcsolat.
- `katalogus.html`: mind a 15 termék, kategóriaszűrő és név/cikkszám szerinti keresés.
- `termekek/*.html`: 15 külön, közvetlenül linkelhető termékadatlap; színválasztó, termékkép, leírás, gyártói mérettáblázat/adatlap. A teljes Malfini-katalógus blokk csak a 9 Malfini-terméknél szerepel.
- `ajanlatkeres.html`: több terméksoros ajánlatkérés, összesített minimum 5 darab, feltételes elülső/hátsó grafikai méretmezők.
- `adatkezeles.html`: egyértelmű helyőrző, nem végleges jogi szöveg.

## Helyi megnyitás

A kész kezdőlap közvetlenül böngészőben is megnyitható. Ajánlott helyi HTTP-kiszolgáló:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Nyisd meg a `http://127.0.0.1:8080` címet. Ez kizárólag helyi előnézet, nem nyilvános publikálás.

## Tartalomszerkesztés

- Ügyféligények: `docs/client-requirements.md` (változatlan eredeti dokumentum).
- Termékek, színek, képek, források: `assets/data/products.json`.
- Közös oldalsablonok: `scripts/build.py`; kezdőlapi szövegek és saját SVG-vázlat: `templates/home.html`.
- Megjelenés: `assets/styles.css`; működés: `assets/app.js`.
- A HTML és a böngészős termékadatok újragenerálása: `python3 scripts/build.py`.
- Árak jelenleg `null` értékűek, a sablon szándékosan „Nettó ár: egyeztetés alatt” szöveget mutat. Az árlista érkezésekor a megjelenítés formátumát is véglegesíteni kell.

## Feltöltés Rackhost tárhelyre

```sh
python3 scripts/build.py
python3 scripts/package-site.py
```

**Csak a `dist/` mappa tartalmát** töltsd fel a domain dokumentumgyökerébe, az `index.html` a gyökérbe kerüljön. A teljes projektet, az `Emailek/` és `docs/` mappákat ne töltsd fel. A csomagoló engedélyezőlista alapján csak a publikus weboldalfájlokat másolja; a `dist/` generált könyvtár tartalmát minden futáskor újrakészíti.

A statikus oldalhoz nem szükséges URL-átírás vagy szerveroldali futtatókörnyezet. A későbbi e-mailes beküldéshez PHP-t támogató tárhely szükséges; a csomag még egyeztetendő. A domain az ügyfél dokumentuma alapján **cegfoma.hu**; nem javítottuk át önkényesen.

## Az ajánlatkérő jelenlegi működése

A kötelező adatok ellenőrzése után a böngésző másolható szöveges összesítőt készít. Nincs hálózati beküldés, adatmentés vagy automatikus e-mail. A felhasználó külön másolhatja ki és küldheti el a szöveget saját levelezőjéből. A felület ezt a kitöltés előtt és után is jelzi. A minimum az összes terméksor mennyiségére vonatkozik; például 3 férfi + 2 női póló elfogadott.

A következő körben egy egyszerű PHP-végpont köthető be: szerveroldali mezőellenőrzés és összesített minimum, rögzített címzett (`cegforma@gmail.com`), tárhelyen hitelesíthető feladó és validált Reply-To, fejlécinjektálás elleni védelem, küldési gyakoriság korlátozása, siker/hiba visszajelzés és az adatkezelési tájékoztató alapján kialakított mezők. Fájlfeltöltés csak külön pontosítás után készül. Az összesítő gombot a valódi küldés bekötésekor kell beküldő gombra cserélni.

## Források és hiányzó adatok

A logó az ügyfél `.eml` csatolmányából származik; az eredeti is megmaradt. A szórólapot nem publikáltuk. A termékadatok a dokumentumban megadott Malfini és Falk & Ross oldalakról származnak; az eredeti URL-ek a termékadatokban és az adatlapokon megtalálhatók. A képek, színminták és PDF-ek helyi másolatok, így böngészéskor nem szükséges kapcsolat a beszállítói oldalakkal.

- 15 termék, 8 kategória, 70 kért színváltozat, 69 letöltött termékkép.
- Soft Padded Jacket – `Black/Black`: a kért névhez nem volt közvetlenül hozzárendelhető beszállítói kép/színminta; látható helyőrző maradt. Más szín fényképével nem helyettesítettük.
- Original Patch Beanie és Ultimate 5 Panel Cap: a beszállító „mérettáblázat” linkje részletes méretsor nélküli termékadatlap. A PDF elérhető, a méretadat hiányát az adatlap jelzi.
- Jacket 501: a beszállító eredeti és új szabást is megad; ezt és a mindkettőt tartalmazó táblázatot megőriztük.
- Hiányzik a nettó árlista, a pontos cím, a végleges stílusreferencia és adatkezelési szöveg. A telefonszám bekérhető az űrlapon, de a cég publikus telefonszáma sehol nem jelenik meg.
- A bögre szolgáltatás szerepel, de konkrét bögreterméket nem találtunk ki.
- Publikálás előtt a beszállítói tartalmak felhasználási jogosultsága, a tárhely és a nyitott ügyféladatok tisztázandók a követelménydokumentum szerint.

A `scripts/import-supplier-assets.cjs` a beszállítói oldalak ismételt feldolgozásához készült fejlesztői segéd (Playwright + Chrome). A `docs/supplier-snapshots/` kizárólag fejlesztői forrásjegyzet. A WebP képek kisebb webes másolatok; a forrásfájlokat megőriztük.

## Ellenőrzés

A `scripts/check-site.cjs` Playwright + telepített Chrome használatával vizsgálja a nézeteket és az interakciókat. A statikus weboldalnak ez nem futási függősége. Ellenőrzési jegyzet és képernyőképek: `docs/qa/`.

## Arculati átdolgozás – 2026. október 6.

A teljes felület új, textilmintakönyvre és műhelymunkalapra épülő arculatot kapott. Barlow Condensed címbetűk, Manrope törzsszöveg, monospace jelölések, törtfehér–grafit felületek és narancs ruhacímke-motívum. A betűk helyi WOFF2-fájlok, OFL-licenceikkel együtt; külső fontkiszolgáló nem töltődik be.

A kezdőlap nyolc kártyája helyett termékképet váltó kategóriajegyzék szerepel; mobilon minden sor saját képet kap. A galléros póló három színe a nyitóképen is kipróbálható, a terméklink megőrzi a választást. A saját SVG-pólóvázlat mellrészes, középső és hátsó elhelyezést mutat. Sematikus ábra, nem kész munka vagy gyártási méretígéret. Az új interakciók billentyűzetről is elérhetők, nincs automatikus lapozás.

Az átdolgozás a kezdőlap mellett a katalógusra, az összes termékoldalra, az ajánlatkérőre és a láblécre is kiterjed. A PHP-küldés, a fájlfeltöltés és a hiányzó üzleti adatok státusza nem változott. Az emblémázási technológiák mezőjében a korábban hibásan záródó DTF-opciót is javítottuk.
