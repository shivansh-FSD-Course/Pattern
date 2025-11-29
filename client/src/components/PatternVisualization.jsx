import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { RENDERERS } from "./renderers";

export default function PatternVisualization({ data }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedRenderer, setSelectedRenderer] = useState("golden_spiral");

  if (!data || !data.visualization_data) {
    return (
      <div className="w-full h-[600px] bg-paper border flex items-center justify-center">
        <p className="opacity-60 text-sm">No visualization data</p>
      </div>
    );
  }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let frameId;
    const disposables = [];

    const vizData = data.visualization_data;
    const pts = vizData.points || [];

    // ----- Scene -----
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1d1e2e);

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // ---- Root group (centers everything) ----
    const root = new THREE.Group();
    root.position.set(0, 0, 0);
    scene.add(root);

    // Calculate data center
    let centerX = 0, centerY = 0, centerZ = 0;
    if (pts.length > 0) {
      centerX = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
      centerY = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;
      centerZ = pts.reduce((sum, p) => sum + p.z, 0) / pts.length;
    }

    // ----- Camera -----
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 4000);
    
    const cameraDistance = 150;
    camera.position.set(
      centerX + cameraDistance,
      centerY + cameraDistance * 0.5,
      centerZ + cameraDistance
    );

    // ----- Renderer ----- 
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    // ----- Controls -----
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(centerX, centerY, centerZ);
    camera.lookAt(centerX, centerY, centerZ);
    controls.update();

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    controls.minDistance = 30;
    controls.maxDistance = 400;

    controls.enablePan = true;
    controls.screenSpacePanning = false;

    controls.rotateSpeed = 0.8;

    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // ----- Lighting -----
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const d1 = new THREE.DirectionalLight(0xffffff, 1);
    d1.position.set(centerX + 120, centerY + 180, centerZ + 130);
    scene.add(d1);

    const d2 = new THREE.DirectionalLight(0x88bbff, 0.5);
    d2.position.set(centerX - 120, centerY - 90, centerZ - 100);
    scene.add(d2);

    // ----- Use selected renderer -----
    const renderFunc = RENDERERS[selectedRenderer].renderer;
    console.log("🎨 Renderer:", selectedRenderer);

    let updateFn = () => {};

    try {
      const result = renderFunc({
        scene: root,
        vizData,
        THREE,
        disposables,
      });

      if (result?.update) updateFn = result.update;

    } catch (e) {
      console.error("Renderer crashed:", e);
    }

    setTimeout(() => setLoading(false), 100);

    // ----- Animation -----
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      updateFn();
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // ----- Resize -----
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    // ----- Cleanup -----
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      disposables.forEach(o => o?.dispose?.());
      renderer.dispose();
      controls.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [data, selectedRenderer]); // Re-render when renderer changes

  return (
    <div className="relative w-full h-[600px] bg-paper border rounded">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-pulse">⚡</div>
            <p className="text-sm">Rendering visualization…</p>
          </div>
        </div>
      )}

      {/* VISUALIZATION SELECTOR */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setSelectedRenderer("golden_spiral")}
          className={`px-3 py-1.5 text-xs rounded-sm border transition ${
            selectedRenderer === "golden_spiral"
              ? "bg-accent-gold/30 border-accent-gold"
              : "bg-white/10 border-white/30 hover:bg-white/20"
          }`}
          title="Wireframe Spiral"
        >
          🌀 Spiral
        </button>
        <button
          onClick={() => setSelectedRenderer("data_ribbon")}
          className={`px-3 py-1.5 text-xs rounded-sm border transition ${
            selectedRenderer === "data_ribbon"
              ? "bg-accent-gold/30 border-accent-gold"
              : "bg-white/10 border-white/30 hover:bg-white/20"
          }`}
          title="Flowing Ribbon"
        >
          〰️ Ribbon
        </button>
        <button
          onClick={() => setSelectedRenderer("candle_spiral")}
          className={`px-3 py-1.5 text-xs rounded-sm border transition ${
            selectedRenderer === "candle_spiral"
              ? "bg-accent-gold/30 border-accent-gold"
              : "bg-white/10 border-white/30 hover:bg-white/20"
          }`}
          title="Ring Tunnel"
        >
          ⭕ Rings
        </button>
      </div>

      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}