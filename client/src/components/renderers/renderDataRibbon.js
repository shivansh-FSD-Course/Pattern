// renderDataRibbon.js
import * as THREE from "three";

export function renderDataRibbon({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) return {};

  const group = new THREE.Group();
  scene.add(group);

  // === USE ACTUAL DATA POINTS ===
  const pathPoints = pts.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", 0.4);
  disposables.push(curve);

  // === MAIN RIBBON TUBE ===
  const tubeGeom = new THREE.TubeGeometry(curve, 600, 2.5, 24, false);
  
  // Create gradient color based on position along curve
  const colors = [];
  const positions = tubeGeom.attributes.position;
  
  for (let i = 0; i < positions.count; i++) {
    const t = i / positions.count;
    const color = new THREE.Color();
    color.setHSL(0.55 + t * 0.15, 0.8, 0.5); // Blue to cyan gradient
    colors.push(color.r, color.g, color.b);
  }
  
  tubeGeom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const tubeMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.2,
    metalness: 0.5,
    emissive: "#1a4d6d",
    emissiveIntensity: 0.2
  });

  disposables.push(tubeGeom, tubeMat);

  const mesh = new THREE.Mesh(tubeGeom, tubeMat);
  group.add(mesh);

  // === WIDER RIBBON SURFACE ALONG DATA PATH ===
  const ribbonSegments = Math.min(pts.length - 1, 150);
  const ribbonWidth = 8;
  
  const ribbonGeom = new THREE.BufferGeometry();
  const ribbonPositions = [];
  const ribbonColors = [];
  const ribbonIndices = [];

  for (let i = 0; i <= ribbonSegments; i++) {
    const t = i / ribbonSegments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    
    // Create perpendicular vector for ribbon width
    const up = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    
    // Left and right edges of ribbon
    const left = point.clone().add(binormal.clone().multiplyScalar(ribbonWidth));
    const right = point.clone().sub(binormal.clone().multiplyScalar(ribbonWidth));
    
    ribbonPositions.push(left.x, left.y, left.z);
    ribbonPositions.push(right.x, right.y, right.z);
    
    // Color gradient
    const color = new THREE.Color();
    color.setHSL(0.55 + t * 0.15, 0.7, 0.55);
    ribbonColors.push(color.r, color.g, color.b);
    ribbonColors.push(color.r, color.g, color.b);
    
    // Create triangles
    if (i < ribbonSegments) {
      const base = i * 2;
      ribbonIndices.push(base, base + 1, base + 2);
      ribbonIndices.push(base + 1, base + 3, base + 2);
    }
  }

  ribbonGeom.setAttribute('position', new THREE.Float32BufferAttribute(ribbonPositions, 3));
  ribbonGeom.setAttribute('color', new THREE.Float32BufferAttribute(ribbonColors, 3));
  ribbonGeom.setIndex(ribbonIndices);
  ribbonGeom.computeVertexNormals();

  const ribbonMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: 0.3,
    metalness: 0.5,
    transparent: true,
    opacity: 0.7
  });

  disposables.push(ribbonGeom, ribbonMat);

  const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat);
  group.add(ribbon);

  // === FLOWING PARTICLES ALONG DATA PATH ===
  const particleCount = 200;
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = [];

  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount;
    const point = curve.getPointAt(t);
    particlePositions.push(point.x, point.y, point.z);
  }

  particleGeom.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: "#55ccff",
    size: 2,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });

  disposables.push(particleGeom, particleMat);

  const particles = new THREE.Points(particleGeom, particleMat);
  group.add(particles);

  // === ENERGY RINGS AT DATA INTERVALS ===
  const ringInterval = Math.max(1, Math.floor(pts.length / 20));
  const rings = [];

  for (let i = 0; i < pts.length; i += ringInterval) {
    const p = pts[i];
    const t = i / pts.length;
    const tangent = curve.getTangentAt(t);

    const ringGeom = new THREE.TorusGeometry(4, 0.4, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: "#55ccff",
      emissive: "#55ccff",
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.6
    });

    disposables.push(ringGeom, ringMat);

    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(p.x, p.y, p.z);
    ring.lookAt(p.x + tangent.x, p.y + tangent.y, p.z + tangent.z);
    ring.userData.t = t;
    ring.userData.phase = i;
    
    group.add(ring);
    rings.push(ring);
  }

  // === GLOWING EDGE LINE ===
  const edgePoints = curve.getPoints(500);
  const edgeGeom = new THREE.BufferGeometry().setFromPoints(edgePoints);
  const edgeMat = new THREE.LineBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.3
  });

  disposables.push(edgeGeom, edgeMat);

  const edgeLine = new THREE.Line(edgeGeom, edgeMat);
  group.add(edgeLine);

  let time = 0;

  return {
    group,
    update: () => {
      time += 0.01;
      group.rotation.y += 0.004;

      // Animate rings
      rings.forEach((ring, i) => {
        const pulse = Math.sin(time * 3 + ring.userData.phase * 0.5);
        ring.scale.setScalar(1 + pulse * 0.15);
        ring.material.opacity = 0.4 + pulse * 0.2;
      });

      // Pulse tube
      tubeMat.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.15;

      // Shimmer particles
      particleMat.opacity = 0.5 + Math.sin(time * 2) * 0.2;
    }
  };
}