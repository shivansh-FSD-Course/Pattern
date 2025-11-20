import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function PatternVisualization({ data }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data || !mountRef.current) return;

    // Get container dimensions
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFDFBF7); // Paper background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(
      data.visualization_data.camera_position.x,
      data.visualization_data.camera_position.y,
      data.visualization_data.camera_position.z
    );

    // Renderer with proper sizing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    
    // Clear any existing children and append
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Create spiral from points
    const points = data.visualization_data.points;
    const geometry = new THREE.BufferGeometry();
    
    const positions = [];
    const colors = [];
    
    points.forEach((point, i) => {
      positions.push(point.x, point.y, point.z);
      
      // Color gradient from green to gold
      const t = i / points.length;
      const color = new THREE.Color();
      color.setHSL(0.3 - t * 0.2, 0.6, 0.5);
      colors.push(color.r, color.g, color.b);
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    // Create line
    const material = new THREE.LineBasicMaterial({ 
      vertexColors: true,
      linewidth: 2
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Add Fibonacci rings
    const fibRings = [];
    data.visualization_data.fibonacci_rings.forEach(ring => {
      const ringGeometry = new THREE.TorusGeometry(30, 0.3, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: ring.color,
        transparent: true,
        opacity: ring.is_golden ? 0.8 : 0.4,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = ring.y;
      scene.add(ringMesh);
      fibRings.push(ringMesh);

      // Add label for golden ratio levels
      if (ring.is_golden) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        context.fillStyle = '#FFD700';
        context.font = 'Bold 32px Arial';
        context.fillText(`φ ${ring.level}`, 10, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(35, ring.y, 0);
        sprite.scale.set(10, 2.5, 1);
        scene.add(sprite);
      }
    });

    // Add grid
    const gridHelper = new THREE.GridHelper(80, 20, 0x7BA591, 0xE8E8E8);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    setLoading(false);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Slow rotation of the spiral
      line.rotation.y += 0.002;
      
      // Subtle pulse effect on golden ratio rings
      fibRings.forEach((ring, i) => {
        if (data.visualization_data.fibonacci_rings[i].is_golden) {
          ring.scale.set(
            1 + Math.sin(Date.now() * 0.001) * 0.02,
            1 + Math.sin(Date.now() * 0.001) * 0.02,
            1
          );
        }
      });
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      // Dispose of Three.js objects
      geometry.dispose();
      material.dispose();
      fibRings.forEach(ring => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };

  }, [data]);

  return (
    <div className="relative w-full h-[600px] bg-paper rounded-sm border border-ink/15 overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper/50 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-pulse">✨</div>
            <p className="text-sm opacity-70">Rendering visualization...</p>
          </div>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-sm text-xs opacity-60 border border-ink/10">
        🖱️ Click and drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}