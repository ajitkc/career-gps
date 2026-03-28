"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronUp, ChevronLeft, ChevronRight, CheckCircle2, ZoomIn, ZoomOut } from "lucide-react";
import type { CareerMatch } from "@/types";
import { useStore } from "@/lib/store";

// ============================================================
// TYPES
// ============================================================

interface MNode {
  id: string;
  label: string;
  x: number;
  y: number;
  careerIdx: number;
  stageIdx: number;
  level: number;
  lane: number;
  burnout: boolean;
}

interface MEdge { from: string; to: string }

// ============================================================
// LAYOUT
// ============================================================

const LW = 480; // lane gap — wider for bigger map
const LH = 400; // level gap — taller
const RW = 44;  // road width — wider
const NR = 28;  // node radius — larger

function buildMap(careers: CareerMatch[]) {
  const nodes = new Map<string, MNode>();
  const edges: MEdge[] = [];
  const adj = new Map<string, Set<string>>();
  const n = careers.length;
  const ox = ((n - 1) * LW) / 2;

  function add(nd: MNode) { nodes.set(nd.id, nd); adj.set(nd.id, new Set()); }
  function link(a: string, b: string) {
    if (!adj.has(a) || !adj.has(b) || adj.get(a)!.has(b)) return;
    edges.push({ from: a, to: b }); adj.get(a)!.add(b); adj.get(b)!.add(a);
  }

  add({ id: "root", label: "Start", x: 0, y: 0, careerIdx: -1, stageIdx: -1, level: 0, lane: Math.floor(n / 2), burnout: false });

  careers.forEach((c, ci) => {
    c.progression.forEach((role, si) => {
      add({ id: `c${ci}-s${si}`, label: role, x: ci * LW - ox, y: -(si + 1) * LH, careerIdx: ci, stageIdx: si, level: si + 1, lane: ci, burnout: c.stress_level === "High" });
      link(si === 0 ? "root" : `c${ci}-s${si - 1}`, `c${ci}-s${si}`);
    });
  });

  const maxLvl = Math.max(...careers.map((c) => c.progression.length));
  for (let l = 1; l <= maxLvl; l++) {
    const at = [...nodes.values()].filter((nd) => nd.level === l).sort((a, b) => a.lane - b.lane);
    for (let i = 0; i < at.length - 1; i++) link(at[i].id, at[i + 1].id);
  }
  return { nodes, edges, adj };
}

// ============================================================
// PATHFINDING
// ============================================================

function bfs(adj: Map<string, Set<string>>, from: string, to: string): string[] | null {
  if (from === to) return [from];
  const vis = new Set([from]); const q: string[][] = [[from]];
  while (q.length > 0) { const p = q.shift()!; const c = p[p.length - 1]; for (const nb of adj.get(c) || []) { if (nb === to) return [...p, nb]; if (!vis.has(nb)) { vis.add(nb); q.push([...p, nb]); } } }
  return null;
}

function bfsDist(adj: Map<string, Set<string>>, s: string) {
  const d = new Map([[s, 0]]); const q = [s];
  while (q.length > 0) { const c = q.shift()!; for (const nb of adj.get(c) || []) { if (!d.has(nb)) { d.set(nb, d.get(c)! + 1); q.push(nb); } } }
  return d;
}

// ============================================================
// CURVED PATH — inspired by the reference image's flowing connector lines
// ============================================================

function connectorPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const isVertical = Math.abs(dy) > Math.abs(dx);

  if (isVertical) {
    // Vertical-dominant: S-curve with horizontal offset
    const bend = dx * 0.15;
    return `M${x1},${y1} C${x1 + bend},${y1 + dy * 0.4} ${x2 - bend},${y1 + dy * 0.6} ${x2},${y2}`;
  } else {
    // Horizontal-dominant: smooth arc
    const bend = dy * 0.2;
    return `M${x1},${y1} C${x1 + dx * 0.4},${y1 + bend} ${x1 + dx * 0.6},${y2 - bend} ${x2},${y2}`;
  }
}

// ============================================================
// COMPONENT
// ============================================================

interface PanelData { node: MNode; career: CareerMatch }

export default function CityCareerMap({ careers }: { careers: CareerMatch[] }) {
  const store = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, adj } = useMemo(() => buildMap(careers), [careers]);

  // Checkpoint from store, fallback to c0-s1
  const checkpoint = store.careerCheckpoint && nodes.has(store.careerCheckpoint) ? store.careerCheckpoint : "c0-s1";

  // Car position = checkpoint (where user actually is)
  const [carNodeId, setCarNodeId] = useState(checkpoint);
  const [isMoving, setIsMoving] = useState(false);
  const [carPos, setCarPos] = useState(() => {
    const nd = nodes.get(checkpoint); return nd ? { x: nd.x, y: nd.y } : { x: 0, y: 0 };
  });

  // Selected path (from checkpoint, not from car)
  const [selectedPath, setSelectedPath] = useState<string[] | null>(null);
  const [panelData, setPanelData] = useState<PanelData | null>(null);

  // Pan + zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ sx: 0, sy: 0, px: 0, py: 0 });

  const distances = useMemo(() => bfsDist(adj, carNodeId), [adj, carNodeId]);

  // Edges and nodes on the selected path
  const pathEdgeSet = useMemo(() => {
    const s = new Set<string>();
    if (!selectedPath) return s;
    for (let i = 0; i < selectedPath.length - 1; i++) s.add([selectedPath[i], selectedPath[i + 1]].sort().join("|"));
    return s;
  }, [selectedPath]);
  const pathNodeSet = useMemo(() => new Set(selectedPath || []), [selectedPath]);

  // Navigate car to a node — FORWARD ONLY (level must be >= current)
  const navigateTo = useCallback(async (targetId: string) => {
    if (isMoving || targetId === carNodeId) return;
    const targetNode = nodes.get(targetId);
    const curNode = nodes.get(carNodeId);
    if (!targetNode || !curNode) return;
    // Block going backward (lower level = demotion)
    if (targetNode.level < curNode.level) return;

    const path = bfs(adj, carNodeId, targetId);
    if (!path || path.length < 2) return;

    // Show path from checkpoint to target
    const fullPath = bfs(adj, checkpoint, targetId);
    setSelectedPath(fullPath);
    setIsMoving(true);
    setPanelData(null);

    for (let i = 1; i < path.length; i++) {
      const nd = nodes.get(path[i])!;
      const from = { ...carPos };
      const to = { x: nd.x, y: nd.y };
      const dur = 350;
      const t0 = performance.now();
      await new Promise<void>((res) => {
        function step(now: number) {
          const t = Math.min(1, (now - t0) / dur);
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          setCarPos({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e });
          if (t < 1) requestAnimationFrame(step); else res();
        }
        requestAnimationFrame(step);
      });
      setCarPos(to);
      setCarNodeId(path[i]);
      if (i < path.length - 1) await new Promise((r) => setTimeout(r, 50));
    }

    setIsMoving(false);
    const final = nodes.get(path[path.length - 1])!;
    if (final.careerIdx >= 0) setPanelData({ node: final, career: careers[final.careerIdx] });
  }, [isMoving, carNodeId, adj, nodes, careers, carPos, checkpoint]);

  // Advance checkpoint to where the car is
  const advanceCheckpoint = useCallback(() => {
    store.setCareerCheckpoint(carNodeId);
    setSelectedPath(null);
  }, [carNodeId, store]);

  // Keyboard — forward only (up, left, right — no down/demotion)
  const findNeighbor = useCallback((dir: "up" | "left" | "right") => {
    const cur = nodes.get(carNodeId);
    if (!cur) return null;
    let best: string | null = null;
    let bestS = -Infinity;
    for (const nid of adj.get(carNodeId) || []) {
      const nd = nodes.get(nid)!;
      // Never allow going to a lower level
      if (nd.level < cur.level) continue;
      const dx = nd.x - cur.x, dy = nd.y - cur.y;
      const valid = dir === "up" ? dy < -10 : dir === "left" ? dx < -10 : dx > 10;
      if (!valid) continue;
      const s = dir === "up" ? -dy - Math.abs(dx) * 0.3 : dir === "left" ? -dx - Math.abs(dy) * 0.3 : dx - Math.abs(dy) * 0.3;
      if (s > bestS) { bestS = s; best = nid; }
    }
    return best;
  }, [carNodeId, nodes, adj]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (isMoving) return;
      let d: "up" | "left" | "right" | null = null;
      if (e.key === "ArrowUp" || e.key === "w") d = "up";
      else if (e.key === "ArrowLeft" || e.key === "a") d = "left";
      else if (e.key === "ArrowRight" || e.key === "d") d = "right";
      // ArrowDown blocked — no demotion
      if (d) { e.preventDefault(); const t = findNeighbor(d); if (t) navigateTo(t); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isMoving, findNeighbor, navigateTo]);

  // Drag to pan
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, [data-clickable]")) return;
    setDragging(true);
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPan({ x: dragRef.current.px + (e.clientX - dragRef.current.sx), y: dragRef.current.py + (e.clientY - dragRef.current.sy) });
  };
  const onPointerUp = () => setDragging(false);

  // Scroll to zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.max(0.4, Math.min(2.5, z + (e.deltaY > 0 ? -0.08 : 0.08))));
    };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  // Visibility
  function nodeVis(id: string): "checkpoint" | "current" | "path" | "child" | "dim" {
    if (id === checkpoint) return "checkpoint";
    if (id === carNodeId && carNodeId !== checkpoint) return "current";
    if (pathNodeSet.has(id)) return "path";
    const d = distances.get(id);
    if (d === 1) return "child";
    return "dim";
  }

  function edgeVis(a: string, b: string): "active" | "child" | "dim" {
    const k = [a, b].sort().join("|");
    if (pathEdgeSet.has(k)) return "active";
    const dA = distances.get(a) ?? 99, dB = distances.get(b) ?? 99;
    if (Math.min(dA, dB) === 0 && Math.max(dA, dB) === 1) return "child";
    return "dim";
  }

  // SVG viewBox — large enough for the full map
  const allN = [...nodes.values()];
  const pad = 400;
  const minX = Math.min(...allN.map((n) => n.x)) - pad;
  const maxX = Math.max(...allN.map((n) => n.x)) + pad;
  const minY = Math.min(...allN.map((n) => n.y)) - pad;
  const maxY = Math.max(...allN.map((n) => n.y)) + pad;
  const vw = maxX - minX;
  const vh = maxY - minY;
  // Compute container-to-svg ratio for pan
  const cw = containerRef.current?.clientWidth || 900;
  const ch = containerRef.current?.clientHeight || 700;
  const panScale = Math.max(vw / cw, vh / ch) / zoom;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#0f1117] select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Map layer — zoom + car-centering + pan */}
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${vw / 2}, ${vh * 0.55}) scale(${zoom}) translate(${-carPos.x + pan.x * panScale}, ${-carPos.y + pan.y * panScale})`}>

          {/* ===== EDGES ===== */}
          {edges.map((edge) => {
            const fn = nodes.get(edge.from)!;
            const tn = nodes.get(edge.to)!;
            const vis = edgeVis(edge.from, edge.to);
            const d = connectorPath(fn.x, fn.y, tn.x, tn.y);
            const burnout = fn.burnout || tn.burnout;

            return (
              <g key={`${edge.from}-${edge.to}`} opacity={vis === "dim" ? 0.15 : 1}>
                {/* Road casing */}
                <path d={d} fill="none" stroke="#1e2028" strokeWidth={RW + 6} strokeLinecap="round" />
                {/* Road surface */}
                <path d={d} fill="none"
                  stroke={vis === "active" ? (burnout ? "#7f1d1d" : "#1e3a5f") : "#1a1d24"}
                  strokeWidth={RW} strokeLinecap="round" />
                {/* Active route overlay */}
                {vis === "active" && (
                  <path d={d} fill="none"
                    stroke={burnout ? "#ef4444" : "#3b82f6"}
                    strokeWidth={5} strokeLinecap="round" opacity={0.8} />
                )}
                {/* Center dashes */}
                <path d={d} fill="none"
                  stroke={vis === "active" ? "rgba(255,255,255,0.5)" : vis === "child" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}
                  strokeWidth={1.5} strokeDasharray="6 10" strokeLinecap="round" />
                {/* Edge lines */}
                {vis !== "dim" && (() => {
                  const dx = tn.x - fn.x, dy = tn.y - fn.y, len = Math.hypot(dx, dy);
                  if (len < 1) return null;
                  const nx = (-dy / len) * (RW / 2 - 1), ny = (dx / len) * (RW / 2 - 1);
                  return [-1, 1].map((s) => (
                    <line key={s} x1={fn.x + nx * s} y1={fn.y + ny * s} x2={tn.x + nx * s} y2={tn.y + ny * s}
                      stroke={burnout && vis === "active" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"} strokeWidth={1} />
                  ));
                })()}
              </g>
            );
          })}

          {/* ===== NODES ===== */}
          {[...nodes.values()].map((node) => {
            const vis = nodeVis(node.id);
            const isCkpt = vis === "checkpoint";
            const isCar = vis === "current";
            const isPath = vis === "path";
            const isChild = vis === "child";
            const isDim = vis === "dim";
            const isRoot = node.id === "root";

            return (
              <g key={node.id} data-clickable
                className={isDim || node.level < (nodes.get(carNodeId)?.level ?? 0) ? "" : "cursor-pointer"}
                onClick={() => {
                  if (isRoot || isMoving) return;
                  const curLevel = nodes.get(carNodeId)?.level ?? 0;
                  if (node.level < curLevel) return; // no demotion
                  navigateTo(node.id);
                }}
                opacity={isDim ? 0.12 : 1}
              >
                {/* Checkpoint glow */}
                {isCkpt && (
                  <circle cx={node.x} cy={node.y} r={NR + 12} fill="none" stroke="#3b82f6" strokeWidth={2} opacity={0.2}>
                    <animate attributeName="r" values={`${NR + 8};${NR + 16};${NR + 8}`} dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Child ring */}
                {isChild && (
                  <circle cx={node.x} cy={node.y} r={NR + 5} fill="none" stroke="#3b82f6" strokeWidth={1.5} opacity={0.2} />
                )}
                {/* Main circle */}
                <circle cx={node.x} cy={node.y} r={NR}
                  fill={isCkpt ? "#3b82f6" : isCar ? "#2563eb" : isPath ? "#1e3a5f" : isChild ? "#1a1d24" : "#14161c"}
                  stroke={isCkpt || isCar ? "#60a5fa" : isPath ? "#3b82f6" : isChild ? "#334155" : "#1e2028"}
                  strokeWidth={isCkpt ? 3 : 2} />
                {/* Inner */}
                {(isCkpt || isCar) && <circle cx={node.x} cy={node.y} r={6} fill="white" />}
                {!isCkpt && !isCar && !isDim && !isRoot && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fill={isChild ? "#94a3b8" : "#475569"} fontSize={9} fontWeight={700}>
                    {node.stageIdx + 1}
                  </text>
                )}
                {isRoot && <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={700}>●</text>}
                {/* Burnout badge */}
                {node.burnout && !isDim && (
                  <g transform={`translate(${node.x + NR * 0.7}, ${node.y - NR * 0.7})`}>
                    <circle r={6} fill="#ef4444" /><text x={0} y={3} textAnchor="middle" fill="white" fontSize={7} fontWeight={800}>!</text>
                  </g>
                )}
                {/* Label */}
                {!isDim && (
                  <g>
                    <rect x={node.x - 58} y={node.y + NR + 5} width={116} height={18} rx={9}
                      fill={isCkpt ? "rgba(59,130,246,0.15)" : "rgba(15,17,23,0.9)"}
                      stroke={isCkpt ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.05)"} strokeWidth={0.5} />
                    <text x={node.x} y={node.y + NR + 17} textAnchor="middle"
                      fill={isCkpt ? "#93c5fd" : isChild ? "#cbd5e1" : "#64748b"} fontSize={8} fontWeight={isCkpt || isChild ? 700 : 500}>
                      {node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label}
                    </text>
                  </g>
                )}
                {/* Checkpoint badge */}
                {isCkpt && !isRoot && (
                  <g transform={`translate(${node.x}, ${node.y - NR - 12})`}>
                    <rect x={-20} y={-7} width={40} height={14} rx={7} fill="#3b82f6" />
                    <text x={0} y={3} textAnchor="middle" fill="white" fontSize={7} fontWeight={800}>YOU</text>
                  </g>
                )}
                {/* Career label */}
                {node.stageIdx === 0 && !isRoot && !isDim && (
                  <text x={node.x} y={node.y - NR - 22} textAnchor="middle"
                    fill={node.burnout ? "#f87171" : "#818cf8"} fontSize={7} fontWeight={800} letterSpacing="0.1em" opacity={0.6}>
                    {careers[node.careerIdx]?.title.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {/* ===== CAR (larger, detailed) ===== */}
          <g transform={`translate(${carPos.x}, ${carPos.y})`}>
            {/* Shadow */}
            <ellipse rx={20} ry={11} fill="rgba(0,0,0,0.25)" transform="translate(2,5)" />
            {/* Wheels */}
            {[[-16,-24],[16,-24],[-16,22],[16,22]].map(([wx,wy],i) => (
              <rect key={i} x={wx-4} y={wy-6} width={8} height={12} rx={2.5} fill="#0f172a" />
            ))}
            {/* Body */}
            <rect x={-17} y={-28} width={34} height={56} rx={10} fill="#e2e8f0" stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />
            {/* Roof highlight */}
            <rect x={-10} y={-10} width={20} height={18} rx={5} fill="rgba(255,255,255,0.06)" />
            {/* Windshield */}
            <path d="M-11,-22 L11,-22 L9,-9 L-9,-9Z" fill="rgba(59,130,246,0.35)" />
            {/* Rear window */}
            <path d="M-9,9 L9,9 L11,22 L-11,22Z" fill="rgba(30,41,59,0.3)" />
            {/* Side mirrors */}
            <ellipse cx={-19} cy={-14} rx={3} ry={4.5} fill="#cbd5e1" />
            <ellipse cx={19} cy={-14} rx={3} ry={4.5} fill="#cbd5e1" />
            {/* Headlights */}
            <rect x={-10} y={-28.5} width={7} height={3.5} rx={1.5} fill="#fde68a" opacity={0.95} />
            <rect x={3} y={-28.5} width={7} height={3.5} rx={1.5} fill="#fde68a" opacity={0.95} />
            {/* Taillights */}
            <rect x={-10} y={25.5} width={7} height={2.5} rx={1} fill="#ef4444" opacity={0.8} />
            <rect x={3} y={25.5} width={7} height={2.5} rx={1} fill="#ef4444" opacity={0.8} />
            {/* Panel lines */}
            <line x1={-13} y1={-22} x2={13} y2={-22} stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />
            <line x1={-13} y1={22} x2={13} y2={22} stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />
          </g>
        </g>
      </svg>

      {/* ===== D-PAD (no down — forward only) ===== */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="relative w-[120px] h-[100px]">
          {([
            ["up", "top-0 left-1/2 -translate-x-1/2", ChevronUp],
            ["left", "bottom-0 left-0", ChevronLeft],
            ["right", "bottom-0 right-0", ChevronRight],
          ] as const).map(([d, cls, Icon]) => (
            <button key={d} onClick={() => { const t = findNeighbor(d); if (t) navigateTo(t); }} disabled={isMoving}
              className={`absolute ${cls} w-11 h-11 bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 active:bg-blue-500/20 transition-all disabled:opacity-20 shadow-lg`}>
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      {/* ===== ZOOM CONTROLS ===== */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl p-1 shadow-lg">
          <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-[#2a2d35] mx-2" />
          <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status + Advance */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isMoving ? "bg-green-500 animate-pulse" : "bg-blue-500"}`} />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isMoving ? "Moving" : "Ready"}
          </span>
        </div>
        {carNodeId !== checkpoint && !isMoving && (
          <button onClick={advanceCheckpoint} data-clickable
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-lg transition-all active:scale-95">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">I&apos;m here now</span>
          </button>
        )}
      </div>

      {/* Hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-[#1a1d24]/80 backdrop-blur border border-[#2a2d35] rounded-full px-4 py-1.5 shadow-lg">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="text-blue-400">Click</span> node · <span className="text-blue-400">↑←→</span> navigate · <span className="text-blue-400">Drag</span> pan · <span className="text-blue-400">Scroll</span> zoom
        </span>
      </div>

      {/* ===== PANEL ===== */}
      <AnimatePresence>
        {panelData && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-0 right-0 bottom-0 w-full md:w-[360px] z-20 bg-[#12141a]/95 backdrop-blur-xl border-l border-[#2a2d35] shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-[#12141a]/80 backdrop-blur border-b border-[#2a2d35] px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">
                  {panelData.node.burnout ? "⚠ High Stress" : "Career Stage"}
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">{panelData.node.label}</h3>
                <p className="text-xs text-slate-500">{panelData.career.title}</p>
              </div>
              <button onClick={() => { setPanelData(null); setSelectedPath(null); }} data-clickable
                className="w-8 h-8 rounded-lg hover:bg-[#1e2028] flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: "Difficulty", v: panelData.career.difficulty, c: panelData.career.difficulty === "Hard" ? "text-red-400" : "text-blue-400" },
                  { l: "Growth", v: panelData.career.growth, c: "text-violet-400" },
                  { l: "Stress", v: panelData.career.stress_level, c: panelData.career.stress_level === "High" ? "text-red-400" : "text-blue-400" },
                ].map((m) => (
                  <div key={m.l} className="bg-[#1a1d24] rounded-lg p-2.5 text-center border border-[#2a2d35]">
                    <div className="text-[8px] text-slate-600 uppercase tracking-widest">{m.l}</div>
                    <div className={`font-bold text-sm ${m.c}`}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="text-[9px] text-blue-400 uppercase tracking-widest font-black mb-1.5">Timeline</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div><div className="text-[8px] text-slate-600">First</div><div className="font-bold text-slate-300">{panelData.career.estimated_timeline.to_first_role}</div></div>
                  <div><div className="text-[8px] text-slate-600">Mid</div><div className="font-bold text-slate-300">{panelData.career.estimated_timeline.to_mid_level}</div></div>
                  <div><div className="text-[8px] text-slate-600">Senior</div><div className="font-bold text-slate-300">{panelData.career.estimated_timeline.to_senior}</div></div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{panelData.career.fit_reason}</p>
              <div>
                <div className="text-[9px] text-slate-600 uppercase tracking-widest font-black mb-2">Progression</div>
                {panelData.career.progression.map((role, i) => {
                  const isHere = i === panelData.node.stageIdx;
                  return (
                    <div key={i} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg mb-1 ${isHere ? "bg-blue-500/10 border border-blue-500/20" : ""}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isHere ? "bg-blue-600 text-white" : i < panelData.node.stageIdx ? "bg-blue-900 text-blue-400" : "bg-[#1a1d24] text-slate-600 border border-[#2a2d35]"
                      }`}>{i + 1}</div>
                      <span className={`text-xs ${isHere ? "text-blue-300 font-bold" : "text-slate-500"}`}>{role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
