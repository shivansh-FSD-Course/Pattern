// renderCandleSpiral.js
import * as THREE from "three";

export function renderCandleSpiral({ scene, vizData, THREE, disposables }) {
  const pts = vizData.points || [];
  if (!pts.length) return {};

  const group = new THREE.Group();
  scene.add(group);

  const pathPoints = pts.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", 0.3);
  disposables.push(curve);

  // === RINGS AT DATA POINTS ===
  const ringInterval = Math.max(1, Math.floor(pts.length / 30));
  const rings = [];
  
  for (let i = 0; i < pts.length; i += ringInterval) {
    const p = pts[i];
    const t = i / pts.length;
    const tangent = curve.getTangentAt(t);
    
    const radius = 3 + Math.abs(p.y) * 0.05;
    
    const torusGeom = new THREE.TorusGeometry(radius, 0.6, 16, 32);
    
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
    torus.position.set(p.x, p.y, p.z);
    torus.lookAt(p.x + tangent.x, p.y + tangent.y, p.z + tangent.z);
    
    torus.userData.basePosition = new THREE.Vector3(p.x, p.y, p.z);
    torus.userData.phase = i;
    
    group.add(torus);
    rings.push(torus);
  }

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

  // === ONLY 5 KEY DATA MARKERS ===
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
    
    const sphereGeom = new THREE.SphereGeometry(2.5, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: "#ffaa44",
      emissive: "#ffaa44",
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.9
    });

    disposables.push(sphereGeom, sphereMat);

    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.position.set(p.x, p.y, p.z);
    sphere.userData.phase = Math.random() * Math.PI * 2;
    
    group.add(sphere);
    dataMarkers.push(sphere);

    const light = new THREE.PointLight("#ffaa44", 1.2, 25);
    light.position.copy(sphere.position);
    group.add(light);

    // === CLEAN MINIMAL LABEL ===
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 80;

    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, 200, 80);

    context.strokeStyle = '#ffaa44';
    context.lineWidth = 2;
    context.strokeRect(0, 0, 200, 80);

    context.fillStyle = '#ffaa44';
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
      
      rings.forEach((ring) => {
        const pulse = Math.sin(time * 2 + ring.userData.phase * 0.3);
        const scale = 1 + pulse * 0.12;
        ring.scale.setScalar(scale);
        
        ring.material.opacity = 0.5 + pulse * 0.25;
        ring.material.emissiveIntensity = 0.4 + pulse * 0.3;
      });

      dataMarkers.forEach((marker) => {
        const scale = 1 + Math.sin(time * 3 + marker.userData.phase) * 0.3;
        marker.scale.setScalar(scale);
      });

      if (showLabels) {
        labels.forEach(label => {
          label.position.y = label.userData.baseY + Math.sin(time * 0.5 + label.userData.phase) * 0.5;
        });
      }

      particleMat.opacity = 0.3 + Math.sin(time * 2) * 0.2;
    }
  };
}