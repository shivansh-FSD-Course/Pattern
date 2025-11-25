import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function PatternVisualization({ data }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Safety check
  if (!data || !data.visualization_data || !data.visualization_data.points) {
    return (
      <div className="w-full h-[600px] bg-paper rounded-sm border border-ink/15 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 opacity-60">⚠️</div>
          <p className="text-sm opacity-60">Visualization data unavailable</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let frameId;
    const disposables = [];
    let renderer;

    // Scene + Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222233);

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(120, 140, 160);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 60;
    controls.maxDistance = 350;

    // ================================================
    // ⭐ REAL DATAPOINT SPIRAL (with HEIGHT SCALE)
    // ================================================

    const rawPoints = data.visualization_data.points;
    if (rawPoints.length < 2) {
      setLoading(false);
      return;
    }

    const pathPoints = rawPoints.map(
      p => new THREE.Vector3(p.x, p.y, p.z)
    );

    // Center the data
    const bbox = new THREE.Box3().setFromPoints(pathPoints);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // ⭐ HEIGHT SCALE — controls vertical stretching
    const HEIGHT_SCALE = 15;   // Try 10, 15, or 20

    const centeredPathPoints = pathPoints.map(p => {
      return new THREE.Vector3(
        p.x - center.x,
        (p.y - center.y) * HEIGHT_SCALE,
        p.z - center.z
      );
    });

    // Smooth curve through datapoints
    const curve = new THREE.CatmullRomCurve3(centeredPathPoints, false, 'catmullrom', 0.1);
    disposables.push(curve);

    // ================================================
    // ⭐ 3D RIBBON GEOMETRY
    // ================================================
    const segments = 500;
    const ribbonWidth = 7;

    const positions = [];
    const indices = [];
    const colors = [];

    const colorA = new THREE.Color(0x66d098);
    const colorB = new THREE.Color(0x4a8ddb);
    const tmpColor = new THREE.Color();

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;

      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();

      // Create sideways normal
      let up = new THREE.Vector3(0, 1, 0);
      if (Math.abs(tangent.dot(up)) > 0.9) up = new THREE.Vector3(1, 0, 0);

      const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const left = point.clone().addScaledVector(normal, ribbonWidth * 0.5);
      const right = point.clone().addScaledVector(normal, -ribbonWidth * 0.5);

      positions.push(left.x, left.y, left.z);
      positions.push(right.x, right.y, right.z);

      tmpColor.copy(colorA).lerp(colorB, t);
      colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
      colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
    }

    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;

      indices.push(a, c, b);
      indices.push(c, d, b);
    }

    const ribbonGeometry = new THREE.BufferGeometry();
    ribbonGeometry.setIndex(indices);
    ribbonGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    ribbonGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    ribbonGeometry.computeVertexNormals();
    disposables.push(ribbonGeometry);

    const ribbonMaterial = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 60,
      side: THREE.DoubleSide,
      opacity: 0.95,
      transparent: true
    });
    disposables.push(ribbonMaterial);

    const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    scene.add(ribbonMesh);

    // ================================================
    // ⭐ Wireframe Grid Overlay
    // ================================================
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      opacity: 0.35,
      transparent: true,
      depthWrite: false
    });

    disposables.push(wireMaterial);

    const wireMesh = new THREE.Mesh(ribbonGeometry, wireMaterial);
    scene.add(wireMesh);

    // ================================================
    // ⭐ Fibonacci Rings
    // ================================================
    const ringsData = data.visualization_data.fibonacci_rings || [];
    const fibRings = [];

    ringsData.forEach(ring => {
      const radius = 85;
      const thickness = 0.7;

      const ringGeom = new THREE.TorusGeometry(radius, thickness, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ring.color,
        transparent: true,
        opacity: ring.is_golden ? 0.6 : 0.25
      });

      disposables.push(ringGeom, ringMat);

      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;

      // Height scale applies to rings too
      ringMesh.position.y = (ring.y - center.y) * HEIGHT_SCALE;
      scene.add(ringMesh);
      fibRings.push(ringMesh);
    });

    // ================================================
    // ⭐ Lighting
    // ================================================
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dir1.position.set(120, 200, 150);
    const dir2 = new THREE.DirectionalLight(0x88aaff, 0.5);
    dir2.position.set(-100, -60, -100);

    scene.add(ambient, dir1, dir2);

    setLoading(false);

    // ================================================
    // ⭐ Animation Loop
    // ================================================
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      ribbonMesh.rotation.y += 0.003;
      wireMesh.rotation.y += 0.003;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);

      disposables.forEach(obj => obj?.dispose?.());
      renderer?.dispose?.();

      if (renderer?.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [data]);

  return (
    <div className="relative w-full h-[600px] bg-paper rounded-sm border border-ink/15 overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper/70 backdrop-blur-md z-10">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-pulse">✨</div>
            <p className="text-sm opacity-80">Rendering your spiral…</p>
          </div>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full" />

      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-sm text-xs opacity-70 border border-ink/10">
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
