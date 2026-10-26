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

  // UK store: pages listed in theme settings (passed only for UK visitors) are hidden from menus and cards.
  const hiddenPages = new Set((config.dataset.hiddenPages || '').split(',').map((handle) => handle.trim().toLowerCase()).filter(Boolean));

  function hide(target) {
    target.hidden = true;
    target.style.setProperty('display', 'none', 'important');
    target.setAttribute('aria-hidden', 'true');
  }

  function hidePageLinks() {
    if (!hiddenPages.size) return;
    document.querySelectorAll('a[href*="/pages/"]').forEach((anchor) => {
      if (anchor.hidden) return;
      let url;
      try { url = new URL(anchor.href, location.href); } catch { return; }
      if (!hosts.has(url.hostname)) return;
      const match = url.pathname.match(/\/pages\/([^/]+)\/?$/);
      if (!match || !hiddenPages.has(match[1].toLowerCase())) return;
      const card = anchor.closest('.r3-col');
      hide(card || anchor);
      // A rituals section whose cards are all hidden goes away entirely.
      const grid = card?.closest('.r3-grid');
      if (grid && !grid.querySelector('.r3-col:not([hidden])')) hide(grid.closest('.shopify-section') || grid);
      // Drop a desktop menu group once all of its links are hidden, so no empty heading is left.
      const group = anchor.parentElement;
      if (group?.matches('.sub-menu') && !group.querySelector('a:not([hidden])')) hide(group);
    });
  }

  function scan() {
    hidePageLinks();
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
