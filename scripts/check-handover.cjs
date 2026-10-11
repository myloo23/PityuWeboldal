// Local handover audit: all pages and file-picker edge cases. No external mail.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
 const page=await browser.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8080')&&r.status()>=400)errors.push(r.url());});
 const files=[...fs.readdirSync('dist').filter(f=>f.endsWith('.html')),...fs.readdirSync('dist/termekek').filter(f=>f.endsWith('.html')).map(f=>'termekek/'+f)];
 const output=process.env.QA_OUTPUT||'/tmp/cegforma-handover';fs.mkdirSync(output,{recursive:true});
 for(const width of [320,390,768,1024,1440]) {
  await page.setViewportSize({width,height:900});
  for(const file of files) {
   await page.goto('http://127.0.0.1:8080/dist/'+file);
   await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await document.fonts.ready;});
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}: ${file}`);
   assert.equal(await page.locator('img[src]').evaluateAll(es=>es.some(i=>!i.naturalWidth)),false,`Image: ${file}`);
   if([390,768,1440].includes(width)&&['index.html','katalogus.html','ajanlatkeres.html','termekek/basic-134.html','impresszum.html'].includes(file))await page.screenshot({path:path.join(output,width+'-'+file.replaceAll('/','-')+'.png'),fullPage:true});
  }
 }
 await page.goto('http://127.0.0.1:8080/dist/ajanlatkeres.html');
 const upload=page.locator('#artwork');
 const file=(name,size=100)=>({name,mimeType:'application/pdf',buffer:Buffer.alloc(size,32)});
 await page.locator('.upload-action').scrollIntoViewIfNeeded();
 const bounds=await page.locator('.upload-action').boundingBox();
 const [chooser]=await Promise.all([page.waitForEvent('filechooser'),page.mouse.click(bounds.x+bounds.width/2,bounds.y+bounds.height/2)]);assert.ok(chooser.isMultiple());
 await upload.focus();assert.equal(await upload.evaluate(e=>e===document.activeElement),true);
 await upload.setInputFiles(file('logo.pdf'));
 assert.equal(await page.locator('.artwork-row').count(),1);
 await upload.setInputFiles(file('hibas.exe'));assert.match(await page.locator('#artwork-error').textContent(),/JPG/);
 assert.equal(await page.locator('.artwork-row').count(),1);
 await page.locator('.artwork-row button').click();assert.equal(await page.locator('#artwork-error').textContent(),'');
 for(const size of [0,5*1024*1024+1]){await upload.setInputFiles(file('nagy.pdf',size));assert.match(await page.locator('#artwork-error').textContent(),/Üres vagy/);}
 await upload.setInputFiles(Array.from({length:6},(_,i)=>file(i+'.pdf')));assert.match(await page.locator('#artwork-error').textContent(),/Legfeljebb 5/);
 await upload.setInputFiles([file('1.pdf',4*1024*1024),file('2.pdf',4*1024*1024),file('3.pdf',4*1024*1024)]);assert.match(await page.locator('#artwork-error').textContent(),/10 MB/);
 await page.locator('#artwork-dropzone').evaluate(el=>{const data=new DataTransfer();data.items.add(new File(['test'], 'behuzott.pdf',{type:'application/pdf'}));el.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:data,cancelable:true}));});
 assert.equal(await page.locator('.artwork-row').count(),1);assert.match(await page.locator('#artwork-status').textContent(),/1 \/ 5/);
 await upload.setInputFiles(file('hosszu-grafikanev-'.repeat(12)+'.pdf'));
 await page.setViewportSize({width:320,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('#artwork-dropzone').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'upload-mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${files.length} pages × 5 widths; images, overflow, native picker, keyboard focus, drag/drop, limits, removal recovery and long filenames. Screenshots: ${output}`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
