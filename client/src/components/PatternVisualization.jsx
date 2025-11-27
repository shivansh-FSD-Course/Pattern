import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Only the 3 working renderers
import { RENDERERS, getRandomRenderer } from "./renderers";

export default function PatternVisualization({ data }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Require visualization_data
  if (!data || !data.visualization_data) {
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

    let frameId = null;
    const disposables = [];
    let renderer = null;
    let updateFn = () => {};

    const vizData = data.visualization_data;

    // ---------------- Scene ----------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222233);

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // ---------------- Camera ----------------
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);

    if (vizData.camera_position) {
      const { x, y, z } = vizData.camera_position;
      camera.position.set(x, y, z);
    } else {
      camera.position.set(140, 150, 165);
    }

    // ---------------- Renderer ----------------
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    // ---------------- Controls ----------------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 60;
    controls.maxDistance = 350;

    const look = vizData.camera_look_at || { x: 0, y: 0, z: 0 };
    controls.target.set(look.x, look.y, look.z);
    camera.lookAt(controls.target);

    // ---------------- Lighting ----------------
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dir1.position.set(120, 200, 150);

    const dir2 = new THREE.DirectionalLight(0x88aaff, 0.5);
    dir2.position.set(-100, -60, -100);

    scene.add(ambient, dir1, dir2);

    // ---------------- Select Renderer ----------------
    const { key, renderer: renderFunc } = getRandomRenderer();
    console.log("🎨 Using renderer:", key);

    try {
      const result = renderFunc({
        scene,
        vizData,
        THREE,
        disposables,
      });

      if (result?.update) {
        updateFn = result.update;
      }
    } catch (err) {
      console.error("Renderer error:", err);
    }

    setLoading(false);

    // ---------------- Animation Loop ----------------
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      updateFn();
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // ---------------- Resize ----------------
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // ---------------- Cleanup ----------------
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);

      disposables.forEach(
        (obj) => obj && typeof obj.dispose === "function" && obj.dispose()
      );

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
            <p className="text-sm opacity-80">Rendering your pattern…</p>
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
