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