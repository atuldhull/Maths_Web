/* ═══════════════════════════════════════════════
   MATH COLLECTIVE — GLOBE ANIMATION
   Three.js Earth with orbital rings + math symbols
   Called via: initGlobe(canvasId)
═══════════════════════════════════════════════ */

function initGlobe(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── Scene Setup ── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
  camera.position.set(0, 0, 6.5);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  /* ── Lighting ── */
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(5, 3, 5);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x334466, 1.2));
  const rimLight = new THREE.DirectionalLight(0x7c3aed, 0.8);
  rimLight.position.set(-5, -2, -3);
  scene.add(rimLight);

  /* ── Textures ── */
  const loader = new THREE.TextureLoader();
  const earthMap  = loader.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg");
  const bumpMap   = loader.load("https://threejs.org/examples/textures/planets/earthbump1k.jpg");
  const specMap   = loader.load("https://threejs.org/examples/textures/planets/earthspec1k.jpg");

  /* ── Earth Globe ── */
  const earthGeo = new THREE.SphereGeometry(2, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({
    map:        earthMap,
    bumpMap:    bumpMap,
    bumpScale:  0.07,
    specularMap: specMap,
    specular:   new THREE.Color(0x446688),
    shininess:  28,
  });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  scene.add(earth);

  /* ── Atmosphere Glow ── */
  const atmGeo = new THREE.SphereGeometry(2.06, 64, 64);
  const atmMat = new THREE.MeshBasicMaterial({
    color: 0x4488ff, transparent: true, opacity: 0.12, side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  /* ── Purple Outer Glow ── */
  const haloGeo = new THREE.SphereGeometry(2.18, 64, 64);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed, transparent: true, opacity: 0.06, side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(haloGeo, haloMat));

  /* ── Orbital Rings ── */
  const orbitConfigs = [
    { rx: 3.2, ry: 3.2, tiltX: 0,              tiltY: 0,             color: 0x7c3aed, speed: 0.0008 },
    { rx: 3.2, ry: 1.6, tiltX: Math.PI / 2,    tiltY: 0,             color: 0x3b82f6, speed: 0.0006 },
    { rx: 2.9, ry: 3.2, tiltX: Math.PI / 4,    tiltY: Math.PI / 3,   color: 0xa78bfa, speed: 0.0010 },
    { rx: 3.3, ry: 2.1, tiltX: -Math.PI / 5,   tiltY: Math.PI / 6,   color: 0x6366f1, speed: 0.0007 },
  ];

  const orbitObjects = orbitConfigs.map(cfg => {
    const pts = [];
    for (let i = 0; i <= 360; i++) {
      const a = (i * Math.PI) / 180;
      pts.push(new THREE.Vector3(Math.cos(a) * cfg.rx, Math.sin(a) * cfg.ry, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.35 });
    const ring = new THREE.LineLoop(geo, mat);
    ring.rotation.x = cfg.tiltX;
    ring.rotation.y = cfg.tiltY;
    scene.add(ring);
    return { ring, cfg, angle: Math.random() * Math.PI * 2 };
  });

  /* ── Math Symbol Sprites on Orbits ── */
  const mathSymbols = ['π', 'Σ', '√', '∞', 'Δ', 'φ'];

  function makeSprite(text, color = '#a78bfa') {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = color;
    ctx.font = 'bold 80px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(0.55, 0.55, 0.55);
    return sprite;
  }

  const orbitSymbols = orbitObjects.map((obj, i) => {
    const sym = makeSprite(mathSymbols[i % mathSymbols.length]);
    scene.add(sym);
    return { sym, orbit: obj };
  });

  /* ── Stars ── */
  const starGeo = new THREE.BufferGeometry();
  const starCount = 7000;
  const pos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) pos[i] = (Math.random() - 0.5) * 2000;
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(starGeo, starMat));

  /* ── Mouse Interaction ── */
  let targetRotX = 0, targetRotY = 0;
  let isHovered = false;

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    targetRotY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
    targetRotX = ((e.clientY - rect.top)  / rect.height - 0.5) * 0.4;
    isHovered = true;
  });
  canvas.addEventListener('mouseleave', () => { isHovered = false; });

  /* ── Resize ── */
  const resizeObserver = new ResizeObserver(() => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(canvas);

  /* ── Animation Loop ── */
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;

    /* Gentle auto-spin */
    earth.rotation.y += 0.001;

    /* Mouse-driven tilt */
    if (isHovered) {
      earth.rotation.x += (targetRotX * 0.5 - earth.rotation.x) * 0.05;
      earth.rotation.y += (targetRotY * 0.5 - earth.rotation.y) * 0.05;
    }

    /* Orbit rings slow spin */
    orbitObjects.forEach(({ ring, cfg }) => {
      ring.rotation.z += cfg.speed;
    });

    /* Update sprite positions along orbit paths */
    orbitSymbols.forEach(({ sym, orbit }, i) => {
      orbit.angle += orbit.cfg.speed * 1.5;
      const a = orbit.angle;
      const x = Math.cos(a) * orbit.cfg.rx;
      const y = Math.sin(a) * orbit.cfg.ry;
      // Apply ring's rotation matrix
      const v = new THREE.Vector3(x, y, 0);
      v.applyEuler(orbit.ring.rotation);
      sym.position.copy(v);
      sym.material.opacity = 0.7 + 0.3 * Math.sin(frame * 0.03 + i);
    });

    renderer.render(scene, camera);
  }
  animate();
}
