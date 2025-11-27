// renderGoldenSpiral.js
import * as THREE from "three";

export function renderGoldenSpiral({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) return {};

  const group = new THREE.Group();
  scene.add(group);

  // Smooth spiral path
  const pathPoints = pts.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", 0.3);
  disposables.push(curve);

  const tubeGeom = new THREE.TubeGeometry(curve, 800, 1.8, 24, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: "#77aaff",
    roughness: 0.15,
    metalness: 0.6,
    emissive: "#0c1a33"
  });

  disposables.push(tubeGeom, tubeMat);

  const mesh = new THREE.Mesh(tubeGeom, tubeMat);
  group.add(mesh);

  return {
    group,
    update: () => {
      group.rotation.y += 0.0018;
    }
  };
}
