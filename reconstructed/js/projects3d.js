/**
 * SS BUILDERS MVS — 3D Tilt Cards for Projects
 * Pure CSS/JS perspective tilt with glass reflection overlay
 */

(function() {
  'use strict';

  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  cards.forEach(card => {
    // Add reflection overlay
    const reflection = document.createElement('div');
    reflection.className = 'project-card__reflection';
    card.appendChild(reflection);

    // Add depth shadow element
    const shadow = document.createElement('div');
    shadow.className = 'project-card__depth-shadow';
    card.insertBefore(shadow, card.firstChild);

    let rafId = null;
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt (max ±8°)
      targetX = ((y - centerY) / centerY) * -8;
      targetY = ((x - centerX) / centerX) * 8;

      // Move reflection with mouse
      const reflectX = (x / rect.width) * 100;
      const reflectY = (y / rect.height) * 100;
      reflection.style.background = `radial-gradient(circle at ${reflectX}% ${reflectY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
      reflection.style.opacity = '1';

      if (!rafId) {
        rafId = requestAnimationFrame(updateTilt);
      }
    });

    card.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, { scale: 1.03, duration: 0.4, ease: 'power2.out' });
      } else {
        card.style.transform += ' scale(1.03)';
      }
    });

    card.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      reflection.style.opacity = '0';

      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotateX: 0, rotateY: 0, scale: 1,
          duration: 0.6, ease: 'power3.out',
          onComplete: () => {
            card.style.transform = '';
          }
        });
      } else {
        card.style.transform = '';
      }

      cancelAnimationFrame(rafId);
      rafId = null;
    });

    function updateTilt() {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      card.style.transform = `perspective(800px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale(1.03)`;
      
      // Dynamic shadow
      const shadowX = -currentY * 2;
      const shadowY = currentX * 2;
      shadow.style.transform = `translate(${shadowX}px, ${shadowY + 10}px)`;

      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        rafId = requestAnimationFrame(updateTilt);
      } else {
        rafId = null;
      }
    }
  });
})();
