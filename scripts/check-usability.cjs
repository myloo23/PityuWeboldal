const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const base = 'http://127.0.0.1:8080/';
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + 'katalogus.html');
    await page.locator('#search').fill('134 noi');
    assert.equal(await page.locator('.product-card:visible').count(), 1);
    assert.equal(new URL(page.url()).searchParams.get('kereses'), '134 noi');
    await page.reload();
    assert.equal(await page.locator('#search').inputValue(), '134 noi');
    assert.equal(await page.locator('.product-card:visible').count(), 1);
    await page.locator('.filter-toggle').click();
    await page.locator('[data-filter="Férfi pólók"]').click();
    assert.equal(await page.locator('#no-results').isVisible(), true);
    await page.goBack();
    assert.equal(await page.locator('.product-card:visible').count(), 1);
    await page.goForward();
    assert.equal(await page.locator('#no-results').isVisible(), true);
    await page.locator('#reset-filters').click();
    assert.equal(await page.locator('.product-card:visible').count(), 15);
    assert.equal(new URL(page.url()).search, '');
    assert.equal(await page.locator('#search').evaluate(el => el === document.activeElement), true);
    await page.goto(base + 'termekek/soft-padded-jacket.html?szin=ismeretlen');
    assert.equal(await page.locator('#variant-image').isVisible(), true);
    await page.goto(base + 'termekek/classic-new-132.html');
    assert.equal(await page.locator('[data-color="01"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-color="07"]').click();
    assert.equal(new URL(page.url()).searchParams.get('szin'), '07');
    await page.reload();
    assert.equal(await page.locator('[data-color="07"]').getAttribute('aria-pressed'), 'true');
    await page.locator('#product-quote').click();
    for (const [name, value] of Object.entries({ contact: 'Teszt Elek', company: 'Árvíztűrő Kft.', phone: '+36 20 000 0000', email: 'teszt@example.com' })) {
      await page.locator(`[name="${name}"]`).fill(value);
    }
    await page.locator('.quantity').fill('4');
    await page.locator('#preview-button').click();
    assert.equal(await page.locator('#quote-preview').isVisible(), false);
    await page.locator('.quantity').fill('5');
    await page.locator('[name="contact"]').fill('   ');
    await page.locator('#preview-button').click();
    assert.equal(await page.locator('#quote-preview').isVisible(), false);
    await page.locator('[name="contact"]').fill('Teszt Elek');
    await page.locator('#preview-button').click();
    assert.equal(await page.locator('#quote-preview').isVisible(), true);
    const summary = await page.locator('#preview-text').inputValue();
    const downloadEvent = page.waitForEvent('download');
    await page.locator('#download-quote').click();
    const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), 'cegforma-ajanlatkeres.txt');
    assert.equal(await fs.readFile(await download.path(), 'utf8'), '\uFEFF' + summary);
    await page.locator('[name="notes"]').fill('Hímzést szeretnék.');
    assert.equal(await page.locator('#quote-preview').isVisible(), false);
    assert.equal(await page.locator('#preview-text').inputValue(), '');
    await page.locator('#preview-button').click();
    assert.match(await page.locator('#preview-text').inputValue(), /Hímzést szeretnék/);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#quote-preview').screenshot({ path: 'docs/qa/quote-download-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: persistent multiword search, history/reset, shareable colors, form correction, UTF-8 download and stale summary removal.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
