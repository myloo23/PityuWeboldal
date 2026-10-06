import json,re
from pathlib import Path
p=Path('assets/data/products.json');products=json.loads(p.read_text())
desc={
'classic-new-132':('Klasszikus, környakú férfi póló, oldalvarrás nélküli szabással.',['Single Jersey, 145 g/m²','100% pamut; 12-es szín: 85% pamut, 15% viszkóz','Keskeny, bordás nyakszegély; megerősített vállpánt']),
'basic-129':('Sokoldalú férfi póló puha, szilikonos kezeléssel.',['Single Jersey, 160 g/m²','100% pamut; 12-es szín: 85% pamut, 15% viszkóz','Oldalvarrás nélküli szabás, megerősített vállrész']),
'heavy-new-137':('Vastagabb anyagú férfi póló, oldalvarrás nélkül.',['Single Jersey, 200 g/m²','100% pamut; 12-es szín: 85% pamut, 15% viszkóz','Szilikonos kezelés, keskeny, bordás nyakszegély']),
'basic-134':('Íves szabású női póló, puha, szilikonos kezeléssel.',['Single Jersey, 160 g/m²','100% pamut; 12-es szín: 85% pamut, 15% viszkóz','Oldalvarrás, megerősített vállpánt']),
'dream-128':('Testhezálló női póló V-nyakkal és rövid raglán ujjakkal.',['Single Jersey, 180 g/m²','95% pamut, 5% elasztán; 12-es szín: 80% pamut, 15% viszkóz, 5% elasztán','Rugalmas anyag, oldalvarrással']),
'pique-polo-203':('Férfi galléros póló háromgombos gombolópánttal.',['Pique, 200 g/m²','65% pamut, 35% poliészter; 12-es szín: 85% pamut, 15% viszkóz','Bordás gallér és ujjvégek, oldalvarrás']),
'pique-polo-210':('Szűkített női galléros póló ötgombos gombolópánttal.',['Pique, 200 g/m²','65% pamut, 35% poliészter; 12-es szín: 85% pamut, 15% viszkóz','Bordás gallér és ujjvégek, oldalvarrás']),
'jacket-501':('Hőtartó férfi polár, teljes hosszúságú cipzárral.',['100% poliészter, bolyhosodás ellen kezelt külső oldal','Cipzáras zsebek és állítható alsó szegély','A gyártó eredeti és új szabást is jelez; a mérettáblázat mindkettőt tartalmazza. A pontos változat egyeztetendő.']),
'5p-307':('Ötpaneles, állítható unisex baseball sapka.',['100% pamut, bordázott szövet','Hímzett szellőzőnyílások, nedvszívó pánt','Rézkapcsos méretállítás']),
'ultimate-5-panel-cap-sandwich-peak':('Ötpaneles baseball sapka kontrasztos szendvics silddel.',['100% pamut (drill)','Varrás nélküli első panel, szellőzőnyílások','Tépőzáras méretállítás']),
'original-patch-beanie':('Dupla rétegű kötött sapka, emblémázható elülső betéttel.',['100% puha tapintású poliakril','Dupla rétegű kötött anyag','Pamut twill betét: 10 × 5 cm']),
'printable-softshell-jacket':('Nyomtatható férfi softshell kabát meleg mikro polár belsővel.',['280 g/m², 100% poliészter, kétrétegű anyag','Végig cipzáras, állvédővel és cipzáras zsebekkel','Szűkebb fazon, nyomásra és hímzésre alkalmas']),
'men-s-printable-softshell-bodywarmer':('Nyomtatható férfi softshell mellény mikro polár belsővel.',['280 g/m², 100% poliészter, kétrétegű anyag','Végig cipzáras, állvédővel és cipzáras zsebekkel','Szűkebb fazon, nyomásra és hímzésre alkalmas']),
 'thermoquilt-gilet':('Könnyű, puha, bélelt mellény kontrasztos részletekkel.',['100% poliészter külső és bélés','140 g/m² újrahasznosított poliészter REPREVE® töltet','Cipzáras zsebek, rugalmas szegélyek']),
'soft-padded-jacket':('Puha, könnyű, bélelt kabát a hűvösebb napokra.',['100% poliészter; töltet: 160 g/m²','Vízlepergető és szélálló kialakítás','Cipzáras oldalzsebek, szegélyezett ujjvégek és derékrész'])}
for x in products:
 x['description'],x['specs']=desc[x['id']]
 x['sizePreview']=x['sizeChart'].replace('.pdf','.png')
 if x['id'] in ['original-patch-beanie','ultimate-5-panel-cap-sandwich-peak']:x['sizePending']=True
 if x['brand']=='Falk & Ross':
  s=Path('docs/supplier-snapshots',x['id']+'.txt').read_text();m=re.search('Termékszám: (.*)',s);x['sku']=m[1] if m else None
 else:x['sku']=x['id'].split('-')[-1]
 for c in x['colors']:c['label']=c['code'] if x['brand']!='Malfini' else 'Színkód: '+c['code']
p.write_text(json.dumps(products,ensure_ascii=False,indent=2))
