"""Read-only release gate; never approves legal content or checks private credentials."""
import json,sys
from pathlib import Path
root=Path(__file__).resolve().parent.parent
config=json.loads((root/'config/site.json').read_text())
problems=[]
for key,label in [('domain_confirmed','A domain megerősítése hiányzik.'),('legal_approved','A jogi szövegek véglegesítése/jóváhagyása nyitott.'),('quote_enabled','Az online ajánlatküldés nincs aktiválva a weboldalon.')]:
 if config.get(key) is not True: problems.append(label)
for name in ['.htaccess','api/quote.php','server/quote.php','server/catalog.json','server/.htaccess','server/vendor/phpmailer/PHPMailer.php','server/vendor/phpmailer/SMTP.php','server/vendor/phpmailer/Exception.php']:
 p=root/'dist'/name
 if not p.is_file(): problems.append('Hiányzó csomagfájl: '+name)
 elif p.read_bytes()!=(root/name).read_bytes(): problems.append('Elavult csomagfájl: '+name)
for p in (root/'dist').rglob('*'):
 if p.is_file() and (p.suffix=='.eml' or p.name.startswith('.env') or p.name in ['quote.example.php','quote.local.php','requests.json'] or any(v in p.relative_to(root/'dist').parts for v in ['Emailek','docs','.git','config'])): problems.append('Privát fájl a csomagban: '+str(p))
for p in (root/'dist').rglob('*.html'):
 if '{{QUOTE_' in p.read_text(): problems.append('Feloldatlan sablon: '+str(p))
if problems:
 print('NEM ÉLESÍTHETŐ MÉG:\n- '+'\n- '.join(problems));sys.exit(1)
print('PASS: helyi csomag és állapotjelzők. A Rackhost-, SMTP-, HTTPS- és valódi kézbesítési próba külön szükséges.')
