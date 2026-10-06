const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const products = require('../assets/data/products.json');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8080/ajanlatkeres.html?termek=classic-new-132&szin=07');
    const first = page.locator('.product-row').first();
    assert.equal(await first.locator('.quote-product-name').textContent(), 'Classic New 132');
    assert.match(await first.locator('.quote-product-image').getAttribute('src'), /-07.webp$/);
    await first.locator('.quantity').fill('3');
    await page.locator('#add-product').click();
    const second = page.locator('.product-row').nth(1);
    await second.locator('.product-select').selectOption('basic-134');
    await second.locator('.quote-color[data-color="44"]').click();
    await second.locator('.quantity').fill('2');
    assert.equal(await first.locator('.color-select').inputValue(), '07');
    assert.equal(await second.locator('.color-select').inputValue(), '44');
    assert.match(await second.locator('.quote-selection').textContent(), /44 · 2 db/);
    for (const width of [1440, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#product-rows').screenshot({ path: 'docs/qa/quote-selection-desktop.png', style: '.site-header, .skip { visibility: hidden !important; }' });
    await page.setViewportSize({ width: 390, height: 844 });
    await first.screenshot({ path: 'docs/qa/quote-selection-mobile.png', style: '.site-header, .skip { visibility: hidden !important; }' });
    for (const product of products) {
      await second.locator('.product-select').selectOption(product.id);
      assert.equal(await second.locator('.quote-product-image').isVisible(), false);
      for (const color of product.colors) {
        await second.locator('.quote-color').filter({ hasText: color.label }).click();
        assert.equal(await second.locator('.color-select').inputValue(), color.code);
        assert.equal(await second.locator('.quote-color[aria-pressed=true]').count(), 1);
        assert.equal(await second.locator('.quote-product-image').isVisible(), Boolean(color.image));
        if (color.image) assert.equal(await second.locator('.quote-product-image').getAttribute('src'), color.image);
        else assert.match(await second.locator('.quote-image-note').textContent(), /nincs termékfotó/);
      }
    }
    await second.locator('.product-select').selectOption('other');
    await second.locator('.custom-product').fill('Egyedi póló');
    await second.locator('.custom-color').fill('Türkiz');
    assert.equal(await second.locator('.quote-colors').isVisible(), false);
    assert.equal(await second.locator('.quote-product-name').textContent(), 'Egyedi póló');
    assert.match(await second.locator('.quote-selection').textContent(), /Türkiz/);
    await first.locator('.remove-row').click();
    assert.equal(await page.locator('.row-heading h3').textContent(), '1. tétel');
    assert.equal(await page.locator('.remove-row').isVisible(), false);
    assert.deepEqual(errors, []);
    console.log('PASS: quote previews, 70 colors, independent rows, custom products, missing photo, renumbering and responsive layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
