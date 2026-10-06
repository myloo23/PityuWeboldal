"""Losslessly preserves source files; creates smaller web images (requires Pillow)."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
for folder,pattern in [('assets/products','*.jpg'),('assets/size-charts','*.png')]:
 for p in (root/folder).glob(pattern):
  if 'swatch' in p.name:continue
  with Image.open(p) as im:im.convert('RGB').save(p.with_suffix('.webp'),quality=88)
p=root/'assets/data/products.json';products=json.loads(p.read_text())
for item in products:
 if item.get('sizePreview'):item['sizePreview']=item['sizePreview'].replace('.png','.webp')
 for color in item['colors']:
  if color.get('image'):color['image']=color['image'].replace('.jpg','.webp')
p.write_text(json.dumps(products,ensure_ascii=False,indent=2))
