import { CartAddEvent } from '@theme/events';

// PRANA Turmeric & Sandalwood PDP (from prana-turmeric-mask-pdp v19): gallery, price/plan/quantity,
// free-shipping note (US only), add to cart through the theme cart drawer, sticky bar, before/after
// slider and journeys (sample data from the source file — replace before launch).
class PranaTfm extends HTMLElement {
  connectedCallback() {
    const $ = (s) => this.querySelector(s);
    const $$ = (s) => Array.from(this.querySelectorAll(s));
    const fmt = new Intl.NumberFormat(this.dataset.locale || 'en', { style: 'currency', currency: this.dataset.currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const money = (cents) => fmt.format(cents / 100);

    // Gallery
    const main = $('#mainImg');
    $$('.thumbs button').forEach((b) => b.addEventListener('click', () => {
      main.src = b.dataset.src;
      $$('.thumbs button').forEach((x) => x.setAttribute('aria-current', 'false'));
      b.setAttribute('aria-current', 'true');
    }));

    // Price + quantity
    const form = $('#ptm-product-form');
    const atc = $('#atc');
    const qtyInput = $('[data-qty-input]');
    const qtyOut = $('#qty');
    const message = $('[data-message]');
    const planNote = $('[data-plan-note]');
    let qty = 1;
    const price = () => {
      const plan = $('input[name=selling_plan]:checked');
      const total = Number(plan ? plan.dataset.price : 0) * qty;
      $$('.price-now').forEach((el) => { el.textContent = money(total); });
      if (planNote) planNote.hidden = !(plan && plan.value);
      const ship = $('#ship');
      if (this.dataset.freeShip !== 'true') { ship.innerHTML = ''; return; }
      const FREE = 10000;
      ship.innerHTML = total >= FREE ? 'This order ships free.'
        : "You're " + money(FREE - total) + ' away from free shipping. Add a second jar, or get the <a href="/pages/abhyanga">ABHYANGA ritual set</a> ($147), which ships free.';
    };
    $$('input[name=selling_plan]').forEach((r) => r.addEventListener('change', price));
    $$('[data-q]').forEach((b) => b.addEventListener('click', () => {
      qty = Math.max(1, qty + Number(b.dataset.q));
      qtyOut.textContent = qty;
      qtyInput.value = qty;
      price();
    }));
    price();

    // Add to cart through the theme cart drawer
    const sticky = $('#sticky');
    const stickyBtn = $('[data-sticky]');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (atc.disabled) return;
      const original = atc.innerHTML;
      atc.disabled = true;
      atc.setAttribute('aria-busy', 'true');
      if (stickyBtn) stickyBtn.disabled = true;
      message.textContent = '';
      try {
        const data = new FormData(form);
        if (!data.get('selling_plan')) data.delete('selling_plan');
        const sections = [...new Set(Array.from(document.querySelectorAll('cart-items-component')).map((el) => el.getAttribute('data-section-id')).filter(Boolean))].slice(0, 5);
        data.set('sections', sections.join(','));
        data.set('sections_url', location.pathname);
        const response = await fetch(Theme.routes.cart_add_url, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
        const result = await response.json();
        if (!response.ok || result.status) throw new Error(result.description || this.dataset.error);
        atc.dispatchEvent(new CartAddEvent(result, form.id, { source: 'product-form-component', itemCount: qty, sections: result.sections }));
        atc.classList.add('done');
        atc.textContent = 'Added to your ritual';
        message.textContent = this.dataset.added || '';
        setTimeout(() => { atc.classList.remove('done'); atc.innerHTML = original; price(); }, 2200);
        const drawer = document.querySelector('cart-drawer-component');
        if (drawer && typeof drawer.open === 'function') drawer.open(); else location.assign(Theme.routes.cart_url);
      } catch (error) {
        atc.innerHTML = original;
        price();
        message.textContent = error instanceof Error ? error.message : this.dataset.error || '';
      } finally {
        atc.disabled = false;
        atc.removeAttribute('aria-busy');
        if (stickyBtn) stickyBtn.disabled = false;
      }
    });
    stickyBtn?.addEventListener('click', () => { atc.scrollIntoView({ behavior: 'smooth', block: 'center' }); form.requestSubmit(atc); });

    // Sticky bar whenever the main button is off screen
    if (sticky && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        const hidden = !entries[0].isIntersecting;
        sticky.classList.toggle('show', hidden);
        sticky.setAttribute('aria-hidden', String(!hidden));
        if (stickyBtn) stickyBtn.tabIndex = hidden ? 0 : -1;
      });
      this.observer.observe(atc);
    }

    // Before / after slider
    const ba = $('#ba');
    const range = $('#baRange');
    range.addEventListener('input', () => ba.style.setProperty('--pos', range.value + '%'));

    // Journeys — SAMPLE DATA from the source file for layout review only. Replace every field with the real
    // customer's details, their own words, their consented photos (Shopify CDN URLs) and the other products used.
    const journeys = [
      { name: 'Maya, 27', skin: 'Blemish-prone, combination skin', before: '', after: '',
        weeks: [['Week 1', 'My skin felt clean but not tight, which never happens with clay masks.'], ['Week 4', 'Redness around my chin looks calmer and my pores look smaller.'], ['Week 8', 'My skin looks clearer and more even. I wear less foundation now.']],
        other: 'Rose Jasmine Milk Cleanser, usual SPF' },
      { name: 'Aisha, 34', skin: 'Blemish-prone, oily skin', before: '', after: '',
        weeks: [['Week 1', 'Less shine by midday, and my skin still felt soft after rinsing.'], ['Week 4', 'My nose and forehead look less congested.'], ['Week 8', 'Old marks look lighter and my skin tone looks more even.']],
        other: 'Usual cleanser and moisturizer' },
      { name: 'Jen, 41', skin: 'Blemish-prone, sensitive skin', before: '', after: '',
        weeks: [['Week 1', 'Started at 8 minutes. No stinging, and the scent is lovely.'], ['Week 4', 'Moved up to 12 minutes. My skin looks calmer overall.'], ['Week 8', 'Fewer blemishes showing up, and my skin looks brighter.']],
        other: 'Saffron Glow Serum, usual SPF' },
    ];
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const beforePh = $('#baBefore').innerHTML;
    const afterPh = $('#baAfter').innerHTML;
    const setSlot = (id, src, label, fallback) => { $('#' + id).innerHTML = src ? '<img src="' + esc(src) + '" alt="' + esc(label) + '">' : fallback; };
    const showJourney = (n) => {
      const j = journeys[n];
      $('#jName').textContent = j.name;
      $('#jSkin').textContent = j.skin;
      $('#jTimeline').innerHTML = j.weeks.map((w) => '<li><b>' + esc(w[0]) + '</b><span>“' + esc(w[1]) + '”</span></li>').join('');
      $('#jDisclose').textContent = 'Unretouched photos shared with permission by a verified customer. Other products used: ' + j.other + '. Individual results vary.';
      setSlot('baBefore', j.before, j.name + ', week 0', beforePh);
      setSlot('baAfter', j.after, j.name + ', week 8', afterPh);
      range.value = 50;
      ba.style.setProperty('--pos', '50%');
    };
    $$('.journey-tabs button').forEach((t) => t.addEventListener('click', () => {
      $$('.journey-tabs button').forEach((x) => x.setAttribute('aria-selected', 'false'));
      t.setAttribute('aria-selected', 'true');
      showJourney(Number(t.dataset.j));
    }));
    showJourney(0);

    // Open formula when linked to
    $$('a[href="#formula"]').forEach((a) => a.addEventListener('click', () => { $('#formula').open = true; }));
  }

  disconnectedCallback() { this.observer?.disconnect(); }
}

if (!customElements.get('prana-tfm')) customElements.define('prana-tfm', PranaTfm);
