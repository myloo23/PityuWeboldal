const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const results=[];
 try {
  for (const path of ['index.html','katalogus.html','termekek/classic-new-132.html','ajanlatkeres.html']) {
   const context=await browser.newContext({viewport:{width:390,height:844}});
   const page=await context.newPage();
   const cdp=await context.newCDPSession(page);
   await cdp.send('Network.enable');
   await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:100000});
   await page.addInitScript(()=>{window.lastLCP=0;new PerformanceObserver(list=>{for(const entry of list.getEntries())window.lastLCP=entry.startTime}).observe({type:'largest-contentful-paint',buffered:true})});
   await page.goto('http://127.0.0.1:8080/'+path);
   await page.waitForLoadState('networkidle');
   results.push({path,...await page.evaluate(()=>({lcpMs:Math.round(window.lastLCP),loadMs:Math.round(performance.getEntriesByType('navigation')[0].loadEventEnd),bytes:performance.getEntriesByType('resource').reduce((n,e)=>n+e.transferSize,performance.getEntriesByType('navigation')[0].transferSize),requests:performance.getEntriesByType('resource').length+1}))});
   await context.close();
  }
 } finally {await browser.close()}
 console.log(JSON.stringify(results,null,2));
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(results,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1});
