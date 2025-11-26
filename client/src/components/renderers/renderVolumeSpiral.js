export function renderVolumeSpiral({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) {
    console.warn("[renderVolumeSpiral] No points provided");
    return {};
  }

  // -------------------------------------------
  // Extract prices & generate synthetic volumes
  // (In Bitcoin CSV, volume may not exist; we map it)
  // -------------------------------------------
  const prices = pts.map(p => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  // Fake "volume" by absolute day-to-day price change
  const volumes = prices.map((p, i) => {
    if (i === 0) return 0;
    return Math.abs(prices[i] - prices[i - 1]);
  });

  const maxVol = Math.max(...volumes);

  // -------------------------------------------
  // Build helix path
  // -------------------------------------------
  const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);
  const BASE_RADIUS = 10;
  const HEIGHT_SCALE = 12;

  const path = [];

  for (let i = 0; i < pts.length; i++) {
    const t = i * GOLDEN_ANGLE;

    const priceNorm = (prices[i] - minP) / (maxP - minP);
    const volNorm = volumes[i] / maxVol || 0;

    // LARGE RADIUS = volume
    const radius = BASE_RADIUS + volNorm * 40;

    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;

    const y = priceNorm * HEIGHT_SCALE * pts.length * 0.04;

    path.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(path, false, "catmullrom", 0.15);
  disposables.push(curve);

  // -------------------------------------------
  // Tube geometry
  // -------------------------------------------
  const tubularSegments = 900;
  const radialSegments = 20;

  const tubeRadius = 2.5; // base thickness

  const geometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    tubeRadius,
    radialSegments,
    false
  );

  disposables.push(geometry);

  const material = new THREE.MeshStandardMaterial({
    color: 0x99ccff,
    metalness: 0.4,
    roughness: 0.25,
    emissive: 0x001122,
  });
  disposables.push(material);

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // -------------------------------------------
  // Fibonacci rings
  // -------------------------------------------
  const fib = vizData.fibonacci_rings || [];
  const ringMeshes = [];

  fib.forEach(ring => {
    const R = BASE_RADIUS + 40; // large rings
    const thickness = 1.2;

    const ringGeom = new THREE.TorusGeometry(R, thickness, 16, 200);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: ring.is_golden ? 0.55 : 0.2,
    });

    disposables.push(ringGeom, ringMat);

    const mg = new THREE.Mesh(ringGeom, ringMat);
    mg.rotation.x = Math.PI / 2;

    mg.position.y =
      ((ring.price - minP) / (maxP - minP)) * HEIGHT_SCALE * pts.length * 0.04;

    scene.add(mg);
    ringMeshes.push(mg);
  });

  // golden rings animation
  const goldenRings = ringMeshes.filter((_, i) => fib[i]?.is_golden);

  const update = () => {
    const t = Date.now() * 0.001;

    mesh.rotation.y = t * 0.05;

    goldenRings.forEach((g, i) => {
      const s = 1 + Math.sin(t * 1.2 + i) * 0.04;
      g.scale.set(s, s, s);
    });
  };

  return { group: null, update };
}
