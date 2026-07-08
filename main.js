/* SCHMATEC GmbH · Site scripts */
(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('is-open'));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        const isInt = Number.isInteger(target);
        function tick(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const value = target * eased;
          el.textContent = (isInt ? Math.round(value) : value.toFixed(1)).toString() + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterIO.observe(c));
  }

  /* ---------- Contact wizard ---------- */
  const wizard = document.querySelector('[data-wizard]');
  if (wizard) initWizard(wizard);

  function initWizard(root) {
    const steps = Array.from(root.querySelectorAll('.wizard__step'));
    const progress = Array.from(root.querySelectorAll('.wizard__progress span'));
    const success = root.querySelector('.wizard__success');
    const form = root.querySelector('form');
    const prevBtn = root.querySelector('[data-wizard-prev]');
    const nextBtn = root.querySelector('[data-wizard-next]');
    const submitBtn = root.querySelector('[data-wizard-submit]');
    let current = 0;

    function show(i) {
      steps.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
      progress.forEach((p, idx) => p.classList.toggle('is-active', idx <= i));
      prevBtn.disabled = i === 0;
      const isLast = i === steps.length - 1;
      nextBtn.style.display = isLast ? 'none' : 'inline-flex';
      submitBtn.style.display = isLast ? 'inline-flex' : 'none';
      current = i;
      // Focus first input/choice for accessibility
      const firstField = steps[i].querySelector('input, textarea, select');
      if (firstField) setTimeout(() => firstField.focus({ preventScroll: true }), 350);
    }

    function validateStep(i) {
      const step = steps[i];
      // For radio groups: require at least one checked when group has data-required
      const radioGroups = step.querySelectorAll('[data-radio-group]');
      for (const group of radioGroups) {
        const name = group.dataset.radioGroup;
        if (!step.querySelector(`input[name="${name}"]:checked`)) {
          alert('Bitte eine Auswahl treffen.');
          return false;
        }
      }
      // Required inputs
      const required = step.querySelectorAll('[required]');
      for (const el of required) {
        if (!el.value.trim()) {
          el.focus();
          el.style.borderColor = 'var(--alert)';
          return false;
        }
        el.style.borderColor = '';
      }
      return true;
    }

    nextBtn.addEventListener('click', () => {
      if (!validateStep(current)) return;
      if (current < steps.length - 1) show(current + 1);
    });
    prevBtn.addEventListener('click', () => {
      if (current > 0) show(current - 1);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateStep(current)) return;
      const data = new FormData(form);
      const accessKey = form.dataset.web3formsKey;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';

      let sent = false;
      if (accessKey && accessKey !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
        data.append('access_key', accessKey);
        data.append('subject', 'Neue Anfrage über schmatec.de');
        data.append('from_name', 'Schmatec Website');
        try {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: data
          });
          if (res.ok) sent = true;
        } catch (_) { /* fallthrough to mailto */ }
      }

      if (!sent) {
        // mailto fallback
        const body = [];
        for (const [k, v] of data.entries()) {
          body.push(`${k}: ${v}`);
        }
        const subject = encodeURIComponent('Anfrage über schmatec.de');
        const mailBody = encodeURIComponent(body.join('\n'));
        window.location.href = `mailto:info@schmatec.de?subject=${subject}&body=${mailBody}`;
      }

      // Show success state either way (mailto opens client, web3forms succeeded)
      steps.forEach(s => s.classList.remove('is-active'));
      progress.forEach(p => p.classList.add('is-active'));
      success.classList.add('is-visible');
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'none';
    });

    show(0);
  }

  /* ---------- Product search (filters <details> in list) ---------- */
  const psInput = document.querySelector('[data-product-search]');
  const psList = document.querySelector('[data-product-search-list]');
  const psClear = document.querySelector('[data-product-search-clear]');
  const psStatus = document.querySelector('[data-product-search-status]');
  if (psInput && psList) {
    const items = Array.from(psList.querySelectorAll('details'));
    const norm = (s) => s.toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss');
    const data = items.map(d => ({
      el: d,
      text: norm(d.textContent || '')
    }));
    function apply() {
      const q = norm(psInput.value.trim());
      let visible = 0;
      data.forEach(({ el, text }) => {
        const match = q.length === 0 || text.includes(q);
        el.hidden = !match;
        if (match) visible++;
        // Auto-open on search to show context
        if (q.length > 1 && match) el.open = true;
        if (q.length === 0) el.open = false;
      });
      psClear.hidden = q.length === 0;
      if (q.length === 0) psStatus.textContent = '';
      else if (visible === 0) psStatus.textContent = `Keine Treffer für „${psInput.value.trim()}". Sprechen Sie uns gerne direkt an.`;
      else if (visible === 1) psStatus.textContent = `1 Treffer für „${psInput.value.trim()}".`;
      else psStatus.textContent = `${visible} Treffer für „${psInput.value.trim()}".`;
    }
    psInput.addEventListener('input', apply);
    psClear.addEventListener('click', () => { psInput.value = ''; apply(); psInput.focus(); });
    // Restore initial first-opened state after registering listener
    // Read ?q=... from URL so links from nav can prefill
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) { psInput.value = q; apply(); }
  }

  /* ---------- Active nav state ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });
})();
