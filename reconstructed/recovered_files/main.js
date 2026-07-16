  }

  // Smooth scroll to section (handles both anchor links and page links)
  function scrollToSection(e) {
    const href = this.getAttribute('href');
    if (!href) return;

    // Close mobile menu first if open
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }

    // External page links (e.g., process.html, gallery.html) — let browser navigate
    if (!href.startsWith('#')) {
      // Clear any stuck overflow before navigating
      document.body.style.overflow = '';
      return; // Don't preventDefault — allow normal navigation
    }

    // Anchor links — smooth scroll
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = navbar.offsetHeight;
      if (lenis) {
        lenis.scrollTo(target, { offset: -offset, duration: 1.5 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }