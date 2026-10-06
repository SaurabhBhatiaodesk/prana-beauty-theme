(() => {
  const config = document.querySelector('[data-prana-market-check]');
  if (!config) return;
  const hosts = new Set([location.hostname, config.dataset.storeDomain, config.dataset.storePermanentDomain]);
  const checks = new Map();
  const seen = new WeakSet();
  const queue = [];
  let active = 0;

  function check(handle) {
    if (!checks.has(handle)) {
      checks.set(handle, new Promise((resolve) => {
        queue.push({ handle, resolve });
        drain();
      }));
    }
    return checks.get(handle);
  }

  function drain() {
    while (active < 4 && queue.length) {
      const { handle, resolve } = queue.shift();
      active++;
      const root = window.Shopify?.routes?.root || '/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      fetch(`${root}products/${encodeURIComponent(handle)}.js`, {
        credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: { Accept: 'application/json' }
      }).then((response) => resolve(response.status === 404 || response.status === 410))
        .catch(() => resolve(false))
        .finally(() => { clearTimeout(timeout); active--; drain(); });
    }
  }

  function scan() {
    document.querySelectorAll('a[href*="/products/"]').forEach((anchor) => {
      if (seen.has(anchor) || anchor.closest('cart-drawer-component, cart-items-component')) return;
      let url;
      try { url = new URL(anchor.href, location.href); } catch { return; }
      if (!hosts.has(url.hostname)) return;
      const match = url.pathname.match(/\/products\/([^/]+)\/?$/);
      if (!match) return;
      let handle;
      try { handle = decodeURIComponent(match[1]); } catch { return; }
      seen.add(anchor);
      check(handle).then((unavailable) => {
        if (!unavailable || !anchor.isConnected) return;
        const card = anchor.closest('product-card, .product-card, .pcaro-card, .prana-ugc__product');
        let target = card || anchor;
        if (card && card.matches('.pcaro-card, product-card, .product-card')) {
          target = card.closest('.swiper-slide, .product-grid__item') || card;
        }
        target.hidden = true;
        target.style.setProperty('display', 'none', 'important');
        target.setAttribute('aria-hidden', 'true');
        const slider = target.closest('.swiper');
        if (slider?.swiper) slider.swiper.update();
      });
    });
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; scan(); });
  });
  scan();
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('shopify:section:load', scan);
})();
