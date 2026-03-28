"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, ZoomIn, ZoomOut } from "lucide-react";
import type { CareerMatch } from "@/types";
import { useStore } from "@/lib/store";

// ============================================================
// TYPES
// ============================================================

interface MNode {
  id: string; label: string; x: number; y: number;
  careerIdx: number; stageIdx: number; level: number; lane: number;
  burnout: boolean; weight: number;
}

interface MEdge { from: string; to: string }
interface BezierPts { p0: [number, number]; p1: [number, number]; p2: [number, number]; p3: [number, number] }

// ============================================================
// LAYOUT
// ============================================================

const LW = 480;
const LH = 400;
const RW = 35;  // 20% reduced from 44
const NR = 28;

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

  add({ id: "root", label: "Start", x: 0, y: 0, careerIdx: -1, stageIdx: -1, level: 0, lane: Math.floor(n / 2), burnout: false, weight: 0 });

  careers.forEach((c, ci) => {
    c.progression.forEach((role, si) => {
      add({
        id: `c${ci}-s${si}`, label: role,
        x: ci * LW - ox, y: -(si + 1) * LH,
        careerIdx: ci, stageIdx: si, level: si + 1, lane: ci,
        burnout: c.stress_level === "High",
        weight: (si + 1) * 10,
      });
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
// BEZIER ROAD HELPERS
// ============================================================

function getRoadBezier(x1: number, y1: number, x2: number, y2: number, seed: number): BezierPts {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  // 30% less curve: was (0.2 + 0.05), now (0.14 + 0.035)
  const wobble = (Math.sin(seed * 7.3) * 0.5 + 0.5) * 0.14 + 0.035;
  const isVert = Math.abs(dy) > Math.abs(dx);

  if (isVert) {
    const bendX = len * wobble * (seed % 2 === 0 ? 1 : -1);
    return { p0: [x1, y1], p1: [x1 + bendX, y1 + dy * 0.35], p2: [x2 - bendX, y1 + dy * 0.65], p3: [x2, y2] };
  } else {
    const bendY = len * wobble * (seed % 2 === 0 ? 1 : -1);
    return { p0: [x1, y1], p1: [x1 + dx * 0.35, y1 + bendY], p2: [x1 + dx * 0.65, y2 - bendY], p3: [x2, y2] };
  }
}

function bezierPath(bp: BezierPts): string {
  return `M${bp.p0[0]},${bp.p0[1]} C${bp.p1[0]},${bp.p1[1]} ${bp.p2[0]},${bp.p2[1]} ${bp.p3[0]},${bp.p3[1]}`;
}

function evalBezier(t: number, bp: BezierPts): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * mt * bp.p0[0] + 3 * mt * mt * t * bp.p1[0] + 3 * mt * t * t * bp.p2[0] + t * t * t * bp.p3[0],
    mt * mt * mt * bp.p0[1] + 3 * mt * mt * t * bp.p1[1] + 3 * mt * t * t * bp.p2[1] + t * t * t * bp.p3[1],
  ];
}

function evalBezierTangent(t: number, bp: BezierPts): [number, number] {
  const mt = 1 - t;
  return [
    3 * mt * mt * (bp.p1[0] - bp.p0[0]) + 6 * mt * t * (bp.p2[0] - bp.p1[0]) + 3 * t * t * (bp.p3[0] - bp.p2[0]),
    3 * mt * mt * (bp.p1[1] - bp.p0[1]) + 6 * mt * t * (bp.p2[1] - bp.p1[1]) + 3 * t * t * (bp.p3[1] - bp.p2[1]),
  ];
}

// ============================================================
// PATHFINDING
// ============================================================

function findBestPath(adj: Map<string, Set<string>>, _nodes: Map<string, MNode>, from: string, to: string): string[] | null {
  if (from === to) return [from];
  const vis = new Set([from]); const q: string[][] = [[from]];
  while (q.length > 0) {
    const p = q.shift()!; const c = p[p.length - 1];
    for (const nb of adj.get(c) || []) {
      if (nb === to) return [...p, nb];
      if (!vis.has(nb)) { vis.add(nb); q.push([...p, nb]); }
    }
  }
  return null;
}

function bfsDist(adj: Map<string, Set<string>>, s: string) {
  const d = new Map([[s, 0]]); const q = [s];
  while (q.length > 0) { const c = q.shift()!; for (const nb of adj.get(c) || []) { if (!d.has(nb)) { d.set(nb, d.get(c)! + 1); q.push(nb); } } }
  return d;
}

// ============================================================
// COMPONENT
// ============================================================

interface PanelData { node: MNode; career: CareerMatch }

export default function CityCareerMap({ careers }: { careers: CareerMatch[] }) {
  const store = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, adj } = useMemo(() => buildMap(careers), [careers]);

  const checkpoint = store.careerCheckpoint && nodes.has(store.careerCheckpoint) ? store.careerCheckpoint : "c0-s1";

  const [carNodeId, setCarNodeId] = useState(checkpoint);
  const [isMoving, setIsMoving] = useState(false);
  const [carPos, setCarPos] = useState(() => {
    const nd = nodes.get(checkpoint); return nd ? { x: nd.x, y: nd.y } : { x: 0, y: 0 };
  });
  const [carAngle, setCarAngle] = useState(-90);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const [selectedPath, setSelectedPath] = useState<string[] | null>(null);
  const [panelData, setPanelData] = useState<PanelData | null>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ sx: 0, sy: 0, px: 0, py: 0 });

  const distances = useMemo(() => bfsDist(adj, carNodeId), [adj, carNodeId]);

  // Pre-compute bezier points for all edges (both directions)
  const edgeBeziers = useMemo(() => {
    const map = new Map<string, BezierPts>();
    edges.forEach((edge, ei) => {
      const fn = nodes.get(edge.from)!, tn = nodes.get(edge.to)!;
      const bp = getRoadBezier(fn.x, fn.y, tn.x, tn.y, ei);
      map.set(`${edge.from}|${edge.to}`, bp);
      map.set(`${edge.to}|${edge.from}`, { p0: bp.p3, p1: bp.p2, p2: bp.p1, p3: bp.p0 });
    });
    return map;
  }, [edges, nodes]);

  const pathEdgeSet = useMemo(() => {
    const s = new Set<string>();
    if (!selectedPath) return s;
    for (let i = 0; i < selectedPath.length - 1; i++) s.add([selectedPath[i], selectedPath[i + 1]].sort().join("|"));
    return s;
  }, [selectedPath]);
  const pathNodeSet = useMemo(() => new Set(selectedPath || []), [selectedPath]);

  // Navigate — highlight from checkpoint, car follows bezier road path
  const navigateTo = useCallback(async (targetId: string) => {
    if (isMoving) return;

    // If clicking the node we're already on, toggle panel
    if (targetId === carNodeId) {
      const nd = nodes.get(targetId)!;
      if (nd.careerIdx >= 0) {
        if (panelData?.node.id === targetId) {
          setPanelData(null);
          setSelectedPath(null);
        } else {
          setPanelData({ node: nd, career: careers[nd.careerIdx] });
          const ckptNode = nodes.get(checkpoint);
          if (ckptNode) {
            const [pf, pt] = nd.weight >= ckptNode.weight ? [checkpoint, targetId] : [targetId, checkpoint];
            setSelectedPath(findBestPath(adj, nodes, pf, pt));
          }
        }
      }
      return;
    }

    const targetNode = nodes.get(targetId);
    const ckptNode = nodes.get(checkpoint);
    if (!targetNode || !ckptNode) return;

    // Highlight path: always between checkpoint and target
    let pathFrom: string, pathTo: string;
    if (targetNode.weight >= ckptNode.weight) {
      pathFrom = checkpoint;
      pathTo = targetId;
    } else {
      pathFrom = targetId;
      pathTo = checkpoint;
    }
    const highlightPath = findBestPath(adj, nodes, pathFrom, pathTo);
    setSelectedPath(highlightPath);

    // Car travels from current position to target
    const travelPath = findBestPath(adj, nodes, carNodeId, targetId);
    if (!travelPath || travelPath.length < 2) return;

    setIsMoving(true);
    setPanelData(null);

    for (let i = 1; i < travelPath.length; i++) {
      const fromId = travelPath[i - 1];
      const toId = travelPath[i];
      const bp = edgeBeziers.get(`${fromId}|${toId}`);

      if (bp) {
        // Animate along bezier curve
        const curve = bp; // alias for closure narrowing
        const moveDur = 450;
        const mt0 = performance.now();
        await new Promise<void>((res) => {
          function step(now: number) {
            const t = Math.min(1, (now - mt0) / moveDur);
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const [px, py] = evalBezier(e, curve);
            const [tx, ty] = evalBezierTangent(e, curve);
            setCarPos({ x: px, y: py });
            setCarAngle(Math.atan2(ty, tx) * (180 / Math.PI));
            if (t < 1) requestAnimationFrame(step); else res();
          }
          requestAnimationFrame(step);
        });
      } else {
        // Fallback: straight line between nodes
        const fromNd = nodes.get(fromId)!, toNd = nodes.get(toId)!;
        const moveDur = 400;
        const mt0 = performance.now();
        await new Promise<void>((res) => {
          function step(now: number) {
            const t = Math.min(1, (now - mt0) / moveDur);
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            setCarPos({ x: fromNd.x + (toNd.x - fromNd.x) * e, y: fromNd.y + (toNd.y - fromNd.y) * e });
            setCarAngle(Math.atan2(toNd.y - fromNd.y, toNd.x - fromNd.x) * (180 / Math.PI));
            if (t < 1) requestAnimationFrame(step); else res();
          }
          requestAnimationFrame(step);
        });
      }

      const nd = nodes.get(toId)!;
      setCarPos({ x: nd.x, y: nd.y });
      setCarNodeId(toId);
      if (i < travelPath.length - 1) await new Promise((r) => setTimeout(r, 30));
    }

    setIsMoving(false);
    const final = nodes.get(travelPath[travelPath.length - 1])!;
    if (final.careerIdx >= 0) setPanelData({ node: final, career: careers[final.careerIdx] });
  }, [isMoving, carNodeId, checkpoint, adj, nodes, careers, edgeBeziers, panelData]);

  const advanceCheckpoint = useCallback(() => {
    store.setCareerCheckpoint(carNodeId);
    setSelectedPath(null);
  }, [carNodeId, store]);

  // Keyboard — all four directions
  const findNeighbor = useCallback((dir: "up" | "down" | "left" | "right") => {
    const cur = nodes.get(carNodeId);
    if (!cur) return null;
    let best: string | null = null, bestS = -Infinity;
    for (const nid of adj.get(carNodeId) || []) {
      const nd = nodes.get(nid)!;
      const dx = nd.x - cur.x, dy = nd.y - cur.y;
      let valid = false, s = 0;
      if (dir === "up") { valid = dy < -10; s = -dy - Math.abs(dx) * 0.3; }
      else if (dir === "down") { valid = dy > 10; s = dy - Math.abs(dx) * 0.3; }
      else if (dir === "left") { valid = dx < -10; s = -dx - Math.abs(dy) * 0.3; }
      else { valid = dx > 10; s = dx - Math.abs(dy) * 0.3; }
      if (valid && s > bestS) { bestS = s; best = nid; }
    }
    return best;
  }, [carNodeId, nodes, adj]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (isMoving) return;
      let d: "up" | "down" | "left" | "right" | null = null;
      if (e.key === "ArrowUp" || e.key === "w") d = "up";
      else if (e.key === "ArrowDown" || e.key === "s") d = "down";
      else if (e.key === "ArrowLeft" || e.key === "a") d = "left";
      else if (e.key === "ArrowRight" || e.key === "d") d = "right";
      if (d) { e.preventDefault(); const t = findNeighbor(d); if (t) navigateTo(t); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isMoving, findNeighbor, navigateTo]);

  // Drag + Zoom
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => { e.preventDefault(); setZoom((z) => Math.max(0.3, Math.min(2.5, z + (e.deltaY > 0 ? -0.08 : 0.08)))); };
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

  // ViewBox
  const allN = [...nodes.values()];
  const pad = 400;
  const minX = Math.min(...allN.map((n) => n.x)) - pad;
  const maxX = Math.max(...allN.map((n) => n.x)) + pad;
  const minY = Math.min(...allN.map((n) => n.y)) - pad;
  const maxY = Math.max(...allN.map((n) => n.y)) + pad;
  const vw = maxX - minX, vh = maxY - minY;
  const cw = containerRef.current?.clientWidth || 900;
  const ch = containerRef.current?.clientHeight || 700;
  const panScale = Math.max(vw / cw, vh / ch) / zoom;

  return (
    <div ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#0f1117] select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>

      <svg className="w-full h-full" viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${vw / 2}, ${vh * 0.55}) scale(${zoom}) translate(${-carPos.x + pan.x * panScale}, ${-carPos.y + pan.y * panScale})`}>

          {/* EDGES — clean thin roads */}
          {edges.map((edge) => {
            const fn = nodes.get(edge.from)!, tn = nodes.get(edge.to)!;
            const vis = edgeVis(edge.from, edge.to);
            const bp = edgeBeziers.get(`${edge.from}|${edge.to}`);
            if (!bp) return null;
            const d = bezierPath(bp);
            const burnout = fn.burnout || tn.burnout;
            return (
              <g key={`${edge.from}-${edge.to}`} opacity={vis === "dim" ? 0.15 : 1}>
                {/* Road border */}
                <path d={d} fill="none" stroke="#1a1d24" strokeWidth={RW + 4} strokeLinecap="round" />
                {/* Road surface */}
                <path d={d} fill="none"
                  stroke={vis === "active" ? (burnout ? "#1c1517" : "#131a2a") : "#16181e"}
                  strokeWidth={RW} strokeLinecap="round" />
                {/* Active glow center line */}
                {vis === "active" && (
                  <path d={d} fill="none"
                    stroke={burnout ? "#ef4444" : "#3b82f6"}
                    strokeWidth={4} strokeLinecap="round" opacity={0.6} />
                )}
                {/* Center dashed line */}
                <path d={d} fill="none"
                  stroke={vis === "active" ? "rgba(255,255,255,0.35)" : vis === "child" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}
                  strokeWidth={1} strokeDasharray="5 8" strokeLinecap="round" />
              </g>
            );
          })}

          {/* NODES */}
          {[...nodes.values()].map((node) => {
            const vis = nodeVis(node.id);
            const isCkpt = vis === "checkpoint";
            const isCar = vis === "current";
            const isPath = vis === "path";
            const isChild = vis === "child";
            const isDim = vis === "dim";
            const isRoot = node.id === "root";
            const isHovered = hoveredNode === node.id && !isRoot && !isDim;
            const isSelected = panelData?.node.id === node.id;
            return (
              <g key={node.id} data-clickable
                className={isDim && !isRoot ? "" : "cursor-pointer"}
                onClick={() => { if (isRoot || (isMoving && node.id !== carNodeId)) return; navigateTo(node.id); }}
                onMouseEnter={() => !isRoot && setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                opacity={isDim ? 0.12 : 1}>

                {/* Hover outline ring */}
                {isHovered && !isCkpt && !isSelected && (
                  <circle cx={node.x} cy={node.y} r={NR + 6}
                    fill="none" stroke="#3b82f6" strokeWidth={2} opacity={0.5} />
                )}

                {/* Selected glow */}
                {isSelected && (
                  <>
                    <circle cx={node.x} cy={node.y} r={NR + 10} fill="rgba(59,130,246,0.08)" />
                    <circle cx={node.x} cy={node.y} r={NR + 6}
                      fill="none" stroke="#60a5fa" strokeWidth={2.5} opacity={0.7} />
                  </>
                )}

                {/* Checkpoint pulse */}
                {isCkpt && (
                  <circle cx={node.x} cy={node.y} r={NR + 12} fill="none" stroke="#3b82f6" strokeWidth={2} opacity={0.2}>
                    <animate attributeName="r" values={`${NR + 8};${NR + 16};${NR + 8}`} dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Child indicator */}
                {isChild && <circle cx={node.x} cy={node.y} r={NR + 5} fill="none" stroke="#3b82f6" strokeWidth={1.5} opacity={0.2} />}

                {/* Main node circle */}
                <circle cx={node.x} cy={node.y} r={NR}
                  fill={
                    isSelected ? "#2563eb"
                    : isCkpt ? "#3b82f6"
                    : isCar ? "#2563eb"
                    : isPath ? "#1e3a5f"
                    : isHovered ? "#1e293b"
                    : isChild ? "#1a1d24"
                    : "#14161c"
                  }
                  stroke={
                    isSelected ? "#93c5fd"
                    : isCkpt || isCar ? "#60a5fa"
                    : isPath ? "#3b82f6"
                    : isHovered ? "#3b82f6"
                    : isChild ? "#334155"
                    : "#1e2028"
                  }
                  strokeWidth={isSelected ? 3 : isCkpt ? 3 : isHovered ? 2.5 : 2} />

                {/* Center dot for checkpoint / current */}
                {(isCkpt || isCar) && <circle cx={node.x} cy={node.y} r={6} fill="white" />}

                {/* Stage number */}
                {!isCkpt && !isCar && !isDim && !isRoot && !isSelected && (
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fill={isChild ? "#94a3b8" : "#475569"} fontSize={9} fontWeight={700}>{node.stageIdx + 1}</text>
                )}

                {/* Selected checkmark */}
                {isSelected && !isCkpt && !isCar && (
                  <circle cx={node.x} cy={node.y} r={6} fill="white" />
                )}

                {/* Root dot */}
                {isRoot && <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={700}>●</text>}

                {/* Burnout indicator */}
                {node.burnout && !isDim && (
                  <g transform={`translate(${node.x + NR * 0.7}, ${node.y - NR * 0.7})`}>
                    <circle r={6} fill="#ef4444" /><text x={0} y={3} textAnchor="middle" fill="white" fontSize={7} fontWeight={800}>!</text>
                  </g>
                )}

                {/* Label */}
                {!isDim && (
                  <g>
                    <rect x={node.x - 58} y={node.y + NR + 5} width={116} height={18} rx={9}
                      fill={isSelected ? "rgba(37,99,235,0.2)" : isCkpt ? "rgba(59,130,246,0.15)" : "rgba(15,17,23,0.9)"}
                      stroke={isSelected ? "rgba(96,165,250,0.3)" : isCkpt ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.05)"} strokeWidth={0.5} />
                    <text x={node.x} y={node.y + NR + 17} textAnchor="middle"
                      fill={isSelected ? "#93c5fd" : isCkpt ? "#93c5fd" : isChild ? "#cbd5e1" : "#64748b"}
                      fontSize={8} fontWeight={isSelected || isCkpt || isChild ? 700 : 500}>
                      {node.label.length > 20 ? node.label.slice(0, 18) + "\u2026" : node.label}
                    </text>
                  </g>
                )}

                {/* YOU badge */}
                {isCkpt && !isRoot && (
                  <g transform={`translate(${node.x}, ${node.y - NR - 12})`}>
                    <rect x={-20} y={-7} width={40} height={14} rx={7} fill="#3b82f6" />
                    <text x={0} y={3} textAnchor="middle" fill="white" fontSize={7} fontWeight={800}>YOU</text>
                  </g>
                )}

                {/* Career title above first stage */}
                {node.stageIdx === 0 && !isRoot && !isDim && (
                  <text x={node.x} y={node.y - NR - 22} textAnchor="middle"
                    fill={node.burnout ? "#f87171" : "#818cf8"} fontSize={7} fontWeight={800} letterSpacing="0.1em" opacity={0.6}>
                    {careers[node.careerIdx]?.title.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {/* CAR — yellow sports car, top-down view */}
          <g transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carAngle + 90})`}>
            {/* Shadow */}
            <ellipse rx={15} ry={24} fill="rgba(0,0,0,0.3)" transform="translate(2,3)" />
            {/* Body */}
            <rect x={-13} y={-24} width={26} height={48} rx={10} fill="#F5C542" stroke="#D4A830" strokeWidth={0.8} />
            {/* Hood sculpt lines */}
            <path d="M-10,-22 Q0,-25 10,-22" fill="none" stroke="#D4A830" strokeWidth={0.6} />
            <path d="M-8,-18 L8,-18" stroke="#D4A830" strokeWidth={0.3} opacity={0.5} />
            {/* Windshield */}
            <path d="M-9,-15 L9,-15 L7,-5 L-7,-5 Z" fill="#1a1a2e" opacity={0.9} />
            {/* Roof / cabin */}
            <rect x={-7} y={-5} width={14} height={10} rx={2} fill="#E8B83A" />
            {/* Rear window */}
            <path d="M-7,5 L7,5 L9,14 L-9,14 Z" fill="#1a1a2e" opacity={0.9} />
            {/* Trunk line */}
            <path d="M-8,17 L8,17" stroke="#D4A830" strokeWidth={0.5} opacity={0.5} />
            {/* Headlights */}
            <ellipse cx={-8} cy={-23} rx={3} ry={1.5} fill="#e8e8e8" opacity={0.9} />
            <ellipse cx={8} cy={-23} rx={3} ry={1.5} fill="#e8e8e8" opacity={0.9} />
            {/* Taillights */}
            <rect x={-10} y={22} width={5} height={2.5} rx={1.2} fill="#ef4444" opacity={0.9} />
            <rect x={5} y={22} width={5} height={2.5} rx={1.2} fill="#ef4444" opacity={0.9} />
            {/* Side mirrors */}
            <ellipse cx={-15} cy={-3} rx={2.5} ry={1.5} fill="#F5C542" stroke="#D4A830" strokeWidth={0.3} />
            <ellipse cx={15} cy={-3} rx={2.5} ry={1.5} fill="#F5C542" stroke="#D4A830" strokeWidth={0.3} />
            {/* Door handles */}
            <rect x={-12.5} y={1} width={3} height={0.8} rx={0.4} fill="#D4A830" opacity={0.6} />
            <rect x={9.5} y={1} width={3} height={0.8} rx={0.4} fill="#D4A830" opacity={0.6} />
          </g>
        </g>
      </svg>

      {/* D-PAD — 4 directions */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="relative w-[120px] h-[120px]">
          <button onClick={() => { const t = findNeighbor("up"); if (t) navigateTo(t); }} disabled={isMoving}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 active:bg-blue-500/20 transition-all disabled:opacity-20 shadow-lg">
            <ChevronUp className="w-5 h-5" />
          </button>
          <button onClick={() => { const t = findNeighbor("left"); if (t) navigateTo(t); }} disabled={isMoving}
            className="absolute top-1/2 left-0 -translate-y-1/2 w-11 h-11 bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 active:bg-blue-500/20 transition-all disabled:opacity-20 shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => { const t = findNeighbor("right"); if (t) navigateTo(t); }} disabled={isMoving}
            className="absolute top-1/2 right-0 -translate-y-1/2 w-11 h-11 bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 active:bg-blue-500/20 transition-all disabled:opacity-20 shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => { const t = findNeighbor("down"); if (t) navigateTo(t); }} disabled={isMoving}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 active:bg-blue-500/20 transition-all disabled:opacity-20 shadow-lg">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ZOOM */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl p-1 shadow-lg">
          <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all"><ZoomIn className="w-4 h-4" /></button>
          <div className="h-px bg-[#2a2d35] mx-2" />
          <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all"><ZoomOut className="w-4 h-4" /></button>
        </div>
      </div>

      {/* STATUS */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-[#1a1d24]/90 backdrop-blur border border-[#2a2d35] rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isMoving ? "bg-green-500 animate-pulse" : "bg-blue-500"}`} />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isMoving ? "Moving" : "Ready"}</span>
        </div>
        {carNodeId !== checkpoint && !isMoving && (
          <button onClick={advanceCheckpoint} data-clickable className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-lg transition-all active:scale-95">
            <CheckCircle2 className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase tracking-widest">I&apos;m here now</span>
          </button>
        )}
      </div>

      {/* HINT */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-[#1a1d24]/80 backdrop-blur border border-[#2a2d35] rounded-full px-4 py-1.5 shadow-lg">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="text-blue-400">Click</span> any node · <span className="text-blue-400">↑↓←→</span> navigate · <span className="text-blue-400">Scroll</span> zoom
        </span>
      </div>

      {/* PANEL */}
      <AnimatePresence>
        {panelData && (
          <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-0 right-0 bottom-0 w-full md:w-[360px] z-20 bg-[#12141a]/95 backdrop-blur-xl border-l border-[#2a2d35] shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[#12141a]/80 backdrop-blur border-b border-[#2a2d35] px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">{panelData.node.burnout ? "\u26A0 High Stress" : "Career Stage"}</div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">{panelData.node.label}</h3>
                <p className="text-xs text-slate-500">{panelData.career.title}</p>
              </div>
              <button onClick={() => { setPanelData(null); setSelectedPath(null); }} data-clickable className="w-8 h-8 rounded-lg hover:bg-[#1e2028] flex items-center justify-center"><X className="w-4 h-4 text-slate-500" /></button>
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
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${isHere ? "bg-blue-600 text-white" : i < panelData.node.stageIdx ? "bg-blue-900 text-blue-400" : "bg-[#1a1d24] text-slate-600 border border-[#2a2d35]"}`}>{i + 1}</div>
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
