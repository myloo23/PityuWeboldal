const {chromium}=require('playwright');const fs=require('fs');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.emulateMedia({reducedMotion:'reduce'});
 const shot=async options=>{await page.locator('img').evaluateAll(es=>es.forEach(e=>e.loading='eager'));await page.waitForFunction(()=>[...document.images].every(e=>e.complete));await page.evaluate(()=>document.fonts.ready);await page.screenshot(options);};
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8080')&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 const url='http://127.0.0.1:8080/';const products=JSON.parse(fs.readFileSync('assets/data/products.json','utf8'));
 await page.goto(url);await shot({path:'docs/qa/home-desktop.png',fullPage:true});
 await page.locator('.category-row').nth(3).hover();assert.equal(await page.locator('#category-caption').textContent(),'Jacket 501');
 await page.locator('.category-row').nth(5).focus();assert.equal(await page.locator('#category-number').textContent(),'06');
 await page.locator('[data-placement="back"]').click();assert.equal(await page.locator('#placement-view-label').textContent(),'HÁTULNÉZET');assert.equal(await page.locator('[data-placement="back"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-placement="front"]').click();assert.equal(await page.locator('#print-marker').getAttribute('transform'),'translate(194 165) scale(2)');
 await page.locator('[data-placement="chest"]').click();
 await page.getByRole('heading',{name:'Hímzés',exact:true}).click();assert.equal(await page.locator('.techniques details').nth(1).getAttribute('open'),'');

 for(const width of [1440,1024,820,768,600,430,390,375,360,320]){
  await page.setViewportSize({width,height:900});
  for(const path of ['index.html','katalogus.html','termekek/classic-new-132.html','termekek/thermoquilt-gilet.html','ajanlatkeres.html','adatkezeles.html']){
   await page.goto(url+path);await page.evaluate(()=>document.fonts.ready);
   await page.locator('img').evaluateAll(es=>es.forEach(e=>e.loading='eager'));
   await page.waitForFunction(()=>[...document.images].every(e=>e.complete));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${width}: ${path}`);
   assert.equal(await page.locator('img').evaluateAll(es=>es.filter(e=>e.hasAttribute('src')&&(!e.complete||!e.naturalWidth)).length),0,`Broken image: ${path}`);
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(url);await shot({path:'docs/qa/home-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Menü'}).click();assert.equal(await page.locator('#navigation').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#navigation').isVisible(),false);
 await page.goto(url+'katalogus.html');assert.equal(await page.locator('.product-card:visible').count(),15);
 await page.locator('.filter-toggle').click();
 await page.locator('[data-filter="Női pólók"]').click();assert.equal(await page.locator('.product-card:visible').count(),2);
 assert.equal(await page.locator('#category-title').textContent(),'Női pólók');
 const basic=page.locator('[data-product-id="basic-134"]');
 await basic.locator('[data-color="07"]').click();
 assert.ok((await basic.locator('img').getAttribute('src')).includes('-07.webp'));
 assert.ok((await basic.locator('.card-link').getAttribute('href')).includes('szin=07'));
 await basic.locator('.card-link').click();
 assert.equal(await page.locator('.swatch[data-color="07"]').getAttribute('aria-pressed'),'true');
 await page.goBack();
 await page.locator('#search').fill('128');assert.equal(await page.locator('.product-card:visible').count(),1);
 await page.locator('#search').fill('nemletezo');assert.equal(await page.locator('#no-results').isVisible(),true);
 await page.locator('#search').fill('');await page.locator('.filter-toggle').click();await page.locator('[data-filter=""]').click();await shot({path:'docs/qa/catalog-mobile.png',fullPage:true});
 for(const product of products){
  await page.goto(url+`termekek/${product.id}.html`);
  assert.equal(await page.locator('.swatch').count(),product.colors.length);
  assert.equal(await page.getByRole('heading',{name:'Teljes termékkínálat',exact:true}).count(),product.brand==='Malfini'?1:0);
  for(const c of product.colors){
   await page.locator('.swatch').evaluateAll((es,code)=>es.find(e=>e.dataset.color===code).click(),c.code);
   assert.equal(await page.locator('#selected-color').textContent(),c.label);
   if(c.image)assert.ok((await page.locator('#variant-image').getAttribute('src')).endsWith(c.image));
   else assert.equal(await page.locator('#variant-missing').isVisible(),true);
   const href=await page.locator('#product-quote').getAttribute('href');assert.equal(new URL(href,url+'termekek/').searchParams.get('szin'),c.code);
  }
 }
 await page.goto(url+'termekek/classic-new-132.html');await page.locator('[data-color="07"]').click();await page.locator('#product-quote').click();
 assert.equal(await page.locator('.product-select').inputValue(),'classic-new-132');assert.equal(await page.locator('.color-select').inputValue(),'07');
 assert.equal(await page.locator('[name=technology] option').count(),4);
 for(const [name,value] of Object.entries({contact:'Teszt Elek',company:'Teszt cég',phone:'+36 20 000 0000',email:'teszt@example.com'}))await page.locator(`[name="${name}"]`).fill(value);
 await page.locator('.quantity').fill('3');assert.equal(await page.locator('.quantity').evaluate(e=>e.validity.valid),false);
 await page.locator('#add-product').click();await page.locator('.product-select').nth(1).selectOption('basic-134');await page.locator('.color-select').nth(1).selectOption('44');await page.locator('.quantity').nth(1).fill('2');assert.equal(await page.locator('.quantity').first().evaluate(e=>e.validity.valid),true);
 await page.locator('#placement').selectOption('Mindkét oldalon');assert.equal(await page.locator('#front-field').isVisible(),true);assert.equal(await page.locator('#back-field').isVisible(),true);
 await page.locator('[name="frontHeight"]').fill('12');await page.locator('[name="backHeight"]').fill('25');
 await page.locator('#placement').selectOption('Elöl');assert.equal(await page.locator('[name="backHeight"]').isDisabled(),true);
 await page.locator('#preview-button').click();assert.equal(await page.locator('#quote-preview').isVisible(),true);
 const summary=await page.locator('#preview-text').inputValue();assert.ok(summary.includes('Összesen: 5 darab'));assert.ok(summary.includes('Basic 134'));assert.ok(!summary.includes('Hátsó grafika magassága'));
 await shot({path:'docs/qa/quote-mobile.png',fullPage:true});
 await page.locator('.quantity').first().fill('4');assert.equal(await page.locator('#quote-preview').isVisible(),false);
 await page.locator('.remove-row').nth(1).click();assert.equal(await page.locator('.quantity').evaluate(e=>e.validity.valid),false);
 await page.locator('.quantity').fill('5');await page.locator('.product-select').selectOption('other');await page.locator('.custom-product').fill('Egyedi bögre');await page.locator('.custom-color').fill('Egyeztetendő');await page.locator('#preview-button').click();assert.ok((await page.locator('#preview-text').inputValue()).includes('Egyedi bögre'));
 assert.equal(await page.locator('input[type="file"]').count(),1);assert.deepEqual(errors,[]);
 await page.setViewportSize({width:1440,height:1000});await page.goto(url+'katalogus.html');await shot({path:'docs/qa/catalog-desktop.png',fullPage:true});await page.goto(url+'termekek/classic-new-132.html');await shot({path:'docs/qa/product-desktop.png',fullPage:true});
 await browser.close();console.log('PASS: 19 pages; 15 products; all requested color variants; 10 viewport widths; filtering, menu, quote transfer, combined minimum, optional fields, summary and no browser errors.');
})();
