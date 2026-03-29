"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Full-viewport Three.js starfield + nebula + mountains background.
 * Camera moves on scroll for parallax section merging.
 * Sits behind all page content with position:fixed.
 */
export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.0003);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 20, 100);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    // Post-processing — bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85));

    // ===== STARS =====
    const starLayers: THREE.Points[] = [];
    for (let layer = 0; layer < 3; layer++) {
      const count = 4000;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const r = 200 + Math.random() * 800;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const c = new THREE.Color();
        const roll = Math.random();
        if (roll < 0.7) c.setHSL(0, 0, 0.8 + Math.random() * 0.2);
        else if (roll < 0.85) c.setHSL(0.6, 0.4, 0.8); // blue tint — brand
        else c.setHSL(0.75, 0.4, 0.8); // purple tint — brand secondary
        colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
        sizes[i] = Math.random() * 2 + 0.5;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, depth: { value: layer } },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;
          uniform float depth;
          void main() {
            vColor = color;
            vec3 pos = position;
            float angle = time * 0.03 * (1.0 - depth * 0.3);
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            pos.xy = rot * pos.xy;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float a = 1.0 - smoothstep(0.0, 0.5, d);
            gl_FragColor = vec4(vColor, a);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      starLayers.push(pts);
    }

    // ===== NEBULA =====
    const nebulaGeo = new THREE.PlaneGeometry(6000, 3000, 80, 80);
    const nebulaMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x2e5bff) }, // brand primary
        color2: { value: new THREE.Color(0x6e06d0) }, // brand secondary
        opacity: { value: 0.25 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vElev;
        uniform float time;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float elev = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 15.0;
          pos.z += elev;
          vElev = elev;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        uniform float time;
        varying vec2 vUv;
        varying float vElev;
        void main() {
          float mix1 = sin(vUv.x * 8.0 + time) * cos(vUv.y * 8.0 + time);
          vec3 col = mix(color1, color2, mix1 * 0.5 + 0.5);
          float a = opacity * (1.0 - length(vUv - 0.5) * 2.0);
          a *= 1.0 + vElev * 0.01;
          gl_FragColor = vec4(col, max(a, 0.0));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebula.position.z = -800;
    scene.add(nebula);

    // ===== MOUNTAINS (silhouette layers) =====
    const mountainLayers: THREE.Mesh[] = [];
    const layerDefs = [
      { dist: -50, h: 55, color: 0x0e0f18, opacity: 1 },
      { dist: -100, h: 70, color: 0x10122a, opacity: 0.85 },
      { dist: -150, h: 90, color: 0x0f1640, opacity: 0.65 },
      { dist: -200, h: 110, color: 0x0a1f50, opacity: 0.45 },
    ];
    layerDefs.forEach((l) => {
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i <= 50; i++) {
        const x = (i / 50 - 0.5) * 1200;
        const y = Math.sin(i * 0.1) * l.h + Math.sin(i * 0.05) * l.h * 0.5 + Math.random() * l.h * 0.15 - 100;
        pts.push(new THREE.Vector2(x, y));
      }
      pts.push(new THREE.Vector2(6000, -300));
      pts.push(new THREE.Vector2(-6000, -300));

      const shape = new THREE.Shape(pts);
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({ color: l.color, transparent: true, opacity: l.opacity, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = l.dist;
      mesh.position.y = -40;
      scene.add(mesh);
      mountainLayers.push(mesh);
    });

    // ===== CAMERA TARGETS =====
    const smoothCam = { x: 0, y: 20, z: 100 };
    let targetCam = { x: 0, y: 20, z: 100 };

    // ===== SCROLL HANDLER =====
    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / Math.max(maxScroll, 1), 1);

      // Camera drifts forward as user scrolls
      targetCam = {
        x: 0,
        y: 20 + progress * 30,
        z: 100 - progress * 250,
      };

      // Mountain parallax
      mountainLayers.forEach((m, i) => {
        m.position.x = Math.sin(Date.now() * 0.0001) * 2 * (1 + i * 0.5);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ===== ANIMATE =====
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      // Stars
      starLayers.forEach((s) => { if (s.material instanceof THREE.ShaderMaterial) s.material.uniforms.time.value = t; });

      // Nebula
      if (nebulaMat.uniforms) nebulaMat.uniforms.time.value = t * 0.5;

      // Smooth camera
      smoothCam.x += (targetCam.x - smoothCam.x) * 0.04;
      smoothCam.y += (targetCam.y - smoothCam.y) * 0.04;
      smoothCam.z += (targetCam.z - smoothCam.z) * 0.04;

      camera.position.set(
        smoothCam.x + Math.sin(t * 0.1) * 1.5,
        smoothCam.y + Math.cos(t * 0.15) * 0.8,
        smoothCam.z
      );
      camera.lookAt(0, 5, -600);

      // Mountains subtle float
      mountainLayers.forEach((m, i) => {
        m.position.y = -40 + Math.cos(t * 0.15) * (1 + i * 0.5);
      });

      composer.render();
    };
    animate();

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      starLayers.forEach((s) => { s.geometry.dispose(); (s.material as THREE.Material).dispose(); });
      mountainLayers.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      nebulaGeo.dispose(); nebulaMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ background: "#050508" }}
    />
  );
}
