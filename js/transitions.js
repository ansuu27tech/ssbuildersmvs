/**
 * SS BUILDERS MVS — Section Entrance Animations
 * Safe reveal pattern: uses fromTo with once:true to guarantee
 * sections always end at opacity:1 and y:0, even on fast scroll.
 */

(function() {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Section entrance animations have been removed to prevent conflicts with animations.js 
  // and to avoid breaking ScrollTrigger calculations by animating the parent section's Y position.

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
