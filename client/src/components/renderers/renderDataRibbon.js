// src/components/renderers/renderDataRibbon.js
export function renderDataRibbon({ scene, vizData, THREE, disposables }) {
  const pointsData = vizData.points || [];
  if (!pointsData.length) {
    console.warn("[renderDataRibbon] No points found in vizData.points");
    return {};
  }

  // ---------------- Build path from data points ----------------
  const pathPoints = pointsData.map(
    (p) => new THREE.Vector3(p.x || 0, p.y || 0, p.z || 0)
  );

  const bbox = new THREE.Box3().setFromPoints(pathPoints);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  // Vertical amplification
  const HEIGHT_SCALE = 15;

  const centeredPathPoints = pathPoints.map((p) => {
    return new THREE.Vector3(
      p.x - center.x,
      (p.y - center.y) * HEIGHT_SCALE,
      p.z - center.z
    );
  });

  const curve = new THREE.CatmullRomCurve3(
    centeredPathPoints,
    false,
    "catmullrom",
    0.1
  );
  disposables.push(curve);

  // ---------------- Ribbon geometry ----------------
  const segments = 500;
  const ribbonWidth = 7;

  const positions = [];
  const indices = [];
  const colors = [];

  const colorA = new THREE.Color(0x66d098);
  const colorB = new THREE.Color(0x4a8ddb);
  const tmpColor = new THREE.Color();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();

    // Sideways normal
    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(tangent.dot(up)) > 0.9) up = new THREE.Vector3(1, 0, 0);

    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const left = point.clone().addScaledVector(normal, ribbonWidth * 0.5);
    const right = point.clone().addScaledVector(normal, -ribbonWidth * 0.5);

    positions.push(left.x, left.y, left.z);
    positions.push(right.x, right.y, right.z);

    tmpColor.copy(colorA).lerp(colorB, t);
    colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
    colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;

    indices.push(a, c, b);
    indices.push(c, d, b);
  }

  const ribbonGeometry = new THREE.BufferGeometry();
  ribbonGeometry.setIndex(indices);
  ribbonGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  ribbonGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );
  ribbonGeometry.computeVertexNormals();
  disposables.push(ribbonGeometry);

  const ribbonMaterial = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 60,
    side: THREE.DoubleSide,
    opacity: 0.95,
    transparent: true,
  });
  disposables.push(ribbonMaterial);

  const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);

  // ---------------- Wireframe overlay ----------------
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    opacity: 0.35,
    transparent: true,
    depthWrite: false,
  });
  disposables.push(wireMaterial);

  const wireMesh = new THREE.Mesh(ribbonGeometry, wireMaterial);

  // ---------------- Fibonacci rings ----------------
  const ringsData = vizData.fibonacci_rings || [];
  const fibRingMeshes = [];

  ringsData.forEach((ring, idx) => {
    const radius = 85;
    const thickness = 0.7;

    const ringGeom = new THREE.TorusGeometry(radius, thickness, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: ring.is_golden ? 0.6 : 0.25,
    });

    disposables.push(ringGeom, ringMat);

    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;

    ringMesh.position.y = (ring.y - center.y) * HEIGHT_SCALE;

    fibRingMeshes.push(ringMesh);
  });

  // ---------------- Group them all ----------------
  const group = new THREE.Group();
  group.add(ribbonMesh);
  group.add(wireMesh);
  fibRingMeshes.forEach((r) => group.add(r));

  scene.add(group);

  // Optional per-frame update (e.g., pulse golden rings)
  const goldenRings = fibRingMeshes.filter(
    (_, i) => ringsData[i]?.is_golden
  );

  const update = () => {
    const t = Date.now() * 0.001;
    goldenRings.forEach((ring, i) => {
      const s = 1 + Math.sin(t + i) * 0.03;
      ring.scale.set(s, s, s);
    });
  };

  return { group, update };
}
