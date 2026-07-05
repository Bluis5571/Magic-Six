/* ==========================================================================
   MAGIC SIX TECHNICAL SERVICES FZC — script.js
   Phase 4 · Loader, header/nav, mobile menu, theme toggle, AOS, GSAP
   (counters + timeline), Swiper, project filter (FLIP), before/after slider,
   hero hex-lattice, scroll widgets, contact form, footer year.

   Every init function bails out quietly if its element(s) are missing so a
   partial page (or a future edit to index.html) never throws.
   ========================================================================== */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ------------------------------------------------------------------
     Loader — hide once the window (incl. images) has fully loaded
     ------------------------------------------------------------------ */
  function initLoader() {
    const loader = $('#loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      loader.classList.add('is-hidden');
    });
    // Safety net: never let a slow/failed asset block the page forever.
    window.setTimeout(() => loader.classList.add('is-hidden'), 4000);
  }

  /* ------------------------------------------------------------------
     Header scroll state + active nav link
     ------------------------------------------------------------------ */
  function initHeaderScroll() {
    const header = $('#header');
    if (header) {
      const SCROLLED_AT = 40;
      let ticking = false;
      const update = () => {
        header.classList.toggle('is-scrolled', window.scrollY > SCROLLED_AT);
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });
      update();
    }

    const navLinks = $$('.nav__link');
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    const linksById = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute('href');
      if (id && id.startsWith('#')) linksById.set(id.slice(1), link);
    });

    const sections = Array.from(linksById.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeLink = linksById.get(entry.target.id);
        if (!activeLink) return;
        navLinks.forEach((l) => l.classList.remove('is-active'));
        activeLink.classList.add('is-active');
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------
     Mobile off-canvas menu
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    const burger = $('#navBurger');
    const menu = $('#mobileMenu');
    const backdrop = $('#mobileBackdrop');
    if (!burger || !menu || !backdrop) return;

    const open = () => {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      backdrop.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      backdrop.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    };

    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        close();
        burger.focus();
      }
    });
    $$('a', menu).forEach((link) => link.addEventListener('click', close));
  }

  /* ------------------------------------------------------------------
     Dark mode toggle (persisted in localStorage; falls back gracefully
     if storage is unavailable — core toggle still works for the session)
     ------------------------------------------------------------------ */
  function initThemeToggle() {
    const toggle = $('#themeToggle');
    const root = document.documentElement;
    if (!toggle) return;

    const STORAGE_KEY = 'magicsix-theme';
    const icon = $('i', toggle);

    const applyTheme = (theme) => {
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      if (icon) {
        icon.classList.toggle('fa-moon', theme !== 'dark');
        icon.classList.toggle('fa-sun', theme === 'dark');
      }
    };

    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      /* storage disabled (private mode / policy) — theme just won't persist */
    }
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
    }

    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (err) {
        /* ignore — non-critical */
      }
    });
  }

  /* ------------------------------------------------------------------
     AOS (scroll reveals)
     ------------------------------------------------------------------ */
  function initAOS() {
    if (!window.AOS) return;
    window.AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: () => prefersReducedMotion,
    });
  }

  /* ------------------------------------------------------------------
     GSAP: stat counters count-up on scroll into view
     ------------------------------------------------------------------ */
  function initCounters() {
    const counters = $$('.counter[data-count]');
    if (!counters.length) return;

    if (!window.gsap) {
      counters.forEach((el) => { el.textContent = el.dataset.count; });
      return;
    }
    if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

    counters.forEach((el) => {
      const target = parseFloat(el.dataset.count) || 0;
      if (prefersReducedMotion || !window.ScrollTrigger) {
        el.textContent = target;
        return;
      }
      const counterState = { value: 0 };
      window.gsap.to(counterState, {
        value: target,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = Math.round(counterState.value); },
      });
    });
  }

  /* ------------------------------------------------------------------
     GSAP: process timeline connecting-line draw
     (CSS reads the --line-progress custom property as a scaleX())
     ------------------------------------------------------------------ */
  function initTimelineLine() {
    const timeline = $('#timeline');
    if (!timeline) return;

    if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
      timeline.style.setProperty('--line-progress', 1);
      return;
    }
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.to(timeline, {
      '--line-progress': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: timeline,
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 0.6,
      },
    });
  }

  /* ------------------------------------------------------------------
     Swiper testimonials
     ------------------------------------------------------------------ */
  function initTestimonialsSwiper() {
    const el = $('.testimonials__swiper');
    if (!el || !window.Swiper) return;
    new window.Swiper(el, {
      loop: true,
      autoHeight: true,
      spaceBetween: 24,
      grabCursor: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      a11y: { enabled: true },
      speed: prefersReducedMotion ? 0 : 500,
      autoplay: prefersReducedMotion ? false : { delay: 6000, disableOnInteraction: true },
    });
  }

  /* ------------------------------------------------------------------
     Project filter with FLIP-style reposition animation
     ------------------------------------------------------------------ */
  function initProjectFilter() {
    const grid = $('#projectsGrid');
    const buttons = $$('.filter__btn');
    if (!grid || !buttons.length) return;
    const tiles = $$('.project-tile', grid);

    const setFilter = (category) => {
      const first = new Map(tiles.map((t) => [t, t.getBoundingClientRect()]));

      tiles.forEach((t) => {
        const match = category === 'all' || t.dataset.category === category;
        const wasHidden = t.classList.contains('is-hidden');
        t.classList.toggle('is-hidden', !match);
        t.dataset.justShown = match && wasHidden ? 'true' : '';
      });

      if (prefersReducedMotion) return;

      tiles.forEach((t) => {
        if (t.classList.contains('is-hidden')) return;
        const last = t.getBoundingClientRect();

        if (t.dataset.justShown === 'true') {
          if (window.gsap) {
            window.gsap.from(t, { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out' });
          }
          return;
        }

        const prev = first.get(t);
        if (!prev) return;
        const dx = prev.left - last.left;
        const dy = prev.top - last.top;
        if (!dx && !dy) return;

        if (window.gsap) {
          window.gsap.fromTo(t, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.45, ease: 'power2.out' });
        } else {
          t.style.transform = `translate(${dx}px, ${dy}px)`;
          t.style.transition = 'transform 0s';
          requestAnimationFrame(() => {
            t.style.transition = 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)';
            t.style.transform = '';
          });
        }
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        setFilter(btn.dataset.filter || 'all');
      });
    });
  }

  /* ------------------------------------------------------------------
     Before / after slider — pointer drag via native range input,
     keyboard accessible for free (range input arrow keys)
     ------------------------------------------------------------------ */
  function initBeforeAfterSlider() {
    const slider = $('#baSlider');
    const range = $('#baRange');
    if (!slider || !range) return;

    const update = () => {
      const pos = `${range.value}%`;
      slider.style.setProperty('--ba-pos', pos);
      slider.style.setProperty('--ba-slider-width', `${slider.getBoundingClientRect().width}px`);
    };

    range.addEventListener('input', update);
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------
     Hero hex-lattice SVG generation (GPU-cheap opacity drift)
     ------------------------------------------------------------------ */
  function buildHexField() {
    const svg = $('#hexField');
    if (!svg) return;

    const NS = 'http://www.w3.org/2000/svg';
    const r = 34;
    const cols = 16;
    const rows = 10;
    const stepX = r * 1.75;
    const stepY = r * 1.6;
    const width = cols * stepX + r;
    const height = rows * stepY + r;

    svg.setAttribute('viewBox', `0 0 ${Math.round(width)} ${Math.round(height)}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    const hexPoints = (cx, cy) => {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
      }
      return pts.join(' ');
    };

    const frag = document.createDocumentFragment();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * stepX + (row % 2 ? stepX / 2 : 0) + r;
        const cy = row * stepY + r;
        const poly = document.createElementNS(NS, 'polygon');
        poly.setAttribute('points', hexPoints(cx, cy));
        poly.setAttribute('fill', 'none');
        poly.setAttribute('stroke', 'rgba(200, 168, 93, 0.4)');
        poly.setAttribute('stroke-width', '1');
        const baseOpacity = 0.12 + Math.random() * 0.3;
        poly.style.opacity = baseOpacity.toFixed(2);
        frag.appendChild(poly);

        if (!prefersReducedMotion && poly.animate) {
          poly.animate(
            [
              { opacity: baseOpacity },
              { opacity: 0.04 },
              { opacity: baseOpacity },
            ],
            {
              duration: 4000 + Math.random() * 4000,
              delay: Math.random() * 3000,
              iterations: Infinity,
              easing: 'ease-in-out',
            }
          );
        }
      }
    }
    svg.appendChild(frag);
  }

  /* ------------------------------------------------------------------
     Back-to-top + sticky contact — appear after 600px scroll
     ------------------------------------------------------------------ */
  function initScrollWidgets() {
    const backTop = $('#backTop');
    const stickyContact = $('#stickyContact');
    if (!backTop && !stickyContact) return;

    const THRESHOLD = 600;
    let ticking = false;

    const show = (el) => {
      if (!el) return;
      if (el.hidden) el.hidden = false;
      requestAnimationFrame(() => el.classList.add('is-visible'));
    };
    const hide = (el) => {
      if (!el) return;
      el.classList.remove('is-visible');
      el.hidden = true;
    };

    const update = () => {
      const past = window.scrollY > THRESHOLD;
      [backTop, stickyContact].forEach((el) => (past ? show(el) : hide(el)));
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    backTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    update();
  }

  /* ------------------------------------------------------------------
     Contact form — inline validation, #formStatus live region
     ------------------------------------------------------------------ */
  function initContactForm() {
    const form = $('#contactForm');
    const status = $('#formStatus');
    if (!form) return;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setInvalid = (field, invalid) => {
      if (!field) return;
      field.classList.toggle('is-invalid', invalid);
      field.setAttribute('aria-invalid', String(invalid));
    };

    const validateField = (field) => {
      if (!field || !field.hasAttribute('required')) return true;
      const value = field.value.trim();
      if (!value) {
        setInvalid(field, true);
        return false;
      }
      if (field.type === 'email' && !EMAIL_RE.test(value)) {
        setInvalid(field, true);
        return false;
      }
      setInvalid(field, false);
      return true;
    };

    $$('.field__input', form).forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = $$('.field__input', form);
      let firstInvalid = null;
      let allValid = true;

      fields.forEach((field) => {
        const ok = validateField(field);
        if (!ok) {
          allValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!allValid) {
        if (status) {
          status.textContent = 'Please fill in all required fields correctly.';
          status.classList.remove('is-success');
          status.classList.add('is-error');
        }
        firstInvalid?.focus();
        return;
      }

      if (status) {
        status.textContent = 'Thank you — your enquiry has been sent. We’ll be in touch within 24–48 hours.';
        status.classList.remove('is-error');
        status.classList.add('is-success');
      }
      form.reset();
      fields.forEach((field) => setInvalid(field, false));
    });
  }

  /* ------------------------------------------------------------------
     Cursor glow — desktop, fine-pointer only
     ------------------------------------------------------------------ */
  function initCursorGlow() {
    const glow = $('#cursorGlow');
    if (!glow) return;
    if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    window.addEventListener('pointermove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      glow.classList.add('is-active');
    }, { passive: true });

    document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  function initFooterYear() {
    const year = $('#year');
    if (!year) return;
    year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  initLoader();
  initHeaderScroll();
  initMobileMenu();
  initThemeToggle();
  initAOS();
  initCounters();
  initTimelineLine();
  initTestimonialsSwiper();
  initProjectFilter();
  initBeforeAfterSlider();
  buildHexField();
  initScrollWidgets();
  initContactForm();
  initCursorGlow();
  initFooterYear();
})();
