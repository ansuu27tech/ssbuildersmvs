/**
 * SS BUILDERS MVS — About Section 3D Blueprint Animation
 * Blueprint → Wireframe → Finished Building (scroll-driven)
 */

(function() {
  'use strict';

  const section = document.getElementById('story');
  if (!section || typeof THREE === 'undefined') return;

  // Create canvas container
  const container = document.createElement('div');
  container.id = 'about-3d';
  container.style.cssText = 'position:absolute;top:0;right:0;width:40%;height:100%;pointer-events:none;z-index:1;opacity:0.5;';
  
  const intro = section.querySelector('.story__intro');
  if (intro) {
    intro.style.position = 'relative';
    intro.appendChild(container);
  } else return;

  // Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(8, 5, 10);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group
  const building = new THREE.Group();
  scene.add(building);

  // Materials
  const blueprintMat = new THREE.LineBasicMaterial({ color: 0x63b3ed, transparent: true, opacity: 0.8 });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x63b3ed, wireframe: true, transparent: true, opacity: 0 });
  const solidMat = new THREE.MeshStandardMaterial({ color: 0xf0ece8, roughness: 0.7, transparent: true, opacity: 0 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2c2b30, roughness: 0.8, transparent: true, opacity: 0 });

  // Build procedural building
  const parts = [];

  function addPart(geo, pos, matType) {
    const edges = new THREE.EdgesGeometry(geo);
    const blueprint = new THREE.LineSegments(edges, blueprintMat.clone());
    blueprint.position.set(pos.x, pos.y, pos.z);
    
    const wire = new THREE.Mesh(geo, wireMat.clone());
    wire.position.copy(blueprint.position);
    
    const mat = matType === 'roof' ? roofMat.clone() : solidMat.clone();
    const solid = new THREE.Mesh(geo, mat);
    solid.position.copy(blueprint.position);

    building.add(blueprint);
    building.add(wire);
    building.add(solid);

    parts.push({ blueprint, wire, solid });
  }

  // Base
  addPart(new THREE.BoxGeometry(5, 0.3, 4), {x: 0, y: 0.15, z: 0}, 'roof');
  // Ground floor
  addPart(new THREE.BoxGeometry(4, 2.5, 3), {x: 0, y: 1.55, z: 0}, 'solid');
  // First floor
  addPart(new THREE.BoxGeometry(4.5, 2, 3.2), {x: 0, y: 3.8, z: 0}, 'solid');
  // Roof
  addPart(new THREE.BoxGeometry(5, 0.25, 3.8), {x: 0, y: 4.95, z: 0}, 'roof');
  // Windows (glass)
  addPart(new THREE.BoxGeometry(2, 1.5, 0.05), {x: 0, y: 1.6, z: 1.53}, 'solid');
  addPart(new THREE.BoxGeometry(2.5, 1.2, 0.05), {x: 0, y: 3.8, z: 1.63}, 'solid');

  building.position.y = -1;

  // Lighting
  scene.add(new THREE.AmbientLight(0x404060, 1.5));
  const light = new THREE.DirectionalLight(0xfff5e6, 1.5);
  light.position.set(-5, 8, 5);
  scene.add(light);

  // Scroll-driven animation
  let scrollProgress = 0;
  let isVisible = false;

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(container);

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1,
      onUpdate: (self) => {
        scrollProgress = self.progress;
      }
    });
  }

  // Animation
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Slow rotation
    building.rotation.y = t * 0.15;

    // Phase transitions based on scroll
    parts.forEach(part => {
      if (scrollProgress < 0.33) {
        // Phase 1: Blueprint only
        part.blueprint.material.opacity = 0.8;
        part.wire.material.opacity = 0;
        part.solid.material.opacity = 0;
      } else if (scrollProgress < 0.66) {
        // Phase 2: Blueprint fades, wireframe appears
        const p = (scrollProgress - 0.33) / 0.33;
        part.blueprint.material.opacity = 0.8 * (1 - p);
        part.wire.material.opacity = p * 0.6;
        part.solid.material.opacity = 0;
      } else {
        // Phase 3: Wireframe fades, solid appears
        const p = (scrollProgress - 0.66) / 0.34;
        part.blueprint.material.opacity = 0;
        part.wire.material.opacity = 0.6 * (1 - p);
        part.solid.material.opacity = p;
      }
    });

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
