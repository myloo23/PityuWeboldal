const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 try {
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const base = process.env.CEGFORMA_TEST_BASE;
  assert(base, 'Run via scripts/check-delivery.py');
  const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error' && /Content Security Policy/.test(m.text())) errors.push(m.text());});
  // Activate only the test response, never the checked-in production configuration.
  await page.route('**/ajanlatkeres.html', async route => {
   const response=await route.fetch();
   await route.fulfill({response,headers:{...response.headers(),'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"},body:(await response.text()).replace('data-online="false"','data-online="true"').replace('id="send-quote" hidden','id="send-quote"')});
  });
  await page.goto(base+'ajanlatkeres.html');
  for(const [name,value] of Object.entries({contact:'Teszt Elek',company:'Teszt Kft.',phone:'+36 20 000 0000',email:'test@example.test'})) await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('.product-select').selectOption('basic-134'); await page.locator('.color-select').selectOption('01'); await page.locator('.quantity').fill('5');
  await page.locator('#artwork').setInputFiles({name:'veszelyes.exe',mimeType:'application/octet-stream',buffer:Buffer.from('test')});
  assert.match(await page.locator('#artwork-error').textContent(),/JPG/); assert.equal(await page.locator('.artwork-row').count(),0);
  const file={name:'nagyon-hosszu-grafikanev-a-mobilos-tordeles-ellenorzesehez.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L2 2"/></svg>')};
  await page.locator('#artwork').setInputFiles([file,{...file,name:'hatul.svg'}]);
  await page.locator('.artwork-row select').first().selectOption('Elöl'); await page.locator('.artwork-row select').nth(1).selectOption('Hátul');
  for(const width of [320,390,768,1440]) {await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);}
  await page.locator('#preview-button').click(); assert.match(await page.locator('#preview-text').inputValue(),/hatul.svg – Hátul/);
  await page.locator('.artwork-row button').last().click(); assert.equal(await page.locator('#quote-preview').isVisible(),false);
  await page.locator('#preview-button').click();
  // Lose the first successful HTTP response. Retry must reuse the token and not send twice.
  let postCount=0;
  await page.route('**/api/quote.php',async route=>{
   if(route.request().method()==='POST' && ++postCount===1) {await route.fetch();await route.abort('failed');}
   else await route.continue();
  });
  await page.locator('#send-quote').click();
  await page.waitForFunction(()=>document.querySelector('#send-status').textContent.includes('hálózati hiba'));
  assert.equal(await page.locator('[name="company"]').inputValue(),'Teszt Kft.'); assert.equal(await page.locator('.artwork-row').count(),1);
  await page.locator('#send-quote').click();
  await page.waitForFunction(()=>document.querySelector('#send-status').textContent.includes('levelezőszerver átvette'));
  assert.equal(await page.locator('#send-quote').isDisabled(),true); assert.equal(postCount,2);
  await page.setViewportSize({width:390,height:844});
  fs.mkdirSync('/tmp/cegforma-qa',{recursive:true});await page.screenshot({path:'/tmp/cegforma-qa/delivery-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: attachments, positions, removal, mobile layout, lost-response retry, preserved data, actual PHP/SMTP delivery.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
