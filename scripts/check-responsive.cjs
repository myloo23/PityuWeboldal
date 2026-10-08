const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = 'http://127.0.0.1:8080/';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Measure document positions after each real hover and decoded image.
  for (const width of [1440, 1024, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const positions = [];
    for (const row of await page.locator('.category-row').all()) {
      await row.hover();
      await page.locator('#category-preview').evaluate(img => img.decode());
      positions.push(await page.locator('#szolgaltatasok').evaluate(el => el.getBoundingClientRect().top + scrollY));
    }
    assert.ok(Math.max(...positions) - Math.min(...positions) <= 1, `Hover layout shift at ${width}: ${positions}`);
    await page.locator('.category-row').first().focus();
    await page.locator('#category-preview').evaluate(img => img.decode());
    assert.equal(await page.locator('#szolgaltatasok').evaluate(el => el.getBoundingClientRect().top + scrollY), positions[0]);
    console.log(`PASS: all eight images + keyboard focus, no section movement at ${width}px.`);
  }
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const phone = await touch.newPage();
  const load = async path => {
    await phone.goto(base + path);
    await phone.evaluate(() => document.fonts.ready);
    await phone.locator('img').evaluateAll(imgs => imgs.forEach(img => img.loading = 'eager'));
    await phone.waitForFunction(() => [...document.images].every(img => img.complete));
  };
  await load('index.html');
  await phone.screenshot({ path: 'docs/qa/mobile-home-optimized.png', fullPage: true });
  await phone.locator('#rolunk').screenshot({ path: 'docs/qa/mobile-about-optimized.png' });
  await phone.getByRole('button', { name: 'Menü' }).tap();
  await phone.getByRole('link', { name: 'Rólunk', exact: true }).tap();
  assert.equal(await phone.locator('#navigation').isVisible(), false);
  assert.ok(await phone.locator('#rolunk').evaluate(el => el.getBoundingClientRect().top >= 72));
  // Full mobile catalog flow with actual taps, including collapse + breakpoint changes.
  await load('katalogus.html');
  assert.equal(await phone.locator('#category-filters').isVisible(), false);
  await phone.locator('.filter-toggle').tap();
  await phone.locator('[data-filter="Női pólók"]').tap();
  assert.equal(await phone.locator('.product-card:visible').count(), 2);
  assert.equal(await phone.locator('#category-filters').isVisible(), false);
  const selected = phone.locator('[data-product-id="basic-134"]');
  await selected.locator('[data-color="07"]').tap();
  for (const button of await selected.locator('.card-color').all()) {
    const box = await button.boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44, 'Small touch target');
  }
  await phone.locator('.card-color:focus').evaluateAll(els => els.forEach(el => el.blur()));
  await phone.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await phone.screenshot({ path: 'docs/qa/mobile-catalog-optimized.png', fullPage: true });
  await selected.locator('.card-link').tap();
  assert.equal(await phone.locator('[data-color="07"]').getAttribute('aria-pressed'), 'true');
  await phone.locator('#product-quote').tap();
  assert.equal(await phone.locator('.color-select').inputValue(), '07');
  const controls = await phone.locator('input,select,textarea').evaluateAll(els => els.filter(el => !el.disabled && !el.closest('[aria-hidden="true"]') && el.getClientRects().length).map(el => ({font: parseFloat(getComputedStyle(el).fontSize), width:el.getBoundingClientRect().width})));
  assert.ok(controls.every(el => el.font >= 16 && el.width >= 200), 'Mobile form controls too small');
  await phone.screenshot({ path: 'docs/qa/mobile-quote-optimized.png', fullPage: true });
  await load('katalogus.html');
  await phone.setViewportSize({ width: 768, height: 1024 });
  await phone.locator('#category-filters').waitFor({ state: 'visible' });
  assert.equal(await phone.locator('#category-filters').isVisible(), true);
  await phone.setViewportSize({ width: 390, height: 844 });
  await phone.locator('#category-filters').waitFor({ state: 'hidden' });
  assert.equal(await phone.locator('#category-filters').isVisible(), false);
  // Landscape menu can scroll, keeping every navigation item reachable.
  await phone.setViewportSize({ width: 667, height: 375 });
  await phone.locator('.menu-toggle').tap();
  const menu = await phone.locator('#navigation').boundingBox();
  assert.ok(menu.y + menu.height <= 375, 'Landscape menu exceeds viewport');
  await phone.locator('#navigation .button').tap();
  await phone.waitForURL('**/ajanlatkeres.html');
  assert.ok(phone.url().includes('ajanlatkeres.html'));
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const fallback = await nojs.newPage();
  await fallback.goto(base + 'katalogus.html');
  assert.equal(await fallback.locator('#category-filters').isVisible(), true);
  console.log('PASS: touch navigation, filter collapse, sizes, quote transfer, responsive filters, landscape menu and no-JS fallback.');
  await browser.close();
})();
