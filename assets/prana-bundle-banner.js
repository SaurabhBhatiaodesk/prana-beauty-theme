import { CartAddEvent } from '@theme/events';

/** @param {HTMLElement} root */
function initBundleBanner(root) {
  if (root.dataset.initialized || !root.dataset.bundleId) return;
  root.dataset.initialized = 'true';
  const button = root.querySelector('[data-bundle-add]');
  const status = root.querySelector('[data-bundle-status]');
  const price = root.querySelector('[data-bundle-price]');
  if (!(button instanceof HTMLButtonElement) || !(price instanceof HTMLElement) || !status) return;
  const base = (root.dataset.root || '/').replace(/\/?$/, '/');
  /** @type {{id: number, quantity: number}[]} */
  let items = [];
  let loading = false;
  let loaded = false;
  let attempts = 0;
  const fail = () => { status.textContent = root.dataset.error || ''; button.disabled = true; };
  const api = () => /** @type {Window & {bndlr?: any}} */ (window).bndlr;
  const money = (/** @type {number} */ cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', {
    style: 'currency', currency: root.dataset.currency || root.dataset.shopCurrency || 'USD',
  }).format(cents / 100);

  async function load() {
    if (!root.isConnected || loading || loaded) return;
    const bundler = api();
    if (typeof bundler?.getBundles !== 'function') return;
    const raw = bundler.getBundles();
    const bundles = Array.isArray(raw) ? raw : Array.isArray(raw?.bundles) ? raw.bundles : Object.values(raw || {});
    const bundle = bundles.find((/** @type {any} */ entry) => String(entry.id ?? entry.bundle_id ?? entry.bundleId) === root.dataset.bundleId?.trim());
    if (!bundle) return;
    loading = true;
    try {
      if (bundle.status && bundle.status !== 'enabled') throw new Error('Disabled bundle');
      if (!bundle.products || !Object.keys(bundle.products).length) throw new Error('Empty bundle');
      const products = await Promise.all(Object.values(bundle.products).map(async (/** @type {any} */ entry) => {
        const variants = Object.entries(entry.variants || {}).filter(([, config]) => String(/** @type {any} */ (config).was_deleted) !== '1');
        // Multi-variant bundles need the app's variant picker; never silently choose one.
        if (!entry.handle || variants.length !== 1) throw new Error('Bundle requires variant selection');
        const [id, config] = variants[0];
        const response = await fetch(`${base}products/${encodeURIComponent(entry.handle)}.js`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('Unavailable product');
        const product = await response.json();
        const variant = product.variants.find((/** @type {{id: number}} */ value) => String(value.id) === id);
        const quantity = Number(/** @type {any} */ (config).quantity || entry.quantity || 1);
        if (!variant?.available || !Number.isInteger(quantity) || quantity < 1) throw new Error('Unavailable variant');
        return { id: variant.id, quantity, title: product.title, price: variant.price };
      }));
      const original = products.reduce((total, product) => total + product.price * product.quantity, 0);
      let total = original;
      const discount = bundle.discount_type;
      if (discount === 'percentage') total = Math.round(original * (1 - Number(bundle.percentage_value) / 100));
      else if (discount === 'fixed_price' || discount === 'fixed_amount') {
        // Fixed app amounts are in shop currency, unlike locale-aware product prices.
        if (root.dataset.currency !== root.dataset.shopCurrency) throw new Error('Currency conversion required');
        const amount = Math.round(Number(discount === 'fixed_price' ? bundle.fixed_price_value : bundle.fixed_amount_value) * 100);
        total = discount === 'fixed_price' ? amount : Math.max(0, original - amount);
      } else throw new Error('Unsupported bundle discount');
      if (!Number.isFinite(total) || total < 0) throw new Error('Invalid price');
      price.replaceChildren();
      if (original > total) { const old = document.createElement('s'); old.textContent = money(original); price.append(old); }
      const current = document.createElement('span'); current.textContent = money(total); price.append(current); price.hidden = false;
      const heading = root.querySelector('[data-bundle-heading]');
      const description = root.querySelector('[data-bundle-description]');
      if (heading && bundle.name) heading.textContent = bundle.name;
      if (description) description.textContent = products.map(product => product.title).join(' + ');
      items = products.map(({id, quantity}) => ({id, quantity}));
      status.textContent = ''; button.disabled = false; loaded = true;
    } catch { fail(); loaded = true; }
    finally { loading = false; }
  }
  button.addEventListener('click', async () => {
    if (!items.length || button.disabled) return;
    button.disabled = true; button.setAttribute('aria-busy', 'true'); status.textContent = '';
    try {
      const sections = [...new Set(Array.from(document.querySelectorAll('cart-items-component')).map(el => el.getAttribute('data-section-id')).filter(Boolean))].slice(0, 5);
      const response = await fetch(`${base}cart/add.js`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({items, sections, sections_url: location.pathname}),
      });
      const result = await response.json();
      if (!response.ok || result.status) throw new Error(result.description || root.dataset.error);
      api()?.updateCartDiscounts?.();
      button.dispatchEvent(new CartAddEvent(result, root.id, { source: 'product-form-component', itemCount: items.reduce((n, item) => n + item.quantity, 0), sections: result.sections }));
      const drawer = document.querySelector('cart-drawer-component');
      if (drawer && 'open' in drawer && typeof drawer.open === 'function') drawer.open();
      else location.assign(`${base}cart`);
      status.textContent = root.dataset.added || '';
    } catch (error) { status.textContent = error instanceof Error ? error.message : root.dataset.error || ''; }
    finally { button.disabled = false; button.removeAttribute('aria-busy'); }
  });
  const onLoaded = () => { void load(); };
  document.addEventListener('bundler:loaded', onLoaded);
  const timer = setInterval(() => {
    attempts++;
    if (!root.isConnected || loaded || attempts >= 60) {
      clearInterval(timer); document.removeEventListener('bundler:loaded', onLoaded);
      if (!loaded && root.isConnected && !loading) fail();
    } else void load();
  }, 500);
  if (!api() && !document.querySelector('script[src*="cdn-bundler.nice-team.net/app/js/bundler.js"]')) {
    const script = document.createElement('script'); script.async = true;
    script.src = `https://cdn-bundler.nice-team.net/app/js/bundler.js?shop=${encodeURIComponent(root.dataset.shop || '')}`;
    document.head.append(script);
  }
  void load();
}
function init() { document.querySelectorAll('[data-bundler-banner]').forEach(root => { if (root instanceof HTMLElement) initBundleBanner(root); }); }
init();
document.addEventListener('shopify:section:load', init);
