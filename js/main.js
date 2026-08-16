/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — Main Application Script
   ═══════════════════════════════════════════════════════════════ */

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ── BFCache / Back-Navigation Restoration Handler ──────────────
// On bfcache restore, just refresh ScrollTrigger positions.
// Do NOT re-create animations — once:true must stay respected.
window.addEventListener('pageshow', function(event) {
  if (event.persisted && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh(true);
  }
});



document.addEventListener('DOMContentLoaded', function() {
  // ── Accessibility: Mark decorative SVG icons as aria-hidden ──
  document.querySelectorAll('.navbar__link svg, .quick-action__btn svg, .service-card svg, .footer svg, .btn svg, .feature-card svg')
    .forEach(function(svg) { svg.setAttribute('aria-hidden', 'true'); });

  // Declare lenis early so all closures can reference it safely
  var lenis;

  function handleHashNavigation() {
    if (window.location.hash) {
      try {
        var target = document.querySelector(window.location.hash);
        if (target) {
          setTimeout(function() {
            var navbar = document.querySelector('.navbar');
            var offset = navbar ? navbar.offsetHeight : 80;
            if (typeof lenis !== 'undefined' && lenis) {
              lenis.scrollTo(target, { offset: -offset, duration: 1.5 });
            } else {
              var top = target.getBoundingClientRect().top + window.scrollY - offset;
              window.scrollTo({ top: top, behavior: 'smooth' });
            }
          }, 100);
        }
      } catch (e) {}
    }
  }

  // ── Page Loader ──────────────────────────────────────────────
  var loader = document.querySelector('.loader');
  var _animationsInitCalled = false;
  if (loader) {
    var hideLoader = function() {
      if (!loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        if (!_animationsInitCalled) {
          _animationsInitCalled = true;
          // Ensure GSAP is loaded before initializing
          if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            try { initAnimations(); } catch (e) { console.error('Animation init error:', e); }
          } else {
            // Wait a bit more for CDN scripts
            setTimeout(function() {
              try { initAnimations(); } catch (e) { console.error('Delayed animation init error:', e); }
            }, 500);
          }
        }
        try { handleHashNavigation(); } catch (e) { console.error('Hash nav error:', e); }
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 100);
    } else {
      var loaderDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 800;
      window.addEventListener('load', function() { setTimeout(hideLoader, loaderDelay); });
    }

    // Safety fallback
    setTimeout(hideLoader, 2500);
  } else {
    // If no loader, still handle hash navigation and initialize animations safely
    if (!_animationsInitCalled) {
      _animationsInitCalled = true;
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        try { initAnimations(); } catch (e) { console.error('Animation init error:', e); }
      } else {
        setTimeout(function() {
          try { initAnimations(); } catch (e) { console.error('Delayed animation init error:', e); }
        }, 500);
      }
    }
    try { handleHashNavigation(); } catch (e) { console.error('Hash nav error:', e); }
  }

  // ── Lenis Smooth Scroll (disabled on mobile to prevent touch conflicts) ──
  var isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
  if (!isMobile) {
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        orientation: 'vertical',
        smoothWheel: true,
      });

      // Sync Lenis with GSAP ScrollTrigger
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function(time) {
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
  }

  // ── Navbar ───────────────────────────────────────────────────
  var navbar = document.querySelector('.navbar');
  var navToggle = document.querySelector('.navbar__toggle');
  var mobileMenu = document.querySelector('.navbar__mobile-menu');
  var navLinks = document.querySelectorAll('.navbar__link');
  var mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('.navbar__link') : [];
  var logo = document.querySelector('.navbar__logo');
  var skipLink = document.querySelector('.skip-link');

  // Navbar scroll background change
  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  handleNavScroll();

  // Active section highlighting (accounts for pinned containers)
  var sections = document.querySelectorAll('section[id]');
  function highlightNav() {
    var scrollY = window.scrollY + 200;
    var currentId = '';

    sections.forEach(function(section) {
      var el = section.closest('.pin-spacer') || section;
      var top = el.offsetTop;
      var height = el.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(function(link) {
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  // Smooth scroll to section (handles both anchor links and page links)
  function scrollToSection(e) {
    var href = this.getAttribute('href');
    if (!href) return;

    // Close mobile menu first if open
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }

    // External page links (e.g., kitchen.html, gallery.html) - let browser navigate
    if (!href.startsWith('#')) {
      document.body.style.overflow = '';
      return;
    }

    e.preventDefault();

    // Direct scroll to top / hero
    if (href === '#hero' || href === '#top') {
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    var target = document.querySelector(href);
    if (target) {
      var offset = navbar ? navbar.offsetHeight : 80;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      if (typeof lenis !== 'undefined' && lenis) {
        lenis.scrollTo(top, { duration: 1.5 });
      } else {
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }
  }

  navLinks.forEach(function(link) { link.addEventListener('click', scrollToSection); });
  mobileLinks.forEach(function(link) { link.addEventListener('click', scrollToSection); });

  // Mobile CTA buttons (Get Free Quote etc.)
  var mobileCTAs = mobileMenu ? mobileMenu.querySelectorAll('.navbar__cta') : [];
  mobileCTAs.forEach(function(cta) { cta.addEventListener('click', scrollToSection); });

  // Mobile menu toggle
  var mobileOverlay = document.querySelector('.navbar__mobile-overlay');

  function closeMobileMenu() {
    if (navToggle) {
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      var isOpen = navToggle.classList.toggle('active');
      if (mobileMenu) mobileMenu.classList.toggle('open');
      if (mobileOverlay) mobileOverlay.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      navToggle.setAttribute('aria-expanded', isOpen.toString());
      
      // Focus trap basic setup
      if (isOpen && mobileMenu) {
        var firstLink = mobileMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
  }

  var scrollProgress = document.querySelector('.scroll-progress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    var scrolled = window.scrollY;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrolled / maxScroll;
    scrollProgress.style.transform = 'scaleX(' + progress + ')';
  }

  // ── Back to Top ──────────────────────────────────────────────
  var backToTop = document.querySelector('.back-to-top');
  function updateBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  // ── Centralized Scroll Listener (rAF) ────────────────────────
  var isScrolling = false;
  window.addEventListener('scroll', function() {
    if (!isScrolling) {
      window.requestAnimationFrame(function() {
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
    backToTop.addEventListener('click', function() {
      if (lenis) {
        lenis.scrollTo(0, { duration: 2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ── Magnetic Buttons ─────────────────────────────────────────
  var magneticBtns = document.querySelectorAll('.magnetic-wrap');
  magneticBtns.forEach(function(wrap) {
    var btn = wrap.querySelector('.btn');
    if (!btn || window.innerWidth <= 768) return;

    wrap.addEventListener('mousemove', function(e) {
      var rect = wrap.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px)';
    });

    wrap.addEventListener('mouseleave', function() {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(function() {
        btn.style.transition = '';
      }, 400);
    });
  });

  // ── Service Card Mouse Glow ──────────────────────────────────
  var serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(function(card) {
    var glow = card.querySelector('.service-card__glow');
    if (!glow) return;

    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      glow.style.left = (e.clientX - rect.left) + 'px';
      glow.style.top = (e.clientY - rect.top) + 'px';
    });
  });

  // ── 3D Card Tilt Effect ──────────────────────────────────────
  var tiltCards = document.querySelectorAll('.feature-card, .leader-card');
  tiltCards.forEach(function(card) {
    if (window.innerWidth <= 768) return;

    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var tiltX = (y - 0.5) * 8;
      var tiltY = (x - 0.5) * -8;
      card.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px)';
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(function() {
        card.style.transition = '';
      }, 600);
    });
  });

  // ── Blueprint SVG Overlay (Hero) ─────────────────────────────
  function createBlueprintGrid() {
    var container = document.querySelector('.hero__blueprint');
    if (!container) return;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1920 1080');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // Horizontal lines
    for (var i = 0; i < 20; i++) {
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', i * 60);
      line.setAttribute('x2', '1920');
      line.setAttribute('y2', i * 60);
      line.style.animationDelay = (i * 0.15) + 's';
      svg.appendChild(line);
    }

    // Vertical lines
    for (var j = 0; j < 35; j++) {
      var vline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      vline.setAttribute('x1', j * 60);
      vline.setAttribute('y1', '0');
      vline.setAttribute('x2', j * 60);
      vline.setAttribute('y2', '1080');
      vline.style.animationDelay = (j * 0.1 + 0.5) + 's';
      svg.appendChild(vline);
    }

    container.appendChild(svg);
  }
  createBlueprintGrid();

  // ── Initialize animations (called after loader) ──────────────
  // This is the global initAnimations function, safe to call multiple times
  window.initAnimations = function initAnimations() {
    // Kill all existing ScrollTriggers before re-creating
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(function(st) { st.kill(); });
    }

    if (typeof initGSAPAnimations === 'function') {
      initGSAPAnimations();
    }
    if (typeof initComponents === 'function') {
      initComponents();
    }
    if (typeof initPagesAnimations === 'function') {
      initPagesAnimations();
    }
    
    // Re-initialize the cinematic hero (fixes initial load and back-nav)
    if (typeof window.initHeroCinematicGSAP === 'function') {
      window.initHeroCinematicGSAP();
    }

    // Re-initialize kitchen scroll sequence if present
    if (typeof window.initKitchenSequence === 'function') {
      window.initKitchenSequence();
    }

    // Force ScrollTrigger to refresh after a short delay to account for lazy-loaded images
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(function() { ScrollTrigger.refresh(true); }, 500);
      setTimeout(function() { ScrollTrigger.refresh(true); }, 1500);
    }
  };

  // Make initAnimations available globally for the first call from hideLoader
  // (the function is already assigned to window above)

  // ── Visibility Change Handler ────────────────────────────────
  // When user tabs back to the page, refresh ScrollTrigger positions
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh(true);
    }
  });

  // Lenis restart on pageshow
  window.addEventListener('pageshow', function(event) {
    if (event.persisted && typeof lenis !== 'undefined' && lenis) {
      lenis.start();
    }
  });
});
