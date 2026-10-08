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
- A `price` mező a termék nettó egységára forintban. A katalógus és a termékoldalak Ft / db formátumban mutatják, külön áfamegjegyzéssel. Az ügyfél mind a 15 termékhez megadta az árat 2026. október 8-án.

## Feltöltés Rackhost tárhelyre

```sh
python3 scripts/build.py
python3 scripts/package-site.py
```

**Csak a `dist/` mappa tartalmát** töltsd fel a domain dokumentumgyökerébe, az `index.html` a gyökérbe kerüljön. A teljes projektet, az `Emailek/` és `docs/` mappákat ne töltsd fel. A csomagoló engedélyezőlista alapján csak a publikus weboldalfájlokat másolja; a `dist/` generált könyvtár tartalmát minden futáskor újrakészíti.

A statikus oldalhoz nem szükséges URL-átírás vagy szerveroldali futtatókörnyezet. Az e-mailes beküldéshez PHP 8.2+ és SMTP-elérés szükséges; az éles csomag képességeit ellenőrizni kell. A megerősített domain **cegforma.hu**.

## Az ajánlatkérő jelenlegi működése

Elkészült a kétlépéses összesítés → küldés, a PHP/SMTP-végpont és a többfájlos grafikafeltöltés. JPG, PNG, PDF és passzív SVG választható, fájlonként elhelyezéssel. Alapkorlát: 5 fájl, fájlonként 5 MiB, összesen 10 MiB. A szerver a termékeket/színeket a generált katalógusból ellenőrzi; minimum összesen 5 darab. A címzett rögzítetten `cegforma@gmail.com`, a látogató e-mailje csak Reply-To.

**Az éles küldés még inaktív.** A `quote_enabled` értéke false; a privát szerverkonfiguráció és az éles SMTP-próba hiányzik. Így a jelenlegi build helyi összesítőt készít, a grafikákat a felhasználó saját leveléhez csatolja. Az aktiváláshoz mind a build-, mind a szerveroldali kapcsoló szükséges. A jogi oldalak működésleírása a build kapcsolóját követi; a tervezetek véglegesítése külön feladat.

A szerver HMAC-tokennel, Origin-ellenőrzéssel, rejtett botmezővel, IP-nkénti és globális órás korláttal, valamint kérésazonosító szerinti ismétlésvédelemmel működik. Nincs új cookie vagy böngészős adattár. A grafika csak PHP ideiglenes feltöltési fájl; a webszerver nem ad róla nyilvános URL-t. A MIME-típus ellenőrzése nem vírusvizsgálat. Az SMTP-átvétel nem beérkezőmappa-garancia.

Beállítás, tesztelés, mentés, visszaállítás: [docs/elesites.md](docs/elesites.md). Csak a még megválaszolatlan ügyfélkérdések: [docs/ugyfelnek-fontos-kerdesek.md](docs/ugyfelnek-fontos-kerdesek.md).

## Források és hiányzó adatok

A logó az ügyfél `.eml` csatolmányából származik; az eredeti is megmaradt. A szórólapot nem publikáltuk. A termékadatok a dokumentumban megadott Malfini és Falk & Ross oldalakról származnak; az eredeti URL-ek a termékadatokban és az adatlapokon megtalálhatók. A képek, színminták és PDF-ek helyi másolatok, így böngészéskor nem szükséges kapcsolat a beszállítói oldalakkal.

- 15 termék, 8 kategória, 70 kért színváltozat, 69 letöltött termékkép.
- Soft Padded Jacket – `Black/Black`: a kért névhez nem volt közvetlenül hozzárendelhető beszállítói kép/színminta; látható helyőrző maradt. Más szín fényképével nem helyettesítettük.
- Original Patch Beanie és Ultimate 5 Panel Cap: a beszállító „mérettáblázat” linkje részletes méretsor nélküli termékadatlap. A PDF elérhető, a méretadat hiányát az adatlap jelzi.
- Jacket 501: a beszállító eredeti és új szabást is megad; ezt és a mindkettőt tartalmazó táblázatot megőriztük.
- A pontos cím és a cégadatok már megvannak; a jogi oldalak tervezeteinek véglegesítése nyitott. A telefonszám bekérhető az űrlapon, de a cég publikus telefonszáma sehol nem jelenik meg.
- A bögre szolgáltatás szerepel, de konkrét bögreterméket nem találtunk ki.
- Publikálás előtt a beszállítói tartalmak felhasználási jogosultsága, a tárhely és a nyitott ügyféladatok tisztázandók a követelménydokumentum szerint.

A `scripts/import-supplier-assets.cjs` a beszállítói oldalak ismételt feldolgozásához készült fejlesztői segéd (Playwright + Chrome). A `docs/supplier-snapshots/` kizárólag fejlesztői forrásjegyzet. A WebP képek kisebb webes másolatok; a forrásfájlokat megőriztük.

## Ellenőrzés

A `scripts/check-site.cjs` Playwright + telepített Chrome használatával vizsgálja a nézeteket és az interakciókat. A statikus weboldalnak ez nem futási függősége. Ellenőrzési jegyzet és képernyőképek: `docs/qa/`.

## Arculati átdolgozás – 2026. október 6.

A teljes felület új, textilmintakönyvre és műhelymunkalapra épülő arculatot kapott. Barlow Condensed címbetűk, Manrope törzsszöveg, monospace jelölések, törtfehér–grafit felületek és narancs ruhacímke-motívum. A betűk helyi WOFF2-fájlok, OFL-licenceikkel együtt; külső fontkiszolgáló nem töltődik be.

A kezdőlap nyolc kártyája helyett termékképet váltó kategóriajegyzék szerepel; mobilon minden sor saját képet kap. A galléros póló három színe a nyitóképen is kipróbálható, a terméklink megőrzi a választást. A saját SVG-pólóvázlat mellrészes, középső és hátsó elhelyezést mutat. Sematikus ábra, nem kész munka vagy gyártási méretígéret. Az új interakciók billentyűzetről is elérhetők, nincs automatikus lapozás.

Az átdolgozás a kezdőlap mellett a katalógusra, az összes termékoldalra, az ajánlatkérőre és a láblécre is kiterjed. A PHP-küldés, a fájlfeltöltés és a hiányzó üzleti adatok státusza nem változott. Az emblémázási technológiák mezőjében a korábban hibásan záródó DTF-opciót is javítottuk.

## Ügyfélreferencia megvalósítása – 2026. október 6.

Az új ügyfélkép alapján fehér–sötétkék–narancs arculat készült. Közös ruházati nyitókép a kezdőlapon és a katalógusban, kétoszlopos katalógus, kategóriaikonok, aktív kategóriacím, kereső és türkiz katalógusajánló. Mobilon egymás alá kerülnek a termékek, a kategóriák tördelődő gombok. A meglévő ügyféllogó és a valódi beszállítói termékfotók megmaradtak.

A katalóguskártyák színgombjai fotót váltanak, jelzik az esetleges hiányzó fotót, és továbbadják a választást a termékoldalra. A gyártói mérettáblázatok közvetlenül elérhetők. A Basic 134 és Dream 128 méretjelölései a helyi gyártói táblázatok alapján XS–3XL értékeket mutatnak; ezek méretinformációk, nem készletígéretek. Az árak továbbra is egyeztetés alatt állnak.

A `scripts/check-site.cjs` a meglévő termék- és űrlaptesztek mellett a katalógus színválasztását és a szín termékoldalra történő átadását is ellenőrzi. A `scripts/package-site.py` a nyitóképet is beleteszi a feltölthető csomagba.

### Nyitókép

Fájl: `assets/images/apparel-hero.png`. A beépített imagegen eszközzel készült marketingillusztráció; a termékkártyákon továbbra is a beszállítói fotók szerepelnek.

Generálási prompt:

> Use case: ads-marketing. Create a premium photorealistic clothing website banner background, wide landscape 3:1. Deep dark navy #0b2435 background. Three unbranded floating ghost mannequin short sleeve garments grouped entirely on RIGHT HALF: vivid orange polo shirt at left of group, teal women's fitted crewneck t-shirt forward center, dark navy crewneck t-shirt at right. Full collar and sleeves visible, garment lower edges cropped by bottom banner edge. Realistic textile folds and studio lighting. A broad diagonal vivid orange ribbon crosses behind the clothes on right. LEFT HALF completely empty uniform deep navy space reserved for HTML heading. No text, no logos, no lettering, no people, no hanger. Similar to a polished corporate apparel catalog advertising hero.

## Mobilos optimalizálás és stabil választék – 2026. október 6.

- Az `assets/responsive.css` tartalmazza a mobilos finomításokat és a stabil képelőnézeti keretet. A választék képei abszolút pozicionált, rögzített magasságú területen váltanak, ezért a saját oldalarányuk nem változtatja meg a következő szekció helyét. A hover sem módosítja a sorok szélességét.
- A 03-as bemutatkozó szekció két kiegyensúlyozott oszlopot kapott; telefonon egymás alá kerül a cím, az évszám és az olvasható szélességű szöveg.
- Mobilon a kategóriaszűrő nyitható/csukható, választás után összecsukódik, az aktuális kategória látszik a fejlécén. JavaScript nélkül minden kategória elérhető marad. A táblagépes nézetre váltás újra megnyitja a szűrőket.
- Legalább 44 px-es színgombok, 48 px-es fő vezérlők, 16 px-es űrlapmezők, rendezett egyoszlopos űrlap és lábléc. A mobilmenü fekvő helyzetben is a képernyőn belül görgethető.
- A nyitókép veszteségesen tömörített, külön asztali és mobilos JPEG-másolatot kapott. A mobilkép 56 568 bájt az eredeti 1 610 224 bájt helyett (kb. 96,5%-kal kisebb); az eredeti PNG fejlesztői forrásként megmaradt.
- Ellenőrzés: `scripts/check-site.cjs` 10 szélességen (320–1440 px), továbbá `scripts/check-responsive.cjs` a képcserék utáni elmozdulást, érintéses navigációt, szűrőket, érintési felületeket, űrlapmezőket, fekvő menüt és JavaScript nélküli használatot ellenőrzi. Playwright/Chrome szükséges. Az érintéses ellenőrzés böngészős emuláció, nem fizikai telefonos teszt.

## Átlátható termékválasztás az ajánlatkérőben

Minden tétel saját, a kiválasztott színt követő termékfotót, nevet, kategóriát, cikkszámot és szín–darabszám összefoglalót kapott. A legördülő mellett feliratos színminták is használhatók, a részletek linkje megőrzi a színt. A hiányzó fotók és saját termékek külön jelzést kapnak; törlés után a látható tételszámok újraszámozódnak. A színfeliratok a meglévő beszállítói adatokból származnak.

Célzott ellenőrzés: `scripts/check-quote.cjs` (Playwright/Chrome): mind a 70 színváltozat, több tétel független kezelése, saját termék, hiányzó fotó és 320–1440 px nézetek.

## Betöltési sebesség – 2026. október 6.

A build a `fonts.css`, `styles.css` és `responsive.css` fájlokból generálja az `assets/site.css` állományt. Ezeket a forrásokat szerkeszd, majd futtasd újra a buildet. A CSS- és JavaScript-URL-ek tartalomfüggő verziót kapnak. A termékoldalak csak saját adataikat töltik be; a katalógus és az ajánlatkérő a teljes, de csökkentett adattartalmú listát. A beszállítói JSON teljes tartalma változatlanul megmarad. A beágyazott színmintákból a build közösen használható `assets/swatches/` fájlokat készít.

A `dist/` tartalmazza a `.htaccess` fájlt is: ezt a rejtett fájlt is töltsd fel. Apache alatt az elérhető modulokkal bekapcsolja a szöveges fájlok tömörítését és a statikus erőforrások gyorsítótárazását. HTML mindig újraellenőrzendő, CSS/JS tartalomhash alapján frissül; változatlan nevű képek legfeljebb egy napig maradhatnak cache-ben. A helyi Python-előnézet ezeket a szerverbeállításokat nem alkalmazza.

Mérési eredmények és korlátok: `docs/qa/performance.md`. Újramérés: `node scripts/measure-performance.cjs` (Playwright és Chrome szükséges).

## SEO és jogi oldalak – 2026. október 7.

A megerősített domain **cegforma.hu** (a korábbi `cegfoma.hu` elírás). A SEO alapcíme a `config/site.json` fájlban van. A `scripts/seo.py` egyedi címeket/leírásokat, abszolút canonical URL-eket, Open Graph/Twitter megosztási metaadatokat és Organization, WebSite, WebPage/CollectionPage, BreadcrumbList, ItemList strukturált adatokat készít. Árat, készletet, értékelést nem találunk ki; Product rich-result jelölés még nincs. A sitemap a kezdőlapot, katalógust és 15 termékoldalt tartalmazza; query paraméterek a canonical címekből kimaradnak. A termékek főképe saját megosztási képük is.

Az `adatkezeles.html`, `impresszum.html`, `sutik.html` és `ajanlatkeresi-feltetelek.html` forrásai a `templates/legal/` mappában szerkeszthetők. A jogi oldalak és ajánlatkérő `noindex,follow` jelölésűek. A tájékoztatók hiányzó adatai láthatóan jelöltek: **nem végleges jogi dokumentumok**. Az oldal kódja nem használ sütit, külső követőt vagy tartós böngészős tárolást, így nincs látszat-hozzájárulást kérő banner. Új követő bevezetésekor tényleges előzetes blokkolás, visszavonható választás és frissített tájékoztató szükséges.

Továbbküldhető ügyfélkérdések, véglegesítési és indulási teendők: `docs/ugyfeltol-bekerendo-adatok.md`. Az eredeti követelménydokumentum történeti forrásként megmarad. A tárhely és Gmail tényleges adatkezelése külön ellenőrizendő. A csomagoló a négy jogi oldalt, robots.txt és sitemap.xml fájlokat is beleteszi a dist mappába. A `legal_approved` konfigurációs mező státuszjelzés, nem automatikus jogi ellenőrzés vagy publikálási engedély.


## Használhatósági fejlesztések – 2026. október 8.

- A katalógus a keresést és kategóriát az URL-ben őrzi meg. Újratöltés, megosztás és vissza/előre navigáció esetén is visszaállnak; a gépelés nem hoz létre külön előzményt minden karakterhez.
- A keresés több szót, tetszőleges sorrendet és ékezet nélküli bevitelt is kezel (például `134 noi`). A „Keresés és szűrők törlése” gomb visszaállítja a teljes választékot.
- A termékoldali színválasztás frissíti a megosztható címet. Hiányzó vagy ismeretlen színparaméternél a sablon alapértelmezett, fotóval rendelkező színe marad érvényes.
- Az ajánlatkérő összesítője UTF-8 szövegfájlként is letölthető. Módosításkor a korábbi összesítő tartalma törlődik, újat kell készíteni. A letöltés nem küld e-mailt, nem ment böngészős adattárba; a működés leírása a tájékoztatókban is frissült.
- Célzott ellenőrzés: `scripts/check-usability.cjs` (Playwright és Chrome). Lefedés: keresés, előzmények, visszaállítás, szín megőrzése, hibás mező javítása, minimum mennyiség, letöltött fájl pontos tartalma, összesítő érvénytelenítése és mobilos elrendezés.

## Jogi tervezetek frissítése – 2026. október 8.

A korábbi hiánylistát felülírva bekerültek az ügyfél által megadott cégadatok, a székhely/üzlet/átvétel címe, a kizárólagos B2B értékesítés és a Gmailes grafikatárolás. A leveleket Balogh István kezeli; külső gyártónak nem továbbítja. A telefonszám a korábbi kérés szerint nem publikus. Az adatkezelési tájékoztató külön jelöli a 6 hónapos és kétéves megőrzési javaslatot, valamint a tervezett törlést. A jogi oldalak továbbra is tervezetek, a szolgáltatói részletek és szerződéskötés véglegesítése nyitott. Aktuális állapot: `docs/ugyfeltol-bekerendo-adatok.md`. A jelenlegi űrlap továbbra is helyi összesítő.

## Ajánlatküldés megvalósítása – 2026. október 8.

PHP 8.2+, fileinfo, mbstring, DOM/libxml és OpenSSL szükséges. A PHPMailer 7.1.1 forrásai és LGPL-licence a `server/vendor/phpmailer/` mappában szerepelnek, verzióval és SHA-256 jegyzékkel. Nincs szükség Composerre a tárhelyen. Forrás: https://github.com/PHPMailer/PHPMailer/tree/v7.1.1 . A könyvtár biztonsági frissítéseit az üzemeltetés részeként követni kell.

Teszt: `python3 scripts/check-delivery.py` (PHP, Node, Playwright, Chrome); kizárólag helyi SMTP-t használ. Általános regresszió: `node scripts/check-all.cjs`, a projektet kiszolgáló 8080-as előnézet mellett. Indulási ellenőrzés: `python3 scripts/check-release.py`; a hiányzó jogi jóváhagyás és az inaktív küldés miatt jelenleg szándékosan hibával áll meg.
