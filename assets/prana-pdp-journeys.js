class PranaPdpJourneys extends HTMLElement {
  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    const tabs = Array.from(this.querySelectorAll('[role="tab"]'));
    const activate = (tab) => {
      tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
      this.querySelectorAll('[role="tabpanel"]').forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab), options);
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault(); activate(tabs[next]); tabs[next].focus();
      }, options);
    });
    this.querySelectorAll('input[type="range"]').forEach(range => range.addEventListener('input', () => {
      range.closest('.ba')?.style.setProperty('--pos', range.value + '%');
    }, options));
    this.addEventListener('shopify:block:select', event => {
      const panel = event.target.closest('[role="tabpanel"]');
      const tab = tabs.find(item => item.getAttribute('aria-controls') === panel?.id);
      if (tab) activate(tab);
    }, options);
  }
  disconnectedCallback() { this.controller?.abort(); }
}
if (!customElements.get('prana-pdp-journeys')) customElements.define('prana-pdp-journeys', PranaPdpJourneys);
