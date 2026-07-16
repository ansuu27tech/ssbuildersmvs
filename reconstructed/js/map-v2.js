/**
 * Ultimate Premium Interactive Service Coverage Map
 * SS BUILDERS MVS
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('coverage-map-container');
  const canvas = document.getElementById('map-3d-canvas');
  const uiLayer = document.getElementById('map-ui-layer');

  if (!container || !canvas || !uiLayer) return;

  // --- City Data ---
  const cities = [
      { id: 'chennai', name: 'Chennai', x: 60, z: -15, isHQ: false, services: 'Premium Residential, Commercial', distance: '120 km', time: '2h 30m', price: '2000' },
      { id: 'walajah', name: 'Walajah', x: 22, z: -6, isHQ: false, services: 'Residential, Renovation', distance: '30 km', time: '45m', price: '1550' },
      { id: 'ranipet', name: 'Ranipet', x: 12, z: 10, isHQ: false, services: 'Residential, Commercial', distance: '15 km', time: '20m', price: '1550' },
      { id: 'melvisharam', name: 'Melvisharam (HQ)', x: 0, z: 0, isHQ: true, services: 'All Services (Headquarters)', distance: '0 km', time: '0m', price: '1550' },
      { id: 'arcot', name: 'Arcot', x: -2, z: -12, isHQ: false, services: 'Residential, Architecture', distance: '2 km', time: '5m', price: '1550' },
      { id: 'vellore', name: 'Vellore', x: -16, z: 8, isHQ: false, services: 'Premium Residential, Commercial', distance: '20 km', time: '30m', price: '1750' },
      { id: 'ambur', name: 'Ambur', x: -35, z: -5, isHQ: false, services: 'Residential, Turnkey', distance: '55 km', time: '1h 10m', price: '1750' },
      { id: 'vaniyambadi', name: 'Vaniyambadi', x: -48, z: 12, isHQ: false, services: 'Residential, Architecture', distance: '75 km', time: '1h 30m', price: '1750' },
      { id: 'bengaluru', name: 'Bengaluru', x: -70, z: -8, isHQ: false, services: 'Luxury Villas, Commercial', distance: '210 km', time: '4h 0m', price: '2100' },
    ];

  let scene, camera, renderer, controls;
  const markers = [];
  const birds = [];
  const radarRings = [];
  const routeParticles = [];
  const routeCurves = [];
  let activeCity = null;

  // Parallax variables
  let mouseX = 0;
  let mouseY = 0;
  let targetCameraOffset = new THREE.Vector3();

  // Initial Camera Config
  const INIT_CAMERA_POS = { x: 0, y: 60, z: 70 };
  const INIT_TARGET = { x: -5, y: 0, z: 5 };
  
  const tempV = new THREE.Vector3();
  const clock = new THREE.Clock();


  // Store route segments and the full path for animation
  let fullRoutePath = null; // CatmullRom through all cities
  const routeSegmentLines = []; // individual glowing segment lines
  const energyParticles = []; // flowing energy orbs
  const trailMeshes = []; // fading trail segments

  init3D();
  createHTMLMarkers();
  animate();

  function init3D() {
    // Scene - Clean Sunrise Theme
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFDFD3'); // Soft sunrise peach/orange
    // Fog removed for a clean look as requested

    // Camera
    camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 120, 100); // Start high for cinematic drop

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.5; 
    controls.minDistance = 20;
    controls.maxDistance = 140;
    controls.target.set(INIT_TARGET.x, INIT_TARGET.y, INIT_TARGET.z);
    controls.enableKeys = false; 
    
    // Lighting - Sunrise Setup
    const ambientLight = new THREE.AmbientLight(0xFFE4E1, 0.65); // Warm ambient
    scene.add(ambientLight);
    
    // Main directional light (Sun at a low angle)
    const sunLight = new THREE.DirectionalLight(0xFFB347, 1.4); // Golden orange sunlight
    sunLight.position.set(60, 25, -50); // Low angle for sunrise effect
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.camera.left = -80;
    sunLight.shadow.camera.right = 80;
    sunLight.shadow.camera.top = 80;
    sunLight.shadow.camera.bottom = -80;
    scene.add(sunLight);

    // Subtle edge rim light (warm)
    const rimLight = new THREE.DirectionalLight(0xFFDAB9, 0.4); 
    rimLight.position.set(-60, 25, 60);
    scene.add(rimLight);

    createRealisticDiorama();
    createPhysicalRoute();
    createRadar();
    createBridges();
    createBirds();

    // Camera Fly-in Intro
    gsap.to(camera.position, {
      x: INIT_CAMERA_POS.x,
      y: INIT_CAMERA_POS.y,
      z: INIT_CAMERA_POS.z,
      duration: 3.5,
      ease: "power3.out"
    });

    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('mousemove', onMouseMove);

    // Info panel close button
    const closeBtn = document.getElementById('map-info-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetMap();
      });
    }

    // Escape key to reset map
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeCity) resetMap();
    });
  }

  function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function createRealisticDiorama() {
    // Topographical terrain using flat shading for a crisp architectural model look
    const geo = new THREE.PlaneGeometry(140, 100, 70, 50);
    geo.rotateX(-Math.PI / 2);
    
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      
      // Organic noise for natural hills and valleys
      let vy = Math.sin(vx * 0.08 + vz * 0.05) * 2.5 
             + Math.sin(vx * 0.15 - vz * 0.1) * 1.5 
             + Math.sin(vx * 0.3 + vz * 0.2) * 0.4;
             
      // Carve a natural river diagonally across the map
      const riverDist = Math.abs(vx - vz * 1.2 + Math.sin(vz * 0.1) * 15);
      if (riverDist < 6) {
        // Deepen to create a riverbed, creating a gorge
        vy -= (6 - riverDist) * 0.8;
      }
             
      // Flatten out slightly near the center/cities
      const distFromCenter = Math.sqrt(vx*vx + vz*vz);
      if (distFromCenter < 20 && riverDist > 6) {
        vy *= 0.5; 
      }
             
      pos.setY(i, vy - 1); 
    }
    geo.computeVertexNormals();

    // Mountain Terrain Material - Lush Green
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: 0x6AB04C, // Vibrant, lush grassy green
      roughness: 0.9,
      metalness: 0.05,
      clearcoat: 0.0,
      flatShading: true // Faceted low-poly look
    });
    const terrain = new THREE.Mesh(geo, baseMat);
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    scene.add(terrain);

    // River / Water Layer
    const waterGeo = new THREE.PlaneGeometry(140, 100);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x4A69BD, // Clean river blue
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -2.2; 
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // Solid base - Earthy Dirt
    const boxGeo = new THREE.BoxGeometry(140, 10, 100);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x6D4C41, // Brown dirt base
      roughness: 1.0,
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.y = -6;
    boxMesh.receiveShadow = true;
    scene.add(boxMesh);
  }

  function createPhysicalRoute() {
    // Build ordered city positions
    const orderedCities = [
      'chennai', 'walajah', 'ranipet', 'melvisharam', 'arcot',
      'vellore', 'ambur', 'vaniyambadi', 'bengaluru'
    ].map(id => cities.find(c => c.id === id)).filter(Boolean);
    if (orderedCities.length < 2) return;

    const routePoints = orderedCities.map(c => new THREE.Vector3(c.x, 0.8, c.z));

    // === 1. Base route line (dim, always visible) ===
    // Use CatmullRomCurve3 for a smooth organic path through all cities
    fullRoutePath = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', 0.3);
    const basePoints = fullRoutePath.getPoints(200);
    const baseGeo = new THREE.BufferGeometry().setFromPoints(basePoints);
    const baseMat = new THREE.LineBasicMaterial({
      color: 0xF58F7C,
      transparent: true,
      opacity: 0.12
    });
    const baseLine = new THREE.Line(baseGeo, baseMat);
    scene.add(baseLine);

    // === 2. Segment arc lines between consecutive cities ===
    for (let i = 0; i < orderedCities.length - 1; i++) {
      const startPos = new THREE.Vector3(orderedCities[i].x, 0.8, orderedCities[i].z);
      const endPos = new THREE.Vector3(orderedCities[i + 1].x, 0.8, orderedCities[i + 1].z);

      // Subtle arc between consecutive cities
      const midPoint = new THREE.Vector3().lerpVectors(startPos, endPos, 0.5);
      midPoint.y += startPos.distanceTo(endPos) * 0.1;

      const segCurve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
      routeCurves.push(segCurve);

      const segPoints = segCurve.getPoints(40);
      const segGeo = new THREE.BufferGeometry().setFromPoints(segPoints);
      const segMat = new THREE.LineBasicMaterial({
        color: 0xF58F7C,
        transparent: true,
        opacity: 0.25
      });
      const segLine = new THREE.Line(segGeo, segMat);
      scene.add(segLine);
      routeSegmentLines.push({ line: segLine, mat: segMat });
    }

    // === 3. Glowing energy orbs that flow through the full path ===
    const ENERGY_COUNT = 5; // Number of energy orbs flowing simultaneously
    for (let i = 0; i < ENERGY_COUNT; i++) {
      // Main energy orb (bright core)
      const coreGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.95
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      scene.add(core);

      // Outer glow halo
      const glowGeo = new THREE.SphereGeometry(0.8, 12, 12);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xF58F7C,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glow);

      // Point light that travels with the orb
      const orbLight = new THREE.PointLight(0xF58F7C, 1.5, 8);
      scene.add(orbLight);

      // Trail particles (small spheres that fade behind the orb)
      const trail = [];
      const TRAIL_LENGTH = 12;
      for (let t = 0; t < TRAIL_LENGTH; t++) {
        const trailGeo = new THREE.SphereGeometry(0.15 - t * 0.01, 6, 6);
        const trailMat = new THREE.MeshBasicMaterial({
          color: 0xF58F7C,
          transparent: true,
          opacity: 0
        });
        const trailMesh = new THREE.Mesh(trailGeo, trailMat);
        scene.add(trailMesh);
        trail.push({ mesh: trailMesh, mat: trailMat });
      }

      energyParticles.push({
        core: core,
        coreMat: coreMat,
        glow: glow,
        glowMat: glowMat,
        light: orbLight,
        trail: trail,
        progress: i / ENERGY_COUNT, // Evenly spaced along the route
        speed: 0.0015 + Math.random() * 0.0005, // Slight speed variation
        trailPositions: [] // history of positions for the trail
      });
    }

    // === 4. City node glow rings (pulse when energy arrives) ===
    orderedCities.forEach((city, idx) => {
      const ringGeo = new THREE.RingGeometry(0.8, 1.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: city.isHQ ? 0xD4AF37 : 0xF58F7C,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(city.x, 0.85, city.z);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);

      // Store with the city's normalized position on the path
      ring.userData = {
        baseOpacity: 0.15,
        pathPosition: idx / (orderedCities.length - 1),
        mat: ringMat
      };
      trailMeshes.push(ring);
    });
  }

  function createRadar() {
    const hq = cities.find(c => c.isHQ);
    if (!hq) return;
    
    // Create concentric rings that pulse
    for(let i=0; i<3; i++) {
      const ringGeo = new THREE.RingGeometry(0.5, 0.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xF58F7C, // Electric blue/coral accent
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(hq.x, 0.9, hq.z);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);
      
      radarRings.push({
        mesh: ring,
        progress: i / 3 // Staggered start
      });
    }
  }

  function createBridges() {
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.3,
      roughness: 0.8
    });
    
    // Create a realistic physical bridge over the river
    const bridgeGeo = new THREE.BoxGeometry(6, 0.4, 2.5);
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    
    // Position it where the route crosses the carved river
    bridge.position.set(-2, -1.5, -4);
    bridge.rotation.y = -Math.PI / 4; 
    bridge.castShadow = true;
    scene.add(bridge);
    
    // Add small support pillars into the water
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 3);
    const p1 = new THREE.Mesh(pillarGeo, bridgeMat);
    p1.position.set(-2, -1.5, 0);
    bridge.add(p1);
    const p2 = new THREE.Mesh(pillarGeo, bridgeMat);
    p2.position.set(2, -1.5, 0);
    bridge.add(p2);
  }

  function createBirds() {
    const birdGeo = new THREE.BufferGeometry();
    // V-shape for realistic birds in the distance
    const vertices = new Float32Array([
        -0.4, 0, -0.4,
         0,   0,  0.4,
         0.4, 0, -0.4,
         0, -0.15, 0.1
    ]);
    const indices = [
        0, 1, 3,
        1, 2, 3,
        0, 3, 2 
    ];
    birdGeo.setIndex(indices);
    birdGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    birdGeo.computeVertexNormals();

    const birdMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.8
    });

    // Flock of birds
    for(let i=0; i<15; i++) {
        const bird = new THREE.Mesh(birdGeo, birdMat);
        bird.position.set(
            (Math.random() - 0.5) * 80,
            12 + Math.random() * 8, // Fly high above terrain
            (Math.random() - 0.5) * 80
        );
        bird.castShadow = true;
        
        bird.userData = {
            speed: 0.05 + Math.random() * 0.05,
            radius: 15 + Math.random() * 30,
            angle: Math.random() * Math.PI * 2,
            yOffset: bird.position.y
        };
        
        scene.add(bird);
        birds.push(bird);
    }
  }

  function createHTMLMarkers() {
    cities.forEach(city => {
      const isHQ = city.isHQ;
      let labelHeight = 1.5;
      
      if (isHQ) {
        // Custom Architectural Model for SS Builders HQ
        const hqGroup = new THREE.Group();
        
        const matGold = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.8, roughness: 0.2 });
        const matGlass = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.1 });
        
        // Base Foundation
        const base = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 3), matGold);
        base.position.y = 0.5;
        base.castShadow = true; base.receiveShadow = true;
        hqGroup.add(base);
        
        // Middle Glass Tower
        const mid = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 2), matGlass);
        mid.position.y = 2.5;
        mid.castShadow = true; mid.receiveShadow = true;
        hqGroup.add(mid);
        
        // Top Crown
        const top = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 2.5), matGold);
        top.position.y = 4.25;
        top.castShadow = true; top.receiveShadow = true;
        hqGroup.add(top);
        
        // Construction Spire/Crane detail on top
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2), matGold);
        spire.position.set(0.5, 5.5, 0.5);
        spire.castShadow = true;
        hqGroup.add(spire);
        
        const craneArm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.1), matGold);
        craneArm.position.set(1.5, 6.4, 0.5);
        craneArm.castShadow = true;
        hqGroup.add(craneArm);

        hqGroup.position.set(city.x, 0, city.z);
        scene.add(hqGroup);
        
        // HQ Illumination
        const glow = new THREE.PointLight(0xD4AF37, 2, 20);
        glow.position.set(city.x, 8, city.z);
        scene.add(glow);
        
        labelHeight = 7.5; // Place HTML label above the crane
      } else {
        // Standard City Marker
        const height = 1.5;
        const bldgGeo = new THREE.BoxGeometry(1, height, 1);
        const bldgMat = new THREE.MeshStandardMaterial({ 
          color: 0x888888,
          metalness: 0.4,
          roughness: 0.5,
        });
        const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
        bldgMesh.position.set(city.x, height/2, city.z);
        bldgMesh.castShadow = true;
        bldgMesh.receiveShadow = true;
        scene.add(bldgMesh);
        
        const glow = new THREE.PointLight(0xffffff, 0.5, 12);
        glow.position.set(city.x, height + 2, city.z);
        scene.add(glow);
        
        labelHeight = height + 1.5;
      }

      // HTML Overlay Marker
      const marker = document.createElement('div');
      marker.className = `city-marker ${city.isHQ ? 'city-marker--hq' : ''}`;
      marker.dataset.id = city.id;

      // Keep UI clean, pointing down to the physical building
      let html = `
        <div class="city-marker__dot" style="margin-bottom: 5px;"></div>
        <div class="city-marker__label">${city.name}</div>
      `;
      if (city.isHQ) {
        html += `<div class="city-marker__hq-badge">HQ</div>`;
      }

      marker.innerHTML = html;
      
      marker.addEventListener('click', (e) => {
        e.stopPropagation(); 
        focusCity(city);
      });
      
      marker.addEventListener('mouseenter', () => {
        if(!activeCity) {
           gsap.to(marker, { scale: 1.15, duration: 0.3, ease: "back.out(1.5)" });
        }
      });
      marker.addEventListener('mouseleave', () => {
        gsap.to(marker, { scale: 1, duration: 0.3, ease: "power2.out" });
      });

      uiLayer.appendChild(marker);
      
      // Position the HTML label slightly above the 3D building
      markers.push({ element: marker, pos3D: new THREE.Vector3(city.x, labelHeight, city.z), cityData: city });
    });
  }

  function createInfoPanel() {
    // Removed because the panel is statically generated in index.html now
  }

  function focusCity(city) {
    if (activeCity === city.id) return;
    activeCity = city.id;

    markers.forEach(m => {
      if (m.cityData.id === city.id) {
        m.element.classList.add('active');
        m.element.classList.remove('blurred');
      } else {
        m.element.classList.remove('active');
        m.element.classList.add('blurred');
      }
    });

    const targetPos = new THREE.Vector3(city.x, 0, city.z);
    const offset = new THREE.Vector3(-12, 15, 15); 
    const newCamPos = targetPos.clone().add(offset);

    gsap.to(camera.position, {
      x: newCamPos.x,
      y: newCamPos.y,
      z: newCamPos.z,
      duration: 2.5,
      ease: "power4.inOut"
    });

    gsap.to(controls.target, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 2.5,
      ease: "power4.inOut"
    });

    const panel = document.getElementById('map-info-panel');
    if(panel) {
      document.getElementById('map-info-badge').textContent = city.isHQ ? 'HQ' : 'Service Region';
      document.getElementById('map-info-city').textContent = city.name;
      document.getElementById('map-info-subtitle').textContent = city.isHQ ? 'Corporate Headquarters' : 'Service Region';
      document.getElementById('map-info-distance').textContent = city.distance;
      document.getElementById('map-info-time').textContent = city.time;
      document.getElementById('map-info-services').textContent = city.services;
      const priceElement = document.getElementById('map-info-price');
      if (priceElement) {
        priceElement.textContent = `₹${city.price}/sq.ft.`;
      }
      
      panel.classList.add('visible');
    }
  }

  function resetMap() {
    activeCity = null;

    markers.forEach(m => {
      m.element.classList.remove('active', 'blurred');
    });

    const panel = document.getElementById('map-info-panel');
    if (panel) panel.classList.remove('visible');
    
    document.body.style.overflow = '';

    gsap.to(camera.position, {
      x: INIT_CAMERA_POS.x,
      y: INIT_CAMERA_POS.y,
      z: INIT_CAMERA_POS.z,
      duration: 2.5,
      ease: "power4.inOut"
    });

    gsap.to(controls.target, {
      x: INIT_TARGET.x,
      y: INIT_TARGET.y,
      z: INIT_TARGET.z,
      duration: 2.5,
      ease: "power4.inOut"
    });
  }
  
  function onPointerDown(event) {
    if(activeCity) resetMap();
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    controls.update();

    // Animate Birds
    birds.forEach(bird => {
        bird.userData.angle += bird.userData.speed * 0.02;
        bird.position.x = Math.cos(bird.userData.angle) * bird.userData.radius;
        bird.position.z = Math.sin(bird.userData.angle) * bird.userData.radius;
        bird.position.y = bird.userData.yOffset + Math.sin(bird.userData.angle * 4 + bird.position.x) * 1.5;
        bird.rotation.y = -bird.userData.angle; 
        
        // Wing flapping illusion
        bird.rotation.z = Math.sin(elapsedTime * 15 + bird.userData.angle) * 0.3; 
    });

    // Animate Energy Flow along sequential route
    if (fullRoutePath) {
      energyParticles.forEach(ep => {
        // Advance along the full path
        ep.progress += ep.speed;
        if (ep.progress > 1) ep.progress -= 1; // Loop continuously

        // Get position on the smooth curve
        const pos = fullRoutePath.getPoint(ep.progress);

        // Update core orb position
        ep.core.position.copy(pos);
        ep.glow.position.copy(pos);
        ep.light.position.copy(pos);
        ep.light.position.y += 1;

        // Pulsing glow effect
        const pulse = 0.3 + Math.sin(elapsedTime * 6 + ep.progress * 20) * 0.15;
        ep.glowMat.opacity = pulse;
        ep.coreMat.opacity = 0.7 + Math.sin(elapsedTime * 8) * 0.3;

        // Scale glow with pulse
        const glowScale = 1 + Math.sin(elapsedTime * 4 + ep.progress * 10) * 0.3;
        ep.glow.scale.set(glowScale, glowScale, glowScale);

        // Record position history for trail
        ep.trailPositions.unshift(pos.clone());
        if (ep.trailPositions.length > ep.trail.length) {
          ep.trailPositions.pop();
        }

        // Update trail particles
        ep.trail.forEach((t, idx) => {
          if (idx < ep.trailPositions.length) {
            t.mesh.position.copy(ep.trailPositions[idx]);
            t.mat.opacity = (1 - idx / ep.trail.length) * 0.5;
            const trailScale = 1 - idx / ep.trail.length;
            t.mesh.scale.set(trailScale, trailScale, trailScale);
          }
        });

        // Pulse city rings when energy passes nearby
        trailMeshes.forEach(ring => {
          const dist = Math.abs(ep.progress - ring.userData.pathPosition);
          if (dist < 0.05) {
            const intensity = 1 - (dist / 0.05);
            ring.userData.mat.opacity = ring.userData.baseOpacity + intensity * 0.6;
            const ringScale = 1 + intensity * 0.5;
            ring.scale.set(ringScale, ringScale, ringScale);
          } else {
            // Smoothly return to base
            ring.userData.mat.opacity += (ring.userData.baseOpacity - ring.userData.mat.opacity) * 0.05;
            ring.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
          }
        });
      });

      // Animate segment lines with a wave glow
      routeSegmentLines.forEach((seg, idx) => {
        const wave = Math.sin(elapsedTime * 2 - idx * 0.5) * 0.5 + 0.5;
        seg.mat.opacity = 0.15 + wave * 0.2;
      });
    }

    // Animate Radar Rings
    radarRings.forEach(rr => {
      rr.progress += 0.01;
      if(rr.progress > 1) rr.progress = 0;
      
      const scale = 1 + rr.progress * 8; // Max size
      rr.mesh.scale.set(scale, scale, scale);
      
      // Fade out as it expands
      rr.mesh.material.opacity = (1 - rr.progress) * 0.8;
    });

    // Mouse Parallax effect (disabled to allow free movement)
    // if (!activeCity) {
    //   targetCameraOffset.x = mouseX * 10;
    //   targetCameraOffset.y = -mouseY * 10;
    //   camera.position.x += ((INIT_CAMERA_POS.x + targetCameraOffset.x) - camera.position.x) * 0.05;
    //   camera.position.y += ((INIT_CAMERA_POS.y + targetCameraOffset.y) - camera.position.y) * 0.05;
    //   camera.lookAt(controls.target);
    // }

    const widthHalf = container.clientWidth / 2;
    const heightHalf = container.clientHeight / 2;

    markers.forEach(m => {
      tempV.copy(m.pos3D);
      tempV.project(camera);

      if (tempV.z > 1) {
        m.element.style.display = 'none';
        return;
      }
      
      m.element.style.display = 'flex';

      const x = (tempV.x * widthHalf) + widthHalf;
      const y = -(tempV.y * heightHalf) + heightHalf;

      m.element.style.left = `${x}px`;
      m.element.style.top = `${y}px`;
    });

    renderer.render(scene, camera);
  }

  // Connect Sidebar City Tags to Map Focus
  const cityTags = document.querySelectorAll('.coverage__city-tag');
  cityTags.forEach(tag => {
    tag.style.cursor = 'pointer'; // Add cursor pointer style
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const cityId = tag.getAttribute('data-city-link');
      const cityData = cities.find(c => c.id === cityId);
      if (cityData) {
        focusCity(cityData);
        
        // Scroll to the map container smoothly
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
});