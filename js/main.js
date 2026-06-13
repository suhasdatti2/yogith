/* =================================================================
   NOVORA — interaction layer
   Smooth scroll · reveals · parallax · sticky steps · counters ·
   comparison slider · custom cursor · magnetic buttons
   ================================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const lerp = (a, b, n) => (1 - n) * a + n * b;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* ---------------------------------------------------------------
     PRELOADER
  --------------------------------------------------------------- */
  document.documentElement.classList.add('is-loading');
  window.addEventListener('load', () => {
    setTimeout(() => {
      const pre = $('#preloader');
      if (pre) pre.classList.add('is-done');
      document.documentElement.classList.remove('is-loading');
      revealNow();
    }, reduceMotion ? 0 : 600);
  });
  // safety: never leave the page locked
  setTimeout(() => document.documentElement.classList.remove('is-loading'), 2600);

  /* ---------------------------------------------------------------
     THEME TOGGLE
  --------------------------------------------------------------- */
  const themeMeta = $('meta[name="theme-color"]');
  const root = document.documentElement;
  const stored = localStorage.getItem('novora-theme');
  if (stored) root.setAttribute('data-theme', stored);
  const applyMeta = () => {
    if (themeMeta) themeMeta.setAttribute('content', root.getAttribute('data-theme') === 'light' ? '#F4F6FB' : '#0A0B0F');
  };
  applyMeta();
  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('novora-theme', next);
    applyMeta();
  });

  /* ---------------------------------------------------------------
     YEAR
  --------------------------------------------------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     MOBILE MENU
  --------------------------------------------------------------- */
  const burger = $('#navBurger');
  const navLinks = $('#navLinks');
  const toggleMenu = (open) => {
    const isOpen = open ?? !navLinks.classList.contains('is-open');
    navLinks.classList.toggle('is-open', isOpen);
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => toggleMenu());

  /* ---------------------------------------------------------------
     SMOOTH ANCHOR SCROLL (eased, nav-offset aware)
  --------------------------------------------------------------- */
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function smoothScrollTo(targetY, duration = 900) {
    if (reduceMotion) { window.scrollTo(0, targetY); return; }
    const startY = window.scrollY;
    const diff = targetY - startY;
    let start;
    const step = (ts) => {
      if (start === undefined) start = ts;
      const p = clamp((ts - start) / duration, 0, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (navLinks.classList.contains('is-open')) toggleMenu(false);
      const y = target.getBoundingClientRect().top + window.scrollY - 74;
      smoothScrollTo(y);
    });
  });

  /* ---------------------------------------------------------------
     SPLIT TEXT (word-by-word reveal) — preserves inline elements
  --------------------------------------------------------------- */
  function splitText(el) {
    const nodes = [...el.childNodes];
    el.innerHTML = '';
    let wi = 0;
    nodes.forEach((node) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((token) => {
          if (token.trim() === '') { el.appendChild(document.createTextNode(token)); return; }
          el.appendChild(makeWord(token, wi++));
        });
      } else if (node.nodeType === 1) {
        const w = document.createElement('span');
        w.className = 'word';
        const inner = document.createElement('span');
        inner.style.setProperty('--wi', wi++);
        node.classList.add('split-child');
        inner.appendChild(node);
        w.appendChild(inner);
        el.appendChild(w);
      }
    });
  }
  function makeWord(text, i) {
    const w = document.createElement('span');
    w.className = 'word';
    const inner = document.createElement('span');
    inner.style.setProperty('--wi', i);
    inner.textContent = text;
    w.appendChild(inner);
    return w;
  }
  const splitEls = $$('[data-split]');
  if (!reduceMotion) splitEls.forEach(splitText);

  /* ---------------------------------------------------------------
     SCROLL REVEALS (IntersectionObserver) + stagger
  --------------------------------------------------------------- */
  // assign stagger delays
  const staggerGroups = new Map();
  $$('[data-stagger]').forEach((el) => {
    const parent = el.parentElement;
    const idx = staggerGroups.get(parent) ?? 0;
    el.style.setProperty('--rd', `${idx * 90}ms`);
    staggerGroups.set(parent, idx + 1);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  const ioSplit = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        ioSplit.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  $$('[data-reveal]').forEach((el) => io.observe(el));
  splitEls.forEach((el) => ioSplit.observe(el));

  function revealNow() {
    // ensure above-the-fold content is shown right after preloader
    $$('[data-reveal]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add('is-visible');
    });
    splitEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add('is-revealed');
    });
  }
  if (reduceMotion) {
    $$('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
    splitEls.forEach((el) => el.classList.add('is-revealed'));
  }

  /* ---------------------------------------------------------------
     COUNT-UP NUMBERS
  --------------------------------------------------------------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1700;
    let start;
    const fmt = (v) => prefix + v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const step = (ts) => {
      if (start === undefined) start = ts;
      const p = clamp((ts - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target);
    };
    requestAnimationFrame(step);
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); countIO.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------------------------------------------------------------
     NAVBAR scroll state + scroll progress + scroll-spy
  --------------------------------------------------------------- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');
  const spyLinks = $$('[data-navlink]');
  const spySections = spyLinks.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  function onScrollUI() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${clamp((y / docH) * 100, 0, 100)}%`;

    // scroll-spy
    let activeIdx = -1;
    const line = y + window.innerHeight * 0.32;
    spySections.forEach((sec, i) => { if (sec.offsetTop <= line) activeIdx = i; });
    spyLinks.forEach((l, i) => l.classList.toggle('is-active', i === activeIdx));
  }

  /* ---------------------------------------------------------------
     HOW-IT-WORKS sticky step sync
  --------------------------------------------------------------- */
  const howSticky = $('.how__sticky');
  const steps = $$('.step');
  const stages = $$('.how-stage');
  const howProgress = $('#howProgress');

  function updateHow() {
    if (!howSticky || !steps.length) return;
    // active step = the one whose center is closest to viewport center
    const mid = window.innerHeight / 2;
    let idx = 0, best = Infinity;
    steps.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < best) { best = d; idx = i; }
    });
    // progress bar tracks overall scroll through the pinned section
    const rect = howSticky.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const p = clamp(-rect.top / Math.max(total, 1), 0, 1);
    if (howProgress) howProgress.style.height = `${p * 100}%`;
    steps.forEach((s, i) => s.classList.toggle('is-current', i === idx));
    stages.forEach((s, i) => s.classList.toggle('is-active', i === idx));
  }

  /* ---------------------------------------------------------------
     PARALLAX (uses individual `translate` property to avoid
     clobbering elements that already use `transform`)
  --------------------------------------------------------------- */
  const parallaxEls = reduceMotion ? [] : $$('[data-parallax]').map((el) => ({
    el, speed: parseFloat(el.dataset.parallax) || 0, cur: 0,
  }));

  function updateParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach((p) => {
      const r = p.el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const target = (center - vh / 2) * p.speed;
      p.cur = lerp(p.cur, target, 0.12);
      if (Math.abs(p.cur - target) < 0.05) p.cur = target;
      p.el.style.translate = `0 ${p.cur.toFixed(2)}px`;
    });
  }

  /* ---------------------------------------------------------------
     rAF LOOP
  --------------------------------------------------------------- */
  let ticking = false;
  function frame() {
    onScrollUI();
    updateHow();
    updateParallax();
    ticking = false;
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', () => { requestTick(); sizeBA(); });
  // continuous loop for lerped parallax smoothness
  if (!reduceMotion) {
    (function loop() { updateParallax(); requestAnimationFrame(loop); })();
  }
  onScrollUI();
  updateHow();

  /* ---------------------------------------------------------------
     BEFORE / AFTER COMPARISON SLIDER
  --------------------------------------------------------------- */
  const ba = $('#baSlider');
  const baBefore = $('#baBefore');
  const baHandle = $('#baHandle');
  function sizeBA() { if (ba) ba.style.setProperty('--ba-w', `${ba.clientWidth}px`); }
  if (ba) {
    sizeBA();
    let dragging = false;
    const setPos = (clientX) => {
      const rect = ba.getBoundingClientRect();
      const pct = clamp(((clientX - rect.left) / rect.width) * 100, 4, 96);
      baBefore.style.width = `${pct}%`;
      baHandle.style.left = `${pct}%`;
      baHandle.setAttribute('aria-valuenow', Math.round(pct));
    };
    const start = (e) => { dragging = true; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    const move = (e) => { if (!dragging) return; setPos(e.touches ? e.touches[0].clientX : e.clientX); };
    const end = () => { dragging = false; };
    ba.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseup', end);
    ba.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end);
    baHandle.addEventListener('keydown', (e) => {
      const cur = parseFloat(baHandle.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') { e.preventDefault(); set(cur - 4); }
      if (e.key === 'ArrowRight') { e.preventDefault(); set(cur + 4); }
      function set(v) { v = clamp(v, 4, 96); baBefore.style.width = `${v}%`; baHandle.style.left = `${v}%`; baHandle.setAttribute('aria-valuenow', Math.round(v)); }
    });
  }

  /* ---------------------------------------------------------------
     CARD GLOW follow (benefits)
  --------------------------------------------------------------- */
  if (!isTouch) {
    $$('.benefit').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------------------------------------------------------------
     MAGNETIC BUTTONS
  --------------------------------------------------------------- */
  if (!isTouch && !reduceMotion) {
    $$('.magnetic').forEach((el) => {
      const strength = 0.28;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.setProperty('--bx', `${x}px`);
        el.style.setProperty('--by', `${y}px`);
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--bx', '0px');
        el.style.setProperty('--by', '0px');
      });
    });
  }

  /* ---------------------------------------------------------------
     CUSTOM CURSOR
  --------------------------------------------------------------- */
  if (!isTouch) {
    const cursor = $('#cursor');
    const dot = $('#cursorDot');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;
    const labels = { cta: 'Get', view: 'Play', hover: '' };

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      cursor.classList.remove('is-hidden');
      dot.classList.remove('is-hidden');
    });
    document.addEventListener('mouseleave', () => { cursor.classList.add('is-hidden'); dot.classList.add('is-hidden'); });

    (function ring() {
      cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2);
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(ring);
    })();

    $$('[data-cursor], a, button, .magnetic, summary').forEach((el) => {
      const type = el.getAttribute('data-cursor');
      el.addEventListener('mouseenter', () => {
        if (type === 'cta') { cursor.classList.add('is-cta'); cursor.dataset.label = labels.cta; }
        else if (type === 'view') { cursor.classList.add('is-cta'); cursor.dataset.label = labels.view; }
        else { cursor.classList.add('is-hover'); }
      });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hover', 'is-cta'); cursor.dataset.label = ''; });
    });
  }

  /* ---------------------------------------------------------------
     SCARCITY — gently tick spots over the session (visual only)
  --------------------------------------------------------------- */
  const spotsEl = $('#spots');
  if (spotsEl) {
    let spots = parseInt(spotsEl.textContent, 10);
    setInterval(() => {
      if (spots > 3 && Math.random() > 0.6) { spots -= 1; spotsEl.textContent = spots; }
    }, 45000);
  }
})();
