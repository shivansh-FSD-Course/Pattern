// src/components/renderers/renderGoldenHelicoid.js
import { requirePoints, makeSafeReturn, addDisposable } from "./utils";

export function renderGoldenHelicoid({ scene, vizData, THREE, disposables }) {
  const pts = requirePoints(vizData, ["x", "y", "z", "price"]);
  if (!pts) return makeSafeReturn();

  const group = new THREE.Group();
  scene.add(group);

  const path = pts.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(path, false, "catmullrom", 0.15);
  addDisposable(disposables, curve);

  const tubeGeom = new THREE.TubeGeometry(curve, 1000, 3.0, 20, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0x55ccff,
    metalness: 0.35,
    roughness: 0.25,
    emissive: 0x0a1a2f
  });
  addDisposable(disposables, tubeGeom, tubeMat);

  const mesh = new THREE.Mesh(tubeGeom, tubeMat);
  group.add(mesh);

  const update = () => {
    group.rotation.y += 0.002;
  };

  return { group, update };
}
