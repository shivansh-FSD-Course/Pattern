// src/components/renderers/renderCandleSpiral.js
export function renderCandleSpiral({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) {
    console.warn("[renderCandleSpiral] No points provided.");
    return {};
  }

  // ------------------------------------------------
  // We assume OHLC is embedded inside vizData points
  // If not, convert close to synthetic OHLC
  // ------------------------------------------------
  const prices = pts.map(p => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  // fake OHLC if missing
  const ohlc = pts.map((p, i) => {
    const base = p.price;

    return {
      open: base * (0.98 + Math.random() * 0.04),
      close: base * (0.98 + Math.random() * 0.04),
      high: base * (1.02 + Math.random() * 0.03),
      low:  base * (0.97 - Math.random() * 0.03),
      index: i
    };
  });

  // ------------------------------------------------
  // Spiral coordinates
  // ------------------------------------------------
  const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);

  const BASE_RADIUS = 35;
  const HEIGHT_SCALE = 0.13 * pts.length;

  const candleMeshes = [];

  for (let i = 0; i < ohlc.length; i++) {
    const { open, close, high, low } = ohlc[i];

    const angle = i * GOLDEN_ANGLE;

    const radius = BASE_RADIUS + Math.sin(i * 0.05) * 6;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // height from normalized price
    const priceNorm = (prices[i] - minP) / (maxP - minP);
    const y = priceNorm * HEIGHT_SCALE;

    // ------------------------------
    // Candle geometry
    // ------------------------------
    const candleGroup = new THREE.Group();

    // Wick
    const wickHeight = (high - low) * 0.04;
    const wickGeom = new THREE.CylinderGeometry(0.2, 0.2, wickHeight, 8);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const wick = new THREE.Mesh(wickGeom, wickMat);

    wick.position.y = y + wickHeight / 2;
    candleGroup.add(wick);

    // Body
    const bodyHeight = Math.abs(close - open) * 0.04;
    const bodyTop = Math.max(close, open);
    const bodyBottom = Math.min(close, open);

    const bodyColor = close > open ? 0x4cd964 : 0xff3b30;

    const bodyGeom = new THREE.BoxGeometry(2.2, bodyHeight, 2.2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.4,
      metalness: 0.2
    });

    const body = new THREE.Mesh(bodyGeom, bodyMat);

    body.position.y = y + ((bodyTop - minP) / (maxP - minP)) * HEIGHT_SCALE -
                      bodyHeight / 2;

    candleGroup.add(body);

    // Place candle in spiral
    candleGroup.position.set(x, 0, z);

    candleMeshes.push(candleGroup);
    scene.add(candleGroup);
  }

  // ------------------------------------------------
  // Fibonacci rings
  // ------------------------------------------------
  const fib = vizData.fibonacci_rings || [];
  const ringMeshes = [];

  fib.forEach((ring) => {
    const R = BASE_RADIUS + 10;
    const thickness = 1.5;

    const ringGeom = new THREE.TorusGeometry(R, thickness, 16, 200);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ring.color,
      transparent: true,
      opacity: ring.is_golden ? 0.55 : 0.25
    });

    disposables.push(ringGeom, ringMat);

    const rm = new THREE.Mesh(ringGeom, ringMat);
    rm.rotation.x = Math.PI / 2;

    rm.position.y =
      ((ring.price - minP) / (maxP - minP)) * HEIGHT_SCALE;

    scene.add(rm);
    ringMeshes.push(rm);
  });

  const goldenRings = ringMeshes.filter((_, i) => fib[i]?.is_golden);

  // ------------------------------------------------
  // Animation
  // ------------------------------------------------
  const update = () => {
    const t = Date.now() * 0.001;

    candleMeshes.forEach((c, i) => {
      c.rotation.y = t * 0.15 + i * 0.002;
    });

    goldenRings.forEach((g, i) => {
      const s = 1 + Math.sin(t * 1.7 + i) * 0.04;
      g.scale.set(s, s, s);
    });
  };

  return { group: null, update };
}
