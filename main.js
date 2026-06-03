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

  /* ---------- Floating Chat (FAQ-Assistent) ---------- */
  const chatLauncher = document.querySelector('[data-chat-launcher]');
  const chatPanel = document.querySelector('[data-chat-panel]');
  const chatBackdrop = document.querySelector('[data-chat-backdrop]');
  const chatClose = document.querySelector('[data-chat-close]');
  const chatBody = document.querySelector('[data-chat-body]');
  let chatLoaded = false;

  function openChat() {
    if (!chatPanel) return;
    if (!chatLoaded) {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.thinkupai.de/automatisierungen/schmatec_iframe';
      iframe.title = 'FAQ-Assistent';
      iframe.setAttribute('allow', 'clipboard-write');
      iframe.addEventListener('load', () => {
        const loader = chatBody.querySelector('.chat-panel__loading');
        if (loader) loader.classList.add('is-hidden');
      });
      chatBody.appendChild(iframe);
      chatLoaded = true;
    }
    chatPanel.classList.add('is-open');
    chatBackdrop.classList.add('is-open');
    chatLauncher.hidden = true;
    chatPanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeChat() {
    if (!chatPanel) return;
    chatPanel.classList.remove('is-open');
    chatBackdrop.classList.remove('is-open');
    chatLauncher.hidden = false;
    chatPanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (chatLauncher) chatLauncher.addEventListener('click', openChat);
  if (chatClose)    chatClose.addEventListener('click', closeChat);
  if (chatBackdrop) chatBackdrop.addEventListener('click', closeChat);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatPanel && chatPanel.classList.contains('is-open')) closeChat();
  });

  /* ---------- Active nav state ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });
})();
