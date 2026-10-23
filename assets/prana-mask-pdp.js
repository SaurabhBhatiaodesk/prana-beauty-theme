import { CartAddEvent } from '@theme/events';
class PranaMaskPdp extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) { const atc = this.querySelector('#atc-' + this.dataset.sectionId); if (atc) this.observer?.observe(atc); return; }
    this.dataset.ready = 'true';
    const form = this.querySelector('form');
    const quantity = this.querySelector('input[name="quantity"]');
    const atc = this.querySelector('#atc-' + this.dataset.sectionId);
    const message = this.querySelector('[data-cart-message]');
    if (!(form instanceof HTMLFormElement) || !(quantity instanceof HTMLInputElement) || !(atc instanceof HTMLButtonElement) || !message) return;
    const format = (/** @type {number} */ amount) => new Intl.NumberFormat(document.documentElement.lang || 'en', {style:'currency',currency:this.dataset.currency || 'USD'}).format(amount / 100);
    const updatePrice = () => {
      const plan = this.querySelector('input[name="selling_plan"]:checked');
      const amount = Number(plan instanceof HTMLInputElement ? plan.dataset.pm-price : this.dataset.price);
      this.querySelectorAll('.pm-price-now').forEach(el => { el.textContent = format(amount * Number(quantity.value || 1)); });
    };
    form.addEventListener('change', updatePrice);
    quantity.addEventListener('input', updatePrice);
    this.querySelector('select[name="id"]')?.addEventListener('change', (event) => {
      if (!(event.target instanceof HTMLSelectElement)) return;
      const url = new URL(location.href); url.searchParams.set('variant',event.target.value); location.assign(url.href);
    });
    this.querySelectorAll('[data-q]').forEach(button => button.addEventListener('click', () => {
      if (button.getAttribute('data-q') === '1') quantity.stepUp(); else quantity.stepDown(); updatePrice();
    }));
    this.querySelectorAll('.pm-thumbs button').forEach(button => button.addEventListener('click', () => {
      const image = this.querySelector('.pm-gallery-main img');
      if (!(image instanceof HTMLImageElement)) return;
      image.removeAttribute('srcset'); image.src = button.getAttribute('data-src') || image.src; image.alt = button.getAttribute('data-alt') || '';
      this.querySelectorAll('.pm-thumbs button').forEach(el => el.setAttribute('aria-current',String(el===button)));
    }));
    this.querySelectorAll('a[href*="#formula-"]').forEach(link => link.addEventListener('click', () => {
      const formula = this.querySelector('details.pm-formula'); if (formula instanceof HTMLDetailsElement) formula.open = true;
    }));
    this.querySelector('input[type="range"]')?.addEventListener('input',(event)=>{
      const comparison=this.querySelector('.pm-ba'); if(comparison instanceof HTMLElement && event.target instanceof HTMLInputElement) comparison.style.setProperty('--pos',event.target.value+'%');
    });
    const sticky = this.querySelector('.pm-sticky');
    const stickyButton = this.querySelector('[data-sticky]');
    stickyButton?.addEventListener('click',()=>{ if(!atc.disabled) form.requestSubmit(atc); });
    if(sticky && 'IntersectionObserver' in window){
      this.observer = new IntersectionObserver(entries=>{const entry=entries[0];if(!entry)return;const visible=!entry.isIntersecting && entry.boundingClientRect.top<0;sticky.classList.toggle('pm-show',visible);sticky.setAttribute('aria-hidden',String(!visible));if(stickyButton instanceof HTMLButtonElement)stickyButton.tabIndex=visible?0:-1;});
      this.observer.observe(atc);
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); if(atc.disabled || !form.reportValidity())return;
      atc.disabled=true; if(stickyButton instanceof HTMLButtonElement)stickyButton.disabled=true;
      atc.setAttribute('aria-busy','true'); message.textContent='';
      try {
        const data=new FormData(form); if(!data.get('selling_plan'))data.delete('selling_plan');
        const sections=[...new Set(Array.from(document.querySelectorAll('cart-items-component')).map(el=>el.getAttribute('data-section-id')).filter(Boolean))].slice(0,5);
        data.set('sections',sections.join(','));data.set('sections_url',location.pathname);
        const response=await fetch(Theme.routes.cart_add_url,{method:'POST',headers:{Accept:'application/json'},body:data});
        const result=await response.json();if(!response.ok || result.status)throw new Error(result.description || this.dataset.error);
        atc.dispatchEvent(new CartAddEvent(result,form.id,{source:'product-form-component',itemCount:Number(quantity.value),sections:result.sections}));
        const drawer=document.querySelector('cart-drawer-component');
        if(drawer && 'open' in drawer && typeof drawer.open==='function')drawer.open(); else location.assign(Theme.routes.cart_url);
        message.textContent=this.dataset.added || '';
      } catch(error) {message.textContent=error instanceof Error ? error.message : this.dataset.error || '';}
      finally {atc.disabled=false;atc.removeAttribute('aria-busy');if(stickyButton instanceof HTMLButtonElement)stickyButton.disabled=false;}
    });
    updatePrice();
  }
  disconnectedCallback(){this.observer?.disconnect();}
}
if(!customElements.get('prana-mask-pdp'))customElements.define('prana-mask-pdp',PranaMaskPdp);
