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
    
    const tangent = curve.getTangentAt(t);
    
    const discGeom = new THREE.CylinderGeometry(3, 3.5, 0.8, 6);
    
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
    
    disc.lookAt(p.x + tangent.x, p.y + tangent.y, p.z + tangent.z);
    disc.rotateX(Math.PI / 2);
    
    disc.userData.phase = i;
    
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

  // === PARTICLE TRAIL ===
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

  // === ONLY 5 KEY DATA MARKERS (START, 25%, 50%, 75%, END) ===
  const keyIndices = [
    0,
    Math.floor(pts.length * 0.25),
    Math.floor(pts.length * 0.5),
    Math.floor(pts.length * 0.75),
    pts.length - 1
  ];
  
  const dataMarkers = [];
  const labels = [];
  
  keyIndices.forEach((i) => {
    const p = pts[i];
    
    // Create marker sphere
    const markerGeom = new THREE.SphereGeometry(3.5, 32, 32);
    const markerMat = new THREE.MeshStandardMaterial({
      color: "#FFD700",
      emissive: "#FFD700",
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.9
    });

    disposables.push(markerGeom, markerMat);

    const marker = new THREE.Mesh(markerGeom, markerMat);
    marker.position.set(p.x, p.y, p.z);
    marker.userData.phase = Math.random() * Math.PI * 2;
    
    group.add(marker);
    dataMarkers.push(marker);

    // Add stronger point light
    const light = new THREE.PointLight("#FFD700", 1.5, 30);
    light.position.copy(marker.position);
    group.add(light);

    // === CLEAN MINIMAL LABEL ===
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 80;

    // Semi-transparent background
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, 200, 80);

    // Gold border
    context.strokeStyle = '#FFD700';
    context.lineWidth = 2;
    context.strokeRect(0, 0, 200, 80);

    // Text
    context.fillStyle = '#FFD700';
    context.font = 'bold 18px Arial';
    context.fillText(`Point ${i}`, 10, 30);
    
    context.fillStyle = '#FFFFFF';
    context.font = '14px Arial';
    const value = p.value?.toFixed(1) || p.y.toFixed(1);
    context.fillText(`Value: ${value}`, 10, 55);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0
    });
    
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(12, 5, 1);
    sprite.position.set(p.x, p.y + 10, p.z);
    sprite.userData.baseY = p.y + 10;
    sprite.userData.phase = Math.random() * Math.PI * 2;
    sprite.userData.material = spriteMat;
    
    group.add(sprite);
    labels.push(sprite);
    disposables.push(texture, spriteMat);
  });

  let time = 0;
  let showLabels = false;

  return {
    group,
    labels,
    toggleLabels: () => {
      showLabels = !showLabels;
      labels.forEach(label => {
        label.userData.material.opacity = showLabels ? 0.95 : 0;
      });
    },
    update: () => {
      time += 0.01;
      group.rotation.y += 0.003;
      
      // Pulse discs
      discs.forEach((disc) => {
        const pulse = Math.sin(time * 2 + disc.userData.phase * 0.2);
        const scale = 1 + pulse * 0.15;
        disc.scale.setScalar(scale);
      });

      // Pulse markers
      dataMarkers.forEach((marker) => {
        const scale = 1 + Math.sin(time * 2 + marker.userData.phase) * 0.3;
        marker.scale.setScalar(scale);
      });

      // Gentle float for labels
      if (showLabels) {
        labels.forEach(label => {
          label.position.y = label.userData.baseY + Math.sin(time * 0.5 + label.userData.phase) * 0.5;
        });
      }

      particleMaterial.opacity = 0.4 + Math.sin(time * 2) * 0.2;
    }
  };
}