/**
 * ═══════════════════════════════════════════════════════════════
 * SS BUILDERS MVS — SCROLL-DRIVEN CINEMATIC HERO ENGINE
 *
 * Nothing auto-plays. The visitor's scroll position controls
 * EVERYTHING: frame progression, camera movement, lighting,
 * particles, text reveals, and section transitions.
 *
 * Scroll Phases (within pinned hero):
 *   Phase 1  (0–12%)   Hero intro → camera approaches, text fades out
 *   Phase 2  (12–78%)  Construction sequence: scroll drives frames 1→175
 *   Phase 3  (78–92%)  Villa complete: warm light, reflections, landscape
 *   Phase 4  (92–100%) Villa recedes, next section fades in
 *
 * Tech: GSAP ScrollTrigger (scrub), HTML Canvas, rAF, GPU transforms
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  const CFG = {
    framePath: 'assets/hero-frames/frame_',
    frameExt: '.jpg',
    frameNumbers: [],
    totalFrames: 0,
    pinDuration: window.innerWidth <= 768 ? '250%' : '500%',
    dpr: Math.min(window.devicePixelRatio || 1, 2.5),
    particleCount: window.innerWidth <= 768 ? 12 : 28,
    sparkCount: window.innerWidth <= 768 ? 6 : 12,
    dustMoteCount: window.innerWidth <= 768 ? 8 : 20,
  };

  // Build frame number list (1–145 + 182–202 + sparse)
  for (let i = 1; i <= 145; i++) CFG.frameNumbers.push(i);
  for (let i = 182; i <= 202; i++) CFG.frameNumbers.push(i);
  [216, 223, 231, 232, 234, 235, 236, 237, 238].forEach(n => CFG.frameNumbers.push(n));
  CFG.totalFrames = CFG.frameNumbers.length; // 175

  const PHASES = [
    { at: 0.00, label: 'RAW FOUNDATION' },
    { at: 0.08, label: 'CONCRETE STRUCTURE' },
    { at: 0.20, label: 'WALL CONSTRUCTION' },
    { at: 0.35, label: 'ELECTRICAL & PLUMBING' },
    { at: 0.48, label: 'GLASS INSTALLATION' },
    { at: 0.60, label: 'EXTERIOR FINISHING' },
    { at: 0.72, label: 'INTERIOR FIT-OUT' },
    { at: 0.82, label: 'LANDSCAPE & LIGHTING' },
    { at: 0.92, label: 'LUXURY COMPLETION' },
  ];

  /* ── STATE ──────────────────────────────────────────────── */
  const state = {
    frames: [],
    ready: false,
    progress: 0,       // master 0→1 from ScrollTrigger
    frameProgress: 0,  // sub-progress for construction sequence
    currentPhase: -1,
    isVisible: true,
    mouseX: 0.5,
    mouseY: 0.5,
    countersStarted: false,
  };

  /* ── DOM ─────────────────────────────────────────────────── */
  const $ = sel => document.querySelector(sel);
  const hero         = $('#hero');
  const mainCanvas   = $('#chCanvas');
  const energyCanvas = $('#chEnergy');
  const phaseEl      = $('#chPhase');
  const phaseText    = phaseEl?.querySelector('.ch-phase__text');
  const progressFill = $('.ch-progress__fill');
  const progressGlow = $('.ch-progress__glow');
  const bloomEl      = $('#chBloom');
  const flareEl      = $('#chFlare');
  const reflectionEl = $('#chReflection');
  const raysEl       = $('#chRays');
  const statsEl      = $('#chStats');
  const dustEl       = $('#chDust');
  const cameraEl     = $('#chCamera');
  const scrollCue    = $('#chScroll');
  const contentEl    = $('#chContent');

  if (!mainCanvas || !hero) return;

  const ctx  = mainCanvas.getContext('2d', { alpha: false });
  const ectx = energyCanvas.getContext('2d', { alpha: true });

  /* ═══════════════════════════════════════════════════════════
     1. FRAME PRELOADER
     ═══════════════════════════════════════════════════════════ */
  function preloadFrames() {
    return new Promise(resolve => {
      let loaded = 0;
      state.frames = new Array(CFG.totalFrames);

      CFG.frameNumbers.forEach((num, idx) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = `${CFG.framePath}${String(num).padStart(3, '0')}${CFG.frameExt}`;
        img.onload = img.onerror = () => {
          state.frames[idx] = img.naturalWidth ? img : null;
          loaded++;
          if (loaded >= CFG.totalFrames) {
            for (let i = 0; i < state.frames.length; i++) {
              if (!state.frames[i]) state.frames[i] = state.frames[i - 1] || state.frames[i + 1];
            }
            state.ready = true;
            resolve();
          }
        };
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     2. CANVAS SIZING
     ═══════════════════════════════════════════════════════════ */
  function sizeCanvases() {
    const w = hero.offsetWidth;
    const h = hero.offsetHeight;

    energyCanvas.width  = w * CFG.dpr;
    energyCanvas.height = h * CFG.dpr;
    energyCanvas.style.width  = w + 'px';
    energyCanvas.style.height = h + 'px';

    const first = state.frames.find(f => f?.naturalWidth);
    if (first) {
      const rect = mainCanvas.getBoundingClientRect();
      const cw = rect.width || w * 0.6;
      const ch = rect.height || h * 0.7;
      mainCanvas.width  = cw * CFG.dpr;
      mainCanvas.height = ch * CFG.dpr;
    } else {
      mainCanvas.width  = 800 * CFG.dpr;
      mainCanvas.height = 600 * CFG.dpr;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     3. CANVAS RENDERER — crossfade between adjacent frames
     ═══════════════════════════════════════════════════════════ */
  function drawFrame() {
    if (!state.ready) return;

    // Map scroll progress to frame index
    // Phase 1 (0–0.12): stay on frame 0
    // Phase 2 (0.12–0.78): frame 0→174
    // Phase 3+4 (0.78–1): stay on last frame
    let frameIdx;
    const p = state.progress;
    if (p <= 0.12) {
      frameIdx = 0;
    } else if (p >= 0.78) {
      frameIdx = CFG.totalFrames - 1;
    } else {
      const sequenceProgress = (p - 0.12) / (0.78 - 0.12);
      frameIdx = sequenceProgress * (CFG.totalFrames - 1);
    }

    state.frameProgress = frameIdx / (CFG.totalFrames - 1);

    const floor = Math.floor(frameIdx);
    const ceil  = Math.min(floor + 1, CFG.totalFrames - 1);
    const blend = frameIdx - floor;
    const frameA = state.frames[floor];
    const frameB = state.frames[ceil];
    if (!frameA) return;

    const w = mainCanvas.width;
    const h = mainCanvas.height;
    ctx.clearRect(0, 0, w, h);

    // Base frame
    ctx.globalAlpha = 1;
    drawCover(ctx, frameA, w, h);

    // Crossfade next
    if (blend > 0.01 && frameB && frameB !== frameA) {
      ctx.globalAlpha = blend;
      drawCover(ctx, frameB, w, h);
      ctx.globalAlpha = 1;
    }

    // Warm color grade that intensifies with construction progress
    const warmth = state.frameProgress * 0.14;
    if (warmth > 0.01) {
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = `rgba(212, 175, 85, ${warmth})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function drawCover(c, img, cw, ch) {
    if (!img?.naturalWidth) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const ia = iw / ih, ca = cw / ch;
    let sx, sy, sw, sh;
    if (ca > ia) { sw = iw; sh = iw / ca; sx = 0; sy = (ih - sh) / 2; }
    else { sh = ih; sw = ih * ca; sx = (iw - sw) / 2; sy = 0; }
    c.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  /* ═══════════════════════════════════════════════════════════
     4. CAMERA SIMULATOR — scroll-driven dolly/orbit/sway
     ═══════════════════════════════════════════════════════════ */
  function updateCamera(time) {
    if (!cameraEl) return;
    
    // Mouse parallax (extremely subtle, just for life)
    const mx = (state.mouseX - 0.5) * 6;
    const my = (state.mouseY - 0.5) * 4;

    cameraEl.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  }

  /* ═══════════════════════════════════════════════════════════
     5. SCROLL-DRIVEN LIGHTING
     ═══════════════════════════════════════════════════════════ */
  function updateLighting() {
    const p = state.progress;
    const fp = state.frameProgress;
    
    const shadowEl = document.getElementById('chShadow');

    // Volumetric rays — gradual appearance, subtle peak
    if (raysEl) {
      const raysOpacity = p < 0.12 ? 0 : Math.min((p - 0.12) * 0.9, 0.5);
      raysEl.style.opacity = raysOpacity;
      raysEl.style.transform = `scale(${1 + p * 0.08}) rotate(${p * 2}deg)`;
    }

    // Bloom — grows with construction, richer at completion
    if (bloomEl) {
      const bloomIntensity = fp < 0.2 ? fp * 0.5 : 0.1 + (fp - 0.2) * 0.75;
      bloomEl.style.opacity = Math.min(bloomIntensity, 0.55).toFixed(3);
      bloomEl.style.transform = `scale(${1 + fp * 0.25})`;
    }

    // Lens flare — appears only when villa is mostly complete, with warmth
    if (flareEl) {
      const flareVal = fp > 0.75 ? (fp - 0.75) * 2.8 : 0;
      flareEl.style.opacity = Math.min(flareVal, 0.7).toFixed(3);
    }

    // Shadow — grounds the structure more heavily as it builds
    if (shadowEl) {
      shadowEl.style.opacity = (0.3 + fp * 0.6).toFixed(3);
      shadowEl.style.transform = `scale(${0.9 + fp * 0.1})`;
    }

    // Floor reflection — strengthens progressively, warmer at end
    if (reflectionEl) {
      const refIntensity = fp < 0.3 ? fp * 0.4 : 0.12 + (fp - 0.3) * 0.85;
      reflectionEl.style.opacity = Math.min(refIntensity, 0.85).toFixed(3);
    }

    // Canvas filter warmth — gradually brightens and warms the interior
    const canvas = document.querySelector('.ch-canvas');
    if (canvas) {
      // Base: contrast(1.06) saturate(1.12) brightness(1.02)
      // End: contrast(1.1) saturate(1.25) brightness(1.1) sepia(0.1)
      const b = 1.02 + fp * 0.08;
      const s = 1.12 + fp * 0.13;
      const c = 1.06 + fp * 0.04;
      const sep = fp * 0.1;
      canvas.style.filter = `contrast(${c.toFixed(2)}) saturate(${s.toFixed(2)}) brightness(${b.toFixed(2)}) sepia(${sep.toFixed(2)})`;
    }

    // Progress bar
    if (progressFill) progressFill.style.width = (p * 100) + '%';
    if (progressGlow) progressGlow.style.left = `calc(${p * 100}% - 30px)`;

    // Background warmth shift — cool to warm as construction progresses
    const base = hero.querySelector('.ch-base');
    if (base) {
      // Gradually shift from cold dark to warm undertone
      const r = Math.round(20 + fp * 35);
      const g = Math.round(16 + fp * 26);
      const b = Math.round(10 + fp * 14);
      base.style.background = `radial-gradient(ellipse 80% 60% at 55% 40%,
        rgba(${r}, ${g}, ${b}, 1) 0%,
        #020202 100%)`;
    }

    // Fog movement — deeper, more cinematic
    const fogFar = hero.querySelector('.ch-fog__far');
    const fogMid = hero.querySelector('.ch-fog__mid');
    if (fogFar) {
      fogFar.style.transform = `translate(${Math.sin(p * 2.5) * 15}px, ${-p * 12}px) scale(${1 + p * 0.06})`;
      fogFar.style.opacity = (0.5 + p * 0.35).toFixed(2);
    }
    if (fogMid) {
      fogMid.style.transform = `translate(${Math.cos(p * 2) * 12}px, ${-p * 8}px)`;
      fogMid.style.opacity = (0.3 + fp * 0.45).toFixed(2);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     6. PHASE LABELS — synced to scroll
     ═══════════════════════════════════════════════════════════ */
  function updatePhase() {
    const fp = state.frameProgress;
    let idx = 0;
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (fp >= PHASES[i].at) { idx = i; break; }
    }
    if (idx !== state.currentPhase) {
      state.currentPhase = idx;
      if (phaseText) {
        phaseText.style.opacity = '0';
        setTimeout(() => {
          phaseText.textContent = PHASES[idx].label;
          phaseText.style.opacity = '1';
        }, 250);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     7. ENERGY PARTICLE SYSTEM — intensity driven by scroll
     ═══════════════════════════════════════════════════════════ */
  const particles = [];

  class Particle {
    constructor(type) {
      this.type = type;
      this.reset();
    }
    reset() {
      const w = energyCanvas.width / CFG.dpr;
      const h = energyCanvas.height / CFG.dpr;
      if (this.type === 'orb') {
        this.cx = w * 0.55;
        this.cy = h * 0.42;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = 80 + Math.random() * 220;
        this.speed = 0.003 + Math.random() * 0.005;
        this.size = 2 + Math.random() * 4;
      } else if (this.type === 'spark') {
        this.x = w * (0.35 + Math.random() * 0.4);
        this.y = h * (0.15 + Math.random() * 0.55);
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = -0.5 - Math.random() * 1.5;
        this.size = 0.8 + Math.random() * 1.8;
        this.life = 1;
        this.decay = 0.008 + Math.random() * 0.012;
      } else {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = -0.05 - Math.random() * 0.2;
        this.size = 0.5 + Math.random() * 1.5;
        this.life = 1;
        this.decay = 0.0008 + Math.random() * 0.002;
      }
    }
    update(time) {
      const fp = state.frameProgress;
      if (this.type === 'orb') {
        this.angle += this.speed;
        this.x = this.cx + Math.cos(this.angle) * this.radius;
        this.y = this.cy + Math.sin(this.angle) * this.radius * 0.45;
        this.alpha = fp * 0.5 * (0.4 + 0.6 * Math.abs(Math.sin(this.angle * 2)));
      } else if (this.type === 'spark') {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.015;
        this.life -= this.decay;
        this.alpha = this.life * fp * 0.7;
        if (this.life <= 0) this.reset();
      } else {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.alpha = this.life * 0.15;
        if (this.life <= 0 || this.y < 0) this.reset();
      }
    }
    draw(c) {
      if (!this.alpha || this.alpha < 0.005) return;
      c.save();
      c.globalAlpha = this.alpha;
      if (this.type === 'orb') {
        const g = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        g.addColorStop(0, 'rgba(212,175,85,0.8)');
        g.addColorStop(0.5, 'rgba(212,175,85,0.15)');
        g.addColorStop(1, 'transparent');
        c.fillStyle = g;
        c.beginPath();
        c.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        c.fill();
      } else {
        c.fillStyle = this.type === 'spark'
          ? `rgba(255,220,120,${this.alpha})`
          : `rgba(255,255,255,${this.alpha})`;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }
  }

  function initParticles() {
    for (let i = 0; i < CFG.particleCount; i++) particles.push(new Particle('orb'));
    for (let i = 0; i < CFG.sparkCount; i++) particles.push(new Particle('spark'));
    for (let i = 0; i < CFG.dustMoteCount; i++) particles.push(new Particle('dust'));
  }

  function drawParticles(time) {
    const w = energyCanvas.width, h = energyCanvas.height;
    ectx.clearRect(0, 0, w, h);
    ectx.save();
    ectx.scale(CFG.dpr, CFG.dpr);
    particles.forEach(p => { p.update(time); p.draw(ectx); });

    // Energy streaks between orbs
    const orbs = particles.filter(p => p.type === 'orb');
    ectx.lineWidth = 0.5;
    for (let i = 0; i < orbs.length; i++) {
      for (let j = i + 1; j < orbs.length; j++) {
        const dx = orbs[i].x - orbs[j].x;
        const dy = orbs[i].y - orbs[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ectx.globalAlpha = (1 - dist / 140) * 0.12 * state.frameProgress;
          ectx.strokeStyle = 'rgba(212,175,85,0.08)';
          ectx.beginPath();
          ectx.moveTo(orbs[i].x, orbs[i].y);
          ectx.lineTo(orbs[j].x, orbs[j].y);
          ectx.stroke();
        }
      }
    }
    ectx.restore();
  }

  /* ═══════════════════════════════════════════════════════════
     8. DUST MOTES (CSS)
     ═══════════════════════════════════════════════════════════ */
  function createDust() {
    if (!dustEl) return;
    const style = document.createElement('style');
    style.id = 'ch-dust-kf';
    style.textContent = `
      @keyframes dustFloat {
        0%   { transform: translateY(0) translateX(0); opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(40px); opacity: 0; }
      }`;
    document.head.appendChild(style);

    for (let i = 0; i < 18; i++) {
      const m = document.createElement('div');
      const sz = 1 + Math.random() * 2.5;
      m.style.cssText = `
        position:absolute;
        width:${sz}px; height:${sz}px;
        border-radius:50%;
        background:rgba(255,255,255,${0.04 + Math.random() * 0.08});
        left:${Math.random() * 100}%;
        bottom:-10px;
        animation:dustFloat ${14 + Math.random() * 20}s linear ${Math.random() * 15}s infinite;
        will-change:transform;`;
      dustEl.appendChild(m);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     9. GSAP — INITIAL TEXT REVEAL + SCROLLTRIGGER PIN
     ═══════════════════════════════════════════════════════════ */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Split text into characters for premium letter-by-letter reveal
    document.querySelectorAll('.ch-title__word').forEach(word => {
      const text = word.textContent.trim();
      word.textContent = '';
      word.style.opacity = '1';
      word.style.transform = 'none';
      
      for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.innerHTML = text[i] === ' ' ? '&nbsp;' : text[i];
        span.style.display = 'inline-block';
        span.classList.add('ch-char');
        // Initial state for GSAP
        span.style.opacity = '0';
        span.style.transform = 'translateY(100%)';
        word.appendChild(span);
      }
    });

    /* ── Initial entrance animation (non-scroll) ── */
    const intro = gsap.timeline({ delay: 0.3 });

    intro.to('.ch-char', {
      y: 0, opacity: 1,
      duration: 1.0, ease: 'power4.out', stagger: 0.03,
    }, 0);

    intro.to('.ch-overline', {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
    }, 0.2);

    intro.to('.ch-sub', {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
    }, 0.5);

    intro.to('.ch-actions', {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
    }, 0.7);

    intro.to('.ch-price', {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
    }, 0.9);

    intro.add(() => {
      if (phaseEl) phaseEl.classList.add('visible');
      if (statsEl) statsEl.classList.add('visible');
      if (scrollCue) scrollCue.classList.add('visible');
    }, 1.2);

    intro.add(() => startCounters(), 1.4);

    /* ── Master ScrollTrigger — pins the hero ── */
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: CFG.pinDuration,
      pin: true,
      scrub: 0.8,          // smooth scrub with slight lag
      anticipatePin: 1,
      onUpdate: (self) => {
        state.progress = self.progress;  // 0→1
      },
    });

    /* ── Phase 1: Scroll-driven text fade-out (delayed for readability) ── */
    gsap.to('.ch-content', {
      y: -40, // Less vertical movement, more elegant fade
      opacity: 0,
      ease: 'power1.inOut',
      scrollTrigger: {
        trigger: hero,
        start: 'top -10%', // Start fading after 10vh of scroll
        end: 'top -80%',   // Finish fading at 80vh of scroll (keeps text visible longer)
        scrub: 0.5,
      }
    });

    // Scroll cue disappears quickly
    gsap.to('.ch-scroll', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'top -20%',
        scrub: true,
      }
    });

    // Stats bar fades out slightly after the text
    gsap.to('.ch-stats', {
      y: 20,
      opacity: 0,
      ease: 'power1.inOut',
      scrollTrigger: {
        trigger: hero,
        start: 'top -30%',
        end: 'top -100%',
        scrub: 0.5,
      }
    });

    const pinVal = parseInt(CFG.pinDuration); // Extracts 500 or 250

    // Phase 3.5: Reveal SS BUILDERS logo on the side at the end of the frames
    gsap.fromTo('.ch-end-logo', {
      opacity: 0,
      x: -30
    }, {
      opacity: 1,
      x: 0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: hero,
        start: `top -${pinVal * 0.75}%`, // e.g. -375% for 500vh pin
        end: `top -${pinVal * 0.85}%`,   // e.g. -425%
        scrub: true,
      }
    });

    // Phase 4: Smooth transition out. Fade the entire camera wrapper to black at the very end of the pin
    gsap.to('.ch-camera', {
      opacity: 0,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: hero,
        start: `top -${pinVal * 0.88}%`, // Start fading at 88% of pin duration
        end: `top -${pinVal}%`,          // Completely black at 100% pin duration
        scrub: 1,
      }
    });

    // Canvas remains fixed in place as the stable centerpiece of the cinematic experience

    // Ensures that triggers below the pin adjust their start/end positions based on the 500vh pin padding.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }

  /* ═══════════════════════════════════════════════════════════
     10. STATS COUNTERS
     ═══════════════════════════════════════════════════════════ */
  function startCounters() {
    if (state.countersStarted) return;
    state.countersStarted = true;

    document.querySelectorAll('.ch-stat__num').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isFloat = target % 1 !== 0;
      const dur = 2000;
      const start = performance.now();
      const tick = now => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = isFloat ? (target * eased).toFixed(1) : Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     11. MOUSE + VISIBILITY
     ═══════════════════════════════════════════════════════════ */
  function initMouse() {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      state.mouseX = (e.clientX - r.left) / r.width;
      state.mouseY = (e.clientY - r.top) / r.height;

      const btn = document.getElementById('chBtnPrimary');
      if (btn) {
        const br = btn.getBoundingClientRect();
        btn.style.setProperty('--x', ((e.clientX - br.left) / br.width * 100) + '%');
        btn.style.setProperty('--y', ((e.clientY - br.top) / br.height * 100) + '%');
      }
    });
  }

  function initVisibility() {
    const obs = new IntersectionObserver(
      ([e]) => { state.isVisible = e.isIntersecting; },
      { threshold: 0.05 }
    );
    obs.observe(hero);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) state.isVisible = false;
    });
  }

  /* ═══════════════════════════════════════════════════════════
     12. MAIN RENDER LOOP (rAF)
     ═══════════════════════════════════════════════════════════ */
  function render(time) {
    requestAnimationFrame(render);
    if (!state.isVisible || !state.ready) return;

    drawFrame();
    drawParticles(time);
    updateCamera(time);
    updateLighting();
    updatePhase();
  }

  /* ═══════════════════════════════════════════════════════════
     13. RESIZE
     ═══════════════════════════════════════════════════════════ */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeCanvases, 200);
  });

  /* ═══════════════════════════════════════════════════════════
     14. INIT
     ═══════════════════════════════════════════════════════════ */
  async function init() {
    await preloadFrames();
    sizeCanvases();
    initParticles();
    createDust();
    initMouse();
    initVisibility();

    // Draw first frame immediately
    drawFrame();

    // Start render loop
    requestAnimationFrame(render);

    // GSAP after a tick
    requestAnimationFrame(() => initGSAP());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
