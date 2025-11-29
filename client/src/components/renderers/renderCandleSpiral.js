// renderCandleSpiral.js
import * as THREE from "three";

export function renderCandleSpiral({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) return {};

  const group = new THREE.Group();
  scene.add(group);

  // === USE ACTUAL DATA POINTS FOR PATH ===
  const pathPoints = pts.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", 0.3);
  disposables.push(curve);

  // === CREATE RINGS AT DATA POINTS ===
  const ringInterval = Math.max(1, Math.floor(pts.length / 30));
  const rings = [];
  
  for (let i = 0; i < pts.length; i += ringInterval) {
    const p = pts[i];
    const t = i / pts.length;
    const tangent = curve.getTangentAt(t);
    
    // Determine ring radius based on data value
    const radius = 3 + Math.abs(p.y) * 0.05;
    
    // Create torus ring
    const torusGeom = new THREE.TorusGeometry(radius, 0.6, 16, 32);
    
    // Color gradient based on position
    const color = new THREE.Color();
    color.setHSL(0.15 + t * 0.5, 0.8, 0.5);
    
    const torusMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.4
    });

    disposables.push(torusGeom, torusMat);

    const torus = new THREE.Mesh(torusGeom, torusMat);
    
    // Position at actual data point
    torus.position.set(p.x, p.y, p.z);
    
    // Orient perpendicular to path
    torus.lookAt(p.x + tangent.x, p.y + tangent.y, p.z + tangent.z);
    
    torus.userData.basePosition = new THREE.Vector3(p.x, p.y, p.z);
    torus.userData.phase = i;
    torus.userData.baseRadius = radius;
    
    group.add(torus);
    rings.push(torus);
  }

  // === SPIRAL PATH LINE ===
  const linePoints = curve.getPoints(500);
  const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMat = new THREE.LineBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.25
  });

  disposables.push(lineGeom, lineMat);

  const line = new THREE.Line(lineGeom, lineMat);
  group.add(line);

  // === GLOWING PARTICLES ALONG PATH ===
  const particleCount = Math.min(pts.length * 2, 300);
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = [];

  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount;
    const point = curve.getPointAt(t);
    particlePositions.push(point.x, point.y, point.z);
  }

  particleGeom.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: "#88ccff",
    size: 1.5,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });

  disposables.push(particleGeom, particleMat);

  const particles = new THREE.Points(particleGeom, particleMat);
  group.add(particles);

  // === DATA POINT MARKERS ===
  const markerIndices = [0, Math.floor(pts.length * 0.25), Math.floor(pts.length * 0.5), Math.floor(pts.length * 0.75), pts.length - 1];
  
  markerIndices.forEach(i => {
    if (pts[i]) {
      const sphereGeom = new THREE.SphereGeometry(2, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: "#ffaa44",
        emissive: "#ffaa44",
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.9
      });

      disposables.push(sphereGeom, sphereMat);

      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(pts[i].x, pts[i].y, pts[i].z);
      sphere.userData.phase = Math.random() * Math.PI * 2;
      
      group.add(sphere);

      // Add point light
      const light = new THREE.PointLight("#ffaa44", 0.5, 20);
      light.position.copy(sphere.position);
      group.add(light);
    }
  });

  let time = 0;

  return {
    group,
    update: () => {
      time += 0.01;
      
      // Rotate entire spiral
      group.rotation.y += 0.003;
      
      // Animate rings with wave motion
      rings.forEach((ring, i) => {
        // Pulse effect
        const pulse = Math.sin(time * 2 + ring.userData.phase * 0.3);
        const scale = 1 + pulse * 0.12;
        ring.scale.setScalar(scale);
        
        // Opacity pulse
        ring.material.opacity = 0.5 + pulse * 0.25;
        ring.material.emissiveIntensity = 0.4 + pulse * 0.3;
      });

      // Pulse markers
      group.children.forEach(child => {
        if (child.userData.phase !== undefined && child.geometry.type === 'SphereGeometry') {
          const scale = 1 + Math.sin(time * 3 + child.userData.phase) * 0.3;
          child.scale.setScalar(scale);
        }
      });

      // Shimmer particles
      particleMat.opacity = 0.3 + Math.sin(time * 2) * 0.2;
    }
  };
}