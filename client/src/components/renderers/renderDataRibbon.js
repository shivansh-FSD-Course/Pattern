// renderDataRibbon.js
import * as THREE from "three";

export function renderDataRibbon({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) return {};

  const group = new THREE.Group();
  scene.add(group);

  // --- Build path (Catmull-Rom smooth spline)
  const pathPoints = pts.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", 0.4);
  disposables.push(curve);

  const tubeGeom = new THREE.TubeGeometry(curve, 600, 1.2, 16, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: "#55ccff",
    roughness: 0.25,
    metalness: 0.4
  });

  disposables.push(tubeGeom, tubeMat);

  const mesh = new THREE.Mesh(tubeGeom, tubeMat);
  group.add(mesh);

  return {
    group,
    update: () => {
      group.rotation.y += 0.003;
    }
  };
}
