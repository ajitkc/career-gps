"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

interface ParticleTextProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  particleSize?: number;
  particleGap?: number;
  mouseRadius?: number;
  mouseForce?: number;
  returnSpeed?: number;
  friction?: number;
  className?: string;
}

export default function ParticleText({
  text,
  fontSize = 80,
  fontFamily = "Manrope, system-ui, sans-serif",
  color = "#b8c3ff",
  particleSize = 2,
  particleGap = 3,
  mouseRadius = 80,
  mouseForce = 8,
  returnSpeed = 0.06,
  friction = 0.85,
  className = "",
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(0);
  const initializedRef = useRef(false);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    // Guard: skip if canvas isn't laid out yet
    if (w < 10 || h < 10) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    // Render text to offscreen canvas to sample pixel positions
    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const offCtx = offscreen.getContext("2d")!;

    // Split text by newlines
    const lines = text.split("\n");
    const lineHeight = fontSize * 1.15;
    const totalHeight = lines.length * lineHeight;
    const startY = (h - totalHeight) / 2 + fontSize * 0.85;

    offCtx.fillStyle = "#ffffff";
    offCtx.font = `800 ${fontSize}px ${fontFamily}`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "alphabetic";

    lines.forEach((line, i) => {
      offCtx.fillText(line, w / 2, startY + i * lineHeight);
    });

    // Sample pixels
    const imageData = offCtx.getImageData(0, 0, w, h);
    const particles: Particle[] = [];

    for (let y = 0; y < h; y += particleGap) {
      for (let x = 0; x < w; x += particleGap) {
        const idx = (y * w + x) * 4;
        const alpha = imageData.data[idx + 3];
        if (alpha > 128) {
          particles.push({
            x: x + (Math.random() - 0.5) * 200, // start scattered
            y: y + (Math.random() - 0.5) * 200,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            color,
            size: particleSize + Math.random() * 0.5,
          });
        }
      }
    }

    particlesRef.current = particles;
    initializedRef.current = true;
  }, [text, fontSize, fontFamily, color, particleSize, particleGap]);

  useEffect(() => {
    // Defer to next frame so canvas has layout dimensions
    const raf = requestAnimationFrame(() => initParticles());

    const handleResize = () => initParticles();
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [initParticles]);

  // Mouse tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !initializedRef.current) {
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const particles = particlesRef.current;

      for (const p of particles) {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * mouseForce;
          p.vy += Math.sin(angle) * force * mouseForce;
        }

        // Spring back to origin
        p.vx += (p.originX - p.x) * returnSpeed;
        p.vy += (p.originY - p.y) * returnSpeed;

        // Friction
        p.vx *= friction;
        p.vy *= friction;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        const distFromOrigin = Math.hypot(p.x - p.originX, p.y - p.originY);
        const alpha = Math.max(0.3, 1 - distFromOrigin / 100);

        ctx.fillStyle = distFromOrigin > 5
          ? `rgba(184, 195, 255, ${alpha * 0.7})`
          : p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [mouseRadius, mouseForce, returnSpeed, friction]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ height: `${(text.split("\n").length * fontSize * 1.15) + fontSize * 0.5}px` }}
    />
  );
}
