// renderCandleSpiral.js
import * as THREE from "three";

export function renderCandleSpiral({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) return {};

  const group = new THREE.Group();
  scene.add(group);

  pts.forEach(p => {
    const candleHeight = Math.max(0.5, p.y * 0.2);

    const geom = new THREE.BoxGeometry(1.4, candleHeight, 1.4);
    const mat = new THREE.MeshStandardMaterial({
      color: p.close > p.open ? "#66ff99" : "#ff6666",
      roughness: 0.3,
      metalness: 0.2
    });

    disposables.push(geom, mat);

    const bar = new THREE.Mesh(geom, mat);
    bar.position.set(p.x, candleHeight / 2, p.z);

    group.add(bar);
  });

  return {
    group,
    update: () => {
      group.rotation.y += 0.002;
    }
  };
}
