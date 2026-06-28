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
      y: 30
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      end: 'top 40%',
      onEnter: () => {
        gsap.to(section, {
          opacity: 1,
          y: 0,
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



})();
