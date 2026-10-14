class PranaRitualQuiz extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized) return;
    this.dataset.initialized = 'true';
    this.load();
  }
  /** @param {string} tag @param {string} className @param {string} text */
  element(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }
  /** @param {string} text @param {() => void} action */
  button(text, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fyr-quiz-opt';
    button.textContent = text;
    button.addEventListener('click', action);
    return button;
  }
  /** @param {string} text */
  status(text) {
    const status = this.element('p', 'fyr-quiz-step-label', text);
    status.setAttribute('role', 'status');
    this.replaceChildren(status);
  }
  /** @param {string} path */
  endpoint(path) {
    const url = new URL(path, location.origin);
    if (url.origin !== location.origin || !url.pathname.includes('/apps/')) throw new Error('Invalid quiz URL');
    return url;
  }
  async load() {
    this.status(this.dataset.loading || '');
    try {
      const url = this.endpoint(this.dataset.apiUrl || '');
      const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
      const quiz = await response.json();
      if (!response.ok || quiz.error) throw new Error('Quiz unavailable');
      this.quiz = quiz;
      this.code = url.searchParams.get('code') || quiz.handle;
      this.path = quiz.singleFlow || 'quick';
      this.questions = quiz[this.path];
      if (!Array.isArray(this.questions) || !this.questions.length) throw new Error('No questions');
      this.answers = [];
      this.question();
    } catch {
      this.status(this.dataset.error || '');
      this.append(this.button(this.dataset.retry || '', () => this.load()));
    }
  }
  question() {
    const index = this.answers.length;
    const question = this.questions[index];
    if (!question) { this.emailStep(); return; }
    const title = this.element('h4', 'fyr-quiz-q', question.text);
    title.tabIndex = -1;
    const options = this.element('div', 'fyr-quiz-opts', '');
    question.options.forEach((/** @type {{label: string}} */ option, /** @type {number} */ optionIndex) => {
      options.append(this.button(option.label, () => { this.answers.push(optionIndex); this.question(); }));
    });
    this.replaceChildren(this.element('p', 'fyr-quiz-step-label', (this.dataset.progress || '').replace('[current]', String(index + 1)).replace('[total]', String(this.questions.length))), title, options);
    if (index) title.focus();
  }
  emailStep() {
    const config = this.quiz.emailCapture;
    if (!config?.enabled) { this.score(); return; }
    const form = document.createElement('form');
    const title = this.element('h4', 'fyr-quiz-q', config.heading || '');
    const input = document.createElement('input');
    input.type = 'email';
    input.name = 'email';
    input.autocomplete = 'email';
    input.required = true;
    input.placeholder = this.dataset.emailPlaceholder || '';
    input.setAttribute('aria-label', this.dataset.emailPlaceholder || 'Email');
    input.className = 'fyr-email-input';
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'fyr-result-cta';
    submit.textContent = config.button || '';
    form.append(title, input, submit);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (form.reportValidity()) this.score(input.value.trim());
    });
    this.replaceChildren(form);
    if (config.allowSkip) this.append(this.button(this.dataset.skip || 'Skip', () => this.score()));
    input.focus();
  }
  /** @param {string} [email] */
  async score(email) {
    this.status(this.dataset.loading || '');
    try {
      const response = await fetch(this.endpoint(this.quiz.endpoints.result), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code: this.code, path: this.path, answers: this.answers, ...(email ? { email } : {}) }),
        signal: AbortSignal.timeout(20000),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok || !payload.result) throw new Error('Result unavailable');
      const result = payload.result;
      this.replaceChildren(this.element('h4', 'fyr-result-name', result.profile?.name || ''), this.element('p', 'fyr-result-desc', result.profile?.essence || result.profile?.sub || result.insight || ''));
      if (!result.products?.length) this.append(this.element('p', 'fyr-result-desc', this.dataset.empty || ''));
      for (const product of result.products || []) {
        const title = product.title || product.name || '';
        const path = product.url || (product.handle ? `/products/${product.handle}` : '');
        if (!path) { this.append(this.element('p', 'fyr-result-desc', title)); continue; }
        const url = new URL(path, location.origin);
        if (!['https:', 'http:'].includes(url.protocol)) continue;
        const link = document.createElement('a');
        link.className = 'fyr-result-cta';
        link.href = url.href;
        link.textContent = title;
        this.append(link);
      }
      this.append(this.button(this.dataset.restart || 'Retake Quiz', () => { this.answers = []; this.question(); }));
    } catch {
      this.status(this.dataset.error || '');
      this.append(this.button(this.dataset.retry || '', () => this.score(email)));
    }
  }
}
if (!customElements.get('prana-ritual-quiz')) customElements.define('prana-ritual-quiz', PranaRitualQuiz);
