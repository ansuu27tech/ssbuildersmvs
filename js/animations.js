/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — GSAP ScrollTrigger Animations
   Safe for re-initialization: all ScrollTriggers use once:true
   and clearProps:'all' to guarantee final visible state.
   ═══════════════════════════════════════════════════════════════ */

function initGSAPAnimations() {
  // Check GSAP availability
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded, using CSS fallback');
    document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('revealed'); });
    // Force all section headers visible as fallback
    document.querySelectorAll('.section-header, .section-header *').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Helper: Split Text into Characters for Flip Effect ──────
  function splitTextToChars(selector) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function(el) {
      if (el.classList.contains('split-done')) return;
      var text = el.textContent;
      el.textContent = '';
      for (var i = 0; i < text.length; i++) {
        var char = text[i];
        var span = document.createElement('span');
        span.innerHTML = char === ' ' ? '&nbsp;' : char;
        span.style.display = 'inline-block';
        span.classList.add('char');
        el.appendChild(span);
      }
      el.classList.add('split-done');
    });
  }

  // Split the hero title words into characters
  if (document.querySelector('.hero') && !document.querySelector('.ch')) {
    splitTextToChars('.hero__title-word');

    // ── Hero Animations ────────────────────────────────────────
    var heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
      .fromTo('.hero__overline', {
        y: 30, opacity: 0
      }, {
        y: 0, opacity: 1, clearProps: "all", duration: 0.8, ease: 'power3.out'
      })
      .fromTo('.hero__title .char', {
        transformPerspective: 500,
        rotateX: -90,
        y: 40,
        opacity: 0
      }, {
        rotateX: 0,
        y: 0,
        opacity: 1, clearProps: "all",
        duration: 0.8,
        ease: 'back.out(1.7)',
        stagger: 0.03
      }, '-=0.4')
      .fromTo('.hero__subtitle', {
        y: 30, opacity: 0
      }, {
        y: 0, opacity: 1, clearProps: "all", duration: 0.8, ease: 'power3.out'
      }, '-=0.5')
      .fromTo('.hero__actions .btn', {
        y: 20, opacity: 0
      }, {
        y: 0, opacity: 1, clearProps: "all", duration: 0.6, ease: 'power3.out',
        stagger: 0.1
      }, '-=0.4')
      .fromTo('.hero__price-tag', {
        y: 20, opacity: 0
      }, {
        y: 0, opacity: 1, clearProps: "all", duration: 0.6, ease: 'power3.out'
      }, '-=0.3')
      .fromTo('.hero__stats', {
        x: 60, opacity: 0
      }, {
        x: 0, opacity: 1, clearProps: "all", duration: 1, ease: 'power3.out'
      }, '-=0.8')
      .fromTo('.hero__stat', {
        y: 30, opacity: 0
      }, {
        y: 0, opacity: 1, clearProps: "all", duration: 0.6, ease: 'power3.out',
        stagger: 0.1
      }, '-=0.5')
      .fromTo('.hero__scroll', {
        y: 20, opacity: 0
      }, {
        y: 0, opacity: 1, clearProps: "all", duration: 0.6, ease: 'power3.out'
      }, '-=0.3');
  }

  // ── Counter Animation ──────────────────────────────────────
  var counters = document.querySelectorAll('.hero__stat-number, .counter-val');
  counters.forEach(function(counter) {
    var target = parseFloat(counter.getAttribute('data-target'));
    var suffix = counter.getAttribute('data-suffix') || '';

    // Reset counter to 0 for re-init
    counter.textContent = '0';

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 90%',
      once: true,
      onEnter: function() {
        var counterObj = { val: 0 };
        gsap.to(counterObj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            counter.textContent = (target % 1 !== 0 ? counterObj.val.toFixed(1) : Math.floor(counterObj.val)) + suffix;
          }
        });
      }
    });
  });

  // ── Section Header Reveals ─────────────────────────────────
  // CRITICAL FIX: Use onComplete to force final visible state
  gsap.utils.toArray('.section-header').forEach(function(header) {
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 90%',
        once: true
      }
    });

    var overline = header.querySelector('.text-overline');
    var heading = header.querySelector('h1, h2, h3, h4');
    var p = header.querySelector('p');
    var divider = header.querySelector('.divider');

    if (overline) tl.fromTo(overline, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' });
    if (heading) tl.fromTo(heading, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', clearProps: 'all' }, tl.duration() > 0 ? '-=0.3' : 0);
    if (divider) tl.fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out', clearProps: 'all' }, tl.duration() > 0 ? '-=0.4' : 0);
    if (p) tl.fromTo(p, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' }, tl.duration() > 0 ? '-=0.3' : 0);
  });

  // ── Story Section ──────────────────────────────────────────
  var storyIntro = document.querySelector('.story__intro');
  if (storyIntro) {
    gsap.fromTo('.story__intro-content', { x: -60, opacity: 0 }, {
      scrollTrigger: {
        trigger: storyIntro,
        start: 'top 75%',
        once: true
      },
      x: 0, opacity: 1, clearProps: "all", duration: 1, ease: 'power3.out'
    });

    gsap.fromTo('.story__vision-cards', { x: 60, opacity: 0 }, {
      scrollTrigger: {
        trigger: storyIntro,
        start: 'top 75%',
        once: true
      },
      x: 0, opacity: 1, clearProps: "all", duration: 1, ease: 'power3.out', delay: 0.2
    });
  }

  // Timeline milestones
  gsap.utils.toArray('.story__milestone').forEach(function(milestone, i) {
    var direction = i % 2 === 0 ? -1 : 1;
    var content = milestone.querySelector('.story__milestone-content');
    var year = milestone.querySelector('.story__milestone-year');
    var dot = milestone.querySelector('.story__milestone-dot');

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: milestone,
        start: 'top 80%',
        once: true
      }
    });

    if (dot) tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    if (year) tl.fromTo(year, { x: direction * 40, opacity: 0 }, { x: 0, opacity: 1, clearProps: "all", duration: 0.6 }, tl.recent() ? '-=0.2' : 0);
    if (content) tl.fromTo(content, { x: direction * -40, opacity: 0 }, { x: 0, opacity: 1, clearProps: "all", duration: 0.6 }, tl.recent() ? '-=0.4' : 0);
  });

  // ── Services Cards ─────────────────────────────────────────
  gsap.utils.toArray('.service-card').forEach(function(card, i) {
    gsap.fromTo(card, { y: 60, opacity: 0 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      },
      y: 0,
      opacity: 1, clearProps: "all",
      duration: 0.8,
      delay: i % 4 * 0.1,
      ease: 'power3.out'
    });
  });

  // ── Coverage Section ───────────────────────────────────────
  var coverageMap = document.querySelector('.coverage__map-container');
  if (coverageMap) {
    gsap.fromTo(coverageMap, { scale: 0.9, opacity: 0 }, {
      scrollTrigger: {
        trigger: coverageMap,
        start: 'top 80%',
        once: true
      },
      scale: 1, opacity: 1, clearProps: "all", duration: 1, ease: 'power3.out'
    });
  }

  gsap.utils.toArray('.coverage__city-tag').forEach(function(tag, i) {
    gsap.fromTo(tag, { y: 20, opacity: 0 }, {
      scrollTrigger: {
        trigger: tag,
        start: 'top 90%',
        once: true
      },
      y: 0, opacity: 1, clearProps: "all", duration: 0.5, delay: i * 0.05, ease: 'power3.out'
    });
  });

  // ── Project Cards ──────────────────────────────────────────
  gsap.utils.toArray('.project-card').forEach(function(card, i) {
    gsap.fromTo(card, { y: 50, opacity: 0 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      },
      y: 0, opacity: 1, clearProps: "all", duration: 0.8, delay: i * 0.1, ease: 'power3.out'
    });
  });

  // ── Leadership Cards ───────────────────────────────────────
  gsap.utils.toArray('.leader-card').forEach(function(card, i) {
    gsap.fromTo(card, { y: 50, scale: 0.95, opacity: 0 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      },
      y: 0, scale: 1, opacity: 1, clearProps: "all", duration: 0.8, delay: i * 0.15, ease: 'power3.out'
    });
  });

  // ── Feature Cards ──────────────────────────────────────────
  gsap.utils.toArray('.feature-card').forEach(function(card, i) {
    gsap.fromTo(card, { y: 40, opacity: 0 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        once: true
      },
      y: 0, opacity: 1, clearProps: "all", duration: 0.6, delay: i * 0.06, ease: 'power3.out'
    });
  });

  // ── Testimonial ────────────────────────────────────────────
  var testimonialSection = document.querySelector('.testimonials');
  var carousel = document.querySelector('.testimonials__carousel');
  if (testimonialSection && carousel) {
    gsap.fromTo(carousel, { y: 40, opacity: 0 }, {
      scrollTrigger: {
        trigger: testimonialSection,
        start: 'top 75%',
        once: true
      },
      y: 0, opacity: 1, clearProps: "all", duration: 0.8, ease: 'power3.out'
    });
  }

  // ── Contact Section ────────────────────────────────────────
  // CRITICAL: This is the section where "Start Your Dream Home Journey" disappears.
  // We must ensure the section header and all children are always revealed.
  var contactSection = document.querySelector('.contact, .luxury-contact');
  var formWrapper = document.querySelector('.contact__form-wrapper, .luxury-contact__panel');
  var infoGrid = document.querySelector('.contact__info, .luxury-contact__info-grid > div');
  if (contactSection) {
    if (formWrapper) {
      gsap.fromTo(formWrapper, {
        x: -50, opacity: 0
      }, {
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 75%',
          once: true
        },
        x: 0, opacity: 1, clearProps: "all", duration: 0.8, ease: 'power3.out'
      });
    }

    if (infoGrid) {
      gsap.fromTo(infoGrid, {
        x: 50, opacity: 0
      }, {
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 75%',
          once: true
        },
        x: 0, opacity: 1, clearProps: "all", duration: 0.8, delay: 0.2, stagger: 0.15, ease: 'power3.out'
      });
    }
  }

  // ── Parallax Effects ───────────────────────────────────────
  var heroShapes = gsap.utils.toArray('.hero__shape');
  if (heroShapes.length > 0) {
    heroShapes.forEach(function(shape, i) {
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
  var timelineSteps = gsap.utils.toArray('.timeline-step');
  if (timelineSteps.length > 0) {
    timelineSteps.forEach(function(step, i) {
      // 1. Fade up the step content
      var timelineContent = step.querySelector('.timeline-content');
      if (timelineContent) {
        gsap.fromTo(timelineContent, {
          y: 40, opacity: 0
        }, {
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            once: true
          },
          y: 0, opacity: 1, clearProps: "all",
          duration: 0.8,
          ease: 'power3.out'
        });
      }

      // 2. Animate the node and connecting line
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        once: true,
        onEnter: function() {
          step.classList.add('is-active');
          if (i < timelineSteps.length - 1) {
            step.classList.add('is-line-active');
          }
        }
      });
    });
  }

  // ── Bento Cards ────────────────────────────────────────────
  gsap.utils.toArray('.bento-card').forEach(function(card, i) {
    gsap.fromTo(card, { y: 40, opacity: 0, scale: 0.96 }, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        once: true
      },
      y: 0, opacity: 1, scale: 1, clearProps: "all",
      duration: 0.7,
      delay: i * 0.06,
      ease: 'power3.out'
    });
  });

  // ── Footer Animation ───────────────────────────────────────
  var footer = document.querySelector('.luxury-footer');
  if (footer) {
    gsap.fromTo('.luxury-footer__top > *', {
      y: 30, opacity: 0
    }, {
      scrollTrigger: {
        trigger: footer,
        start: 'top 85%',
        once: true
      },
      y: 0, opacity: 1, clearProps: "all", duration: 0.6, stagger: 0.1, ease: 'power3.out'
    });
  }
}
