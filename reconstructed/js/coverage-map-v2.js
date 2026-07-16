/* ═══════════════════════════════════════════════════════════
   COVERAGE MAP — Interactive Premium Experience
   SS BUILDERS MVS
   ═══════════════════════════════════════════════════════════ */
;(function () {
  'use strict';

  /* ── City Data ── */
  const CITY_DATA = {
    chennai: {
      name: 'Chennai',
      subtitle: 'Metropolitan Hub — Tamil Nadu Capital',
      distance: '130 km',
      time: '45–60 min',
      visit: 'Mon – Sat (By Appointment)',
      services: ['Residential Projects', 'Commercial Projects', 'Luxury Villas', 'Interior Design', 'Exterior Design', 'Turnkey Projects']
    },
    walajah: {
      name: 'Walajah',
      subtitle: 'Strategic Town — Ranipet District',
      distance: '15 km',
      time: '15–20 min',
      visit: 'Mon – Sat (Walk-in & Appointment)',
      services: ['Residential Projects', 'Commercial Projects', 'Interior Design', 'Exterior Design', 'Renovations']
    },
    ranipet: {
      name: 'Ranipet',
      subtitle: 'Industrial Town — Growing Market',
      distance: '5 km',
      time: '10–15 min',
      visit: 'Mon – Sat (Walk-in Welcome)',
      services: ['Residential Projects', 'Commercial Projects', 'Luxury Villas', 'Interior Design', 'Exterior Design', 'Renovations']
    },
    arcot: {
      name: 'Arcot',
      subtitle: 'Heritage Town — Near Headquarters',
      distance: '2 km',
      time: '5–10 min',
      visit: 'Mon – Sat (Walk-in Welcome)',
      services: ['Residential Projects', 'Commercial Projects', 'Interior Design', 'Exterior Design', 'Renovations', 'Structural Consulting']
    },
    melvisharam: {
      name: 'Melvisharam',
      subtitle: '🏢 Headquarters — Command Center',
      distance: '0 km (HQ)',
      time: 'Immediate',
      visit: 'Mon – Sat (Always Available)',
      services: ['Residential Projects', 'Commercial Projects', 'Luxury Villas', 'Interior Design', 'Exterior Design', 'Renovations', 'Turnkey Projects', 'Structural Consulting']
    },
    vellore: {
      name: 'Vellore',
      subtitle: 'Fort City — Education Hub',
      distance: '20 km',
      time: '20–30 min',
      visit: 'Mon – Sat (By Appointment)',
      services: ['Residential Projects', 'Commercial Projects', 'Luxury Villas', 'Interior Design', 'Exterior Design']
    },
    ambur: {
      name: 'Ambur',
      subtitle: 'Leather City — Industrial Center',
      distance: '45 km',
      time: '30–40 min',
      visit: 'Mon – Fri (By Appointment)',
      services: ['Residential Projects', 'Commercial Projects', 'Interior Design', 'Exterior Design', 'Renovations']
    },
    vaniyambadi: {
      name: 'Vaniyambadi',
      subtitle: 'Hill Town — Northern Gateway',
      distance: '65 km',
      time: '40–50 min',
      visit: 'Mon – Fri (By Appointment)',
      services: ['Residential Projects', 'Commercial Projects', 'Interior Design', 'Renovations']
    },
    bengaluru: {
      name: 'Bengaluru',
      subtitle: 'Silicon Valley of India — Tech Capital',
      distance: '210 km',
      time: '60–90 min',
      visit: 'By Appointment Only',
      services: ['Residential Projects', 'Commercial Projects', 'Luxury Villas', 'Interior Design', 'Exterior Design', 'Turnkey Projects']
    }
  };

  const SERVICE_ICONS = {
    'Residential Projects': '🏠',
    'Commercial Projects': '🏢',
    'Luxury Villas': '🏰',
    'Interior Design': '🎨',
    'Exterior Design': '🏗️',
    'Renovations': '🔨',
    'Turnkey Projects': '🔑',
    'Structural Consulting': '📐'
  };

  /* ── DOM References ── */
  const mapContainer = document.getElementById('coverage-map-container');
  const mapImg = document.getElementById('coverage-map-img');
  const mapLabels = document.getElementById('coverage-map-labels');
  const panel = document.getElementById('map-info-panel');
  const panelClose = document.getElementById('map-info-close');
  const overlay = document.getElementById('cmap-overlay'); // might not exist but leaving it
  const particlesContainer = document.getElementById('cmap-particles');
  const markers = document.querySelectorAll('.city-marker');
  const cityTags = document.querySelectorAll('[data-city-link]');

  if (!mapContainer || !panel) return;

  let activeCity = null;
  let isOpen = false;

  /* ── Particles System ── */
  function createParticles() {
    if (!particlesContainer) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('span');
      p.className = 'cmap__particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = (6 + Math.random() * 8) + 's';
      p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
      particlesContainer.appendChild(p);
    }
  }

  /* ── Parallax on Mouse Move ── */
  function initParallax() {
    mapContainer.addEventListener('mousemove', function (e) {
      if (isOpen) return;
      const rect = mapContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      if (mapImg) {
        mapImg.style.transform = 'scale(1.03) translate(' + (x * -8) + 'px, ' + (y * -8) + 'px)';
      }
      if (mapLabels) {
        mapLabels.style.transform = 'translate(' + (x * -4) + 'px, ' + (y * -4) + 'px)';
      }
    });

    mapContainer.addEventListener('mouseleave', function () {
      if (mapImg) mapImg.style.transform = 'scale(1)';
      if (mapLabels) mapLabels.style.transform = 'translate(0, 0)';
    });
  }

  /* ── Panel Tilt Effect (Disabled for UI stability) ── */
  function initPanelTilt() {
    // Disabled: 3D tilting makes the close button move away from the mouse
    // causing a frustrating UX where the button is hard to click.
  }

  /* ── Open City Panel ── */
  function openPanel(cityKey) {
    const data = CITY_DATA[cityKey];
    if (!data) return;

    // If same city clicked again, close it
    if (isOpen && activeCity === cityKey) {
      closePanel();
      return;
    }

    const wasOpen = isOpen;
    activeCity = cityKey;
    isOpen = true;

    // Update active state on markers
    markers.forEach(function (m) {
      m.classList.toggle('active', m.dataset.city === cityKey);
    });
    cityTags.forEach(function (t) {
      t.classList.toggle('active', t.dataset.cityLink === cityKey);
    });
    
    // Add dimming class to the map labels container
    if (mapLabels) mapLabels.classList.add('has-active-marker');

    // Populate panel
    var badge = document.getElementById('map-info-badge');
    badge.textContent = cityKey === 'melvisharam' ? '🏢 Headquarters' : '📍 Service Location';
    badge.className = 'map-info__badge' + (cityKey === 'melvisharam' ? ' map-info__badge--hq' : '');

    document.getElementById('map-info-city').textContent = data.name;
    document.getElementById('map-info-subtitle').textContent = data.subtitle;
    document.getElementById('map-info-distance').textContent = data.distance;
    document.getElementById('map-info-time').textContent = data.time;
    document.getElementById('map-info-visit').textContent = data.visit;

    // Services grid
    var servicesGrid = document.getElementById('map-info-services');
    if (servicesGrid) {
      servicesGrid.innerHTML = '';
      data.services.forEach(function (s) {
        var tag = document.createElement('span');
        tag.className = 'map-info__service-tag';
        tag.textContent = (SERVICE_ICONS[s] || '✓') + ' ' + s;
        servicesGrid.appendChild(tag);
      });
    }

    // Show panel
    panel.classList.add('visible');
    if (overlay) overlay.classList.add('visible');

    if (typeof gsap !== 'undefined') {
      if (wasOpen) {
        var panelContent = document.getElementById('map-info-panel');
        if (panelContent) {
          gsap.fromTo(panelContent, { opacity: 0.8 }, { opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: "opacity" });
        }
      }
    }

    // Zoom map image toward the selected city marker
    var marker = document.querySelector('[data-city="' + cityKey + '"]');
    if (marker && mapImg) {
      var mTop = parseFloat(marker.style.top) || 50;
      var mLeft = parseFloat(marker.style.left) || 50;
      var offsetX = (50 - mLeft) * 0.3;
      var offsetY = (50 - mTop) * 0.3;
      if (typeof gsap !== 'undefined') {
        gsap.to(mapImg, {
          scale: 1.15,
          x: offsetX + '%',
          y: offsetY + '%',
          duration: 0.8,
          ease: 'power2.out'
        });
      }
    }
  }

  /* ── Close Panel ── */
  function closePanel() {
    isOpen = false;
    activeCity = null;

    panel.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');

    markers.forEach(function (m) { m.classList.remove('active'); });
    cityTags.forEach(function (t) { t.classList.remove('active'); });
    
    // Remove dimming class
    if (mapLabels) mapLabels.classList.remove('has-active-marker');

    // Zoom back
    if (typeof gsap !== 'undefined' && mapImg) {
      gsap.to(mapImg, { scale: 1, x: 0, y: 0, duration: 0.6, ease: 'power2.inOut' });
    } else if (mapImg) {
      mapImg.style.transform = 'scale(1)';
    }
  }

  /* ── Event Listeners ── */
  // Marker clicks
  markers.forEach(function (marker) {
    marker.addEventListener('click', function (e) {
      e.stopPropagation();
      openPanel(marker.dataset.city);
    });
  });

  // City tag clicks (sidebar)
  cityTags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      openPanel(tag.dataset.cityLink);
    });
  });

  // Close button
  if (panelClose) {
    panelClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closePanel();
    });
  }

  // Click outside to close (document-level)
  document.addEventListener('click', function (e) {
    if (isOpen) closePanel();
  });

  // Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // Prevent panel clicks from closing
  panel.addEventListener('click', function (e) { e.stopPropagation(); });

  /* ── Initialize ── */
  createParticles();
  initParallax();
  initPanelTilt();

  // Floating marker animation (natural bob)
  markers.forEach(function (marker, i) {
    marker.style.animationDelay = (i * 0.3) + 's';
  });

})();
