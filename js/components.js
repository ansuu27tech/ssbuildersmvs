/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — Interactive Components
   ═══════════════════════════════════════════════════════════════ */

function initComponents() {

  // ══════════════════════════════════════════════════════════════
  // TESTIMONIALS CAROUSEL
  // ══════════════════════════════════════════════════════════════
  const carousel = document.querySelector('.testimonials__carousel');
  if (carousel) {
    const track = carousel.querySelector('.testimonials__track');
    const slides = track ? track.querySelectorAll('.testimonial-card') : [];
    const dots = carousel.parentElement.querySelectorAll('.testimonials__dot');
    const prevBtn = carousel.parentElement.querySelector('.testimonials__btn--prev');
    const nextBtn = carousel.parentElement.querySelector('.testimonials__btn--next');
    let currentSlide = 0;
    let autoplayInterval;
    const totalSlides = slides.length;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentSlide = index;

      if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
      }

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startAutoplay() {
      autoplayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stopAutoplay(); goToSlide(i); startAutoplay(); });
    });

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    if (track) {
      track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      }, { passive: true });

      track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) nextSlide();
        else if (touchEndX - touchStartX > 50) prevSlide();
        startAutoplay();
      }, { passive: true });
    }

    // Start autoplay
    if (totalSlides > 1) startAutoplay();

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
  }

  // ══════════════════════════════════════════════════════════════
  // CONTACT FORM
  // ══════════════════════════════════════════════════════════════
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      let isValid = true;
      const required = contactForm.querySelectorAll('[required]');
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          isValid = false;
          setTimeout(() => {
            field.style.borderColor = '';
          }, 3000);
        }
      });

      if (!isValid) return;

      // Show success state
      const submitBtn = contactForm.querySelector('.btn--primary');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '✓ Message Sent Successfully!';
        submitBtn.style.background = '#10b981';
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          contactForm.reset();
        }, 3000);
      }
    });

    // Focus effects
    const inputs = contactForm.querySelectorAll('.form-input, .form-textarea, .form-select');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // STAR RATING ANIMATION (Testimonials)
  // ══════════════════════════════════════════════════════════════
  const starContainers = document.querySelectorAll('.testimonial-card__stars');
  if (starContainers.length > 0 && typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stars = entry.target.querySelectorAll('.testimonial-card__star');
          stars.forEach((star, i) => {
            star.style.animation = `starFill 0.5s ${i * 0.1}s ease-out forwards`;
            star.style.opacity = '0';
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    starContainers.forEach(container => observer.observe(container));
  }

  // ══════════════════════════════════════════════════════════════
  // NAVBAR CTA SCROLL
  // ══════════════════════════════════════════════════════════════
  const navCTA = document.querySelector('.navbar__cta');
  if (navCTA) {
    navCTA.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#contact');
      if (target) {
        const offset = document.querySelector('.navbar').offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // INTERSECTION OBSERVER FOR REVEALS
  // ══════════════════════════════════════════════════════════════
  if (typeof IntersectionObserver !== 'undefined') {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  // ══════════════════════════════════════════════════════════════
  // CLICK-TO-CALL / WHATSAPP TRACKING
  // ══════════════════════════════════════════════════════════════
  document.querySelectorAll('a[href^="tel:"], a[href^="https://wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      // TODO: Add Google Analytics / GTM tracking event here for contact interactions
    });
  });
}
