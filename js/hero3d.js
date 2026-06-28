/**
 * SS BUILDERS MVS — Premium 3D Hero Villa
 * Blueprint → Solid build entrance animation
 * Mouse parallax, warm interior lighting, floating particles
 */

(function() {
  'use strict';

  const container = document.getElementById('hero-3d');
  if (!container || typeof THREE === 'undefined') return;

  // ─── SCENE SETUP ───────────────────────────────────────────────
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    45, container.clientWidth / container.clientHeight, 0.1, 1000
  );
  camera.position.set(18, 10, 22);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // ─── VILLA GROUP ───────────────────────────────────────────────
  const villaGroup = new THREE.Group();
  scene.add(villaGroup);

  // ─── MATERIALS ─────────────────────────────────────────────────
  const matConcrete = new THREE.MeshStandardMaterial({ 
    color: 0xf0ece8, roughness: 0.75, metalness: 0.05
  });
  
  const matCharcoal = new THREE.MeshStandardMaterial({ 
    color: 0x2c2b30, roughness: 0.85, metalness: 0.15
  });
  
  const matWood = new THREE.MeshStandardMaterial({ 
    color: 0x8b6914, roughness: 0.65, metalness: 0.0
  });
  
  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff, metalness: 0.0, roughness: 0.05,
    transparent: true, opacity: 0.35,
    clearcoat: 1.0, clearcoatRoughness: 0.05
  });

  const matLawn = new THREE.MeshStandardMaterial({
    color: 0x2e5b31, roughness: 1.0
  });

  const matAccent = new THREE.MeshStandardMaterial({
    color: 0xf58f7c, roughness: 0.3, metalness: 0.2,
    emissive: 0xf58f7c, emissiveIntensity: 0.15
  });

  // Blueprint wireframe material
  const matWire = new THREE.LineBasicMaterial({ 
    color: 0x63b3ed, transparent: true, opacity: 0.8
  });

  // ─── BUILD VILLA PARTS ─────────────────────────────────────────
  // Store all parts for animation
  const villaParts = [];
  
  function createPart(geometry, material, position, name, delay) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;
    
    // Create wireframe twin
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(edges, matWire.clone());
    wireframe.position.copy(mesh.position);
    wireframe.name = name + '_wire';
    
    villaGroup.add(wireframe);
    villaGroup.add(mesh);
    
    // Start hidden — will animate in
    mesh.material = mesh.material.clone();
    mesh.material.transparent = true;
    mesh.material.opacity = 0;
    mesh.scale.set(0.01, 0.01, 0.01);
    
    villaParts.push({ mesh, wireframe, delay: delay || 0 });
    return mesh;
  }

  // Platform
  const platformGeo = new THREE.CylinderGeometry(9, 9, 0.4, 64);
  createPart(platformGeo, matCharcoal, {x: 0, y: -0.2, z: 0}, 'platform', 0);

  // Lawn
  const lawnGeo = new THREE.BoxGeometry(12, 0.15, 9);
  createPart(lawnGeo, matLawn, {x: 0, y: 0.2, z: 0}, 'lawn', 0.1);

  // Base / Foundation
  const baseGeo = new THREE.BoxGeometry(10, 0.5, 7);
  createPart(baseGeo, matCharcoal, {x: 0, y: 0.5, z: 0}, 'base', 0.3);

  // Ground Floor
  const gfGeo = new THREE.BoxGeometry(6, 3.2, 5);
  createPart(gfGeo, matConcrete, {x: -0.5, y: 2.4, z: -0.3}, 'ground_floor', 0.6);

  // First Floor
  const ffGeo = new THREE.BoxGeometry(7, 2.8, 5.2);
  createPart(ffGeo, matConcrete, {x: 0, y: 5.2, z: 0}, 'first_floor', 0.9);

  // First Floor Wood Accent Band
  const accentGeo = new THREE.BoxGeometry(7.2, 0.3, 5.4);
  createPart(accentGeo, matWood, {x: 0, y: 3.9, z: 0}, 'accent_band', 0.85);

  // Roof Overhang
  const roofGeo = new THREE.BoxGeometry(8, 0.3, 6);
  createPart(roofGeo, matCharcoal, {x: 0, y: 6.75, z: 0.2}, 'roof', 1.2);

  // Roof accent strip
  const roofAccent = new THREE.BoxGeometry(8.2, 0.08, 6.2);
  createPart(roofAccent, matAccent, {x: 0, y: 6.95, z: 0.2}, 'roof_accent', 1.25);

  // Ground Floor Windows
  const winGeo1 = new THREE.BoxGeometry(3.5, 2.5, 0.08);
  createPart(winGeo1, matGlass, {x: -0.5, y: 2.4, z: 2.22}, 'window_gf', 1.4);

  // First Floor Large Window
  const winGeo2 = new THREE.BoxGeometry(4.5, 2.2, 0.08);
  createPart(winGeo2, matGlass, {x: 0, y: 5.2, z: 2.65}, 'window_ff', 1.5);

  // Side Windows
  const sideWinGeo = new THREE.BoxGeometry(0.08, 1.8, 2);
  createPart(sideWinGeo, matGlass, {x: 3.52, y: 5.2, z: 0}, 'window_side', 1.5);

  // Entrance Door
  const doorGeo = new THREE.BoxGeometry(1.4, 2.5, 0.12);
  createPart(doorGeo, matWood, {x: 3.2, y: 2.0, z: 2.2}, 'door', 1.6);

  // Steps
  for(let i = 0; i < 3; i++) {
    const stepGeo = new THREE.BoxGeometry(2.2, 0.2, 0.8);
    createPart(stepGeo, matConcrete, {x: 3.2, y: 0.7 - (i * 0.22), z: 2.8 + (i * 0.4)}, 'step_' + i, 1.55 + i * 0.05);
  }

  // Balcony
  const balconyGeo = new THREE.BoxGeometry(3, 0.15, 1.5);
  createPart(balconyGeo, matCharcoal, {x: -2, y: 3.85, z: 3.2}, 'balcony', 1.3);

  // Balcony Railing
  const railGeo = new THREE.BoxGeometry(3, 0.8, 0.06);
  createPart(railGeo, matGlass, {x: -2, y: 4.3, z: 3.95}, 'railing', 1.35);

  // Decorative Plants
  const plantGeo = new THREE.SphereGeometry(0.45, 12, 12);
  const plantMat = new THREE.MeshStandardMaterial({ color: 0x1a4d1c, roughness: 0.95 });
  const plant1 = createPart(plantGeo, plantMat, {x: 1.8, y: 1.0, z: 3.5}, 'plant1', 1.7);
  const plant2 = createPart(new THREE.SphereGeometry(0.35, 12, 12), plantMat, {x: 4.5, y: 0.85, z: 3.0}, 'plant2', 1.72);

  // Chimney
  const chimneyGeo = new THREE.BoxGeometry(0.6, 1.5, 0.6);
  createPart(chimneyGeo, matCharcoal, {x: -2.5, y: 7.5, z: -1.5}, 'chimney', 1.3);

  // Center the group
  villaGroup.position.y = -2.5;

  // ─── FLOATING ARCHITECTURAL PARTICLES ──────────────────────────
  const particleCount = 60;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSpeeds = [];

  for(let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 30;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    particleSpeeds.push({
      vx: (Math.random() - 0.5) * 0.008,
      vy: (Math.random() - 0.5) * 0.005,
      vz: (Math.random() - 0.5) * 0.008,
      phase: Math.random() * Math.PI * 2
    });
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  const particleMat = new THREE.PointsMaterial({
    color: 0xf58f7c,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ─── LIGHTING ──────────────────────────────────────────────────
  // Ambient fill
  const ambient = new THREE.AmbientLight(0x404060, 1.8);
  scene.add(ambient);

  // Main sun
  const sun = new THREE.DirectionalLight(0xfff5e6, 1.8);
  sun.position.set(-12, 18, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 50;
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  // Fill light from right
  const fill = new THREE.DirectionalLight(0x63b3ed, 0.4);
  fill.position.set(10, 5, -5);
  scene.add(fill);

  // Interior warm glow (ground floor)
  const interiorGlow1 = new THREE.PointLight(0xffa040, 2.0, 8);
  interiorGlow1.position.set(-0.5, 2.4, 1);
  villaGroup.add(interiorGlow1);

  // Interior warm glow (first floor)
  const interiorGlow2 = new THREE.PointLight(0xffa040, 1.5, 8);
  interiorGlow2.position.set(0, 5.2, 1);
  villaGroup.add(interiorGlow2);

  // Entrance glow
  const entranceGlow = new THREE.PointLight(0xffd480, 1.0, 6);
  entranceGlow.position.set(3.2, 1.5, 3);
  villaGroup.add(entranceGlow);

  // Coral ground glow
  const groundGlow = new THREE.PointLight(0xf58f7c, 0.6, 12);
  groundGlow.position.set(0, 0, 6);
  villaGroup.add(groundGlow);

  // ─── ENTRANCE ANIMATION (Blueprint → Solid) ────────────────────
  let animationComplete = false;

  function runEntranceAnimation() {
    if (typeof gsap === 'undefined') {
      // Fallback: just show everything immediately
      villaParts.forEach(part => {
        part.mesh.material.opacity = 1;
        part.mesh.scale.set(1, 1, 1);
        part.wireframe.material.opacity = 0;
      });
      animationComplete = true;
      return;
    }

    const tl = gsap.timeline({
      delay: 1.5,
      onComplete: () => { animationComplete = true; }
    });

    // Phase 1: Wireframes appear with glow
    villaParts.forEach(part => {
      part.wireframe.material.opacity = 0;
      tl.to(part.wireframe.material, {
        opacity: 0.9,
        duration: 0.4,
        ease: 'power2.out'
      }, part.delay * 0.3);
    });

    // Phase 2: Solid meshes build in, wireframes fade
    villaParts.forEach(part => {
      const startTime = 0.8 + part.delay * 0.6;
      
      tl.to(part.mesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.8,
        ease: 'back.out(1.2)'
      }, startTime);

      tl.to(part.mesh.material, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, startTime + 0.1);

      tl.to(part.wireframe.material, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
      }, startTime + 0.4);
    });

    // Phase 3: Interior lights pulse on
    tl.fromTo(interiorGlow1, { intensity: 0 }, { intensity: 2.0, duration: 1, ease: 'power2.out' }, 2.5);
    tl.fromTo(interiorGlow2, { intensity: 0 }, { intensity: 1.5, duration: 1, ease: 'power2.out' }, 2.7);
    tl.fromTo(entranceGlow, { intensity: 0 }, { intensity: 1.0, duration: 0.8, ease: 'power2.out' }, 2.9);

    // Canvas fade in
    tl.fromTo(renderer.domElement, 
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' },
      0
    );
  }

  // ─── ANIMATION LOOP ────────────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  const clock = new THREE.Clock();
  let isVisible = true;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // IntersectionObserver for performance
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Mouse parallax (max ±10°)
    const targetRotY = mouseX * 0.18;
    const targetRotX = mouseY * 0.08;
    villaGroup.rotation.y += (targetRotY + t * 0.03 - villaGroup.rotation.y) * 0.04;
    villaGroup.rotation.x += (targetRotX - villaGroup.rotation.x) * 0.04;

    // Floating effect
    villaGroup.position.y = -2.5 + Math.sin(t * 0.4) * 0.25;

    // Interior light pulsing
    if (animationComplete) {
      interiorGlow1.intensity = 2.0 + Math.sin(t * 1.5) * 0.3;
      interiorGlow2.intensity = 1.5 + Math.sin(t * 1.2 + 1) * 0.25;
    }

    // Particles floating
    const positions = particleGeo.attributes.position.array;
    for(let i = 0; i < particleCount; i++) {
      const sp = particleSpeeds[i];
      positions[i * 3] += sp.vx;
      positions[i * 3 + 1] += Math.sin(t * 0.5 + sp.phase) * 0.003;
      positions[i * 3 + 2] += sp.vz;

      // Wrap around
      if (Math.abs(positions[i * 3]) > 15) sp.vx *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 15) sp.vz *= -1;
    }
    particleGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Start
  animate();
  runEntranceAnimation();
})();
