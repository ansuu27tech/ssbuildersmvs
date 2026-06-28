/**
 * SS BUILDERS MVS — Contact Section 3D Office Building
 * Small floating office with warm lighting and rotating logo
 */

(function() {
  'use strict';

  if (typeof THREE === 'undefined') return;

  // Find the contact info panel
  const contactInfo = document.querySelector('.contact__info');
  if (!contactInfo) return;

  // Create container
  const container = document.createElement('div');
  container.id = 'contact-3d';
  container.style.cssText = 'width:100%;height:250px;margin-bottom:1.5rem;border-radius:16px;overflow:hidden;';
  contactInfo.insertBefore(container, contactInfo.firstChild);

  // Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / 250, 0.1, 100);
  camera.position.set(6, 4, 8);
  camera.lookAt(0, 1.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, 250);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Group
  const office = new THREE.Group();
  scene.add(office);

  // Materials
  const matBody = new THREE.MeshStandardMaterial({ color: 0x2c2b30, roughness: 0.7, metalness: 0.1 });
  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff, transparent: true, opacity: 0.3,
    clearcoat: 1.0, clearcoatRoughness: 0.05
  });
  const matAccent = new THREE.MeshStandardMaterial({
    color: 0xf58f7c, roughness: 0.3,
    emissive: 0xf58f7c, emissiveIntensity: 0.3
  });

  // Platform
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4, 0.2, 48),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.9 })
  );
  platform.receiveShadow = true;
  office.add(platform);

  // Building body (3 floors)
  for (let i = 0; i < 3; i++) {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.0, 2),
      matBody.clone()
    );
    floor.position.y = 0.7 + i * 1.05;
    floor.castShadow = true;
    office.add(floor);

    // Windows per floor
    for (let w = -0.7; w <= 0.7; w += 0.7) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.6, 0.05),
        matGlass.clone()
      );
      win.position.set(w, 0.7 + i * 1.05, 1.03);
      office.add(win);
    }

    // Floor separator accent
    if (i > 0) {
      const sep = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.05, 2.1),
        matAccent.clone()
      );
      sep.position.y = 0.18 + i * 1.05;
      office.add(sep);
    }
  }

  // Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 0.15, 2.2),
    matAccent.clone()
  );
  roof.position.y = 3.42;
  office.add(roof);

  // Entrance
  const entrance = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.8, 0.3),
    matGlass.clone()
  );
  entrance.position.set(0, 0.5, 1.15);
  office.add(entrance);

  // Entrance glow
  const entGlow = new THREE.PointLight(0xffa040, 1.5, 4);
  entGlow.position.set(0, 0.5, 1.5);
  office.add(entGlow);

  // ─── Lighting ──────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x303050, 2.0));

  const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
  mainLight.position.set(-5, 8, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  // Warm fill
  const warmFill = new THREE.PointLight(0xffa040, 0.8, 10);
  warmFill.position.set(3, 2, 3);
  scene.add(warmFill);

  // ─── Animation ─────────────────────────────────────────────────
  let isVisible = false;
  const clock = new THREE.Clock();

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Slow rotation
    office.rotation.y = t * 0.2;

    // Float
    office.position.y = Math.sin(t * 0.5) * 0.15;

    // Pulsing entrance glow
    entGlow.intensity = 1.5 + Math.sin(t * 2) * 0.4;

    renderer.render(scene, camera);
  }

  animate();

  // Resize
  window.addEventListener('resize', () => {
    if (!container.clientWidth) return;
    camera.aspect = container.clientWidth / 250;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, 250);
  });
})();
