import { CartAddEvent } from '@theme/events';

// Keep sticky purchases on the same cart update path as the theme product form.
document.addEventListener('click', async (event) => {
  const button = event.target.closest?.('.hp-sticky-atc');
  if (!button || button.disabled) return;
  event.preventDefault();
  const message = document.getElementById('PranaStickyCartError');
  const label = button.textContent;
  const component = document.querySelector(
    `#MainContent product-form-component[data-product-id="${button.dataset.productId}"]`
  );
  const form = component?.querySelector('form');
  if (form && !form.reportValidity()) return;
  const data = form ? new FormData(form) : new FormData();
  if (!data.get('id')) data.set('id', button.dataset.variantId);
  if (!data.get('quantity')) data.set('quantity', '1');
  const sections = [...new Set(Array.from(document.querySelectorAll('cart-items-component'))
    .map((element) => element.dataset.sectionId).filter(Boolean))].slice(0, 5);
  data.set('sections', sections.join(','));
  data.set('sections_url', window.location.pathname);
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = button.dataset.addingText;
  if (message) { message.hidden = true; message.textContent = ''; }
  try {
    const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
      method: 'POST', headers: { Accept: 'application/json' }, body: data,
    });
    const result = await response.json();
    if (!response.ok || result.status) {
      throw new Error(result.description || result.message || button.dataset.errorText);
    }
    button.dispatchEvent(new CartAddEvent(result, button.id, {
      source: 'product-form-component',
      itemCount: Number(data.get('quantity')),
      sections: result.sections,
    }));
    const drawer = document.querySelector('cart-drawer-component');
    if (drawer) {
      await customElements.whenDefined('cart-drawer-component');
      drawer.open();
    } else {
      window.location.assign(`${window.Shopify.routes.root}cart`);
    }
  } catch (error) {
    if (message) {
      message.textContent = error.message || button.dataset.errorText;
      message.hidden = false;
    }
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.textContent = label;
  }
});
