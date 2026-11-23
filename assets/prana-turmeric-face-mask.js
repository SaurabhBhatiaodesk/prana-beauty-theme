import { CartAddEvent } from '@theme/events';

// PRANA Turmeric & Sandalwood PDP sections (ptm-*), from prana-turmeric-mask-pdp v19.
// <prana-tfm>: gallery, price/plan/quantity, free-shipping note, add to cart via the theme cart drawer, sticky bar.
// <prana-tfm-journeys>: journey tabs and before/after sliders.

class PranaTfm extends HTMLElement {
  connectedCallback() {
    const $ = (s) => this.querySelector(s);
    const $$ = (s) => Array.from(this.querySelectorAll(s));
    // Whole amounts show as $52, others as $44.20 (same as money_without_trailing_zeros).
    const money = (cents) => new Intl.NumberFormat(this.dataset.locale || 'en', { style: 'currency', currency: this.dataset.currency || 'USD', minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(cents / 100);

    // Gallery
    const main = $('#mainImg');
    $$('.tm-thumbs button').forEach((b) => b.addEventListener('click', () => {
      if (!main) return;
      main.removeAttribute('srcset');
      main.removeAttribute('sizes');
      main.src = b.dataset.src;
      if (b.dataset.alt) main.alt = b.dataset.alt;
      $$('.tm-thumbs button').forEach((x) => x.setAttribute('aria-current', 'false'));
      b.setAttribute('aria-current', 'true');
    }));

    // Price, plan and quantity
    const form = $('#ptm-product-form');
    const atc = $('#atc');
    if (!form || !atc) return;
    const qtyInput = $('[data-qty-input]');
    const qtyOut = $('#qty');
    const message = $('[data-message]');
    const planNote = $('[data-plan-note]');
    const ship = $('#ship');
    let qty = 1;
    const price = () => {
      const plan = $('input[name=selling_plan]:checked');
      const total = Number(plan ? plan.dataset.price : 0) * qty;
      $$('.tm-price-now').forEach((el) => { el.textContent = money(total); });
      if (planNote) planNote.hidden = !(plan && plan.value);
      if (!ship) return;
      const threshold = Number(this.dataset.freeShipCents || 0);
      if (this.dataset.freeShip !== 'true' || !threshold) { ship.innerHTML = ''; return; }
      ship.innerHTML = total >= threshold ? (this.dataset.shipFree || '') : (this.dataset.shipAway || '').replace('[amount]', money(threshold - total));
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
    form.addEventListener('submit', async (event) => {
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
        atc.classList.add('tm-done');
        atc.textContent = this.dataset.addedLabel || '';
        message.textContent = this.dataset.addedLabel || '';
        setTimeout(() => { atc.classList.remove('tm-done'); atc.innerHTML = original; price(); }, 2200);
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
        sticky.classList.toggle('tm-show', hidden);
        sticky.setAttribute('aria-hidden', String(!hidden));
        if (stickyBtn) stickyBtn.tabIndex = hidden ? 0 : -1;
      });
      this.observer.observe(atc);
    }
  }

  disconnectedCallback() { this.observer?.disconnect(); }
}

class PranaTfmJourneys extends HTMLElement {
  connectedCallback() {
    const tabs = Array.from(this.querySelectorAll('.tm-journey-tabs button'));
    const panels = Array.from(this.querySelectorAll('[data-journey]'));
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-selected', String(x === tab)));
      panels.forEach((panel) => { panel.hidden = panel.dataset.journey !== tab.dataset.j; });
    }));
    this.querySelectorAll('.tm-ba').forEach((ba) => {
      const range = ba.querySelector('input[type=range]');
      range?.addEventListener('input', () => ba.style.setProperty('--pos', range.value + '%'));
    });
  }
}

if (!customElements.get('prana-tfm')) customElements.define('prana-tfm', PranaTfm);
if (!customElements.get('prana-tfm-journeys')) customElements.define('prana-tfm-journeys', PranaTfmJourneys);

// Links to #formula open the formula table (it is a <details>).
if (!window.__ptmFormulaLinks) {
  window.__ptmFormulaLinks = true;
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href="#formula"]') : null;
    const formula = document.getElementById('formula');
    if (link && formula instanceof HTMLDetailsElement) formula.open = true;
  });
}
