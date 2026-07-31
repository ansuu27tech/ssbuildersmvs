/* ═══════════════════════════════════════════════════════════════
   SS BUILDERS MVS — Interactive Components
   Safe for re-initialization: guards against duplicate listeners
   ═══════════════════════════════════════════════════════════════ */

// Track if components have been initialized to prevent duplicate listeners
var _componentsInitialized = false;
var _carouselAutoplayInterval = null;

function initComponents() {

  // ══════════════════════════════════════════════════════════════
  // TESTIMONIALS CAROUSEL
  // ══════════════════════════════════════════════════════════════
  var carousel = document.querySelector('.testimonials__carousel');
  if (carousel) {
    var track = carousel.querySelector('.testimonials__track');
    var slides = track ? track.querySelectorAll('.testimonial-card') : [];
    var dots = carousel.parentElement.querySelectorAll('.testimonials__dot');
    var prevBtn = carousel.parentElement.querySelector('.testimonials__btn--prev');
    var nextBtn = carousel.parentElement.querySelector('.testimonials__btn--next');
    var currentSlide = 0;
    var totalSlides = slides.length;

    // Clear any existing autoplay interval to prevent duplicates
    if (_carouselAutoplayInterval) {
      clearInterval(_carouselAutoplayInterval);
      _carouselAutoplayInterval = null;
    }

    // Reset carousel position
    if (track) {
      track.style.transform = 'translateX(0%)';
    }
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === 0);
    });

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentSlide = index;

      if (track) {
        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      }

      dots.forEach(function(dot, i) {
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
      if (_carouselAutoplayInterval) clearInterval(_carouselAutoplayInterval);
      _carouselAutoplayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
      if (_carouselAutoplayInterval) {
        clearInterval(_carouselAutoplayInterval);
        _carouselAutoplayInterval = null;
      }
    }

    // Only add event listeners if not already initialized
    if (!_componentsInitialized) {
      if (nextBtn) nextBtn.addEventListener('click', function() { stopAutoplay(); nextSlide(); startAutoplay(); });
      if (prevBtn) prevBtn.addEventListener('click', function() { stopAutoplay(); prevSlide(); startAutoplay(); });

      dots.forEach(function(dot, i) {
        dot.addEventListener('click', function() { stopAutoplay(); goToSlide(i); startAutoplay(); });
      });

      // Touch support
      var touchStartX = 0;
      var touchEndX = 0;

      if (track) {
        track.addEventListener('touchstart', function(e) {
          touchStartX = e.changedTouches[0].screenX;
          stopAutoplay();
        }, { passive: true });

        track.addEventListener('touchend', function(e) {
          touchEndX = e.changedTouches[0].screenX;
          if (touchStartX - touchEndX > 50) nextSlide();
          else if (touchEndX - touchStartX > 50) prevSlide();
          startAutoplay();
        }, { passive: true });
      }

      // Pause on hover
      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', function() { if (totalSlides > 1) startAutoplay(); });
    }

    // Start autoplay (safe to call on re-init)
    if (totalSlides > 1) startAutoplay();
  }

  // ══════════════════════════════════════════════════════════════
  // CONTACT FORM
  // ══════════════════════════════════════════════════════════════
  if (!_componentsInitialized) {
    var contactForm = document.querySelector('#contactForm');
    if (contactForm) {
      var isSubmitting = false;
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Prevent double-submit
        if (isSubmitting) return;

        var formData = new FormData(contactForm);
        var data = Object.fromEntries(formData.entries());

        // Basic validation
        var isValid = true;
        var required = contactForm.querySelectorAll('[required]');
        required.forEach(function(field) {
          if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
            setTimeout(function() {
              field.style.borderColor = '';
            }, 3000);
          }
        });

        if (!isValid) return;

        isSubmitting = true;

        // Show success state
        var submitBtn = contactForm.querySelector('.btn--primary');
        if (submitBtn) {
          var originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '✓ Message Sent Successfully!';
          submitBtn.style.background = '#10b981';
          submitBtn.disabled = true;

          setTimeout(function() {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
            contactForm.reset();
            isSubmitting = false;
          }, 3000);
        } else {
          isSubmitting = false;
        }
      });

      // Focus effects
      var inputs = contactForm.querySelectorAll('.form-input, .form-textarea, .form-select');
      inputs.forEach(function(input) {
        input.addEventListener('focus', function() {
          input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', function() {
          input.parentElement.classList.remove('focused');
        });
      });

      // City-price hint (shows construction cost per sq.ft. for selected city)
      var citySelect = document.getElementById('city');
      var priceHint = document.getElementById('city-price-hint');
      if (citySelect && priceHint) {
        var prices = {
          'chennai': '₹2000/sq.ft.',
          'vellore': '₹1750/sq.ft.',
          'ranipet': '₹1650/sq.ft.',
          'walajah': '₹1650/sq.ft.',
          'arcot': '₹1650/sq.ft.',
          'bengaluru': '₹2100/sq.ft.'
        };
        citySelect.addEventListener('change', function(e) {
          var selected = e.target.value;
          if (prices[selected]) {
            priceHint.innerHTML = 'Construction Starts @ <strong>' + prices[selected] + '</strong>';
            priceHint.style.display = 'block';
          } else {
            priceHint.style.display = 'none';
          }
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // STAR RATING ANIMATION (Testimonials)
  // ══════════════════════════════════════════════════════════════
  if (!_componentsInitialized) {
    var starContainers = document.querySelectorAll('.testimonial-card__stars');
    if (starContainers.length > 0 && typeof IntersectionObserver !== 'undefined') {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var stars = entry.target.querySelectorAll('.testimonial-card__star');
            stars.forEach(function(star, i) {
              star.style.animation = 'starFill 0.5s ' + (i * 0.1) + 's ease-out forwards';
              star.style.opacity = '0';
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      starContainers.forEach(function(container) { observer.observe(container); });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // NAVBAR CTA SCROLL
  // ══════════════════════════════════════════════════════════════
  if (!_componentsInitialized) {
    var navCTA = document.querySelector('.navbar__cta');
    if (navCTA) {
      navCTA.addEventListener('click', function(e) {
        var target = document.querySelector('#contact');
        if (target) {
          // #contact exists on this page — smooth scroll to it
          e.preventDefault();
          var offset = document.querySelector('.navbar').offsetHeight;
          var top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        } else {
          // #contact doesn't exist (sub-page) — navigate to index.html#contact
          e.preventDefault();
          window.location.href = 'index.html#contact';
        }
      });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // INTERSECTION OBSERVER FOR REVEALS
  // ══════════════════════════════════════════════════════════════
  if (!_componentsInitialized) {
    if (typeof IntersectionObserver !== 'undefined' && typeof gsap === 'undefined') {
      var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CLICK-TO-CALL / WHATSAPP TRACKING
  // ══════════════════════════════════════════════════════════════
  if (!_componentsInitialized) {
    document.querySelectorAll('a[href^="tel:"], a[href^="https://wa.me"]').forEach(function(link) {
      link.addEventListener('click', function() {
        // TODO: Add Google Analytics / GTM tracking event here for contact interactions
      });
    });
  }

  // Mark as initialized to prevent duplicate event listeners
  _componentsInitialized = true;
}
