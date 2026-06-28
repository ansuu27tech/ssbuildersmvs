/**
 * SS BUILDERS MVS — Materials Page 3D Rotating Objects
 * Procedural material samples with hover interaction
 */

(function() {
  'use strict';

  if (typeof THREE === 'undefined') return;

  // Find material cards
  const materialCards = document.querySelectorAll('.material-card, .materials__card, [class*="material"]');
  if (!materialCards.length) return;

  // ─── Material Model Builders ───────────────────────────────────
  const materialModels = {
    steel: function(scene) {
      const g = new THREE.Group();
      // I-beam shape
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.5), 
        new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.9, roughness: 0.2 }));
      top.position.y = 0.5;
      g.add(top);
      const web = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.5), 
        new THREE.MeshStandardMaterial({ color: 0x95a5a6, metalness: 0.9, roughness: 0.2 }));
      web.position.y = 0.1;
      g.add(web);
      const bottom = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.5), 
        new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.9, roughness: 0.2 }));
      bottom.position.y = -0.3;
      g.add(bottom);
      scene.add(g);
      return g;
    },

    concrete: function(scene) {
      const g = new THREE.Group();
      const block = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xbdc3c7, roughness: 0.95, metalness: 0.0 }));
      g.add(block);
      scene.add(g);
      return g;
    },

    brick: function(scene) {
      const g = new THREE.Group();
      const brick = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.9 }));
      g.add(brick);
      // Mortar lines (thin lighter strips)
      const mortar = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.02, 0.52),
        new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 1.0 }));
      mortar.position.y = 0.21;
      g.add(mortar);
      scene.add(g);
      return g;
    },

    ceramic: function(scene) {
      const g = new THREE.Group();
      const tile = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.9),
        new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.1, metalness: 0.1 }));
      g.add(tile);
      // Pattern
      const pattern = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.1 }));
      pattern.position.y = 0.005;
      g.add(pattern);
      scene.add(g);
      return g;
    },

    wood: function(scene) {
      const g = new THREE.Group();
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.7 }));
      g.add(plank);
      // Grain lines
      for (let i = -0.4; i <= 0.4; i += 0.2) {
        const grain = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.005, 0.02),
          new THREE.MeshStandardMaterial({ color: 0x7d5a1a, roughness: 0.8 }));
        grain.position.set(0, 0.078, i);
        g.add(grain);
      }
      scene.add(g);
      return g;
    },

    glass: function(scene) {
      const g = new THREE.Group();
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.05),
        new THREE.MeshPhysicalMaterial({ 
          color: 0x88ccff, transparent: true, opacity: 0.3,
          clearcoat: 1.0, clearcoatRoughness: 0.05
        }));
      g.add(panel);
      // Frame
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7 });
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.07), frameMat).translateY(0.5));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.07), frameMat).translateY(-0.5));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.0, 0.07), frameMat).translateX(-0.4));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.0, 0.07), frameMat).translateX(0.4));
      scene.add(g);
      return g;
    }
  };

  const modelNames = ['steel', 'concrete', 'brick', 'ceramic', 'wood', 'glass'];

  // ─── Create scenes ─────────────────────────────────────────────
  const entries = [];

  materialCards.forEach((card, i) => {
    if (i >= modelNames.length) return;

    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    canvas.style.cssText = 'display:block;margin:0 auto 1rem;border-radius:12px;';
    
    // Insert canvas at top of card
    card.insertBefore(canvas, card.firstChild);

    const s = new THREE.Scene();
    s.add(new THREE.AmbientLight(0x404060, 2.0));
    const dl = new THREE.DirectionalLight(0xfff5e6, 1.5);
    dl.position.set(-3, 5, 3);
    s.add(dl);
    s.add(new THREE.PointLight(0xf58f7c, 0.4, 5));

    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    cam.position.set(1.5, 1, 2);
    cam.lookAt(0, 0, 0);

    const builderName = modelNames[i];
    const model = materialModels[builderName] ? materialModels[builderName](s) : materialModels.concrete(s);

    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setSize(180, 180);
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    let hoverSpeed = 0.3;

    card.addEventListener('mouseenter', () => { hoverSpeed = 1.2; });
    card.addEventListener('mouseleave', () => { hoverSpeed = 0.3; });

    entries.push({ scene: s, camera: cam, renderer: r, model, hoverSpeed: () => hoverSpeed });
  });

  // ─── Animation ─────────────────────────────────────────────────
  let isVisible = false;
  const clock = new THREE.Clock();

  const observer = new IntersectionObserver((entries_) => {
    isVisible = entries_.some(e => e.isIntersecting);
  }, { threshold: 0.1 });

  materialCards.forEach(c => observer.observe(c));

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    entries.forEach(e => {
      if (e.model) {
        e.model.rotation.y = t * e.hoverSpeed();
      }
      e.renderer.render(e.scene, e.camera);
    });
  }

  animate();
})();
