/**
 * SS BUILDERS MVS — Section Entrance Animations
 * Safe reveal pattern: uses fromTo with once:true to guarantee
 * sections always end at opacity:1 and y:0, even on fast scroll.
 */

(function() {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ─── SECTION ENTRANCE ANIMATIONS ───────────────────────────────
  // Use fromTo instead of gsap.set + onEnter to prevent sections
  // from staying invisible if the trigger never fires.
  const sections = document.querySelectorAll('section.section');
  
  sections.forEach((section) => {
    // Skip the cinematic hero — it has its own GSAP pin system
    if (section.id === 'hero' || section.classList.contains('ch')) return;

    gsap.fromTo(section, {
      opacity: 0,
      y: 30
    }, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        once: true
      }
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

})();
