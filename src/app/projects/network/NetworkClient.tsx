'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import BackButton from '@/components/BackButton/BackButton';

export default function NetworkClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);

  // Sync state with ref for animation loop
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Configuration
    const NUM_PARTICLES = 750;
    const MAX_DISTANCE = 120;
    const BOUND = 400;
    const RETURN_SPEED = 0.05;
    const CONTRACT_SPEED = 0.1;
    const GRAVITY_CENTER = new THREE.Vector3(0, 0, 0);

    const matColorDark = new THREE.Color(0x06b6d4); // cyan-500

    // Three.js instances
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let particles: THREE.Points;
    let linesMesh: THREE.LineSegments;
    
    // Geometry arrays
    let positions = new Float32Array(NUM_PARTICLES * 3);
    let originalPositions = new Float32Array(NUM_PARTICLES * 3);
    let velocities: THREE.Vector3[] = [];

    // Interaction states
    let isContracting = false;
    let isDragging = false;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let previousMousePosition = { x: 0, y: 0 };
    let animationFrameId: number;

    const init = () => {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
      camera.position.z = 800;

      const geometry = new THREE.BufferGeometry();

      for (let i = 0; i < NUM_PARTICLES; i++) {
        // Random spherical distribution
        const r = BOUND * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        originalPositions[i * 3] = x;
        originalPositions[i * 3 + 1] = y;
        originalPositions[i * 3 + 2] = z;

        velocities.push(new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ));
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Create a tiny circle texture programmatically instead of loading a data URI to avoid warnings/cors
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const context = canvas.getContext('2d');
      if (context) {
        context.beginPath();
        context.arc(8, 8, 8, 0, Math.PI * 2);
        context.fillStyle = '#ffffff';
        context.fill();
      }
      const sprite = new THREE.CanvasTexture(canvas);

      const pMaterial = new THREE.PointsMaterial({
        color: matColorDark,
        size: 8,
        map: sprite,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      });

      particles = new THREE.Points(geometry, pMaterial);
      scene.add(particles);

      // Lines
      const linesGeo = new THREE.BufferGeometry();
      const linesPos = new Float32Array(6000 * 3); 
      linesGeo.setAttribute('position', new THREE.BufferAttribute(linesPos, 3).setUsage(THREE.DynamicDrawUsage));
      
      const lMaterial = new THREE.LineBasicMaterial({
        color: matColorDark,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      linesMesh = new THREE.LineSegments(linesGeo, lMaterial);
      scene.add(linesMesh);

      // Renderer
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      // Event Listeners
      container.addEventListener('pointerdown', onPointerDown);
      container.addEventListener('pointerup', onPointerUp);
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerleave', onPointerUp);
      window.addEventListener('resize', onWindowResize);

      animate();
    };

    const onWindowResize = () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onPointerDown = () => {
      isContracting = true;
      isDragging = true;
    };

    const onPointerUp = () => {
      isContracting = false;
      isDragging = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX - windowHalfX;
      mouseY = e.clientY - windowHalfY;

      if (isDragging && !autoRotateRef.current) {
        const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
        scene.rotation.y += deltaMove.x * 0.005;
        scene.rotation.x += deltaMove.y * 0.005;
      }
      
      previousMousePosition = { x: e.offsetX, y: e.offsetY };
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      render();
    };

    const render = () => {
      if (autoRotateRef.current) {
        targetRotationX = mouseY * 0.0002;
        targetRotationY = mouseX * 0.0002;
        scene.rotation.x += 0.002;
        scene.rotation.y += 0.004;
      }

      let vertexpos = 0;
      const posAttr = particles.geometry.attributes.position;
      const linesPosArr = linesMesh.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        let px = posAttr.getX(i);
        let py = posAttr.getY(i);
        let pz = posAttr.getZ(i);

        let ox = originalPositions[i * 3];
        let oy = originalPositions[i * 3 + 1];
        let oz = originalPositions[i * 3 + 2];

        if (isContracting) {
          const dx = (GRAVITY_CENTER.x - px) * CONTRACT_SPEED;
          const dy = (GRAVITY_CENTER.y - py) * CONTRACT_SPEED;
          const dz = (GRAVITY_CENTER.z - pz) * CONTRACT_SPEED;
          px += dx + (Math.random() - 0.5) * 10;
          py += dy + (Math.random() - 0.5) * 10;
          pz += dz + (Math.random() - 0.5) * 10;
        } else {
          px += (ox - px) * RETURN_SPEED;
          py += (oy - py) * RETURN_SPEED;
          pz += (oz - pz) * RETURN_SPEED;
          
          px += Math.sin(Date.now() * 0.001 + i) * 0.5;
          py += Math.cos(Date.now() * 0.001 + i) * 0.5;
        }

        posAttr.setXYZ(i, px, py, pz);

        for (let j = i + 1; j < NUM_PARTICLES; j++) {
          const jx = posAttr.getX(j);
          const jy = posAttr.getY(j);
          const jz = posAttr.getZ(j);

          const distSq = (px-jx)*(px-jx) + (py-jy)*(py-jy) + (pz-jz)*(pz-jz);

          if (distSq < MAX_DISTANCE * MAX_DISTANCE) {
            if (vertexpos < linesPosArr.length - 6) {
              linesPosArr[vertexpos++] = px;
              linesPosArr[vertexpos++] = py;
              linesPosArr[vertexpos++] = pz;
              linesPosArr[vertexpos++] = jx;
              linesPosArr[vertexpos++] = jy;
              linesPosArr[vertexpos++] = jz;
            }
          }
        }
      }

      for (let k = vertexpos; k < linesPosArr.length; k++) {
        linesPosArr[k] = 0;
      }

      posAttr.needsUpdate = true;
      linesMesh.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.setDrawRange(0, vertexpos / 3);

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    init();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerUp);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-950 text-slate-100 overflow-hidden relative" style={{ touchAction: 'none' }}>
      
      {/* 3D Canvas Background */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,#0f172a_0%,#020617_100%)]" 
      />

      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <BackButton />
      </div>

      {/* UI OVERLAY */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
        {/* TOP NAV */}
        <div className="p-4 sm:p-6 flex justify-between items-start pointer-events-auto pl-20 lg:pl-6">
          <div className="flex items-center gap-4 ml-2 lg:ml-12">
            <div className="backdrop-blur border px-4 py-2.5 rounded-2xl shadow-lg bg-slate-800/50 border-slate-700/50">
              <h1 className="text-sm sm:text-base font-bold tracking-tight leading-none mb-0.5 text-white">Neural WebGL Network</h1>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Three.js Particle Physics</p>
            </div>
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="mt-auto p-4 sm:p-8 pointer-events-auto flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
          <div className="backdrop-blur border px-5 py-4 rounded-3xl shadow-2xl max-w-sm bg-slate-800/50 border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-drag-move-line text-cyan-400"></i>
              <span className="text-sm font-bold text-white">Interactive Physics</span>
            </div>
            <p className="text-xs leading-relaxed mb-4 text-slate-300">
              Click and hold to contract the network toward a central gravitational pull. Release to let the nodes expand back to their stable bounds. Drag to rotate the camera.
            </p>
            <button 
              onClick={() => setAutoRotate(!autoRotate)}
              className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-cyan-400"
            >
              {autoRotate ? (
                <><i className="ri-magic-line"></i> Auto-Rotate: ON</>
              ) : (
                <><i className="ri-stop-mini-line"></i> Auto-Rotate: OFF</>
              )}
            </button>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="backdrop-blur border px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 bg-slate-800/50 border-slate-700/50">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white">750 Nodes</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">WebGL 2.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
