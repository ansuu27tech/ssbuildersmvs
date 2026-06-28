/**
 * SS BUILDERS MVS — Cinematic Page Transitions
 * Fade + blur + scale + depth section entrances
 */

(function() {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);

  // ─── SECTION ENTRANCE ANIMATIONS ───────────────────────────────
  const sections = document.querySelectorAll('section.section, section.hero');
  
  sections.forEach((section, i) => {
    // Skip hero — it has its own animations
    if (section.classList.contains('hero')) return;

    gsap.set(section, {
      opacity: 0,
      y: 50,
      scale: 0.97,
      filter: 'blur(6px)'
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      end: 'top 40%',
      onEnter: () => {
        gsap.to(section, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power3.out'
        });
      },
      once: true
    });
  });

  // ─── PARALLAX BACKGROUNDS ──────────────────────────────────────
  document.querySelectorAll('.blueprint-bg').forEach(el => {
    gsap.to(el, {
      backgroundPositionY: '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // ─── STAGGERED REVEAL FOR GRIDS ────────────────────────────────
  // Service cards
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length) {
    gsap.set(serviceCards, { opacity: 0, y: 40, scale: 0.95 });
    
    ScrollTrigger.create({
      trigger: '.services__grid',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(serviceCards, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out'
        });
      },
      once: true
    });
  }

  // Project cards
  const projectCards = document.querySelectorAll('.project-card');
  if (projectCards.length) {
    gsap.set(projectCards, { opacity: 0, y: 30, rotationY: -5 });
    
    ScrollTrigger.create({
      trigger: '#projects',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(projectCards, {
          opacity: 1, y: 0, rotationY: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out'
        });
      },
      once: true
    });
  }

  // Why-us cards
  const whyCards = document.querySelectorAll('.why-us__card');
  if (whyCards.length) {
    gsap.set(whyCards, { opacity: 0, x: (i) => i === 0 ? -60 : 60 });
    
    ScrollTrigger.create({
      trigger: '.why-us__versus',
      start: 'top 75%',
      onEnter: () => {
        gsap.to(whyCards, {
          opacity: 1, x: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out'
        });
      },
      once: true
    });
  }

  // ─── SECTION HEADERS ───────────────────────────────────────────
  document.querySelectorAll('.section-header').forEach(header => {
    const overline = header.querySelector('.text-overline');
    const h2 = header.querySelector('h2');
    const divider = header.querySelector('.divider');
    const p = header.querySelector('p');
    const elements = [overline, h2, divider, p].filter(Boolean);

    gsap.set(elements, { opacity: 0, y: 25 });

    ScrollTrigger.create({
      trigger: header,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(elements, {
          opacity: 1, y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out'
        });
      },
      once: true
    });
  });

  // ─── CONTACT CARDS STAGGER ─────────────────────────────────────
  const contactCards = document.querySelectorAll('.contact__card');
  if (contactCards.length) {
    gsap.set(contactCards, { opacity: 0, y: 30 });
    
    ScrollTrigger.create({
      trigger: '.contact__info',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(contactCards, {
          opacity: 1, y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out'
        });
      },
      once: true
    });
  }

  // ─── SMOOTH DEPTH COUNTER ANIMATION ────────────────────────────
  document.querySelectorAll('.hero__stat-number[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: function() {
            el.textContent = Math.floor(this.targets()[0].val) + suffix;
          }
        });
      },
      once: true
    });
  });

})();
