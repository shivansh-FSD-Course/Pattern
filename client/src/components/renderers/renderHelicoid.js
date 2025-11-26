// src/components/renderers/renderHelicoid.js
export function renderHelicoid({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) {
    console.warn("[renderHelicoid] No points provided");
    return {};
  }

  // ---------------- Build helicoid path ----------------
  const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);

  const priceValues = pts.map((p) => p.price);
  const minP = Math.min(...priceValues);
  const maxP = Math.max(...priceValues);

  const HEIGHT_SCALE = 14;
  const BASE_RADIUS = 14;

  const path = [];

  for (let i = 0; i < pts.length; i++) {
    const t = i * GOLDEN_ANGLE;

    const priceNorm = (pts[i].price - minP) / (maxP - minP);

    // Radius depends on volatility (subtle)
    const radius = BASE_RADIUS + Math.sin(i * 0.02) * 4 + priceNorm * 6;

    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;

    // Height comes from normalized price
    const y = priceNorm * HEIGHT_SCALE * pts.length * 0.03;

    path.push(new THREE.Vector3(x, y, z));
  }

  // Smooth curve
  const curve = new THREE.CatmullRomCurve3(path, false, "catmullrom", 0.15);
  disposables.push(curve);

  // ---------------- Tube Geometry ----------------
  const segments = 1000;
  const tubeRadius = 3.4;

  const geometry = new THREE.TubeGeometry(curve, segments, tubeRadius, 20, false);
  disposables.push(geometry);

  const material = new THREE.MeshStandardMaterial({
    color: 0x55ccff,
    metalness: 0.35,
    roughness: 0.25,
    emissive: 0x0a1a2f,
  });
  disposables.push(material);

  const tubeMesh = new THREE.Mesh(geometry, material);
  scene.add(tubeMesh);

  // ---------------- Optional: secondary "DNA strand" ----------------
  const secondaryRadius = tubeRadius * 0.55;
  const helixPoints = [];

  for (let i = 0; i < pts.length; i++) {
    const t = i * GOLDEN_ANGLE * 1.2;

    const base = path[i];
    if (!base) continue;

    const x = base.x + Math.cos(t) * secondaryRadius;
    const y = base.y + Math.sin(i * 0.03) * 2; // small oscillation
    const z = base.z + Math.sin(t) * secondaryRadius;

    helixPoints.push(new THREE.Vector3(x, y, z));
  }

  const helixCurve = new THREE.CatmullRomCurve3(
    helixPoints,
    false,
    "catmullrom",
    0.1
  );
  disposables.push(helixCurve);

  const helixGeom = new THREE.TubeGeometry(helixCurve, segments, 1.0, 12, false);
  disposables.push(helixGeom);

  const helixMat = new THREE.MeshStandardMaterial({
    color: 0xff88aa,
    metalness: 0.2,
    roughness: 0.2,
    emissive: 0x220011,
  });
  disposables.push(helixMat);

  const helixMesh = new THREE.Mesh(helixGeom, helixMat);
  scene.add(helixMesh);

  // ---------------- Fibonacci Rings ----------------
  const ringMeshes = [];
  const fib = vizData.fibonacci_rings || [];

  fib.forEach((ring) => {
    const R = BASE_RADIUS * 2 + 20;
    const thickness = 1.0;

    const ringGeom = new THREE.TorusGeometry(R, thickness, 16, 200);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: ring.is_golden ? 0.55 : 0.2,
    });

    disposables.push(ringGeom, ringMat);

    const mesh = new THREE.Mesh(ringGeom, ringMat);
    mesh.rotation.x = Math.PI / 2;

    mesh.position.y =
      ((ring.price - minP) / (maxP - minP)) * HEIGHT_SCALE * pts.length * 0.03;

    ringMeshes.push(mesh);
    scene.add(mesh);
  });

  const goldenRings = ringMeshes.filter((_, i) => fib[i]?.is_golden);

  // ---------------- Animation ----------------
  const update = () => {
    const time = Date.now() * 0.001;

    tubeMesh.rotation.y = time * 0.04;
    helixMesh.rotation.y = -time * 0.05;

    goldenRings.forEach((g, i) => {
      const s = 1 + Math.sin(time + i) * 0.04;
      g.scale.set(s, s, s);
    });
  };

  return { group: null, update };
}
