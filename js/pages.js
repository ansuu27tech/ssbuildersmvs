/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — Extended Pages & Sections Scripts
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initQuickActions();
    initConstructionCalculator();
    initSiteVisitForm();
    initProjectModals();
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
  });

  // ══════════════════════════════════════════════════════════════
  // FLOATING QUICK ACTIONS
  // ══════════════════════════════════════════════════════════════
  function initQuickActions() {
    const quickActions = document.querySelector('.quick-actions');
    if (!quickActions) return;

    // Also hide the old back-to-top button if quick actions exist
    const oldBackToTop = document.querySelector('.back-to-top');
    if (oldBackToTop) oldBackToTop.style.display = 'none';

    let isQuickActionsScrolling = false;
    window.addEventListener('scroll', () => {
      if (!isQuickActionsScrolling) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 600) {
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
    const topBtn = quickActions.querySelector('.quick-action--top');
    if (topBtn) {
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Book consultation — scroll to contact
    const consultBtn = quickActions.querySelector('.quick-action--consult');
    if (consultBtn) {
      consultBtn.addEventListener('click', () => {
        const contact = document.querySelector('#contact');
        if (contact) {
          const offset = document.querySelector('.navbar')?.offsetHeight || 80;
          const top = contact.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }

    // Calculator toggle
    const calcBtn = quickActions.querySelector('.quick-action--calc');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        const panel = document.querySelector('.calc-panel');
        if (panel) panel.classList.toggle('open');
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CONSTRUCTION CALCULATOR
  // ══════════════════════════════════════════════════════════════
  function initConstructionCalculator() {
    const panel = document.querySelector('.calc-panel');
    if (!panel) return;

    const closeBtn = panel.querySelector('.calc-panel__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => panel.classList.remove('open'));
    }

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
      }
    });

    // Calculate
    const areaInput = panel.querySelector('#calc-area');
    const typeSelect = panel.querySelector('#calc-type');
    const interiorCheck = panel.querySelector('#calc-interior');
    const exteriorCheck = panel.querySelector('#calc-exterior');
    const resultValue = panel.querySelector('.calc-result__value');

    function calculate() {
      if (!areaInput || !resultValue) return;
      const area = parseFloat(areaInput.value) || 0;
      if (area <= 0) {
        resultValue.textContent = '₹0';
        return;
      }

      let rate = 1550; // base rate per sq.ft.
      const type = typeSelect ? typeSelect.value : 'residential';

      switch(type) {
        case 'commercial': rate = 1750; break;
        case 'luxury-villa': rate = 2200; break;
        case 'renovation': rate = 1200; break;
        default: rate = 1550;
      }

      if (interiorCheck && interiorCheck.checked) rate += 350;
      if (exteriorCheck && exteriorCheck.checked) rate += 200;

      const total = area * rate;
      const formatted = new Intl.NumberFormat('en-IN', {
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
  // BOOK A SITE VISIT FORM
  // ══════════════════════════════════════════════════════════════
  function initSiteVisitForm() {
    const form = document.querySelector('#siteVisitForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formWrapper = form.closest('.site-visit__form');
      const success = formWrapper?.querySelector('.site-visit__success');

      // Basic validation
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
          setTimeout(() => { field.style.borderColor = ''; }, 3000);
        }
      });

      if (!valid) return;

      // Show success
      if (success) {
        form.style.display = 'none';
        success.classList.add('show');

        setTimeout(() => {
          form.style.display = '';
          success.classList.remove('show');
          form.reset();
        }, 4000);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PROJECT DETAIL MODALS
  // ══════════════════════════════════════════════════════════════
  function initProjectModals() {
    const overlay = document.querySelector('.project-modal-overlay');
    if (!overlay) return;

    const modal = overlay.querySelector('.project-modal');
    const closeBtn = overlay.querySelector('.project-modal__close');

    // Project data
    const projectData = {
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
      const data = projectData[projectKey];
      if (!data) return;

      // Populate modal
      const typeEl = modal.querySelector('.project-modal__type');
      const titleEl = modal.querySelector('.project-modal__title');
      const details = modal.querySelectorAll('.project-modal__detail-value');
      const tagsContainer = modal.querySelector('.project-modal__material-tags');
      const reviewText = modal.querySelector('.project-modal__review-text');
      const reviewAuthor = modal.querySelector('.project-modal__review-author');

      if (typeEl) typeEl.textContent = data.type;
      if (titleEl) titleEl.textContent = data.title;
      if (details[0]) details[0].textContent = data.area;
      if (details[1]) details[1].textContent = data.location;
      if (details[2]) details[2].textContent = data.completion;
      if (details[3]) details[3].textContent = data.timeline;

      if (tagsContainer) {
        tagsContainer.innerHTML = data.materials.map(m =>
          `<span class="project-modal__material-tag">${m}</span>`
        ).join('');
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

    // Bind detail buttons
    document.querySelectorAll('.project-card__detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-project');
        if (key) openModal(key);
      });
    });

    // Close handlers
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // WORKFLOW ANIMATIONS (GSAP)
  // ══════════════════════════════════════════════════════════════
  function initWorkflowAnimations() {
    const steps = document.querySelectorAll('.workflow__step');
    if (!steps.length || typeof gsap === 'undefined') {
      // Fallback: just reveal them
      steps.forEach(s => s.classList.add('revealed'));
      return;
    }

    steps.forEach((step, i) => {
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
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // WHY US ANIMATIONS
  // ══════════════════════════════════════════════════════════════
  function initWhyUsAnimations() {
    const cards = document.querySelectorAll('.why-us__card');
    const vsBadge = document.querySelector('.why-us__vs-badge');
    if (!cards.length || typeof gsap === 'undefined') return;

    gsap.fromTo(cards[0], { opacity: 0, x: -60 }, {
      opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.why-us__versus', start: 'top 80%' }
    });

    if (vsBadge) {
      gsap.fromTo(vsBadge, { opacity: 0, scale: 0 }, {
        opacity: 1, scale: 1, duration: 0.5, delay: 0.3, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '.why-us__versus', start: 'top 80%' }
      });
    }

    if (cards[1]) {
      gsap.fromTo(cards[1], { opacity: 0, x: 60 }, {
        opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out',
        scrollTrigger: { trigger: '.why-us__versus', start: 'top 80%' }
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BRANDS ANIMATIONS
  // ══════════════════════════════════════════════════════════════
  function initBrandsAnimations() {
    const brandCards = document.querySelectorAll('.brand-card');
    if (!brandCards.length || typeof gsap === 'undefined') return;

    brandCards.forEach((card, i) => {
      gsap.fromTo(card, {
        opacity: 0,
        y: 30,
        scale: 0.9
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PROCESS PAGE
  // ══════════════════════════════════════════════════════════════
  function initProcessPage() {
    const timeline = document.querySelector('.process-timeline');
    const progressBar = timeline?.querySelector('.process-timeline__progress');
    const steps = timeline?.querySelectorAll('.process-step');
    if (!steps?.length) return;

    // GSAP stagger entrance
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      steps.forEach((step, i) => {
        gsap.fromTo(step, {
          opacity: 0,
          x: -40,
        }, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            toggleActions: 'play none none none'
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

    // Expand on click (mobile-friendly)
    steps.forEach(step => {
      const content = step.querySelector('.process-step__content');
      if (content) {
        content.addEventListener('click', () => {
          // Close others
          steps.forEach(s => {
            if (s !== step) {
              s.querySelector('.process-step__content')?.classList.remove('expanded');
            }
          });
          content.classList.toggle('expanded');
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // MATERIALS PAGE REDESIGN
  // ══════════════════════════════════════════════════════════════
  function initMaterialsPage() {
    // 1. Statistics Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length && typeof gsap !== 'undefined') {
      statNumbers.forEach(stat => {
        const targetValue = parseInt(stat.getAttribute('data-count'), 10) || parseInt(stat.textContent, 10);
        stat.textContent = '0';
        
        gsap.to(stat, {
          textContent: targetValue,
          duration: 2.5,
          ease: 'power3.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: '.materials-stats',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });
    }

    // 2. 3D Tilt effect for brand cards
    const brandCards = document.querySelectorAll('.brand-card');
    if (brandCards.length && window.innerWidth > 768) {
      brandCards.forEach(card => {
        const inner = card.querySelector('.brand-card__inner');
        if (!inner) return;

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          // Stronger tilt for luxury feel
          const tiltX = (y - 0.5) * 15;
          const tiltY = (x - 0.5) * -15;
          
          inner.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
          inner.style.transform = '';
          inner.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          setTimeout(() => { inner.style.transition = ''; }, 600);
        });
      });
    }

    // 3. Stagger animation for brand cards
    if (brandCards.length && typeof gsap !== 'undefined') {
      gsap.fromTo(brandCards, {
        opacity: 0,
        y: 40,
        scale: 0.95
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.brands-showcase',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }

    // 4. Mobile infinite carousel duplication
    const track = document.querySelector('.brands-track');
    if (track && window.innerWidth <= 768) {
      // Clone cards for infinite scroll seamless looping
      const cards = track.querySelectorAll('.brand-card');
      cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // GALLERY PAGE
  // ══════════════════════════════════════════════════════════════
  function initGalleryPage() {
    const filters = document.querySelectorAll('.gallery__filter');
    const items = document.querySelectorAll('.gallery__item');
    const lightboxOverlay = document.querySelector('.lightbox-overlay');

    // Filtering
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        const category = filter.getAttribute('data-filter');

        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');

        items.forEach(item => {
          if (category === 'all' || item.getAttribute('data-category') === category) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });

    // Lightbox
    if (lightboxOverlay) {
      const lightboxTitle = lightboxOverlay.querySelector('.lightbox__title');
      const lightboxCategory = lightboxOverlay.querySelector('.lightbox__category');
      const lightboxClose = lightboxOverlay.querySelector('.lightbox__close');

      items.forEach(item => {
        item.addEventListener('click', () => {
          const title = item.querySelector('.gallery__placeholder-text')?.textContent || '';
          const category = item.querySelector('.gallery__category-badge')?.textContent || '';

          if (lightboxTitle) lightboxTitle.textContent = title;
          if (lightboxCategory) lightboxCategory.textContent = category;

          lightboxOverlay.classList.add('open');
          document.body.style.overflow = 'hidden';
        });
      });

      function closeLightbox() {
        lightboxOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }

      if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
      lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) closeLightbox();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxOverlay.classList.contains('open')) {
          closeLightbox();
        }
      });
    }

    // Stagger entrance
    if (typeof gsap !== 'undefined') {
      items.forEach((item, i) => {
        gsap.fromTo(item, {
          opacity: 0,
          y: 30,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: i * 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      });
    }
  }

})();
