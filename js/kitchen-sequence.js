/**
 * SS BUILDERS MVS — Modular Kitchen Scroll Sequence Engine
 * Canvas-based, scroll-driven image sequence with GSAP ScrollTrigger
 * 
 * Architecture:
 *   1. IntersectionObserver triggers intelligent preloading
 *   2. GSAP ScrollTrigger pins section + maps scroll → frame index
 *   3. requestAnimationFrame renders only on frame change
 *   4. Text overlays driven by scroll progress thresholds
 */

(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────────────────── */
  const CONFIG = {
    frameCount: 150,
    framePath: '1000211928_frames/frame_',
    frameExt: '.jpg',
    scrubSmoothing: 0.5,       // GSAP scrub easing (seconds)
    scrollMultiplier: 5,       // Pin duration = scrollMultiplier × viewport height
    preloadBatchSize: 15,      // Frames loaded per batch
    priorityFrames: 12,        // First N frames loaded immediately
    canvasAspect: 1280 / 720,  // Source frame aspect ratio

    // Text timeline (progress values 0–1)
    text: {
      phase1: { start: 0.00, peak: 0.03, fadeEnd: 0.14 },
      phase2: { start: 0.28, peak: 0.33, fadeEnd: 0.52 },
      phase3: { start: 0.58, peak: 0.63, fadeEnd: 1.00 },
      scroll: { start: 0.00, fadeEnd: 0.06 }
    }
  };

  /* ── State ──────────────────────────────────────────────────── */
  const state = {
    frames: new Array(CONFIG.frameCount),
    loadedCount: 0,
    currentFrame: -1,
    isReady: false,
    rafId: null,
    ctx: null,
    canvas: null,
    section: null,
    destroyed: false
  };

  /* ── DOM References ─────────────────────────────────────────── */
  let els = {};

  /* ── Utilities ──────────────────────────────────────────────── */
  function padNumber(n) {
    return String(n).padStart(3, '0');
  }

  function frameSrc(index) {
    return CONFIG.framePath + padNumber(index + 1) + CONFIG.frameExt;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
  }

  /* ── Image Preloader ────────────────────────────────────────── */
  function loadImage(index) {
    return new Promise((resolve) => {
      if (state.frames[index] && state.frames[index].complete) {
        resolve();
        return;
      }
      const img = new Image();
      img.onload = () => {
        state.frames[index] = img;
        state.loadedCount++;
        updateLoader();
        resolve();
      };
      img.onerror = () => {
        // On error, try once more then skip
        const retry = new Image();
        retry.onload = () => {
          state.frames[index] = retry;
          state.loadedCount++;
          updateLoader();
          resolve();
        };
        retry.onerror = () => resolve();
        retry.src = frameSrc(index);
      };
      img.src = frameSrc(index);
    });
  }

  function updateLoader() {
    const fill = els.loaderFill;
    if (!fill) return;
    const pct = (state.loadedCount / CONFIG.frameCount) * 100;
    fill.style.width = pct + '%';
  }

  async function preloadFrames() {
    // Priority: load first batch synchronously-ish
    const priority = [];
    for (let i = 0; i < CONFIG.priorityFrames; i++) {
      priority.push(loadImage(i));
    }
    await Promise.all(priority);

    // Show first frame immediately
    if (!state.destroyed) {
      state.isReady = true;
      drawFrame(0);
      hideLoader();
    }

    // Load remaining in batches
    const remaining = [];
    for (let i = CONFIG.priorityFrames; i < CONFIG.frameCount; i++) {
      remaining.push(i);
    }

    for (let b = 0; b < remaining.length; b += CONFIG.preloadBatchSize) {
      if (state.destroyed) return;
      const batch = remaining.slice(b, b + CONFIG.preloadBatchSize);
      await Promise.all(batch.map(loadImage));
    }
  }

  function hideLoader() {
    if (els.loader) {
      els.loader.classList.add('is-hidden');
    }
  }

  /* ── Canvas Renderer ────────────────────────────────────────── */
  function resizeCanvas() {
    if (!state.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = state.canvas.clientWidth;
    const h = state.canvas.clientHeight;
    state.canvas.width = w * dpr;
    state.canvas.height = h * dpr;
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Redraw current frame at new size
    if (state.currentFrame >= 0) {
      drawFrame(state.currentFrame);
    }
  }

  function drawFrame(index) {
    const img = state.frames[index];
    if (!img || !state.ctx) return;

    const canvas = state.canvas;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    // Clear
    state.ctx.fillStyle = '#090909';
    state.ctx.fillRect(0, 0, cw, ch);

    // Cover-fit calculation (fill viewport, crop overflow — no gaps)
    const imgAspect = CONFIG.canvasAspect;
    const canvasAspect = cw / ch;

    let dw, dh, dx, dy;

    if (canvasAspect > imgAspect) {
      // Canvas is wider than image — fit to width, crop top/bottom
      dw = cw;
      dh = cw / imgAspect;
      dx = 0;
      dy = (ch - dh) / 2;
    } else {
      // Canvas is taller than image — fit to height, crop left/right
      dh = ch;
      dw = ch * imgAspect;
      dx = (cw - dw) / 2;
      dy = 0;
    }

    state.ctx.drawImage(img, dx, dy, dw, dh);
    state.currentFrame = index;
  }

  /* ── Text Overlay Controller ────────────────────────────────── */
  function updateTextOverlays(progress) {
    const t = CONFIG.text;

    // Phase 1: Title
    updateOverlay(els.textPhase1, progress, t.phase1);

    // Phase 2: Features
    updateOverlay(els.textPhase2, progress, t.phase2);

    // Phase 3: CTA
    updateOverlay(els.textPhase3, progress, t.phase3);

    // Scroll indicator
    if (els.scrollIndicator) {
      const scrollVisible = progress <= t.scroll.fadeEnd;
      els.scrollIndicator.classList.toggle('is-visible', scrollVisible);
    }
  }

  function updateOverlay(el, progress, config) {
    if (!el) return;

    const { start, peak, fadeEnd } = config;

    let opacity = 0;
    let translateY = 24;

    if (progress >= start && progress <= fadeEnd) {
      // Fade in
      if (progress < peak) {
        const fadeInProgress = (progress - start) / (peak - start);
        opacity = clamp(fadeInProgress, 0, 1);
        translateY = lerp(24, 0, fadeInProgress);
      }
      // Hold
      else if (progress <= fadeEnd - 0.06) {
        opacity = 1;
        translateY = 0;
      }
      // Fade out
      else {
        const fadeOutProgress = (progress - (fadeEnd - 0.06)) / 0.06;
        opacity = clamp(1 - fadeOutProgress, 0, 1);
        translateY = lerp(0, -16, fadeOutProgress);
      }
    }

    el.style.opacity = opacity;
    el.style.transform = `translateY(${translateY}px)`;
  }

  /* ── Premium Effects ────────────────────────────────────────── */
  function updatePremiumEffects(progress) {
    // Subtle canvas brightness ramp
    if (state.canvas) {
      const brightness = lerp(1.0, 1.04, progress);
      state.canvas.style.filter = `brightness(${brightness})`;
    }

    // Vignette intensity shift
    if (state.section) {
      const vignetteOpacity = lerp(0.5, 0.35, progress);
      state.section.style.setProperty('--vignette-opacity', vignetteOpacity);
    }
  }

  /* ── GSAP ScrollTrigger Setup ───────────────────────────────── */
  function initScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[KitchenSequence] GSAP or ScrollTrigger not found. Falling back to static mode.');
      showStaticFallback();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Create a scroll-driven animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: state.section,
        start: 'top top',
        end: () => '+=' + (window.innerHeight * CONFIG.scrollMultiplier),
        pin: true,
        scrub: CONFIG.scrubSmoothing,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Map progress to frame index
          const frameIndex = clamp(Math.floor(progress * (CONFIG.frameCount - 1)), 0, CONFIG.frameCount - 1);

          // Only redraw if frame changed
          if (frameIndex !== state.currentFrame && state.frames[frameIndex]) {
            drawFrame(frameIndex);
          }

          // Update text overlays
          updateTextOverlays(progress);

          // Premium effects
          updatePremiumEffects(progress);
        }
      }
    });

    // Dummy tween to give the timeline a duration
    tl.to({}, { duration: 1 });
  }

  function showStaticFallback() {
    // Show first frame + all text visible
    if (state.frames[0]) drawFrame(0);
    if (els.textPhase1) {
      els.textPhase1.style.opacity = '1';
      els.textPhase1.style.transform = 'translateY(0)';
    }
  }

  /* ── Initialization ─────────────────────────────────────────── */
  function init() {
    state.section = document.getElementById('kitchen-experience');
    if (!state.section) return;

    state.canvas = state.section.querySelector('.kitchen-experience__canvas');
    if (!state.canvas) return;

    state.ctx = state.canvas.getContext('2d');

    // Cache DOM elements
    els = {
      loader: state.section.querySelector('.kitchen-experience__loader'),
      loaderFill: state.section.querySelector('.kitchen-experience__loader-fill'),
      textPhase1: state.section.querySelector('[data-kitchen-text="phase1"]'),
      textPhase2: state.section.querySelector('[data-kitchen-text="phase2"]'),
      textPhase3: state.section.querySelector('[data-kitchen-text="phase3"]'),
      scrollIndicator: state.section.querySelector('.kitchen-experience__scroll')
    };

    // Initial canvas sizing
    resizeCanvas();

    // Resize handler (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        ScrollTrigger && ScrollTrigger.refresh();
      }, 150);
    });

    // Use IntersectionObserver for lazy initialization
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          startExperience();
        }
      });
    }, {
      rootMargin: '200px 0px', // Start loading 200px before visible
      threshold: 0
    });

    observer.observe(state.section);
  }

  async function startExperience() {
    // Show scroll indicator immediately
    if (els.scrollIndicator) {
      els.scrollIndicator.classList.add('is-visible');
    }

    // Start preloading
    await preloadFrames();

    // Initialize GSAP scroll-driven animation
    if (!state.destroyed) {
      initScrollTrigger();
    }
  }

  /* ── Boot ────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
