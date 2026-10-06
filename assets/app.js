(() => {
  'use strict';
  const products = window.CEGFORMA_PRODUCTS || [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menu = $('.menu-toggle');
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    $('#navigation').classList.toggle('open', expanded);
  });
  const closeMenu = () => { menu?.setAttribute('aria-expanded', 'false'); $('#navigation')?.classList.remove('open'); };
  $$('#navigation a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });

  if (document.body.dataset.page === 'home') {
    const colorNames = { '01': 'fekete', '00': 'fehér', '07': 'piros' };
    $$('[data-hero-color]').forEach(button => button.addEventListener('click', () => {
      const code = button.dataset.heroColor;
      $('#hero-garment').src = `assets/products/pique-polo-203-${code}.webp`;
      $('#hero-garment').alt = `Pique Polo 203 – ${colorNames[code]} galléros póló`;
      $('#hero-product-link').href = 'termekek/pique-polo-203.html?szin=' + code;
      $$('[data-hero-color]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    }));
    $$('.category-row').forEach(row => {
      const showCategory = () => {
        $('#category-preview').src = row.dataset.preview;
        $('#category-preview').alt = row.dataset.caption;
        $('#category-caption').textContent = row.dataset.caption;
        $('#category-number').textContent = row.dataset.index;
      };
      row.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') showCategory(); });
      row.addEventListener('focus', showCategory);
    });
    const placements = {
      chest: { transform: 'translate(270 130)', view: 'ELÖLNÉZET', text: 'Visszafogott elhelyezés a mellrészen. A pontos helyet és méretet egyeztetjük.' },
      front: { transform: 'translate(194 165) scale(2)', view: 'ELÖLNÉZET', text: 'Nagyobb minta elöl, középen. A grafika szélessége az eredeti képarányhoz igazodik.' },
      back: { transform: 'translate(194 126) scale(2)', view: 'HÁTULNÉZET', text: 'Nagyobb felület a hátoldalon. A pontos méretet a grafikához és a textilhez igazítjuk.' }
    };
    $$('[data-placement]').forEach(button => button.addEventListener('click', () => {
      const choice = placements[button.dataset.placement];
      $('#print-marker').setAttribute('transform', choice.transform);
      $('#placement-view-label').textContent = choice.view;
      $('#placement-description').textContent = choice.text;
      $('#shirt-neck').setAttribute('d', button.dataset.placement === 'back' ? 'M174 54q76 40 152 0M180 56q70 22 140 0' : 'M174 54q76 110 152 0M180 56q70 88 140 0');
      $('.shirt-drawing').setAttribute('aria-label', `Sematikus pólórajz: ${choice.view.toLocaleLowerCase('hu')}. ${choice.text}`);
      $$('[data-placement]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    }));
  }
  if (document.body.dataset.page === 'catalog') {
    const links = $$('[data-filter]');
    let category = new URLSearchParams(location.search).get('kategoria') || '';
    const normalize = s => s.toLocaleLowerCase('hu').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    function filter() {
      if (!links.some(a => a.dataset.filter === category)) category = '';
      links.forEach(a => a.setAttribute('aria-current', String(a.dataset.filter === category)));
      const search = normalize($('#search').value.trim());
      let count = 0;
      $$('.product-card').forEach(card => {
        card.hidden = Boolean((category && card.dataset.category !== category) || !normalize(card.dataset.search).includes(search));
        if (!card.hidden) count++;
      });
      $('#result-count').textContent = `${count} termék`;
      $('#no-results').hidden = count > 0;
    }
    links.forEach(a => a.addEventListener('click', event => {
      event.preventDefault(); category = a.dataset.filter;
      history.pushState(null, '', a.href); filter();
    }));
    $('#search').addEventListener('input', filter);
    window.addEventListener('popstate', () => { category = new URLSearchParams(location.search).get('kategoria') || ''; filter(); });
    filter();
  }
  if (document.body.dataset.page === 'product') {
    const product = products.find(p => p.id === $('[data-product]').dataset.product);
    function selectColor(code) {
      const color = product.colors.find(c => c.code === code);
      if (!color) return;
      const img = $('#variant-image');
      img.hidden = !color.image;
      $('#variant-missing').hidden = Boolean(color.image);
      if (color.image) { img.src = '../' + color.image; img.alt = product.name + ' – ' + color.label; }
      $('#selected-color').textContent = color.label;
      $$('.swatch').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === code)));
      $('#product-quote').href = '../ajanlatkeres.html?' + new URLSearchParams({ termek: product.id, szin: code });
    }
    $$('.swatch').forEach(b => b.addEventListener('click', () => selectColor(b.dataset.color)));
    selectColor(new URLSearchParams(location.search).get('szin'));
  }
  if (document.body.dataset.page === 'quote') {
    const form = $('#quote-form');
    let rowIndex = 0;
    function option(text, value = text) { const o = document.createElement('option'); o.textContent = text; o.value = value; return o; }
    function invalidatePreview() { $('#quote-preview').hidden = true; $('#copy-status').textContent = ''; }
    function updateTotal() {
      const quantities = $$('.quantity');
      const total = quantities.reduce((sum, input) => sum + (Number(input.value) || 0), 0);
      $('#total-quantity').textContent = `Összesen: ${total} darab`;
      quantities.forEach(input => input.setCustomValidity(''));
      if (total < 5 && quantities[0]) quantities[0].setCustomValidity('A teljes ajánlatkérésben legalább összesen 5 darab szükséges. Többféle termékből is összeállíthatod.');
      $$('.remove-row').forEach(b => b.hidden = quantities.length === 1);
    }
    function addRow(productId = '', colorCode = '') {
      const index = ++rowIndex;
      const row = document.createElement('div'); row.className = 'product-row';
      row.innerHTML = `<div class="row-heading"><h3>Termék ${index}</h3><button class="remove-row" type="button" aria-label="Termék ${index} eltávolítása">Eltávolítás</button></div><div class="field-grid"><label class="field full">Termék neve vagy cikkszáma *<select class="product-select" name="products[${index}][id]" required></select></label><label class="field full custom-product-field" hidden>Más termék neve vagy cikkszáma *<input class="custom-product" name="products[${index}][custom]" maxlength="160" disabled></label><label class="field color-field">Választott szín *<select class="color-select" name="products[${index}][color]" required></select></label><label class="field custom-color-field" hidden>Választott szín neve vagy kódja *<input class="custom-color" name="products[${index}][customColor]" maxlength="100" disabled></label><label class="field">Tervezett darabszám *<input class="quantity" type="number" name="products[${index}][quantity]" min="1" step="1" max="100000" required inputmode="numeric" aria-describedby="quantity-help"></label><label class="field full">Méretek és méretenkénti darabszám<textarea class="sizes" name="products[${index}][sizes]" rows="2" maxlength="1000" placeholder="Például: M – 2 db, L – 3 db"></textarea></label></div>`;
      const select = $('.product-select', row), colors = $('.color-select', row);
      select.append(option('Válassz terméket', ''));
      products.forEach(p => select.append(option(p.name + ' · ' + p.sku, p.id)));
      select.append(option('Más termék / saját cikkszám', 'other'));
      function setProduct() {
        const other = select.value === 'other';
        $('.custom-product-field', row).hidden = !other;
        $('.custom-color-field', row).hidden = !other;
        $('.color-field', row).hidden = other;
        [$('.custom-product', row), $('.custom-color', row)].forEach(input => { input.disabled = !other; input.required = other; });
        colors.disabled = other; colors.replaceChildren(option('Válassz színt', ''));
        products.find(p => p.id === select.value)?.colors.forEach(c => colors.append(option(c.label, c.code)));
      }
      select.value = products.some(p => p.id === productId) ? productId : '';
      setProduct();
      if ([...colors.options].some(o => o.value === colorCode)) colors.value = colorCode;
      select.addEventListener('change', setProduct);
      $('.remove-row', row).addEventListener('click', () => {
        const rows = $$('.product-row'); const current = rows.indexOf(row);
        row.remove(); updateTotal(); invalidatePreview();
        $('.product-select', $$('.product-row')[Math.max(0, current - 1)]).focus();
      });
      $('#product-rows').append(row); updateTotal(); return row;
    }
    const params = new URLSearchParams(location.search);
    addRow(params.get('termek'), params.get('szin'));
    $('#preview-button').disabled = false;
    $('#add-product').addEventListener('click', () => { const row = addRow(); invalidatePreview(); $('.product-select', row).focus(); });
    function placement() {
      const value = $('#placement').value;
      [['front', ['Elöl', 'Mindkét oldalon']], ['back', ['Hátul', 'Mindkét oldalon']]].forEach(([side, options]) => {
        const field = $(`#${side}-field`); field.hidden = !options.includes(value); $('input', field).disabled = field.hidden;
      });
      $('#ratio-note').hidden = !value;
    }
    $('#placement').addEventListener('change', placement);
    form.addEventListener('input', () => { updateTotal(); invalidatePreview(); });
    form.addEventListener('change', invalidatePreview);
    // No form data is sent, persisted, or placed in URLs in this prototype.
    form.addEventListener('submit', event => {
      event.preventDefault(); updateTotal();
      $$('input[required]', form).forEach(input => {
        if (!input.classList.contains('quantity')) input.setCustomValidity(input.value.trim() ? '' : 'Kérjük, töltsd ki ezt a mezőt.');
      });
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const lines = ['ÁRAJÁNLATKÉRÉS – CÉGFORMA', 'Az ajánlatkérés nem jelent végleges megrendelést.', '', 'Kapcsolattartó: ' + data.get('contact'), 'Cégnév: ' + data.get('company'), 'Telefonszám: ' + data.get('phone'), 'E-mail: ' + data.get('email'), '', 'TERMÉKEK'];
      $$('.product-row').forEach((row, i) => {
        const p = products.find(p => p.id === $('.product-select', row).value);
        const color = p?.colors.find(c => c.code === $('.color-select', row).value);
        lines.push(`${i+1}. ${p ? p.name + ' (cikkszám: ' + p.sku + ')' : $('.custom-product', row).value}`, `Szín: ${color ? color.label : $('.custom-color', row).value}`, `Darabszám: ${$('.quantity', row).value}`, `Méretek: ${$('.sizes', row).value.trim() || 'Később egyeztetjük'}`, '');
      });
      lines.push($('#total-quantity').textContent, '', 'EMBLÉMÁZÁS', 'Technológia: ' + (data.get('technology') || 'Később egyeztetjük'), 'Minta helye: ' + (data.get('placement') || 'Később egyeztetjük'));
      if (data.get('frontHeight')) lines.push('Elülső grafika magassága: ' + data.get('frontHeight') + ' cm');
      if (data.get('backHeight')) lines.push('Hátsó grafika magassága: ' + data.get('backHeight') + ' cm');
      if (data.get('notes')?.trim()) lines.push('', 'MEGJEGYZÉS', data.get('notes'));
      $('#preview-text').value = lines.join('\n');
      $('#quote-preview').hidden = false; $('#preview-heading').focus();
    });
    // Clear custom whitespace errors as soon as the user corrects a required field.
    form.addEventListener('input', event => { if (event.target.matches('input[required]:not(.quantity)')) event.target.setCustomValidity(''); });
    $('#copy-quote').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#preview-text').value); $('#copy-status').textContent = 'Kimásolva. Illeszd be a leveledbe, majd küldd el a cegforma@gmail.com címre.'; }
      catch { $('#preview-text').focus(); $('#preview-text').select(); $('#copy-status').textContent = 'A szöveget kijelöltük. Másold ki a készüléked másolás funkciójával.'; }
    });
  }
})();
