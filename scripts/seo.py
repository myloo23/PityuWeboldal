"""Shared static metadata. No third-party scripts or invented commercial claims."""
import html, json
from urllib.parse import urlsplit

def metadata(config, title, description, path, page, products, product_id=None):
 origin=config['site_url'].rstrip('/')
 parsed=urlsplit(origin)
 if parsed.scheme!='https' or not parsed.netloc or parsed.path or parsed.query or parsed.fragment:
  raise ValueError('site_url must be an HTTPS origin without a path')
 url=origin+'/'+path
 product=next((p for p in products if p['id']==product_id),None)
 image=origin+'/'+(next(c['image'] for c in product['colors'] if c.get('image')) if product else 'assets/images/apparel-hero-desktop.jpg')
 image_alt=product['name'] if product else 'Cégforma – céges ruházat és egyedi emblémázás'
 esc=lambda value:html.escape(str(value),quote=True)
 tags=[f'<link rel="canonical" href="{esc(url)}">', '<meta name="robots" content="'+('noindex,follow' if page in ['legal','quote'] else 'index,follow,max-image-preview:large')+'">']
 for key,value in {'og:type':'website','og:locale':'hu_HU','og:site_name':'Cégforma','og:title':title+' | Cégforma','og:description':description,'og:url':url,'og:image':image,'og:image:alt':image_alt}.items():
  tags.append(f'<meta property="{key}" content="{esc(value)}">')
 for key,value in {'twitter:card':'summary_large_image','twitter:title':title+' | Cégforma','twitter:description':description,'twitter:image':image,'twitter:image:alt':image_alt}.items():
  tags.append(f'<meta name="{key}" content="{esc(value)}">')
 graph=[{'@type':'Organization','@id':origin+'/#organization','name':'Cégforma','url':origin+'/','logo':origin+'/assets/images/cegforma-logo.webp','email':'cegforma@gmail.com'},
 {'@type':'WebSite','@id':origin+'/#website','url':origin+'/','name':'Cégforma','inLanguage':'hu-HU','publisher':{'@id':origin+'/#organization'}},
 {'@type':'CollectionPage' if page=='catalog' else 'WebPage','@id':url+'#webpage','url':url,'name':title,'description':description,'inLanguage':'hu-HU','isPartOf':{'@id':origin+'/#website'}}]
 if page!='home':
  crumbs=[('Kezdőlap',origin+'/')]
  if product:crumbs.append(('Termékkatalógus',origin+'/katalogus.html'))
  crumbs.append((product['name'] if product else title,url))
  graph.append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':name,'item':link} for i,(name,link) in enumerate(crumbs)]})
 if page=='catalog':
  graph.append({'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':p['name'],'url':origin+'/termekek/'+p['id']+'.html'} for i,p in enumerate(products)]})
 # No Product rich-result markup until genuine offers or reviews are available.
 tags.append('<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')+'</script>')
 return ''.join(tags)
