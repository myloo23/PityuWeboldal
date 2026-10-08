const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext();
 const page=await context.newPage();
 const external=[],errors=[];
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8080/'))external.push(r.url());});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()}: ${r.url()}`);});
 const files=fs.readdirSync('dist').filter(f=>f.endsWith('.html')).concat(fs.readdirSync('dist/termekek').map(f=>'termekek/'+f));
 const titles=new Set(),descriptions=new Set(),canonicals=new Set();
 for(const file of files){
  await page.goto('http://127.0.0.1:8080/dist/'+file);
  assert.equal(await page.locator('h1').count(),1,file);
  const title=await page.title();assert(!titles.has(title),title);titles.add(title);
  const desc=await page.locator('meta[name="description"]').getAttribute('content');assert(!descriptions.has(desc),file);descriptions.add(desc);
  const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
  assert.equal(canonical,'https://cegforma.hu/'+(file==='index.html'?'':file));assert(!canonicals.has(canonical));canonicals.add(canonical);
  assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'),canonical);
  const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert(graph['@graph'].length>=3);
  for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
   if(/^(https?:|mailto:|#)/.test(href))continue;
   const target=require('node:path').resolve('dist',require('node:path').dirname(file),href.split(/[?#]/)[0]);
   assert(fs.existsSync(target),`${file}: ${href}`);
  }
  assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 }
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  for(const file of ['adatkezeles.html','impresszum.html','sutik.html','ajanlatkeresi-feltetelek.html']){
   await page.goto('http://127.0.0.1:8080/dist/'+file);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${file}: ${width}`);
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:8080/dist/sutik.html');
 await page.screenshot({path:'docs/qa/privacy-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:8080/dist/adatkezeles.html');
 await page.screenshot({path:'docs/qa/privacy-desktop.png',fullPage:true});
 await page.goto('http://127.0.0.1:8080/dist/termekek/classic-new-132.html?szin=01');
 assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://cegforma.hu/termekek/classic-new-132.html');
 assert.deepEqual(await context.cookies(),[]);assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,17);
 for(const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g))assert(canonicals.has(match[1]));
 assert(!fs.existsSync('dist/docs'));assert(!fs.existsSync('dist/Emailek'));
 await browser.close();console.log(`PASS: ${files.length} pages; metadata, schema, links, sitemap, legal mobile layouts, no cookies/storage/external requests.`);
})().catch(e=>{console.error(e);process.exit(1)});
