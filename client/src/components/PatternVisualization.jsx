import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { RENDERERS, getRandomRenderer } from "./renderers";

export default function PatternVisualization({ data }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);

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

    // ----- Camera -----
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 4000);
    const cam = vizData.camera_position || { x: 140, y: 140, z: 140 };
    camera.position.set(cam.x, cam.y, cam.z);

    // ----- Renderer -----
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    // ----- Controls -----
    const controls = new OrbitControls(camera, renderer.domElement);

    const look = vizData.camera_look_at || { x: 0, y: 50, z: 0 };
    controls.target.set(look.x, look.y, look.z);
    camera.lookAt(controls.target);

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    controls.minDistance = 60;
    controls.maxDistance = 350;

    controls.enablePan = false;
    controls.screenSpacePanning = false;

    controls.rotateSpeed = 0.8;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // ----- Lighting -----
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const d1 = new THREE.DirectionalLight(0xffffff, 0.9);
    d1.position.set(120, 180, 130);
    scene.add(d1);

    const d2 = new THREE.DirectionalLight(0x88bbff, 0.4);
    d2.position.set(-120, -90, -100);
    scene.add(d2);

    // ----- Renderer selection -----
    // const renderFunc = RENDERERS["golden_spiral"];
    const { renderer: renderFunc, key } = getRandomRenderer();
    console.log("🎨 Renderer:", key);

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

    setLoading(false);

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
    };
    window.addEventListener("resize", handleResize);

    // ----- Cleanup -----
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      disposables.forEach(o => o?.dispose?.());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [data]);

  return (
    <div className="relative w-full h-[600px] bg-paper border rounded">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper/80 backdrop-blur-sm z-10">
          <p className="text-sm">Rendering…</p>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
