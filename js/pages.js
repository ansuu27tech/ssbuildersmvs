/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — Extended Pages & Sections Scripts
   Safe for re-initialization: guards against duplicate listeners
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var _pagesInitialized = false;
  var _pagesAnimationsInitialized = false;

  document.addEventListener('DOMContentLoaded', function() {
    if (!_pagesInitialized) {
      initQuickActions();
      initConstructionCalculator();
      initProjectModals();
      _pagesInitialized = true;
    }
  });

  window.initPagesAnimations = function() {
    initWorkflowAnimations();
    initWhyUsAnimations();
    initBrandsAnimations();

    // Page-specific inits
    if (document.querySelector('.process-timeline')) {
      initProcessPage();
    }
    if (document.querySelector('.materials-hero') || document.querySelector('.materials__grid')) {
      initMaterialsPage();
    }
    if (document.querySelector('.gallery__masonry')) {
      initGalleryPage();
    }

    _pagesAnimationsInitialized = true;
  };

  // ══════════════════════════════════════════════════════════════
  // FLOATING QUICK ACTIONS
  // ══════════════════════════════════════════════════════════════
  function initQuickActions() {
    var quickActions = document.querySelector('.quick-actions');
    if (!quickActions) return;

    // Also hide the old back-to-top button if quick actions exist
    var oldBackToTop = document.querySelector('.back-to-top');
    if (oldBackToTop) oldBackToTop.style.display = 'none';

    var isQuickActionsScrolling = false;
    // On sub-pages without the pinned cinematic hero, use a low threshold
    var hasHero = !!document.querySelector('#hero .ch-canvas, .ch');
    window.addEventListener('scroll', function() {
      if (!isQuickActionsScrolling) {
        window.requestAnimationFrame(function() {
          var threshold;
          if (hasHero) {
            // Hero is pinned for 500%/250% on desktop/mobile. Quick actions appear after.
            var heroMultiplier = window.innerWidth <= 768 ? 2.8 : 5.5;
            threshold = window.innerHeight * heroMultiplier;
          } else {
            // Sub-pages: show after scrolling 300px
            threshold = 300;
          }
          if (window.scrollY > threshold) {
            quickActions.classList.add('visible');
          } else {
            quickActions.classList.remove('visible');
          }
          isQuickActionsScrolling = false;
        });
        isQuickActionsScrolling = true;
      }
    }, { passive: true });

    // Scroll to top
    var topBtn = quickActions.querySelector('.quick-action--top');
    if (topBtn) {
      topBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Book consultation — scroll to contact
    var consultBtn = quickActions.querySelector('.quick-action--consult');
    if (consultBtn) {
      consultBtn.addEventListener('click', function() {
        var contact = document.querySelector('#contact');
        if (contact) {
          var navbar = document.querySelector('.navbar');
          var offset = navbar ? navbar.offsetHeight : 80;
          var top = contact.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    }

    // Calculator toggle
    var calcBtn = quickActions.querySelector('.quick-action--calc');
    if (calcBtn) {
      calcBtn.addEventListener('click', function() {
        var panel = document.querySelector('.calc-panel');
        if (panel) panel.classList.toggle('open');
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CONSTRUCTION CALCULATOR
  // ══════════════════════════════════════════════════════════════
  function initConstructionCalculator() {
    var panel = document.querySelector('.calc-panel');
    if (!panel) return;

    var closeBtn = panel.querySelector('.calc-panel__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() { panel.classList.remove('open'); });
    }

    // Close on ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
      }
    });

    // Calculate
    var areaInput = panel.querySelector('#calc-area');
    var typeSelect = panel.querySelector('#calc-type');
    var interiorCheck = panel.querySelector('#calc-interior');
    var exteriorCheck = panel.querySelector('#calc-exterior');
    var resultValue = panel.querySelector('.calc-result__value');

    function calculate() {
      if (!areaInput || !resultValue) return;
      var area = parseFloat(areaInput.value) || 0;
      if (area <= 0) {
        resultValue.textContent = '₹0';
        return;
      }

      var rate = 1550; // base rate per sq.ft.
      var type = typeSelect ? typeSelect.value : 'residential';

      switch(type) {
        case 'commercial': rate = 1750; break;
        case 'luxury-villa': rate = 2200; break;
        case 'renovation': rate = 1200; break;
        default: rate = 1550;
      }

      if (interiorCheck && interiorCheck.checked) rate += 350;
      if (exteriorCheck && exteriorCheck.checked) rate += 200;

      var total = area * rate;
      var formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(total);

      resultValue.textContent = formatted;
    }

    if (areaInput) areaInput.addEventListener('input', calculate);
    if (typeSelect) typeSelect.addEventListener('change', calculate);
    if (interiorCheck) interiorCheck.addEventListener('change', calculate);
    if (exteriorCheck) exteriorCheck.addEventListener('change', calculate);
  }

  // ══════════════════════════════════════════════════════════════
  // PROJECT DETAIL MODALS
  // ══════════════════════════════════════════════════════════════
  function initProjectModals() {
    var overlay = document.querySelector('.project-modal-overlay');
    if (!overlay) return;

    var modal = overlay.querySelector('.project-modal');
    var closeBtn = overlay.querySelector('.project-modal__close');

    // Project data
    var projectData = {
      'luxury-villa': {
        type: 'Luxury Villa',
        title: 'Luxury Villa Project',
        area: '4,200 sq.ft.',
        location: 'Bengaluru',
        completion: 'December 2024',
        timeline: '14 months',
        materials: ['UltraTech Cement', 'JSW Steel', 'Kajaria Tiles', 'Asian Paints', 'Havells Electricals'],
        review: '"Building our luxury villa with SS BUILDERS was the best decision we made. The quality of construction is phenomenal!"',
        reviewer: 'Suresh Menon — Villa Client'
      },
      'commercial': {
        type: 'Commercial',
        title: 'Commercial Complex',
        area: '8,000 sq.ft.',
        location: 'Chennai',
        completion: 'March 2025',
        timeline: '18 months',
        materials: ['ACC Cement', 'JSW Steel', 'Finolex Wiring', 'Astral Pipes', 'Havells Electricals'],
        review: '"The team\'s professionalism was outstanding. They delivered our commercial space on time and within budget."',
        reviewer: 'Priya Natarajan — Commercial Client'
      },
      'interior': {
        type: 'Interior Design',
        title: 'Luxury Interior Design',
        area: '1,800 sq.ft.',
        location: 'Ranipet',
        completion: 'June 2024',
        timeline: '4 months',
        materials: ['Asian Paints', 'Kajaria Tiles', 'Havells Lighting', 'Designer Doors', 'UPVC Windows'],
        review: '"They transformed our old home into a modern, elegant space with minimal disruption."',
        reviewer: 'Abdul Rahman — Renovation Client'
      },
      'exterior': {
        type: 'Exterior Design',
        title: 'Modern Exterior Design',
        area: '3,000 sq.ft.',
        location: 'Melvisharam',
        completion: 'August 2024',
        timeline: '3 months',
        materials: ['Asian Paints Apex', 'Natural Stone', 'Weather-resistant Cladding', 'Landscape Materials'],
        review: '"The exterior transformation exceeded our expectations. Our home looks brand new!"',
        reviewer: 'Fathima Begum — Residential Client'
      }
    };

    function openModal(projectKey) {
      var data = projectData[projectKey];
      if (!data) return;

      // Populate modal
      var typeEl = modal.querySelector('.project-modal__type');
      var titleEl = modal.querySelector('.project-modal__title');
      var details = modal.querySelectorAll('.project-modal__detail-value');
      var tagsContainer = modal.querySelector('.project-modal__material-tags');
      var reviewText = modal.querySelector('.project-modal__review-text');
      var reviewAuthor = modal.querySelector('.project-modal__review-author');

      if (typeEl) typeEl.textContent = data.type;
      if (titleEl) titleEl.textContent = data.title;
      if (details[0]) details[0].textContent = data.area;
      if (details[1]) details[1].textContent = data.location;
      if (details[2]) details[2].textContent = data.completion;
      if (details[3]) details[3].textContent = data.timeline;

      if (tagsContainer) {
        tagsContainer.innerHTML = data.materials.map(function(m) {
          return '<span class="project-modal__material-tag">' + m + '</span>';
        }).join('');
      }

      if (reviewText) reviewText.textContent = data.review;
      if (reviewAuthor) reviewAuthor.textContent = data.reviewer;

      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Bind click on project cards
    document.querySelectorAll('.project-card[data-modal-target]').forEach(function(card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() {
        var typeEl = card.querySelector('.project-card__type');
        if (!typeEl) return;
        var typeText = typeEl.textContent.trim().toLowerCase();
        // Map display text to data key
        var keyMap = {
          'luxury villa': 'luxury-villa',
          'commercial': 'commercial',
          'interior design': 'interior',
          'exterior design': 'exterior'
        };
        var key = keyMap[typeText] || typeText.replace(/\s+/g, '-');
        if (key) openModal(key);
      });
    });

    // Close handlers
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // WORKFLOW ANIMATIONS (GSAP)
  // ══════════════════════════════════════════════════════════════
  function initWorkflowAnimations() {
    var steps = document.querySelectorAll('.workflow__step');
    if (!steps.length || typeof gsap === 'undefined') {
      // Fallback: just reveal them
      steps.forEach(function(s) { s.classList.add('revealed'); });
      return;
    }

    steps.forEach(function(step, i) {
      gsap.fromTo(step, {
        opacity: 0,
        y: 40,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: i * 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          once: true
        },
        onComplete: function() {
          // Add CSS class to maintain visibility, then safely clear inline styles
          step.classList.add('revealed');
          gsap.set(step, { clearProps: 'all' });
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // WHY US ANIMATIONS
  // ══════════════════════════════════════════════════════════════
  function initWhyUsAnimations() {
    var cards = document.querySelectorAll('.why-us__card');
    var vsBadge = document.querySelector('.why-us__vs-badge');
    var triggerEl = document.querySelector('.why-us__versus');
    if (!cards.length || typeof gsap === 'undefined' || !triggerEl) return;

    gsap.fromTo(cards[0], { opacity: 0, x: -60 }, {
      opacity: 1, clearProps: "all", x: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: triggerEl, start: 'top 80%', once: true }
    });

    if (vsBadge) {
      gsap.fromTo(vsBadge, { opacity: 0, scale: 0 }, {
        opacity: 1, clearProps: "all", scale: 1, duration: 0.5, delay: 0.3, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: triggerEl, start: 'top 80%', once: true }
      });
    }

    if (cards[1]) {
      gsap.fromTo(cards[1], { opacity: 0, x: 60 }, {
        opacity: 1, clearProps: "all", x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out',
        scrollTrigger: { trigger: triggerEl, start: 'top 80%', once: true }
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BRANDS ANIMATIONS
  // ══════════════════════════════════════════════════════════════
  function initBrandsAnimations() {
    var brandCards = document.querySelectorAll('.brand-card');
    if (!brandCards.length || typeof gsap === 'undefined') return;

    brandCards.forEach(function(card, i) {
      gsap.fromTo(card, {
        opacity: 0,
        y: 30,
        scale: 0.9
      }, {
        opacity: 1, clearProps: "all",
        y: 0,
        scale: 1,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          once: true
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PROCESS PAGE
  // ══════════════════════════════════════════════════════════════
  function initProcessPage() {
    var timeline = document.querySelector('.process-timeline');
    var progressBar = timeline ? timeline.querySelector('.process-timeline__progress') : null;
    var steps = timeline ? timeline.querySelectorAll('.process-step') : [];
    if (!steps.length) return;

    // GSAP stagger entrance
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      steps.forEach(function(step, i) {
        gsap.fromTo(step, {
          opacity: 0,
          x: -40,
        }, {
          opacity: 1, clearProps: "all",
          x: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            once: true
          }
        });
      });
    }

    // Progress bar follows scroll via GSAP ScrollTrigger
    if (progressBar && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.to(progressBar, {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: timeline,
          start: 'top center',
          end: 'bottom center',
          scrub: true
        }
      });
    }

    // Expand on click (mobile-friendly) - Guarded for re-initialization
    if (!_pagesAnimationsInitialized) {
      steps.forEach(function(step) {
        var content = step.querySelector('.process-step__content');
        if (content) {
          content.addEventListener('click', function() {
            // Close others
            steps.forEach(function(s) {
              if (s !== step) {
                var otherContent = s.querySelector('.process-step__content');
                if (otherContent) otherContent.classList.remove('expanded');
              }
            });
            content.classList.toggle('expanded');
          });
        }
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // MATERIALS PAGE REDESIGN
  // ══════════════════════════════════════════════════════════════
  function initMaterialsPage() {
    // 1. Statistics Counter Animation
    var statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length && typeof gsap !== 'undefined') {
      statNumbers.forEach(function(stat) {
        var targetValue = parseInt(stat.getAttribute('data-target'), 10) || parseInt(stat.getAttribute('data-count'), 10) || parseInt(stat.textContent, 10);
        stat.textContent = '0';
        
        var statsTrigger = document.querySelector('.materials-stats');
        if (statsTrigger) {
          gsap.to(stat, {
            textContent: targetValue,
            duration: 2.5,
            ease: 'power3.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: statsTrigger,
              start: 'top 85%',
              once: true
            }
          });
        }
      });
    }

    // 2. 3D Tilt effect for brand cards - Guarded for re-init
    var brandCards = document.querySelectorAll('.brand-card');
    if (brandCards.length && window.innerWidth > 768 && !_pagesAnimationsInitialized) {
      brandCards.forEach(function(card) {
        var inner = card.querySelector('.brand-card__inner');
        if (!inner) return;

        card.addEventListener('mousemove', function(e) {
          var rect = card.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width;
          var y = (e.clientY - rect.top) / rect.height;
          // Stronger tilt for luxury feel
          var tiltX = (y - 0.5) * 15;
          var tiltY = (x - 0.5) * -15;
          
          inner.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-8px)';
        });

        card.addEventListener('mouseleave', function() {
          inner.style.transform = '';
          inner.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          setTimeout(function() { inner.style.transition = ''; }, 600);
        });
      });
    }

    // 3. Stagger animation for brand cards
    var brandsTrigger = document.querySelector('.brands-showcase');
    if (brandCards.length && typeof gsap !== 'undefined' && brandsTrigger) {
      gsap.fromTo(brandCards, {
        opacity: 0,
        y: 40,
        scale: 0.95
      }, {
        opacity: 1, clearProps: "all",
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: brandsTrigger,
          start: 'top 85%',
          once: true
        }
      });
    }

    // 4. Mobile infinite carousel duplication - Guarded for re-init
    var track = document.querySelector('.brands-track');
    if (track && window.innerWidth <= 768 && !_pagesAnimationsInitialized) {
      // Clone cards for infinite scroll seamless looping
      var cards = track.querySelectorAll('.brand-card');
      cards.forEach(function(card) {
        var clone = card.cloneNode(true);
        track.appendChild(clone);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // GALLERY PAGE
  // ══════════════════════════════════════════════════════════════
  function initGalleryPage() {
    var filters = document.querySelectorAll('.gallery__filter');
    var items = document.querySelectorAll('.gallery__item');
    var masonry = document.querySelector('.gallery__masonry');
    var lightboxOverlay = document.querySelector('.lightbox-overlay');

    // Filtering - Guarded for re-init
    if (!_pagesAnimationsInitialized) {
      filters.forEach(function(filter) {
        filter.addEventListener('click', function() {
          var category = filter.getAttribute('data-filter');

          filters.forEach(function(f) { f.classList.remove('active'); });
          filter.classList.add('active');

          if (masonry) masonry.classList.add('filtering');
          
          setTimeout(function() {
            items.forEach(function(item) {
              if (category === 'all' || item.getAttribute('data-category') === category) {
                item.classList.remove('hidden');
              } else {
                item.classList.add('hidden');
              }
            });
            
            if (masonry) masonry.classList.remove('filtering');
          }, 300);
        });
      });

      // Lightbox
      if (lightboxOverlay) {
        var lightboxTitle = lightboxOverlay.querySelector('.lightbox__title');
        var lightboxCategory = lightboxOverlay.querySelector('.lightbox__category');
        var lightboxClose = lightboxOverlay.querySelector('.lightbox__close');
        var lightboxPlaceholder = lightboxOverlay.querySelector('.lightbox__placeholder-large');
        var lightboxImg = lightboxOverlay.querySelector('.lightbox__img');
        var lightboxLocation = lightboxOverlay.querySelector('.lightbox__location');
        var lightboxLocationText = lightboxOverlay.querySelector('.lightbox__location-text');

        items.forEach(function(item) {
          item.addEventListener('click', function() {
            var titleEl = item.querySelector('.gallery__placeholder-text, .gallery__img-title');
            var title = titleEl ? titleEl.textContent : '';
            var categoryEl = item.querySelector('.gallery__category-badge');
            var category = categoryEl ? categoryEl.textContent : '';
            var location = item.getAttribute('data-location') || '';
            var imgElement = item.querySelector('img.gallery__img');

            if (lightboxTitle) lightboxTitle.textContent = title;
            if (lightboxCategory) lightboxCategory.textContent = category;
            
            if (lightboxLocation && lightboxLocationText) {
              if (location) {
                lightboxLocationText.textContent = location;
                lightboxLocation.style.display = 'block';
              } else {
                lightboxLocation.style.display = 'none';
              }
            }

            if (imgElement && lightboxImg && lightboxPlaceholder) {
              lightboxImg.src = imgElement.src;
              lightboxImg.style.display = 'block';
              lightboxPlaceholder.style.display = 'none';
            } else if (lightboxImg && lightboxPlaceholder) {
              lightboxImg.style.display = 'none';
              lightboxImg.src = '';
              lightboxPlaceholder.style.display = 'flex';
            }

            lightboxOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
          });
        });

        function closeLightbox() {
          lightboxOverlay.classList.remove('open');
          document.body.style.overflow = '';
        }

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', function(e) {
          if (e.target === lightboxOverlay) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && lightboxOverlay.classList.contains('open')) {
            closeLightbox();
          }
        });
      }
    }

    // Stagger entrance (Safe to re-run because it uses GSAP fromTo with once: true)
    if (typeof gsap !== 'undefined') {
      items.forEach(function(item, i) {
        gsap.fromTo(item, {
          opacity: 0,
          y: 30,
        }, {
          opacity: 1, clearProps: "all",
          y: 0,
          duration: 0.5,
          delay: i * 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            once: true
          }
        });
      });
    }
  }

})();
