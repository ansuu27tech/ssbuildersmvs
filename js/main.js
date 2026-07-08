/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — Main Application Script
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Page Loader ──────────────────────────────────────────────
  const loader = document.querySelector('.loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initAnimations();
    }, 2200);
  });

  // Safety fallback
  setTimeout(() => {
    if (!loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initAnimations();
    }
  }, 4000);

  // ── Lenis Smooth Scroll ──────────────────────────────────────
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    // Sync Lenis with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0, 0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  } catch(e) {
    console.warn('Lenis not loaded, using native scroll');
  }

  // ── Navigation ───────────────────────────────────────────────
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.navbar__link');
  const navToggle = document.querySelector('.navbar__toggle');
  const mobileMenu = document.querySelector('.navbar__mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('.navbar__link') : [];

  // Scroll behavior for nav
  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  handleNavScroll();

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  function highlightNav() {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Smooth scroll to section
  function scrollToSection(e) {
    const href = this.getAttribute('href');
    
    // Only smooth scroll if it's an anchor link
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = navbar.offsetHeight;
      if (lenis) {
        lenis.scrollTo(target, { offset: -offset, duration: 1.5 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
    // Close mobile menu if open
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  }

  navLinks.forEach(link => link.addEventListener('click', scrollToSection));
  mobileLinks.forEach(link => link.addEventListener('click', scrollToSection));

  // Mobile CTA buttons (Get Free Quote etc.)
  const mobileCTAs = mobileMenu ? mobileMenu.querySelectorAll('.navbar__cta') : [];
  mobileCTAs.forEach(cta => cta.addEventListener('click', scrollToSection));

  // Mobile menu toggle
  function closeMobileMenu() {
    navToggle.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  const scrollProgress = document.querySelector('.scroll-progress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrolled / maxScroll;
    scrollProgress.style.transform = `scaleX(${progress})`;
  }

  // ── Back to Top ──────────────────────────────────────────────
  const backToTop = document.querySelector('.back-to-top');
  function updateBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  // ── Centralized Scroll Listener (rAF) ────────────────────────
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        handleNavScroll();
        highlightNav();
        updateScrollProgress();
        updateBackToTop();
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // (Mouse glow effect removed)

  // ── Magnetic Buttons ─────────────────────────────────────────
  const magneticBtns = document.querySelectorAll('.magnetic-wrap');
  magneticBtns.forEach(wrap => {
    const btn = wrap.querySelector('.btn');
    if (!btn || window.innerWidth <= 768) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    wrap.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => {
        btn.style.transition = '';
      }, 400);
    });
  });

  // ── Service Card Mouse Glow ──────────────────────────────────
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    const glow = card.querySelector('.service-card__glow');
    if (!glow) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      glow.style.left = (e.clientX - rect.left) + 'px';
      glow.style.top = (e.clientY - rect.top) + 'px';
    });
  });

  // ── 3D Card Tilt Effect ──────────────────────────────────────
  const tiltCards = document.querySelectorAll('.feature-card, .leader-card');
  tiltCards.forEach(card => {
    if (window.innerWidth <= 768) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * 8;
      const tiltY = (x - 0.5) * -8;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => {
        card.style.transition = '';
      }, 600);
    });
  });

  // ── Blueprint SVG Overlay (Hero) ─────────────────────────────
  function createBlueprintGrid() {
    const container = document.querySelector('.hero__blueprint');
    if (!container) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1920 1080');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // Horizontal lines
    for (let i = 0; i < 20; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', i * 60);
      line.setAttribute('x2', '1920');
      line.setAttribute('y2', i * 60);
      line.style.animationDelay = `${i * 0.15}s`;
      svg.appendChild(line);
    }

    // Vertical lines
    for (let i = 0; i < 35; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', i * 60);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', i * 60);
      line.setAttribute('y2', '1080');
      line.style.animationDelay = `${i * 0.1 + 0.5}s`;
      svg.appendChild(line);
    }

    container.appendChild(svg);
  }
  createBlueprintGrid();

  // ── Initialize animations (called after loader) ──────────────
  function initAnimations() {
    if (typeof initGSAPAnimations === 'function') {
      initGSAPAnimations();
    }
    if (typeof initMap === 'function') {
      initMap();
    }
    if (typeof initComponents === 'function') {
      initComponents();
    }

    // Safety net: guarantee all sections are visible after 5s
    // in case any GSAP animation fails to trigger
    setTimeout(() => {
      document.querySelectorAll('section.section').forEach(s => {
        if (parseFloat(getComputedStyle(s).opacity) < 0.5) {
          s.style.opacity = '1';
          s.style.transform = 'none';
        }
      });
    }, 5000);
  }
});
