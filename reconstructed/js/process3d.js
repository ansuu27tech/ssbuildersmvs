/**
 * SS BUILDERS MVS — Process Page 3D Construction Timeline
 * Scroll-driven building construction animation
 */

(function() {
  'use strict';

  if (typeof THREE === 'undefined') return;

  // Find or create container
  let container = document.getElementById('process-3d-container');
  const timeline = document.querySelector('.process-timeline') || document.querySelector('.timeline');
  
  if (!container && timeline) {
    container = document.createElement('div');
    container.id = 'process-3d-container';
    container.style.cssText = 'position:sticky;top:100px;width:100%;height:400px;margin-bottom:2rem;border-radius:20px;overflow:hidden;background:rgba(10,10,26,0.3);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.05);';
    timeline.parentNode.insertBefore(container, timeline);
  }
  
  if (!container) return;

  // Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / 400, 0.1, 100);
  camera.position.set(12, 8, 15);
  camera.lookAt(0, 2, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, 400);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Building group
  const building = new THREE.Group();
  scene.add(building);

  // Materials
  const matConcrete = new THREE.MeshStandardMaterial({ color: 0xf0ece8, roughness: 0.7 });
  const matSteel = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.3 });
  const matBrick = new THREE.MeshStandardMaterial({ color: 0xb5651d, roughness: 0.9 });
  const matRoof = new THREE.MeshStandardMaterial({ color: 0x2c2b30, roughness: 0.8 });
  const matGlass = new THREE.MeshPhysicalMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3, clearcoat: 1.0 });
  const matWarm = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffa500, emissiveIntensity: 0.5 });

  // ─── Construction Phases ───────────────────────────────────────
  // Phase 1: Foundation
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 6), matConcrete);
  foundation.position.y = -2; // Start below
  foundation.receiveShadow = true;
  building.add(foundation);

  // Phase 2: Columns (4 corners)
  const columns = [];
  const colPositions = [[-3, 0, -2], [3, 0, -2], [-3, 0, 2], [3, 0, 2]];
  colPositions.forEach(([x, y, z]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4, 8), matSteel);
    col.position.set(x, -2, z);
    col.scale.y = 0.01; // Start invisible
    col.castShadow = true;
    building.add(col);
    columns.push(col);
  });

  // Phase 3: Walls
  const walls = [];
  // Front wall
  const fWall = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 0.2), matBrick);
  fWall.position.set(0, -2, 2);
  fWall.scale.set(0.01, 0.01, 1);
  building.add(fWall);
  walls.push(fWall);
  // Back wall
  const bWall = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 0.2), matBrick);
  bWall.position.set(0, -2, -2);
  bWall.scale.set(0.01, 0.01, 1);
  building.add(bWall);
  walls.push(bWall);
  // Side walls
  const sWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 4), matBrick);
  sWall1.position.set(-3, -2, 0);
  sWall1.scale.set(1, 0.01, 0.01);
  building.add(sWall1);
  walls.push(sWall1);
  const sWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 4), matBrick);
  sWall2.position.set(3, -2, 0);
  sWall2.scale.set(1, 0.01, 0.01);
  building.add(sWall2);
  walls.push(sWall2);

  // Phase 4: Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.3, 6.5), matRoof);
  roof.position.set(0, 6, 0);
  roof.scale.set(0.01, 1, 0.01);
  roof.castShadow = true;
  building.add(roof);

  // Phase 5: Windows
  const windows = [];
  for (let x = -1.5; x <= 1.5; x += 1.5) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.05), matGlass);
    win.position.set(x, 1.5, 2.13);
    win.material = matGlass.clone();
    win.material.opacity = 0;
    building.add(win);
    windows.push(win);
  }

  // Phase 6: Interior light
  const interiorLight = new THREE.PointLight(0xffa040, 0, 8);
  interiorLight.position.set(0, 1.5, 0);
  building.add(interiorLight);

  // Platform
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6, 0.2, 48),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 })
  );
  platform.position.y = -0.35;
  platform.receiveShadow = true;
  building.add(platform);

  building.position.y = -1;

  // ─── Lighting ──────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x404060, 2.0));
  const sun = new THREE.DirectionalLight(0xfff5e6, 1.5);
  sun.position.set(-8, 12, 8);
  sun.castShadow = true;
  scene.add(sun);

  // ─── Scroll-Driven Progress ────────────────────────────────────
  let progress = 0;
  let isVisible = false;
  const clock = new THREE.Clock();

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(container);

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1.5,
      onUpdate: (self) => { progress = self.progress; }
    });
  } else {
    // Fallback: use scroll position
    window.addEventListener('scroll', () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      progress = Math.max(0, Math.min(1, 1 - (rect.bottom / (vh + rect.height))));
    });
  }

  // ─── Animation ─────────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Slow orbit
    building.rotation.y = t * 0.1;

    // Phase 1: Foundation (0–15%)
    const foundY = progress < 0.15 ? -2 + (progress / 0.15) * 2.25 : 0.25;
    foundation.position.y = foundY;

    // Phase 2: Columns (15–30%)
    columns.forEach(col => {
      if (progress > 0.15) {
        const p = Math.min(1, (progress - 0.15) / 0.15);
        col.scale.y = p;
        col.position.y = 0.5 + p * 2;
      }
    });

    // Phase 3: Walls (30–50%)
    walls.forEach((wall, i) => {
      if (progress > 0.3) {
        const p = Math.min(1, (progress - 0.3) / 0.2);
        if (i < 2) { wall.scale.x = p; wall.scale.y = p; }
        else { wall.scale.y = p; wall.scale.z = p; }
        wall.position.y = 0.5 + p * 1.5;
      }
    });

    // Phase 4: Roof (50–65%)
    if (progress > 0.5) {
      const p = Math.min(1, (progress - 0.5) / 0.15);
      roof.scale.x = p;
      roof.scale.z = p;
      roof.position.y = 3.5 + (1 - p) * 3;
    }

    // Phase 5: Windows (65–80%)
    windows.forEach(win => {
      if (progress > 0.65) {
        const p = Math.min(1, (progress - 0.65) / 0.15);
        win.material.opacity = p * 0.4;
      }
    });

    // Phase 6: Interior lights (80–100%)
    if (progress > 0.8) {
      const p = (progress - 0.8) / 0.2;
      interiorLight.intensity = p * 2.5;
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    if (!container.clientWidth) return;
    camera.aspect = container.clientWidth / 400;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, 400);
  });
})();
