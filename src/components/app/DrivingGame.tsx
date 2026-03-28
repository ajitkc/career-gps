"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CareerMatch } from "@/types";

// ============================================================
// CONSTANTS
// ============================================================

const ROAD_WIDTH = 90;
const CAR_ACCEL = 0.15;
const CAR_BRAKE = 0.2;
const CAR_FRICTION = 0.04;
const MAX_SPEED = 5;
const CAMERA_SMOOTH = 0.07;
const ROAD_RESOLUTION = 1200;

// Colors matching our design system
const COLORS = {
  bg: "#0e0e10",
  road: "#2a2a2c",
  roadEdge: "#353437",
  roadCasing: "#1b1b1d",
  dashWhite: "rgba(184, 195, 255, 0.35)",
  dashActive: "rgba(184, 195, 255, 0.7)",
  grass1: "#111113",
  grass2: "#131316",
  tree: "#1b1b1e",
  treeShadow: "rgba(0,0,0,0.3)",
  primary: "#b8c3ff",
  primaryGlow: "rgba(46, 91, 255, 0.4)",
  burnoutRoad: "#2a1a1a",
  burnoutEdge: "#4a1a1a",
  burnoutGlow: "rgba(208, 42, 48, 0.25)",
  burnoutSign: "#d02a30",
  milestone: "#2e5bff",
  milestoneGlow: "rgba(46, 91, 255, 0.5)",
  milestoneLocked: "#353437",
  white: "#e5e1e4",
  dim: "#8e90a2",
  carBody: "#2e5bff",
  carRoof: "#4a6fff",
  carShadow: "rgba(0,0,0,0.4)",
  headlight: "#fffde0",
  taillight: "#ff4444",
};

// ============================================================
// ROAD WAYPOINTS — a winding career road
// ============================================================

const WAYPOINTS: [number, number][] = [
  [0, 0],
  [0, -160],
  [0, -340],
  [60, -500],
  [160, -620],
  [200, -780],
  [140, -940],
  [20, -1060],
  [-120, -1200],
  [-200, -1360],
  [-140, -1520],
  [20, -1660],
  [160, -1820],
  [200, -1960],
  [100, -2120],
  [-40, -2280],
  [-140, -2420],
  [-80, -2580],
  [60, -2740],
  [140, -2880],
  [60, -3040],
  [-60, -3180],
  [-20, -3360],
  [80, -3500],
  [40, -3660],
  [-40, -3800],
  [0, -3960],
];

// ============================================================
// SPLINE MATH
// ============================================================

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

function precomputeRoad(waypoints: [number, number][], resolution: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const n = waypoints.length;
  const segsPerWp = Math.floor(resolution / (n - 1));

  for (let i = 0; i < n - 1; i++) {
    const p0 = waypoints[Math.max(0, i - 1)];
    const p1 = waypoints[i];
    const p2 = waypoints[Math.min(n - 1, i + 1)];
    const p3 = waypoints[Math.min(n - 1, i + 2)];

    for (let j = 0; j < segsPerWp; j++) {
      const t = j / segsPerWp;
      points.push({
        x: catmullRom(p0[0], p1[0], p2[0], p3[0], t),
        y: catmullRom(p0[1], p1[1], p2[1], p3[1], t),
      });
    }
  }
  points.push({ x: waypoints[n - 1][0], y: waypoints[n - 1][1] });
  return points;
}

function getAngle(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function getNormal(angle: number): { nx: number; ny: number } {
  return { nx: -Math.sin(angle), ny: Math.cos(angle) };
}

// ============================================================
// MILESTONE & BURNOUT DATA
// ============================================================

interface GameMilestone {
  progress: number; // 0-1 along road
  label: string;
  sublabel: string;
  reached: boolean;
  burnout: boolean;
}

function buildMilestones(career: CareerMatch): GameMilestone[] {
  return career.progression.map((role, i) => ({
    progress: (i + 1) / (career.progression.length + 1),
    label: role,
    sublabel: i === 0 ? career.estimated_timeline.to_first_role
      : i === Math.floor(career.progression.length / 2) ? career.estimated_timeline.to_mid_level
      : i === career.progression.length - 1 ? career.estimated_timeline.to_senior
      : "",
    reached: false,
    burnout: career.stress_level === "High" && i >= career.progression.length - 2,
  }));
}

interface BurnoutZone {
  start: number;
  end: number;
}

function buildBurnoutZones(career: CareerMatch): BurnoutZone[] {
  if (career.stress_level !== "High") return [];
  return [{ start: 0.6, end: 0.85 }];
}

// ============================================================
// DRAWING FUNCTIONS
// ============================================================

function drawEnvironment(ctx: CanvasRenderingContext2D, camera: { x: number; y: number }, w: number, h: number) {
  // Scattered dots for terrain texture
  const gridSize = 60;
  const startX = Math.floor((camera.x - w) / gridSize) * gridSize;
  const startY = Math.floor((camera.y - h) / gridSize) * gridSize;
  ctx.fillStyle = "rgba(184, 195, 255, 0.02)";
  for (let x = startX; x < camera.x + w; x += gridSize) {
    for (let y = startY; y < camera.y + h; y += gridSize) {
      const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      if (hash > 0.7) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawTreesAlongRoad(
  ctx: CanvasRenderingContext2D,
  roadPoints: { x: number; y: number }[],
  camera: { x: number; y: number },
  viewRadius: number
) {
  const step = 12;
  for (let i = 0; i < roadPoints.length; i += step) {
    const p = roadPoints[i];
    const dist = Math.hypot(p.x - camera.x, p.y - camera.y);
    if (dist > viewRadius) continue;

    const next = roadPoints[Math.min(i + 1, roadPoints.length - 1)];
    const angle = getAngle(p, next);
    const { nx, ny } = getNormal(angle);
    const hash = Math.abs(Math.sin(i * 7.7) * 999) % 1;

    for (const side of [-1, 1]) {
      const offset = ROAD_WIDTH * 0.8 + hash * 60 + 30;
      const tx = p.x + nx * offset * side;
      const ty = p.y + ny * offset * side;

      // Shadow
      ctx.fillStyle = COLORS.treeShadow;
      ctx.beginPath();
      ctx.ellipse(tx + 3, ty + 3, 8 + hash * 6, 6 + hash * 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tree
      ctx.fillStyle = COLORS.tree;
      ctx.beginPath();
      ctx.arc(tx, ty, 6 + hash * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  roadPoints: { x: number; y: number }[],
  burnoutZones: BurnoutZone[],
  camera: { x: number; y: number },
  viewRadius: number,
  dashOffset: number
) {
  const n = roadPoints.length;

  function isInBurnout(idx: number): boolean {
    const t = idx / n;
    return burnoutZones.some((z) => t >= z.start && t <= z.end);
  }

  // Draw road in segments for performance (only visible parts)
  for (let i = 0; i < n - 1; i++) {
    const p = roadPoints[i];
    const dist = Math.hypot(p.x - camera.x, p.y - camera.y);
    if (dist > viewRadius) continue;

    const next = roadPoints[i + 1];
    const angle = getAngle(p, next);
    const { nx, ny } = getNormal(angle);
    const inBurnout = isInBurnout(i);

    // Road casing
    ctx.strokeStyle = inBurnout ? COLORS.burnoutEdge : COLORS.roadCasing;
    ctx.lineWidth = ROAD_WIDTH + 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();

    // Road surface
    ctx.strokeStyle = inBurnout ? COLORS.burnoutRoad : COLORS.road;
    ctx.lineWidth = ROAD_WIDTH;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();

    // Edge lines
    ctx.strokeStyle = inBurnout ? "rgba(208, 42, 48, 0.3)" : "rgba(184, 195, 255, 0.12)";
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      const hw = ROAD_WIDTH / 2 - 2;
      ctx.beginPath();
      ctx.moveTo(p.x + nx * hw * side, p.y + ny * hw * side);
      ctx.lineTo(next.x + nx * hw * side, next.y + ny * hw * side);
      ctx.stroke();
    }

    // Burnout glow
    if (inBurnout && i % 3 === 0) {
      ctx.strokeStyle = COLORS.burnoutGlow;
      ctx.lineWidth = ROAD_WIDTH + 40;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
  }

  // Center dashes (drawn separately for dash pattern)
  ctx.strokeStyle = COLORS.dashWhite;
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 22]);
  ctx.lineDashOffset = dashOffset;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p = roadPoints[i];
    const dist = Math.hypot(p.x - camera.x, p.y - camera.y);
    if (dist > viewRadius) continue;
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBurnoutSigns(
  ctx: CanvasRenderingContext2D,
  roadPoints: { x: number; y: number }[],
  burnoutZones: BurnoutZone[],
  camera: { x: number; y: number },
  viewRadius: number
) {
  const n = roadPoints.length;
  for (const zone of burnoutZones) {
    // Warning sign before zone
    const signIdx = Math.max(0, Math.floor(zone.start * n) - 30);
    const sp = roadPoints[signIdx];
    if (!sp || Math.hypot(sp.x - camera.x, sp.y - camera.y) > viewRadius) continue;

    const nextP = roadPoints[Math.min(signIdx + 1, n - 1)];
    const angle = getAngle(sp, nextP);
    const { nx, ny } = getNormal(angle);
    const sx = sp.x + nx * (ROAD_WIDTH * 0.7);
    const sy = sp.y + ny * (ROAD_WIDTH * 0.7);

    // Sign post
    ctx.fillStyle = "#555";
    ctx.fillRect(sx - 1.5, sy - 20, 3, 20);

    // Sign
    ctx.fillStyle = COLORS.burnoutSign;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 36);
    ctx.lineTo(sx + 14, sy - 20);
    ctx.lineTo(sx - 14, sy - 20);
    ctx.closePath();
    ctx.fill();

    // ! symbol
    ctx.fillStyle = "white";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", sx, sy - 23);

    // Traffic cones in burnout zone
    for (let t = zone.start; t <= zone.end; t += 0.03) {
      const idx = Math.floor(t * n);
      const p = roadPoints[idx];
      if (!p || Math.hypot(p.x - camera.x, p.y - camera.y) > viewRadius) continue;
      const next2 = roadPoints[Math.min(idx + 1, n - 1)];
      const a2 = getAngle(p, next2);
      const n2 = getNormal(a2);
      const hash = Math.abs(Math.sin(idx * 3.3)) % 1;

      for (const side of [-1, 1]) {
        if (hash > 0.5 && side === 1) continue;
        const hw = ROAD_WIDTH / 2 - 8;
        const cx = p.x + n2.nx * hw * side;
        const cy = p.y + n2.ny * hw * side;

        // Cone
        ctx.fillStyle = "#ff6633";
        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx + 4, cy + 2);
        ctx.lineTo(cx - 4, cy + 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillRect(cx - 3, cy - 1, 6, 1.5);
      }
    }
  }
}

function drawMilestoneMarkers(
  ctx: CanvasRenderingContext2D,
  roadPoints: { x: number; y: number }[],
  milestones: GameMilestone[],
  camera: { x: number; y: number },
  viewRadius: number,
  time: number
) {
  const n = roadPoints.length;

  for (const ms of milestones) {
    const idx = Math.floor(ms.progress * n);
    const p = roadPoints[idx];
    if (!p) continue;
    const dist = Math.hypot(p.x - camera.x, p.y - camera.y);
    if (dist > viewRadius) continue;

    const pulse = Math.sin(time * 3 + ms.progress * 10) * 0.3 + 0.7;

    // Glow
    if (!ms.reached) {
      ctx.fillStyle = ms.burnout ? COLORS.burnoutGlow : COLORS.milestoneGlow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20 * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // Circle
    ctx.fillStyle = ms.reached ? COLORS.milestone : ms.burnout ? COLORS.burnoutSign : COLORS.milestoneLocked;
    ctx.strokeStyle = ms.reached ? COLORS.primary : ms.burnout ? COLORS.burnoutSign : COLORS.dim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Icon
    ctx.fillStyle = "white";
    ctx.font = `bold 10px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ms.reached ? "✓" : "?", p.x, p.y);

    // Label (only when close)
    if (dist < 300) {
      ctx.fillStyle = ms.reached ? COLORS.white : COLORS.dim;
      ctx.font = "bold 10px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(ms.reached ? ms.label : "???", p.x, p.y + 20);
      if (ms.sublabel && ms.reached) {
        ctx.fillStyle = COLORS.dim;
        ctx.font = "9px sans-serif";
        ctx.fillText(ms.sublabel, p.x, p.y + 34);
      }
    }
  }
}

function drawCar(ctx: CanvasRenderingContext2D, time: number) {
  // Car is drawn at origin (0,0) facing UP (-Y direction)
  // The canvas is already translated/rotated so car appears at center

  const headlightPulse = 0.8 + Math.sin(time * 4) * 0.2;

  // Shadow
  ctx.fillStyle = COLORS.carShadow;
  ctx.beginPath();
  ctx.ellipse(3, 4, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = "#1a1a1a";
  for (const [wx, wy] of [[-12, -16], [12, -16], [-12, 16], [12, 16]]) {
    ctx.beginPath();
    ctx.roundRect(wx - 3, wy - 5, 6, 10, 2);
    ctx.fill();
  }

  // Body
  const bodyGrad = ctx.createLinearGradient(-14, 0, 14, 0);
  bodyGrad.addColorStop(0, "#1e3faa");
  bodyGrad.addColorStop(0.3, COLORS.carBody);
  bodyGrad.addColorStop(0.7, COLORS.carRoof);
  bodyGrad.addColorStop(1, "#1e3faa");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-14, -22, 28, 44, 8);
  ctx.fill();

  // Body outline
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-14, -22, 28, 44, 8);
  ctx.stroke();

  // Roof highlight
  const roofGrad = ctx.createLinearGradient(0, -10, 0, 10);
  roofGrad.addColorStop(0, "rgba(255,255,255,0.12)");
  roofGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = roofGrad;
  ctx.beginPath();
  ctx.roundRect(-8, -8, 16, 16, 4);
  ctx.fill();

  // Windshield
  ctx.fillStyle = "rgba(14, 14, 16, 0.6)";
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.lineTo(8, -14);
  ctx.lineTo(6, -5);
  ctx.lineTo(-6, -5);
  ctx.closePath();
  ctx.fill();

  // Rear window
  ctx.fillStyle = "rgba(14, 14, 16, 0.4)";
  ctx.beginPath();
  ctx.moveTo(-6, 6);
  ctx.lineTo(6, 6);
  ctx.lineTo(8, 14);
  ctx.lineTo(-8, 14);
  ctx.closePath();
  ctx.fill();

  // Headlights
  ctx.fillStyle = `rgba(255, 253, 224, ${headlightPulse})`;
  ctx.shadowColor = COLORS.headlight;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(-7, -21, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(7, -21, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Headlight beams
  ctx.fillStyle = "rgba(255, 253, 224, 0.03)";
  ctx.beginPath();
  ctx.moveTo(-10, -24);
  ctx.lineTo(10, -24);
  ctx.lineTo(20, -80);
  ctx.lineTo(-20, -80);
  ctx.closePath();
  ctx.fill();

  // Taillights
  ctx.fillStyle = COLORS.taillight;
  ctx.shadowColor = COLORS.taillight;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(-8, 20, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, 20, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface MilestonePopupData {
  label: string;
  sublabel: string;
  burnout: boolean;
  index: number;
}

export default function DrivingGame({ careers }: { careers: CareerMatch[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<Set<string>>(new Set());

  // Game state in ref for animation loop (no re-renders)
  const stateRef = useRef({
    carIdx: 5, // start a bit into the road
    speed: 0,
    camera: { x: 0, y: 0 },
    cameraAngle: 0,
    dashOffset: 0,
    time: 0,
  });

  const [roadPoints] = useState(() => precomputeRoad(WAYPOINTS, ROAD_RESOLUTION));
  const [milestones, setMilestones] = useState<GameMilestone[]>(() =>
    careers.length > 0 ? buildMilestones(careers[0]) : []
  );
  const [burnoutZones] = useState<BurnoutZone[]>(() =>
    careers.length > 0 ? buildBurnoutZones(careers[0]) : []
  );
  const [popup, setPopup] = useState<MilestonePopupData | null>(null);
  const [speedDisplay, setSpeedDisplay] = useState(0);

  // Keyboard input
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Check milestone collisions
  const checkMilestones = useCallback(
    (carIdx: number) => {
      const carProgress = carIdx / roadPoints.length;
      setMilestones((prev) => {
        let changed = false;
        const next = prev.map((ms, i) => {
          if (!ms.reached && Math.abs(carProgress - ms.progress) < 0.015) {
            changed = true;
            setPopup({ label: ms.label, sublabel: ms.sublabel, burnout: ms.burnout, index: i });
            return { ...ms, reached: true };
          }
          return ms;
        });
        return changed ? next : prev;
      });
    },
    [roadPoints.length]
  );

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const s = stateRef.current;
      const keys = keysRef.current;
      const touch = touchRef.current;

      s.time += 0.016;

      // Input
      const up = keys.has("ArrowUp") || keys.has("w") || touch.has("up");
      const down = keys.has("ArrowDown") || keys.has("s") || touch.has("down");

      // Acceleration
      if (up) s.speed = Math.min(MAX_SPEED, s.speed + CAR_ACCEL);
      else if (down) s.speed = Math.max(-MAX_SPEED * 0.4, s.speed - CAR_BRAKE);
      else {
        // Friction
        if (Math.abs(s.speed) < CAR_FRICTION) s.speed = 0;
        else s.speed -= Math.sign(s.speed) * CAR_FRICTION;
      }

      // Move car along road
      s.carIdx = Math.max(0, Math.min(roadPoints.length - 2, s.carIdx + s.speed));

      const idx = Math.floor(s.carIdx);
      const frac = s.carIdx - idx;
      const p1 = roadPoints[idx];
      const p2 = roadPoints[Math.min(idx + 1, roadPoints.length - 1)];
      const carX = p1.x + (p2.x - p1.x) * frac;
      const carY = p1.y + (p2.y - p1.y) * frac;
      const carAngle = getAngle(p1, p2);

      // Camera follow with smoothing
      s.camera.x += (carX - s.camera.x) * CAMERA_SMOOTH;
      s.camera.y += (carY - s.camera.y) * CAMERA_SMOOTH;

      // Smooth camera angle
      let angleDiff = carAngle - s.cameraAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      s.cameraAngle += angleDiff * CAMERA_SMOOTH * 1.5;

      // Animated dashes
      s.dashOffset -= s.speed * 2;

      // Check milestones
      checkMilestones(idx);

      // Update speed display periodically
      setSpeedDisplay(Math.abs(Math.round(s.speed * 30)));

      // ===== RENDER =====
      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, w, h);

      // Camera transform: center on car, rotate to heading
      ctx.save();
      ctx.translate(w / 2, h * 0.65); // car slightly below center
      ctx.rotate(-s.cameraAngle - Math.PI / 2); // road goes "up"
      ctx.translate(-s.camera.x, -s.camera.y);

      const viewRadius = Math.max(w, h) * 1.2;

      // Draw world
      drawEnvironment(ctx, s.camera, w, h);
      drawTreesAlongRoad(ctx, roadPoints, s.camera, viewRadius);
      drawRoad(ctx, roadPoints, burnoutZones, s.camera, viewRadius, s.dashOffset);
      drawBurnoutSigns(ctx, roadPoints, burnoutZones, s.camera, viewRadius);
      drawMilestoneMarkers(ctx, roadPoints, milestones, s.camera, viewRadius, s.time);

      ctx.restore();

      // Draw car at center (fixed position on screen)
      ctx.save();
      ctx.translate(w / 2, h * 0.65);
      drawCar(ctx, s.time);
      ctx.restore();

      ctx.restore();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [roadPoints, milestones, burnoutZones, checkMilestones]);

  // D-pad touch handlers
  const startTouch = (dir: string) => touchRef.current.add(dir);
  const endTouch = (dir: string) => touchRef.current.delete(dir);

  // Progress bar value
  const progress = (stateRef.current.carIdx / roadPoints.length) * 100;

  return (
    <div className="relative w-full h-full bg-[#0e0e10] select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* HUD — Top progress bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-primary tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* HUD — Speed */}
      <div className="absolute top-12 right-4 z-10 bg-surface-container/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-outline-variant/10">
        <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Speed</div>
        <div className="font-headline text-xl font-extrabold text-primary tabular-nums">
          {speedDisplay}
          <span className="text-xs text-on-surface-variant ml-0.5">km/h</span>
        </div>
      </div>

      {/* HUD — Instructions */}
      <div className="absolute top-12 left-4 z-10 bg-surface-container/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-outline-variant/10">
        <div className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Controls</div>
        <div className="text-[10px] text-on-surface-variant">
          <span className="text-primary font-bold">↑</span> Accelerate · <span className="text-primary font-bold">↓</span> Brake
        </div>
      </div>

      {/* On-screen D-pad */}
      <div className="absolute bottom-8 left-8 z-10 md:bottom-12 md:left-12">
        <div className="relative w-[140px] h-[140px]">
          {/* Up */}
          <button
            onPointerDown={() => startTouch("up")}
            onPointerUp={() => endTouch("up")}
            onPointerLeave={() => endTouch("up")}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl flex items-center justify-center text-primary hover:bg-primary/20 active:bg-primary/30 transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          {/* Down */}
          <button
            onPointerDown={() => startTouch("down")}
            onPointerUp={() => endTouch("down")}
            onPointerLeave={() => endTouch("down")}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl flex items-center justify-center text-primary hover:bg-primary/20 active:bg-primary/30 transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          {/* Left */}
          <button
            onPointerDown={() => startTouch("up")}
            onPointerUp={() => endTouch("up")}
            onPointerLeave={() => endTouch("up")}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-primary/20 active:bg-primary/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          {/* Right */}
          <button
            onPointerDown={() => startTouch("down")}
            onPointerUp={() => endTouch("down")}
            onPointerLeave={() => endTouch("down")}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-outline-variant/20 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-primary/20 active:bg-primary/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-surface-container/60 backdrop-blur-xl rounded-lg border border-outline-variant/10 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary/30" />
          </div>
        </div>
      </div>

      {/* Milestone Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.index}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20 w-[320px]"
          >
            <div className={`rounded-2xl p-6 border shadow-2xl ${
              popup.burnout
                ? "bg-surface-container-low border-tertiary/30"
                : "bg-surface-container-low border-primary/30"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  popup.burnout ? "text-tertiary" : "text-primary"
                }`}>
                  {popup.burnout ? "⚠ Burnout Zone" : "✓ Milestone Reached"}
                </span>
                <button
                  onClick={() => setPopup(null)}
                  className="w-6 h-6 rounded-md hover:bg-surface-container-high flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-on-surface-variant" />
                </button>
              </div>
              <h4 className="font-headline text-lg font-extrabold tracking-tight">
                {popup.label}
              </h4>
              {popup.sublabel && (
                <p className="text-sm text-on-surface-variant mt-1">{popup.sublabel}</p>
              )}
              {popup.burnout && (
                <p className="text-xs text-tertiary mt-2">
                  This section of your career path has higher stress. Take it slow.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-dismiss popup */}
      {popup && (
        <AutoDismiss
          key={popup.index}
          delay={4000}
          onDismiss={() => setPopup(null)}
        />
      )}
    </div>
  );
}

function AutoDismiss({ delay, onDismiss }: { delay: number; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, delay);
    return () => clearTimeout(t);
  }, [delay, onDismiss]);
  return null;
}
