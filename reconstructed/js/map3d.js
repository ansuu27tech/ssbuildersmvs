/**
 * SS BUILDERS MVS — Coverage Map 3D Enhancements
 * Glowing 3D pins, animated route lines, floating particles
 * Decorative overlay on the existing interactive map
 */

(function() {
  'use strict';

  if (typeof THREE === 'undefined') return;

  const section = document.getElementById('coverage');
  if (!section) return;

  const mapContainer = section.querySelector('.coverage__map-wrapper') || section.querySelector('.coverage__map');
  if (!mapContainer) return;

  // Create overlay canvas
  const container = document.createElement('div');
  container.id = 'map-3d-overlay';
  container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;';
  mapContainer.style.position = 'relative';
  mapContainer.appendChild(container);

  // Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 8, 12);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // ─── City Pins ─────────────────────────────────────────────────
  // Approximate 2D positions mapped to 3D space
  const cities = [
    { name: 'Melvisharam', x: 0, z: 0, color: 0xf58f7c },       // HQ - center
    { name: 'Vellore', x: -1.5, z: -0.8, color: 0x63b3ed },
    { name: 'Ranipet', x: -0.5, z: 0.8, color: 0x63b3ed },
    { name: 'Ambur', x: 1.5, z: -1.2, color: 0x63b3ed },
    { name: 'Vaniyambadi', x: 2.0, z: -0.3, color: 0x63b3ed },
    { name: 'Arcot', x: -1.0, z: 1.2, color: 0x63b3ed },
    { name: 'Walajah', x: -1.8, z: 1.5, color: 0x63b3ed },
    { name: 'Chennai', x: -2.5, z: 2.5, color: 0x63b3ed },
    { name: 'Bengaluru', x: 3.0, z: 1.0, color: 0x63b3ed }
  ];

  const pins = [];

  cities.forEach(city => {
    const pinGroup = new THREE.Group();
    
    // Pin body (cone)
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.35, 12),
      new THREE.MeshStandardMaterial({ 
        color: city.color, 
        emissive: city.color, 
        emissiveIntensity: 0.4 
      })
    );
    cone.rotation.x = Math.PI;
    cone.position.y = 0.4;
    pinGroup.add(cone);

    // Pin sphere top
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      new THREE.MeshStandardMaterial({ 
        color: city.color, 
        emissive: city.color, 
        emissiveIntensity: 0.6 
      })
    );
    sphere.position.y = 0.6;
    pinGroup.add(sphere);

    // Glow light
    const glow = new THREE.PointLight(city.color, 0.5, 3);
    glow.position.y = 0.6;
    pinGroup.add(glow);

    // Pulse ring on ground
    const ringGeo = new THREE.RingGeometry(0.15, 0.22, 24);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: city.color, transparent: true, opacity: 0.4, side: THREE.DoubleSide 
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    pinGroup.add(ring);

    pinGroup.position.set(city.x, 0, city.z);
    scene.add(pinGroup);

    pins.push({ group: pinGroup, glow, ring, ringMat, phase: Math.random() * Math.PI * 2 });
  });

  // ─── Route Lines ───────────────────────────────────────────────
  // Connect each city to HQ (Melvisharam at 0,0)
  cities.slice(1).forEach(city => {
    const points = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = city.x * t;
      const z = city.z * t;
      const y = Math.sin(t * Math.PI) * 0.3; // Arc upward
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.015, 6, false);
    const tubeMat = new THREE.MeshBasicMaterial({ 
      color: 0x63b3ed, transparent: true, opacity: 0.25
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tube);
  });

  // ─── Floating Particles ────────────────────────────────────────
  const pCount = 30;
  const pPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 8;
    pPositions[i * 3 + 1] = Math.random() * 2;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({ 
    color: 0xf58f7c, size: 0.05, transparent: true, opacity: 0.5, sizeAttenuation: true
  });
  scene.add(new THREE.Points(pGeo, pMat));

  // ─── Lighting ──────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x404060, 1.5));
  const dl = new THREE.DirectionalLight(0xffffff, 0.8);
  dl.position.set(-3, 8, 5);
  scene.add(dl);

  // ─── Animation ─────────────────────────────────────────────────
  let isVisible = false;
  const clock = new THREE.Clock();

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(container);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Animate pins
    pins.forEach(pin => {
      // Float
      pin.group.position.y = Math.sin(t * 0.8 + pin.phase) * 0.08;
      // Glow pulse
      pin.glow.intensity = 0.5 + Math.sin(t * 1.5 + pin.phase) * 0.3;
      // Ring pulse
      pin.ringMat.opacity = 0.2 + Math.sin(t * 2 + pin.phase) * 0.2;
      const s = 1 + Math.sin(t * 1.5 + pin.phase) * 0.3;
      pin.ring.scale.set(s, s, 1);
    });

    // Float particles
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      pos[i * 3 + 1] += Math.sin(t + i) * 0.002;
    }
    pGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  // Resize
  window.addEventListener('resize', () => {
    if (!container.clientWidth) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
