/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — Premium Custom Cursor
   Glowing magnetic cursor with contextual states
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // Skip on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  document.documentElement.classList.add('has-custom-cursor');

  // Create cursor elements
  const ring = document.createElement('div');
  ring.className = 'custom-cursor__ring';
  document.body.appendChild(ring);

  const dot = document.createElement('div');
  dot.className = 'custom-cursor__dot';
  document.body.appendChild(dot);

  // Cursor state
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let dotX = -100, dotY = -100;
  let isHovering = false;
  let isOn3D = false;
  let isClicking = false;
  let magnetTarget = null;

  // Mouse move
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Magnetic effect on buttons
    if (magnetTarget) {
      const rect = magnetTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 80;

      if (dist < maxDist) {
        const pull = 1 - (dist / maxDist);
        const offsetX = dx * pull * 0.3;
        const offsetY = dy * pull * 0.3;
        magnetTarget.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      } else {
        magnetTarget.style.transform = '';
      }
    }
  });

  // Click states
  document.addEventListener('mousedown', () => {
    isClicking = true;
    ring.classList.add('clicking');
    dot.classList.add('clicking');
  });

  document.addEventListener('mouseup', () => {
    isClicking = false;
    ring.classList.remove('clicking');
    dot.classList.remove('clicking');
  });

  // Hover detection
  document.addEventListener('mouseover', (e) => {
    const target = e.target;

    // Check for interactive elements
    const interactive = target.closest('a, button, .btn, .service-card__cta, .navbar__link, .navbar__cta, input, select, textarea, .project-card');
    if (interactive) {
      isHovering = true;
      ring.classList.add('hovering');
      dot.classList.add('hovering');

      // Magnetic effect for buttons
      if (interactive.matches('.btn, .navbar__cta, .service-card__cta, button, .navbar__link')) {
        magnetTarget = interactive;
      }
    }

    // Check for 3D canvases
    if (target.tagName === 'CANVAS' || target.closest('[id$="-3d"]')) {
      isOn3D = true;
      ring.classList.add('on-3d');
      dot.classList.add('on-3d');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target;
    const interactive = target.closest('a, button, .btn, .service-card__cta, .navbar__link, .navbar__cta, input, select, textarea, .project-card');
    
    if (interactive) {
      isHovering = false;
      ring.classList.remove('hovering');
      dot.classList.remove('hovering');

      if (magnetTarget) {
        magnetTarget.style.transform = '';
        magnetTarget = null;
      }
    }

    if (target.tagName === 'CANVAS' || target.closest('[id$="-3d"]')) {
      isOn3D = false;
      ring.classList.remove('on-3d');
      dot.classList.remove('on-3d');
    }
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0';
    dot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    ring.style.opacity = '1';
    dot.style.opacity = '1';
  });

  // Animation loop
  function animateCursor() {
    // Dot follows mouse tightly
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    // Ring trails behind with smooth easing
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
})();
