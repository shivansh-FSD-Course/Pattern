// src/components/renderers/renderNoiseMesh.js
import { Noise } from "noisejs";

export function renderNoiseMesh({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) {
    console.warn("[renderNoiseMesh] No points available.");
    return {};
  }

  // ---------------------------------------------
  // Build synthetic volatility metric
  // ---------------------------------------------
  const prices = pts.map(p => p.price);
  const vol = prices.map((p, i) =>
    i === 0 ? 0 : Math.abs(p - prices[i - 1])
  );
  const maxVol = Math.max(...vol) || 1;

  // Normalize volatility to 0..1
  const volNorm = vol.map(v => v / maxVol);

  // ---------------------------------------------
  // Noise generator
  // ---------------------------------------------
  const noise = new Noise(Math.random());

  // ---------------------------------------------
  // Surface mesh settings
  // ---------------------------------------------
  const widthSegments = 200;    // across
  const heightSegments = pts.length; // along time series

  const width = 120;
  const height = 350;

  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments
  );
  disposables.push(geometry);

  // Rotate so it's vertical
  geometry.rotateX(-Math.PI / 2);

  // ---------------------------------------------
  // Apply Perlin noise displacement
  // ---------------------------------------------
  const pos = geometry.attributes.position;
  const original = [];

  for (let i = 0; i < pos.count; i++) {
    original.push(pos.getX(i), pos.getY(i), pos.getZ(i));
  }

  function displaceVertices(time = 0) {
    for (let i = 0; i < pos.count; i++) {
      const x = original[i * 3 + 0];
      const y = original[i * 3 + 1];
      const z = original[i * 3 + 2];

      // Map mesh row to price index
      const row = Math.floor((i / (widthSegments + 1)));

      const v = volNorm[row] || 0.0;

      // Noise input
      const n = noise.perlin3(
        x * 0.03,
        z * 0.03,
        time * 0.25
      );

      // displacement amount
      const disp = n * 12 + v * 20;

      pos.setXYZ(i, x, y + disp, z);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  // Initial displacement
  displaceVertices(0);

  // ---------------------------------------------
  // Material
  // ---------------------------------------------
  const material = new THREE.MeshStandardMaterial({
    color: 0x6fb8ff,
    roughness: 0.45,
    metalness: 0.2,
    side: THREE.DoubleSide,
    wireframe: false,
    transparent: true,
    opacity: 0.9,
  });
  disposables.push(material);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0;
  mesh.position.x = 0;
  mesh.position.z = 0;

  scene.add(mesh);

  // ---------------------------------------------
  // Fibonacci rings
  // ---------------------------------------------
  const fib = vizData.fibonacci_rings || [];
  const ringMeshes = [];

  fib.forEach((ring) => {
    const R = 60;
    const t = 0.9;

    const g = new THREE.TorusGeometry(R, t, 16, 160);
    const m = new THREE.MeshBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: ring.is_golden ? 0.55 : 0.25
    });

    disposables.push(g, m);

    const rm = new THREE.Mesh(g, m);
    rm.rotation.x = Math.PI / 2;

    rm.position.y =
      ((ring.price - Math.min(...prices)) /
        (Math.max(...prices) - Math.min(...prices))) *
      150;

    scene.add(rm);
    ringMeshes.push(rm);
  });

  const goldenRings = ringMeshes.filter((_, i) => fib[i]?.is_golden);

  // ---------------------------------------------
  // Animation
  // ---------------------------------------------
  const update = () => {
    const t = Date.now() * 0.001;

    displaceVertices(t);

    mesh.rotation.y = Math.sin(t * 0.2) * 0.15;

    goldenRings.forEach((g, i) => {
      const s = 1 + Math.sin(t * 1.4 + i) * 0.03;
      g.scale.set(s, s, s);
    });
  };

  return { group: null, update };
}
