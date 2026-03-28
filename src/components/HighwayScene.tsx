"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

interface LabelPos { x: number; y: number; opacity: number }

const MILESTONES = [
  { z: 30, size: 0.6, color: 0x3b82f6, label: "You", isCurrent: true },
  { z: 5, size: 0.4, color: 0xb8c3ff, label: "Trainee / Intern" },
  { z: -25, size: 0.4, color: 0xb8c3ff, label: "Junior Developer" },
  { z: -55, size: 0.4, color: 0xb8c3ff, label: "Mid-Level" },
  { z: -85, size: 0.35, color: 0xb8c3ff, label: "Senior Developer" },
  { z: -115, size: 0.3, color: 0xb8c3ff, label: "Staff / Principal" },
  { z: -145, size: 0.25, color: 0xb8c3ff, label: "Engineering Lead" },
];

export default function HighwayScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [labelPositions, setLabelPositions] = useState<LabelPos[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131315);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 800);
    camera.position.set(0, 14, 55);
    camera.lookAt(0, 2, -150);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x131315, 1);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.8, 0.3, 0.9));

    // Roads
    const roadConfigs = [
      { xOffset: -8, trailColor: [0.72, 0.45, 0.85] },
      { xOffset: -3, trailColor: [0.45, 0.55, 0.95] },
      { xOffset: 0, trailColor: [0.23, 0.51, 1.0] },
      { xOffset: 3, trailColor: [0.55, 0.75, 1.0] },
      { xOffset: 8, trailColor: [0.85, 0.55, 1.0] },
    ];

    roadConfigs.forEach((rc) => {
      const roadGeo = new THREE.PlaneGeometry(3.5, 350, 1, 1);
      const roadMat = new THREE.MeshBasicMaterial({ color: 0x0c0e16, transparent: true, opacity: 0.35 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(rc.xOffset, -0.02, -135);
      scene.add(road);

      for (const side of [-1, 1]) {
        const edgeGeo = new THREE.PlaneGeometry(0.08, 350, 1, 1);
        const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.rotation.x = -Math.PI / 2;
        edge.position.set(rc.xOffset + side * 1.75, -0.01, -135);
        scene.add(edge);
      }

      const dashGeo = new THREE.PlaneGeometry(0.06, 350, 1, 1);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xb8c3ff, transparent: true, opacity: 0.08 });
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(rc.xOffset, 0, -135);
      scene.add(dash);
    });

    // Trails
    const allTrails: { line: THREE.Line; speed: number; phase: number }[] = [];
    roadConfigs.forEach((rc) => {
      const trailCount = rc.xOffset === 0 ? 3 : 4;
      for (let i = 0; i < trailCount; i++) {
        const pts: THREE.Vector3[] = [];
        const xSpread = (Math.random() - 0.5) * 2.5;
        for (let j = 0; j <= 50; j++) {
          const t = j / 50;
          pts.push(new THREE.Vector3(rc.xOffset + xSpread * (1 - t * 0.8), 0.06, 55 - t * 350));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const c = new THREE.Color(rc.trailColor[0], rc.trailColor[1], rc.trailColor[2]);
        const mat = new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        allTrails.push({ line, speed: 0.4 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2 });
      }
    });

    // Milestone spheres (3D objects)
    const milestoneMeshes: THREE.Mesh[] = [];
    MILESTONES.forEach((ms) => {
      const geo = new THREE.SphereGeometry(ms.size, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: ms.color });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.set(0, ms.size, ms.z);
      scene.add(sphere);
      milestoneMeshes.push(sphere);

      const ringGeo = new THREE.RingGeometry(ms.size + 0.2, ms.size + 0.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: ms.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(sphere.position);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);
    });

    // Side road milestones
    [[-8, -15], [-3, -30], [3, -25], [8, -10], [-8, -50], [8, -45], [-3, -60], [3, -55], [-8, -85], [-3, -95], [3, -90], [8, -80], [-8, -120], [8, -115], [-3, -130], [3, -125]].forEach(([x, z]) => {
      const geo = new THREE.SphereGeometry(0.25, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color: 0xb8c3ff, transparent: true, opacity: 0.3 });
      const s = new THREE.Mesh(geo, mat);
      s.position.set(x, 0.25, z);
      scene.add(s);
    });

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      sp[i * 3] = (Math.random() - 0.5) * 400;
      sp[i * 3 + 1] = Math.random() * 100 + 5;
      sp[i * 3 + 2] = (Math.random() - 0.5) * 400 - 60;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xb8c3ff, size: 0.12, transparent: true, opacity: 0.4 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Cross roads
    for (const z of [-15, -40, -65, -95, -125]) {
      const crossGeo = new THREE.PlaneGeometry(22, 0.6, 1, 1);
      const crossMat = new THREE.MeshBasicMaterial({ color: 0x0c0e16, transparent: true, opacity: 0.25 });
      const cross = new THREE.Mesh(crossGeo, crossMat);
      cross.rotation.x = -Math.PI / 2;
      cross.position.set(0, -0.01, z);
      scene.add(cross);
    }

    // Mouse
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    canvas.addEventListener("mousemove", onMouse);

    // Project 3D milestone positions to 2D screen coords
    const projectLabels = () => {
      const positions: LabelPos[] = [];
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      milestoneMeshes.forEach((mesh) => {
        const vec = mesh.position.clone();
        vec.project(camera);
        const x = (vec.x * 0.5 + 0.5) * cw;
        const y = (-vec.y * 0.5 + 0.5) * ch;
        // Behind camera or off screen
        const visible = vec.z < 1 && x > -50 && x < cw + 50 && y > -50 && y < ch + 50;
        const depth = mesh.position.distanceTo(camera.position);
        const opacity = visible ? Math.max(0, Math.min(1, 1 - depth / 200)) : 0;
        positions.push({ x, y, opacity });
      });

      setLabelPositions(positions);
    };

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      camera.position.x += (mouseRef.current.x * 3 - camera.position.x) * 0.03;
      camera.position.y += (14 - mouseRef.current.y * 2 - camera.position.y) * 0.03;
      camera.lookAt(0, 2, -150);

      allTrails.forEach((tr) => {
        const mat = tr.line.material as THREE.LineBasicMaterial;
        mat.opacity = 0.25 + Math.sin(t * tr.speed + tr.phase) * 0.3;
      });

      composer.render();
      projectLabels();
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* HTML labels projected from 3D positions */}
      {labelPositions.map((pos, i) => {
        const ms = MILESTONES[i];
        if (!ms || pos.opacity < 0.05) return null;
        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: "translate(20px, -50%)",
              opacity: pos.opacity,
              transition: "opacity 0.3s",
            }}
          >
            <div className={`flex items-center gap-2 ${ms.isCurrent ? "" : ""}`}>
              <span
                className={`text-[11px] font-bold tracking-wide whitespace-nowrap ${
                  ms.isCurrent
                    ? "bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-full"
                    : "text-on-surface-variant/70"
                }`}
              >
                {ms.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
