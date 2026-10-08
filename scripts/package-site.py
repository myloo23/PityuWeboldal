"""Copy an allowlist of public website files to dist; never include client email."""
from pathlib import Path
import shutil,json
root=Path(__file__).resolve().parent.parent
dest=root/'dist'
if dest.exists():shutil.rmtree(dest)
dest.mkdir()
files=['sitemap.xml','robots.txt','impresszum.html','sutik.html','ajanlatkeresi-feltetelek.html','.htaccess','assets/site.css','index.html','katalogus.html','ajanlatkeres.html','adatkezeles.html','assets/app.js','assets/styles.css','assets/responsive.css','assets/data/products.js','assets/images/cegforma-logo.webp','assets/images/apparel-hero-desktop.jpg','assets/images/apparel-hero-mobile.jpg']
files += ['assets/fonts.css'] + [str(p.relative_to(root)) for p in (root/'assets/fonts').iterdir() if p.is_file()]
files += [str(p.relative_to(root)) for folder in ['assets/data','assets/swatches'] for p in (root/folder).glob('*.js' if folder.endswith('data') else '*.png')]
for p in json.loads((root/'assets/data/products.json').read_text()):
 files.extend([f'termekek/{p["id"]}.html',p['sizeChart'],p['sizePreview']])
 for c in p['colors']:
  if c.get('image'):files.append(c['image'])
  if c.get('swatch') and not c['swatch'].startswith('data:'):files.append(c['swatch'])
for name in dict.fromkeys(files):
 target=dest/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/name,target)
print(f'Prepared {len(set(files))} public files in dist/; emails and developer documents excluded.')
