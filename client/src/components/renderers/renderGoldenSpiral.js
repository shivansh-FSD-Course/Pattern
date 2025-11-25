// src/components/renderers/renderGoldenSpiral.js
export function renderGoldenSpiral({ scene, vizData, THREE, disposables }) {
  const points = vizData.points || [];
  if (!points.length) {
    console.warn("[renderGoldenSpiral] No points available.");
    return {};
  }

  // ---------------- Extract point vectors ----------------
  const path = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));

  // Center correction
  const bbox = new THREE.Box3().setFromPoints(path);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  const HEIGHT_SCALE = 12;

  const centered = path.map((p) => {
    return new THREE.Vector3(
      p.x - center.x,
      (p.y - center.y) * HEIGHT_SCALE,
      p.z - center.z
    );
  });

  // ---------------- Create smooth spiral curve ----------------
  const curve = new THREE.CatmullRomCurve3(centered, false, "catmullrom", 0.15);
  disposables.push(curve);

  // ---------------- Tube Geometry (3D Spiral) ----------------
  const tubularSegments = 800;     // smoothness along the path
  const tubeRadius = 3.5;          // thickness
  const radialSegments = 16;       // geometry resolution

  const tubeGeometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    tubeRadius,
    radialSegments,
    false
  );
  disposables.push(tubeGeometry);

  const tubeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffbf55,
    metalness: 0.35,
    roughness: 0.25,
    emissive: 0x110800,
  });
  disposables.push(tubeMaterial);

  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);

  // ---------------- Add Fibonacci "bands" around the spiral ----------------
  const ringMeshes = [];
  const fib = vizData.fibonacci_rings || [];

  fib.forEach((ring) => {
    const ringRadius = 65;
    const ringThickness = 1.0;

    const ringGeom = new THREE.TorusGeometry(
      ringRadius,
      ringThickness,
      16,
      200
    );
    const ringMat = new THREE.MeshBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: ring.is_golden ? 0.55 : 0.25,
    });

    disposables.push(ringGeom, ringMat);

    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = (ring.y - center.y) * HEIGHT_SCALE;

    ringMeshes.push(ringMesh);
  });

  // ---------------- Group and add to scene ----------------
  const group = new THREE.Group();
  group.add(tube);
  ringMeshes.forEach((r) => group.add(r));

  scene.add(group);

  // ---------------- Golden rings gentle breathing ----------------
  const goldenRings = ringMeshes.filter((_, i) => fib[i]?.is_golden === true);

  const update = () => {
    const t = Date.now() * 0.001;
    goldenRings.forEach((mesh, i) => {
      const s = 1 + Math.sin(t + i) * 0.04;
      mesh.scale.set(s, s, s);
    });
  };

  return { group, update };
}
