"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, ZoomIn, ZoomOut, Circle, Clock, Zap, MapPin, TrendingUp } from "lucide-react";
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

const LW = 520;
const LH = 440;
const RW = 38;
const NR = 38;

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

export default function CityCareerMap({ careers, externalCareerIdx, externalTs }: { careers: CareerMatch[]; externalCareerIdx?: number | null; externalTs?: number }) {
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

  // Reset car position when careers/map changes (e.g. chatbot updates career tracks)
  useEffect(() => {
    const validCheckpoint = store.careerCheckpoint && nodes.has(store.careerCheckpoint) ? store.careerCheckpoint : "c0-s1";
    const fallback = nodes.has(validCheckpoint) ? validCheckpoint : (nodes.keys().next().value || "root");
    const nd = nodes.get(fallback);
    if (nd) {
      setCarNodeId(fallback);
      setCarPos({ x: nd.x, y: nd.y });
    }
    setPanelData(null);
    setSelectedPath(null);
  }, [careers, nodes, store.careerCheckpoint]);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ sx: 0, sy: 0, px: 0, py: 0 });

  const distances = useMemo(() => bfsDist(adj, carNodeId), [adj, carNodeId]);

  // External career selection (from dashboard cards) — ts ensures re-trigger on same card
  useEffect(() => {
    if (externalCareerIdx != null && externalCareerIdx >= 0 && externalCareerIdx < careers.length) {
      const career = careers[externalCareerIdx];
      const nodeId = `c${externalCareerIdx}-s0`;
      const node = nodes.get(nodeId);
      if (node) setPanelData({ node, career });
    }
  }, [externalCareerIdx, externalTs, careers, nodes]);

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

  const advanceCheckpoint = useCallback(async () => {
    store.setCareerCheckpoint(carNodeId);
    setSelectedPath(null);

    const node = nodes.get(carNodeId);
    if (!node || node.careerIdx < 0 || !store.analysis || !store.profile) return;

    const career = careers[node.careerIdx];
    const stageMap: Record<number, string> = { 0: "intern", 1: "junior", 2: "mid", 3: "senior", 4: "lead" };
    const newStage = (stageMap[node.stageIdx] || "exploring") as import("@/types").CareerStage;
    const currentStageLabel = `${career.title} — ${node.label}`;

    // Update profile career stage
    const updatedProfile = { ...store.profile, careerStage: newStage };
    store.setProfile(updatedProfile);

    // Regenerate analysis with updated roadmap stage and reordered careers
    const reorderedCareers = [career, ...store.analysis.career_matches.filter((c) => c.title !== career.title)];

    // Build updated roadmap tasks based on current stage
    const stageIdx = node.stageIdx;
    const nextRoles = career.progression.slice(stageIdx + 1);
    const currentRole = node.label;

    // Regenerate resources for the new primary career
    const { generateResources: genRes } = await import("@/data/mock-response");

    const updatedAnalysis = {
      ...store.analysis,
      career_matches: reorderedCareers,
      roadmap: {
        ...store.analysis.roadmap,
        current_stage: currentStageLabel,
        next_30_days: [
          { title: `Excel as ${currentRole}`, description: `Focus on mastering your current role and building expertise in ${store.profile.skills.slice(0, 2).join(" and ") || "your core skills"}.`, duration: "Weeks 1-4", tasks: [`Deliver a key project as ${currentRole}`, "Get feedback from your manager/mentor", "Identify one skill gap to close this month"] },
        ],
        next_3_months: nextRoles.length > 0 ? [
          { title: `Prepare for ${nextRoles[0]}`, description: `Start building skills needed for the next level.`, duration: "Months 1-3", tasks: [`Study what ${nextRoles[0]} roles require`, "Take on stretch assignments", "Expand your professional network"] },
        ] : store.analysis.roadmap.next_3_months,
      },
      resources: genRes(reorderedCareers, store.profile),
    };

    store.setAnalysis(updatedAnalysis);

    // Recalculate burnout
    const { calculateBurnoutScore } = await import("@/lib/burnout");
    store.setBurnoutScore(calculateBurnoutScore(updatedProfile));

    // Persist to Supabase
    if (store.profileId) {
      try {
        await Promise.all([
          fetch("/api/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId: store.profileId, profile: { currentStatus: newStage } }),
          }),
          fetch("/api/update-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId: store.profileId, analysis: updatedAnalysis }),
          }),
        ]);
      } catch { /* silent */ }
    }
  }, [carNodeId, store, nodes, careers]);

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
      if (e.key === "ArrowUp") d = "up";
      else if (e.key === "ArrowDown") d = "down";
      else if (e.key === "ArrowLeft") d = "left";
      else if (e.key === "ArrowRight") d = "right";
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
    const h = (e: WheelEvent) => {
      // Don't zoom if scrolling inside the drawer panel
      if ((e.target as HTMLElement).closest("[data-panel]")) return;
      e.preventDefault();
      setZoom((z) => Math.max(0.3, Math.min(2.5, z + (e.deltaY > 0 ? -0.08 : 0.08))));
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
              <g key={`${edge.from}-${edge.to}`} opacity={vis === "dim" ? 0.2 : 1}>
                {/* Outer glow for active paths */}
                {vis === "active" && (
                  <path d={d} fill="none"
                    stroke={burnout ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)"}
                    strokeWidth={RW + 20} strokeLinecap="round" />
                )}
                {/* Road border */}
                <path d={d} fill="none" stroke={vis === "active" ? "#1e293b" : "#1e2028"} strokeWidth={RW + 6} strokeLinecap="round" />
                {/* Road surface */}
                <path d={d} fill="none"
                  stroke={vis === "active" ? (burnout ? "#2a1520" : "#172042") : vis === "child" ? "#1a1e2e" : "#191c24"}
                  strokeWidth={RW} strokeLinecap="round" />
                {/* Lane edge lines */}
                {vis !== "dim" && (() => {
                  const dx = tn.x - fn.x, dy = tn.y - fn.y, len = Math.hypot(dx, dy);
                  if (len < 1) return null;
                  const nx = (-dy / len) * (RW / 2 - 2), ny = (dx / len) * (RW / 2 - 2);
                  return [-1, 1].map((s) => (
                    <line key={s} x1={fn.x + nx * s} y1={fn.y + ny * s} x2={tn.x + nx * s} y2={tn.y + ny * s}
                      stroke={vis === "active" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"} strokeWidth={1} />
                  ));
                })()}
                {/* Center dashed line */}
                <path d={d} fill="none"
                  stroke={vis === "active" ? "rgba(255,255,255,0.4)" : vis === "child" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}
                  strokeWidth={1.5} strokeDasharray="8 12" strokeLinecap="round" />
                {/* Active glow center line */}
                {vis === "active" && (
                  <path d={d} fill="none"
                    stroke={burnout ? "#ef4444" : "#3b82f6"}
                    strokeWidth={6} strokeLinecap="round" opacity={0.5} />
                )}
                {/* Active path direction dots */}
                {vis === "active" && (
                  <path d={d} fill="none"
                    stroke={burnout ? "#fca5a5" : "#93c5fd"}
                    strokeWidth={3} strokeLinecap="round" strokeDasharray="2 20" opacity={0.6} />
                )}
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
                  <text x={node.x} y={node.y + 6} textAnchor="middle" fill="#f1f5f9" fontSize={16} fontWeight={700}>{node.stageIdx + 1}</text>
                )}

                {/* Selected checkmark */}
                {isSelected && !isCkpt && !isCar && (
                  <circle cx={node.x} cy={node.y} r={8} fill="white" />
                )}

                {/* Root dot */}
                {isRoot && <text x={node.x} y={node.y + 5} textAnchor="middle" fill="#94a3b8" fontSize={14} fontWeight={700}>●</text>}

                {/* Burnout indicator */}
                {node.burnout && !isDim && (
                  <g transform={`translate(${node.x + NR * 0.7}, ${node.y - NR * 0.7})`}>
                    <circle r={8} fill="#ef4444" /><text x={0} y={4} textAnchor="middle" fill="white" fontSize={9} fontWeight={800}>!</text>
                  </g>
                )}

                {/* Label pill */}
                {!isDim && (
                  <g>
                    <rect x={node.x - 90} y={node.y + NR + 6} width={180} height={30} rx={15}
                      fill={isSelected ? "rgba(37,99,235,0.3)" : isCkpt ? "rgba(59,130,246,0.25)" : "rgba(15,17,23,0.94)"}
                      stroke={isSelected ? "rgba(96,165,250,0.5)" : isCkpt ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.12)"} strokeWidth={0.6} />
                    <text x={node.x} y={node.y + NR + 26} textAnchor="middle"
                      fill={isSelected ? "#bfdbfe" : isCkpt ? "#bfdbfe" : isChild ? "#f8fafc" : "#e2e8f0"}
                      fontSize={14} fontWeight={700}>
                      {node.label.length > 14 ? node.label.slice(0, 12) + "\u2026" : node.label}
                    </text>
                  </g>
                )}

                {/* YOU badge */}
                {isCkpt && !isRoot && (
                  <g transform={`translate(${node.x}, ${node.y - NR - 18})`}>
                    <rect x={-26} y={-10} width={52} height={20} rx={10} fill="#3b82f6" />
                    <text x={0} y={4} textAnchor="middle" fill="white" fontSize={12} fontWeight={800}>YOU</text>
                  </g>
                )}

                {/* Career title above first stage */}
                {node.stageIdx === 0 && !isRoot && !isDim && (
                  <text x={node.x} y={node.y - NR - 28} textAnchor="middle"
                    fill={node.burnout ? "#fca5a5" : "#c7d2fe"} fontSize={14} fontWeight={800} letterSpacing="0.04em">
                    {careers[node.careerIdx]?.title.toUpperCase()}
                  </text>
                )}

                {/* tooltip rendered as HTML overlay below */}
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

      {/* HTML Tooltip — rendered outside SVG so zoom doesn't affect size */}
      {hoveredNode && !nodes.get(hoveredNode)?.id.startsWith("root") && (() => {
        const node = nodes.get(hoveredNode);
        if (!node || node.careerIdx < 0) return null;
        const career = careers[node.careerIdx];
        if (!career) return null;
        // Convert node world coords to screen coords
        // SVG viewBox: (0,0)-(vw,vh) maps to container (cw,ch)
        // Inner transform: translate(vw/2, vh*0.55) scale(zoom) translate(-carPos+pan*panScale)
        const svgScale = Math.min(cw / vw, ch / vh);
        const worldX = (vw / 2) + (node.x - carPos.x + pan.x * panScale) * zoom;
        const worldY = (vh * 0.55) + (node.y - carPos.y + pan.y * panScale) * zoom;
        const screenX = (worldX - (vw - cw / svgScale) / 2) * svgScale;
        const screenY = (worldY - (vh - ch / svgScale) / 2) * svgScale;
        return (
          <div className="absolute z-30 pointer-events-none" style={{ left: screenX, top: screenY - 20, transform: "translate(-50%, -100%)" }}>
            <div className="bg-[#0a0c12]/97 border border-white/15 rounded-2xl px-5 py-4 shadow-[0_12px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl min-w-[280px] max-w-[340px]">
              <div className="text-lg font-extrabold text-white leading-tight">{node.label}</div>
              <div className="text-sm font-semibold text-blue-400 mt-1">{career.title}</div>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
                <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs font-bold">Stage {node.stageIdx + 1}/{career.progression.length}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs font-bold">{career.difficulty}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs font-bold">{career.stress_level} stress</span>
              </div>
              {career.fit_reason && (
                <div className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{career.fit_reason}</div>
              )}
            </div>
            <div className="w-3 h-3 bg-[#0a0c12] border-r border-b border-white/15 rotate-45 mx-auto -mt-1.5" />
          </div>
        );
      })()}

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
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-[#1a1d24]/80 backdrop-blur border border-[#2a2d35] rounded-full px-5 py-2 shadow-lg">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span className="text-blue-400">Click</span> any node · <span className="text-blue-400">↑↓←→</span> navigate · <span className="text-blue-400">Scroll</span> zoom
        </span>
      </div>

      {/* PANEL — rich expandable drawer */}
      <AnimatePresence>
        {panelData && (
          <PanelDrawer panelData={panelData} analysis={store.analysis} onClose={() => { setPanelData(null); setSelectedPath(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// RICH EXPANDABLE PANEL DRAWER
// ============================================================

function PanelDrawer({ panelData, analysis, onClose }: { panelData: { node: MNode; career: CareerMatch }; analysis: import("@/types").AnalysisResponse | null; onClose: () => void }) {
  const store = useStore();
  const [selecting, setSelecting] = useState(false);
  const career = panelData.career;
  const node = panelData.node;
  const isCurrentPath = analysis?.career_matches[0]?.title === career.title;

  const selectPath = async () => {
    if (!analysis || !store.profile) return;
    setSelecting(true);

    // Reorder: selected career becomes index 0
    const reordered = [career, ...analysis.career_matches.filter((c) => c.title !== career.title)];

    // Generate updated resources for the new top career
    const { generateResources: genRes } = await import("@/data/mock-response");

    // Build updated roadmap with career-specific tasks
    const currentRole = node.label;
    const nextRoles = career.progression.slice(node.stageIdx + 1);
    const skills = store.profile.skills.slice(0, 2).join(" and ") || "your core skills";

    const updatedAnalysis = {
      ...analysis,
      career_matches: reordered,
      roadmap: {
        ...analysis.roadmap,
        current_stage: `${career.title} — ${currentRole}`,
        next_30_days: [
          { title: `Excel as ${currentRole}`, description: `Build expertise in ${skills} for your ${career.title} track.`, duration: "Weeks 1-4", tasks: [`Deliver a project as ${currentRole}`, "Get feedback from a mentor", "Identify one skill gap to close"] },
        ],
        next_3_months: nextRoles.length > 0 ? [
          { title: `Prepare for ${nextRoles[0]}`, description: `Start building skills for the next level in ${career.title}.`, duration: "Months 1-3", tasks: [`Study ${nextRoles[0]} requirements`, "Take on stretch assignments", "Expand your network in the field"] },
        ] : analysis.roadmap.next_3_months,
      },
      resources: genRes(reordered, store.profile),
    };

    store.setAnalysis(updatedAnalysis);

    // Set checkpoint: this career is now at index 0, so c0-s{stageIdx}
    store.setCareerCheckpoint(`c0-s${node.stageIdx}`);

    // Persist to DB
    if (store.profileId) {
      try {
        await fetch("/api/update-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: store.profileId, analysis: updatedAnalysis }),
        });
      } catch { /* silent */ }
    }

    setSelecting(false);
    onClose();
  };
  const roadmap = analysis?.roadmap;
  const growthPct = career.growth === "High" ? 92 : career.growth === "Medium" ? 68 : 38;
  const stressSegs = career.stress_level === "High" ? 4 : career.stress_level === "Medium" ? 2 : 1;
  const durations = ["Day 1-5", "Week 1-2", "Month 1", "Month 3", "Month 6", "Year 1"];

  return (
    <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      data-panel
      className="fixed top-0 right-0 bottom-0 z-[60] w-full md:w-[420px] bg-[#12141a]/95 backdrop-blur-xl border-l border-[#2a2d35] shadow-2xl flex flex-col overscroll-contain">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#12141a]/90 backdrop-blur-xl border-b border-[#2a2d35] px-5 py-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">{node.burnout ? "\u26A0 High Stress" : "Career Stage"}</div>
          <h3 className="text-lg font-extrabold text-white tracking-tight truncate">{node.label}</h3>
          <p className="text-xs text-slate-500">{career.title} · Stage {node.stageIdx + 1} of {career.progression.length}</p>
        </div>
        <button onClick={onClose} data-clickable className="w-8 h-8 rounded-lg hover:bg-[#1e2028] flex items-center justify-center flex-shrink-0">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" onWheel={(e) => e.stopPropagation()}>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "Difficulty", v: career.difficulty, c: career.difficulty === "Hard" ? "text-red-400" : "text-blue-400" },
            { l: "Growth", v: career.growth, c: "text-violet-400" },
            { l: "Stress", v: career.stress_level, c: career.stress_level === "High" ? "text-red-400" : "text-blue-400" },
          ].map((m) => (
            <div key={m.l} className="bg-[#1a1d24] rounded-xl p-3 text-center border border-[#2a2d35]">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{m.l}</div>
              <div className={`font-bold text-base ${m.c}`}>{m.v}</div>
            </div>
          ))}
        </div>

        {/* Growth bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold mb-2">
            <span className="text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Growth Potential</span>
            <span className="text-blue-400">{growthPct}%</span>
          </div>
          <div className="h-2 bg-[#1a1d24] rounded-full overflow-hidden border border-[#2a2d35]">
            <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${growthPct}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>

        {/* Stress bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold mb-2">
            <span className="text-slate-500">Stress Level</span>
            <span className="text-slate-400">{career.stress_level}</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((seg) => (
              <div key={seg} className={`h-2 flex-1 rounded-full ${seg <= stressSegs ? "bg-blue-500" : "bg-[#1a1d24] border border-[#2a2d35]"}`} />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <div className="text-[10px] text-blue-400 uppercase tracking-widest font-black mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Timeline</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-[9px] text-slate-500 uppercase">First Role</div><div className="font-bold text-sm text-slate-200">{career.estimated_timeline.to_first_role}</div></div>
            <div><div className="text-[9px] text-slate-500 uppercase">Mid-Level</div><div className="font-bold text-sm text-slate-200">{career.estimated_timeline.to_mid_level}</div></div>
            <div><div className="text-[9px] text-slate-500 uppercase">Senior</div><div className="font-bold text-sm text-slate-200">{career.estimated_timeline.to_senior}</div></div>
          </div>
        </div>

        {/* Fit reason */}
        <p className="text-sm text-slate-300 leading-relaxed">{career.fit_reason}</p>

        {/* Career Progression — step-by-step roadmap */}
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Career Progression
          </div>
          <div className="space-y-0">
            {career.progression.map((role, i) => {
              const isCompleted = i < node.stageIdx;
              const isCurrent = i === node.stageIdx;
              const isFuture = i > node.stageIdx;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                    ) : (
                      <Circle className="w-6 h-6 text-slate-600 flex-shrink-0" />
                    )}
                    {i < career.progression.length - 1 && (
                      <div className={`w-px flex-1 min-h-8 ${isCompleted ? "bg-blue-500/40" : "bg-[#2a2d35]"}`} />
                    )}
                  </div>
                  <div className={`pb-4 ${isFuture ? "opacity-40" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isCurrent ? "text-blue-400" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>{role}</span>
                      {isCurrent && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold uppercase">You are here</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">{durations[i] || `Year ${Math.ceil(i / 2)}`}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap milestones */}
        {roadmap && (
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Roadmap Milestones
            </div>
            {[
              { label: "Next 30 Days", steps: roadmap.next_30_days },
              { label: "3 Months", steps: roadmap.next_3_months },
              { label: "6 Months", steps: roadmap.next_6_months },
              { label: "12 Months", steps: roadmap.next_12_months },
            ].map((bucket) => bucket.steps.map((step, si) => (
              <div key={`${bucket.label}-${si}`} className="mb-4 bg-[#1a1d24] rounded-xl p-4 border border-[#2a2d35]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">{bucket.label}</span>
                  <span className="text-[10px] text-slate-600">{step.duration}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-200">{step.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                <div className="mt-2.5 space-y-1.5">
                  {step.tasks.map((task, ti) => (
                    <div key={ti} className="flex items-start gap-2">
                      <Circle className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-400">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )))}
          </div>
        )}

      </div>

      {/* Sticky bottom — Select This Path */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-[#2a2d35] bg-[#12141a]/95 backdrop-blur-xl">
        {isCurrentPath ? (
          <div className="w-full py-2.5 rounded-full text-center text-[11px] font-headline font-bold text-primary bg-primary/10 border border-primary/20">
            This is your current path
          </div>
        ) : (
          <button onClick={selectPath} disabled={selecting} data-clickable
            className="relative overflow-hidden w-full py-2.5 rounded-full font-headline font-bold text-xs bg-white text-surface group/fill disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">
            <span className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary-container rounded-[inherit] translate-y-full group-hover/fill:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-150 group-hover/fill:text-white">
              {selecting ? (
                <><span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Updating...</>
              ) : (
                "Select This Path"
              )}
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
