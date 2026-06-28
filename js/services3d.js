/**
 * SS BUILDERS MVS — Services 3D Icons
 * Procedural mini-models for each service card
 * Uses single renderer with scissor technique
 */

(function() {
  'use strict';

  const cards = document.querySelectorAll('.service-card');
  if (!cards.length || typeof THREE === 'undefined') return;

  // ─── Procedural Model Builders ─────────────────────────────────
  const builders = {
    // Mini house
    house: function(scene) {
      const g = new THREE.Group();
      // Walls
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.9, 1),
        new THREE.MeshStandardMaterial({ color: 0xf0ece8, roughness: 0.7 })
      );
      walls.position.y = 0.45;
      g.add(walls);
      // Roof
      const roofShape = new THREE.ConeGeometry(1, 0.6, 4);
      const roof = new THREE.Mesh(roofShape, new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 }));
      roof.position.y = 1.2;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);
      // Door
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.45, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.7 })
      );
      door.position.set(0, 0.22, 0.53);
      g.add(door);
      scene.add(g);
      return g;
    },

    // Office tower
    tower: function(scene) {
      const g = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const floor = new THREE.Mesh(
          new THREE.BoxGeometry(0.9 - i * 0.05, 0.4, 0.8 - i * 0.05),
          new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x63b3ed : 0x2c2b30, roughness: 0.5 })
        );
        floor.position.y = i * 0.42 + 0.2;
        g.add(floor);
      }
      // Antenna
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xf58f7c })
      );
      antenna.position.y = 2;
      g.add(antenna);
      scene.add(g);
      return g;
    },

    // Villa with columns
    villa: function(scene) {
      const g = new THREE.Group();
      // Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.15, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x2c2b30, roughness: 0.8 })
      );
      base.position.y = 0.075;
      g.add(base);
      // Main body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.9),
        new THREE.MeshStandardMaterial({ color: 0xf0ece8, roughness: 0.7 })
      );
      body.position.y = 0.55;
      g.add(body);
      // Columns
      for (let x = -0.5; x <= 0.5; x += 1) {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8),
          new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 })
        );
        col.position.set(x, 0.55, 0.5);
        g.add(col);
      }
      // Roof
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.1, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x2c2b30 })
      );
      roof.position.y = 1.0;
      g.add(roof);
      scene.add(g);
      return g;
    },

    // Living room
    room: function(scene) {
      const g = new THREE.Group();
      // Floor
      g.add(makeBox(1.4, 0.05, 1, 0x8b6914, 0, 0.025, 0));
      // Back wall
      g.add(makeBox(1.4, 0.8, 0.05, 0xf0ece8, 0, 0.45, -0.5));
      // Sofa
      g.add(makeBox(0.6, 0.25, 0.3, 0x3498db, -0.2, 0.175, -0.2));
      // Table
      g.add(makeBox(0.3, 0.05, 0.3, 0x8b6914, 0.2, 0.3, 0.1));
      // Lamp
      const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      lamp.position.set(0.5, 0.25, -0.3);
      g.add(lamp);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffa500, emissiveIntensity: 0.5 })
      );
      bulb.position.set(0.5, 0.47, -0.3);
      g.add(bulb);
      scene.add(g);
      return g;
    },

    // Elevation facade
    elevation: function(scene) {
      const g = new THREE.Group();
      // Main facade
      g.add(makeBox(1.3, 1.2, 0.15, 0xf0ece8, 0, 0.6, 0));
      // Windows
      for (let x = -0.35; x <= 0.35; x += 0.35) {
        for (let y = 0.3; y <= 0.9; y += 0.4) {
          g.add(makeBox(0.2, 0.25, 0.02, 0x63b3ed, x, y, 0.1));
        }
      }
      // Roof trim
      g.add(makeBox(1.5, 0.08, 0.2, 0x2c2b30, 0, 1.24, 0));
      // Garden
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x2e5b31 })
      );
      bush.position.set(-0.5, 0.15, 0.2);
      g.add(bush);
      scene.add(g);
      return g;
    },

    // Construction tools
    tools: function(scene) {
      const g = new THREE.Group();
      // Hammer handle
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x8b6914 })
      );
      handle.rotation.z = 0.3;
      handle.position.set(-0.1, 0.3, 0);
      g.add(handle);
      // Hammer head
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.15, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.3 })
      );
      head.position.set(0.1, 0.72, 0);
      head.rotation.z = 0.3;
      g.add(head);
      // Wrench
      const wrenchHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8),
        new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7 })
      );
      wrenchHandle.rotation.z = -0.2;
      wrenchHandle.position.set(0.3, 0.3, 0.1);
      g.add(wrenchHandle);
      scene.add(g);
      return g;
    },

    // Wireframe structure
    wireframe: function(scene) {
      const g = new THREE.Group();
      const frameGeo = new THREE.BoxGeometry(1, 1.2, 0.8);
      const edges = new THREE.EdgesGeometry(frameGeo);
      const frame = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x63b3ed }));
      frame.position.y = 0.6;
      g.add(frame);
      // Cross braces
      for (let i = 0; i < 3; i++) {
        const brace = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 1.5, 6),
          new THREE.MeshStandardMaterial({ color: 0xf58f7c })
        );
        brace.rotation.z = Math.PI / 4;
        brace.position.set(0, 0.3 + i * 0.35, 0);
        g.add(brace);
      }
      scene.add(g);
      return g;
    },

    // Key
    key: function(scene) {
      const g = new THREE.Group();
      // Key ring (torus)
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.04, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })
      );
      ring.position.y = 0.8;
      g.add(ring);
      // Key shaft
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })
      );
      shaft.position.y = 0.3;
      g.add(shaft);
      // Key teeth
      for (let i = 0; i < 3; i++) {
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.04, 0.04),
          new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 })
        );
        tooth.position.set(0.06, 0.1 + i * 0.08, 0);
        g.add(tooth);
      }
      scene.add(g);
      return g;
    }
  };

  function makeBox(w, h, d, color, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
    );
    mesh.position.set(x, y, z);
    return mesh;
  }

  // ─── Map service cards to model builders ───────────────────────
  const modelMap = [
    'house',     // New Home Construction
    'tower',     // Commercial Construction
    'villa',     // Luxury Villas
    'room',      // Interior Design
    'elevation', // Exterior Design
    'tools',     // Renovation
    'wireframe', // Structural Planning
    'key'        // Turnkey Projects
  ];

  // ─── Create scenes for each card ───────────────────────────────
  const scenes = [];
  const canvases = [];

  cards.forEach((card, i) => {
    const iconContainer = card.querySelector('.service-card__icon');
    if (!iconContainer) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    canvas.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:1;';
    iconContainer.style.position = 'relative';
    iconContainer.appendChild(canvas);
    
    // Create scene
    const s = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    cam.position.set(2, 1.5, 2.5);
    cam.lookAt(0, 0.5, 0);

    // Lighting
    s.add(new THREE.AmbientLight(0x404060, 2.0));
    const dl = new THREE.DirectionalLight(0xfff5e6, 1.5);
    dl.position.set(-3, 5, 3);
    s.add(dl);
    const pl = new THREE.PointLight(0xf58f7c, 0.5, 5);
    pl.position.set(0, 0, 2);
    s.add(pl);

    // Build model
    const builderName = modelMap[i] || 'house';
    const model = builders[builderName] ? builders[builderName](s) : builders.house(s);

    // Renderer for this canvas
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setSize(150, 150);
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scenes.push({ scene: s, camera: cam, renderer: r, model, card });
    canvases.push(canvas);
  });

  // ─── Hover effect ──────────────────────────────────────────────
  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      if (scenes[i] && scenes[i].model && typeof gsap !== 'undefined') {
        gsap.to(scenes[i].model.position, { y: 0.15, duration: 0.4, ease: 'power2.out' });
      }
    });
    card.addEventListener('mouseleave', () => {
      if (scenes[i] && scenes[i].model && typeof gsap !== 'undefined') {
        gsap.to(scenes[i].model.position, { y: 0, duration: 0.4, ease: 'power2.out' });
      }
    });
  });

  // ─── Animation Loop ────────────────────────────────────────────
  let isVisible = false;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  
  const servicesSection = document.getElementById('services');
  if (servicesSection) observer.observe(servicesSection);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    scenes.forEach(({ scene: s, camera: c, renderer: r, model }) => {
      if (model) {
        model.rotation.y = t * 0.3;
      }
      r.render(s, c);
    });
  }

  animate();
})();
