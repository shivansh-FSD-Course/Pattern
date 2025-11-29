// renderGoldenSpiral.js
import * as THREE from "three";

export function renderGoldenSpiral({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) return {};

  const group = new THREE.Group();
  scene.add(group);

  // === USE ACTUAL DATA POINTS ===
  const pathPoints = pts.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", 0.3);
  disposables.push(curve);

  // === MAIN TUBE FOLLOWING DATA ===
  const tubeGeom = new THREE.TubeGeometry(curve, 800, 2.5, 32, false);
  
  const tubeMat = new THREE.MeshStandardMaterial({
    color: "#C9A961",
    roughness: 0.2,
    metalness: 0.7,
    emissive: "#C9A961",
    emissiveIntensity: 0.3
  });

  disposables.push(tubeGeom, tubeMat);
  const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
  group.add(tubeMesh);

  // === HEXAGONAL DISCS AT DATA POINTS ===
  const discInterval = Math.max(1, Math.floor(pts.length / 40));
  const discs = [];

  for (let i = 0; i < pts.length; i += discInterval) {
    const p = pts[i];
    const t = i / pts.length;
    
    // Get tangent at this point for proper orientation
    const tangent = curve.getTangentAt(t);
    
    // Create hexagonal disc
    const discGeom = new THREE.CylinderGeometry(3, 3.5, 0.8, 6);
    
    // Color gradient
    const color = new THREE.Color();
    color.setHSL(0.15 - t * 0.05, 0.8, 0.4 + t * 0.3);
    
    const discMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.4,
      metalness: 0.6,
      roughness: 0.3
    });

    disposables.push(discGeom, discMat);

    const disc = new THREE.Mesh(discGeom, discMat);
    disc.position.set(p.x, p.y, p.z);
    
    // Orient disc perpendicular to path
    disc.lookAt(p.x + tangent.x, p.y + tangent.y, p.z + tangent.z);
    disc.rotateX(Math.PI / 2);
    
    disc.userData.phase = i;
    disc.userData.baseScale = 1;
    
    group.add(disc);
    discs.push(disc);
  }

  // === WIREFRAME OVERLAY ===
  const wireframeGeom = new THREE.TubeGeometry(curve, 400, 2.8, 16, false);
  const wireframeMat = new THREE.MeshStandardMaterial({
    color: "#FFD700",
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });

  disposables.push(wireframeGeom, wireframeMat);
  const wireframe = new THREE.Mesh(wireframeGeom, wireframeMat);
  group.add(wireframe);

  // === PARTICLE TRAIL ALONG DATA PATH ===
  const particleCount = Math.min(pts.length * 2, 500);
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = [];

  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount;
    const point = curve.getPointAt(t);
    particlePositions.push(point.x, point.y, point.z);
  }

  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: "#FFD700",
    size: 2,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  disposables.push(particleGeometry, particleMaterial);
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);

  // === GLOWING SPHERES AT KEY DATA POINTS ===
  const keyIndices = [0, Math.floor(pts.length * 0.25), Math.floor(pts.length * 0.5), Math.floor(pts.length * 0.75), pts.length - 1];
  
  keyIndices.forEach(i => {
    if (pts[i]) {
      const sphereGeom = new THREE.SphereGeometry(3, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: "#FFD700",
        emissive: "#FFD700",
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.8
      });

      disposables.push(sphereGeom, sphereMat);

      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(pts[i].x, pts[i].y, pts[i].z);
      sphere.userData.phase = Math.random() * Math.PI * 2;
      group.add(sphere);

      // Point light
      const light = new THREE.PointLight("#FFD700", 1, 30);
      light.position.copy(sphere.position);
      group.add(light);
    }
  });

  let time = 0;

  return {
    group,
    update: () => {
      time += 0.01;
      group.rotation.y += 0.003;
      
      // Pulse discs
      discs.forEach((disc, i) => {
        const pulse = Math.sin(time * 2 + disc.userData.phase * 0.2);
        const scale = 1 + pulse * 0.15;
        disc.scale.setScalar(scale);
      });

      // Pulse spheres
      group.children.forEach(child => {
        if (child.userData.phase !== undefined && child.geometry.type === 'SphereGeometry') {
          const scale = 1 + Math.sin(time * 2 + child.userData.phase) * 0.2;
          child.scale.setScalar(scale);
        }
      });

      // Shimmer particles
      particleMaterial.opacity = 0.4 + Math.sin(time * 2) * 0.2;
    }
  };
}