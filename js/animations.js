/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — GSAP ScrollTrigger Animations
   ═══════════════════════════════════════════════════════════════ */

function initGSAPAnimations() {
  // Check GSAP availability
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded, using CSS fallback');
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Helper: Split Text into Characters for Flip Effect ──────
  function splitTextToChars(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el.classList.contains('split-done')) return;
      const text = el.textContent;
      el.textContent = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const span = document.createElement('span');
        span.innerHTML = char === ' ' ? '&nbsp;' : char;
        span.style.display = 'inline-block';
        span.classList.add('char');
        el.appendChild(span);
      }
      el.classList.add('split-done');
    });
  }

  // Split the hero title words into characters
  if (document.querySelector('.hero')) {
    splitTextToChars('.hero__title-word');

    // ── Hero Animations ────────────────────────────────────────
    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
      .fromTo('.hero__overline', {
        y: 30, opacity: 0
      }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
      })
      .fromTo('.hero__title .char', {
        transformPerspective: 500,
        rotateX: -90,
        y: 40,
        opacity: 0
      }, {
        rotateX: 0,
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        stagger: 0.03
      }, '-=0.4')
      .fromTo('.hero__subtitle', {
        y: 30, opacity: 0
      }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
      }, '-=0.5')
      .fromTo('.hero__actions .btn', {
        y: 20, opacity: 0
      }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
        stagger: 0.1
      }, '-=0.4')
      .fromTo('.hero__price-tag', {
        y: 20, opacity: 0
      }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out'
      }, '-=0.3')
      .fromTo('.hero__stats', {
        x: 60, opacity: 0
      }, {
        x: 0, opacity: 1, duration: 1, ease: 'power3.out'
      }, '-=0.8')
      .fromTo('.hero__stat', {
        y: 30, opacity: 0
      }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
        stagger: 0.1
      }, '-=0.5')
      .fromTo('.hero__scroll', {
        y: 20, opacity: 0
      }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out'
      }, '-=0.3');
  }

  // ── Counter Animation ──────────────────────────────────────
  const counters = document.querySelectorAll('.hero__stat-number, .counter-val');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'));
    const suffix = counter.getAttribute('data-suffix') || '';

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            const progress = this.progress();
            const current = target * progress;
            counter.textContent = (target % 1 !== 0 ? current.toFixed(1) : Math.floor(current)) + suffix;
          }
        });
      }
    });
  });

  // ── Section Header Reveals ─────────────────────────────────
  gsap.utils.toArray('.section-header').forEach(header => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        once: true
      }
    });

    const overline = header.querySelector('.text-overline');
    const h2 = header.querySelector('h2');
    const p = header.querySelector('p');
    const divider = header.querySelector('.divider');

    if (overline) tl.fromTo(overline, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
    if (h2) tl.fromTo(h2, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.3');
    if (divider) tl.fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    if (p) tl.fromTo(p, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3');
  });

  // ── Story Section ──────────────────────────────────────────
  const storyIntro = document.querySelector('.story__intro');
  if (storyIntro) {
    gsap.fromTo('.story__intro-content', { x: -60, opacity: 0 }, {
      scrollTrigger: {
        trigger: storyIntro,
        start: 'top 75%',
        once: true
      },
      x: 0, opacity: 1, duration: 1, ease: 'power3.out'
    });

    gsap.fromTo('.story__vision-cards', { x: 60, opacity: 0 }, {
      scrollTrigger: {
        trigger: storyIntro,
        start: 'top 75%',
        once: true
      },
      x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2
    });
  }

  // Timeline milestones
  gsap.utils.toArray('.story__milestone').forEach((milestone, i) => {
    const direction = i % 2 === 0 ? -1 : 1;
    const content = milestone.querySelector('.story__milestone-content');
    const year = milestone.querySelector('.story__milestone-year');
    const dot = milestone.querySelector('.story__milestone-dot');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: milestone,
        start: 'top 80%',
        once: true
      }
    });

    if (dot) tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    if (year) tl.fromTo(year, { x: direction * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, '-=0.2');
    if (content) tl.fromTo(content, { x: direction * -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, '-=0.4');
  });

  // ── Services Cards ─────────────────────────────────────────
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.fromTo(card, { y: 60, opacity: 0 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay: i % 4 * 0.1,
      ease: 'power3.out'
    });
  });

  // ── Coverage Section ───────────────────────────────────────
  const coverageMap = document.querySelector('.coverage__map-container');
  if (coverageMap) {
    gsap.fromTo(coverageMap, { scale: 0.9, opacity: 0 }, {
      scrollTrigger: {
        trigger: coverageMap,
        start: 'top 80%',
        once: true
      },
      scale: 1, opacity: 1, duration: 1, ease: 'power3.out'
    });
  }

  gsap.utils.toArray('.coverage__city-tag').forEach((tag, i) => {
    gsap.fromTo(tag, { y: 20, opacity: 0 }, {
      scrollTrigger: {
        trigger: tag,
        start: 'top 90%',
        once: true
      },
      y: 0, opacity: 1, duration: 0.5, delay: i * 0.05, ease: 'power3.out'
    });
  });

  // ── Project Cards ──────────────────────────────────────────
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.fromTo(card, { y: 50, opacity: 0 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      },
      y: 0, opacity: 1, duration: 0.8, delay: i * 0.1, ease: 'power3.out'
    });
  });

  // ── Leadership Cards ───────────────────────────────────────
  gsap.utils.toArray('.leader-card').forEach((card, i) => {
    gsap.fromTo(card, { y: 50, scale: 0.95, opacity: 0 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      },
      y: 0, scale: 1, opacity: 1, duration: 0.8, delay: i * 0.15, ease: 'power3.out'
    });
  });

  // ── Feature Cards ──────────────────────────────────────────
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.fromTo(card, { y: 40, opacity: 0 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        once: true
      },
      y: 0, opacity: 1, duration: 0.6, delay: i * 0.06, ease: 'power3.out'
    });
  });

  // ── Testimonial ────────────────────────────────────────────
  const testimonialSection = document.querySelector('.testimonials');
  if (testimonialSection) {
    gsap.fromTo('.testimonials__carousel', { y: 40, opacity: 0 }, {
      scrollTrigger: {
        trigger: testimonialSection,
        start: 'top 75%',
        once: true
      },
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
    });
  }

  // ── Contact Section ────────────────────────────────────────
  const contactSection = document.querySelector('.contact, .luxury-contact');
  if (contactSection) {
    gsap.fromTo('.contact__form-wrapper, .luxury-contact__panel', {
      x: -50, opacity: 0
    }, {
      scrollTrigger: {
        trigger: contactSection,
        start: 'top 75%',
        once: true
      },
      x: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
    });

    gsap.fromTo('.contact__info, .luxury-contact__info-grid > div', {
      x: 50, opacity: 0
    }, {
      scrollTrigger: {
        trigger: contactSection,
        start: 'top 75%',
        once: true
      },
      x: 0, opacity: 1, duration: 0.8, delay: 0.2, stagger: 0.15, ease: 'power3.out'
    });
  }

  // ── Parallax Effects ───────────────────────────────────────
  const heroShapes = gsap.utils.toArray('.hero__shape');
  if (heroShapes.length > 0) {
    heroShapes.forEach((shape, i) => {
      gsap.to(shape, {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: (i + 1) * -80,
        rotation: (i + 1) * 15,
        ease: 'none'
      });
    });
  }

  // ── Process Timeline Animation ─────────────────────────────
  const timelineSteps = gsap.utils.toArray('.timeline-step');
  if (timelineSteps.length > 0) {
    timelineSteps.forEach((step, i) => {
      // 1. Fade up the step content
      gsap.fromTo(step.querySelector('.timeline-content'), {
        y: 40, opacity: 0
      }, {
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          once: true
        },
        y: 0, opacity: 1,
        duration: 0.8,
        ease: 'power3.out'
      });

      // 2. Animate the node and connecting line
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          step.classList.add('is-active');
          if (i < timelineSteps.length - 1) {
            step.classList.add('is-line-active');
          }
        }
      });
    });
  }

  // ── Footer Animation ───────────────────────────────────────
  const footer = document.querySelector('.luxury-footer');
  if (footer) {
    gsap.fromTo('.luxury-footer__top > *', {
      y: 30, opacity: 0
    }, {
      scrollTrigger: {
        trigger: footer,
        start: 'top 85%',
        once: true
      },
      y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out'
    });
  }
}
