"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  ZoomIn, ZoomOut, Maximize2, LocateFixed, AlertTriangle,
} from "lucide-react";
import type { CareerMatch } from "@/types";
import JourneyPanel from "./JourneyPanel";

// ============================================================
// Types
// ============================================================

interface MapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: "completed" | "current" | "locked";
  careerIdx: number;
  stageIdx: number;
  isBranch?: boolean; // is this a branching point?
  burnoutRisk?: "Low" | "Medium" | "High";
}

interface MapEdge {
  from: string;
  to: string;
  burnout: boolean;
}

// ============================================================
// Map Layout Engine — builds a unified branching map
// ============================================================

function buildMapData(careers: CareerMatch[]) {
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];

  // Root node
  const rootId = "root";
  nodes.push({
    id: rootId,
    label: "Start",
    x: 0,
    y: 0,
    state: "completed",
    careerIdx: -1,
    stageIdx: -1,
  });

  const angleSpread = Math.PI * 0.6; // spread across 108 degrees
  const startAngle = -Math.PI / 2 - angleSpread / 2; // centered above

  careers.forEach((career, cIdx) => {
    const angle = startAngle + (cIdx / Math.max(1, careers.length - 1)) * angleSpread;
    const branchDir = cIdx === 0 ? -1 : cIdx === careers.length - 1 ? 1 : 0;

    career.progression.forEach((role, sIdx) => {
      const dist = 160 + sIdx * 160;
      // Slight curve: each stage bends further along the branch angle
      const stageAngle = angle + branchDir * sIdx * 0.06;
      const x = Math.cos(stageAngle) * dist;
      const y = Math.sin(stageAngle) * dist;

      const nodeId = `c${cIdx}-s${sIdx}`;
      const isHighBurnout = career.stress_level === "High";

      nodes.push({
        id: nodeId,
        label: role,
        x,
        y,
        state: sIdx === 0 ? "completed" : sIdx === 1 ? "current" : "locked",
        careerIdx: cIdx,
        stageIdx: sIdx,
        isBranch: sIdx === 0,
        burnoutRisk: career.stress_level,
      });

      // Edge from previous node (or root)
      const fromId = sIdx === 0 ? rootId : `c${cIdx}-s${sIdx - 1}`;
      edges.push({ from: fromId, to: nodeId, burnout: isHighBurnout });
    });
  });

  return { nodes, edges };
}

// ============================================================
// SVG Helpers
// ============================================================

function getNodeById(nodes: MapNode[], id: string) {
  return nodes.find((n) => n.id === id);
}

function edgePath(from: MapNode, to: MapNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const cx1 = from.x + dx * 0.4;
  const cy1 = from.y;
  const cx2 = from.x + dx * 0.6;
  const cy2 = to.y;
  return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
}

// ============================================================
// Component
// ============================================================

export default function CareerJourneyMap({ careers }: { careers: CareerMatch[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Cursor-based car tilt
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const tiltX = useSpring(cursorX, { stiffness: 100, damping: 20 });
  const tiltY = useSpring(cursorY, { stiffness: 100, damping: 20 });

  const { nodes, edges } = buildMapData(careers);

  // Find current node for car
  const currentNode = nodes.find((n) => n.state === "current") || nodes[1];

  // Viewport bounds
  const padding = 200;
  const allX = nodes.map((n) => n.x);
  const allY = nodes.map((n) => n.y);
  const minX = Math.min(...allX) - padding;
  const maxX = Math.max(...allX) + padding;
  const minY = Math.min(...allY) - padding;
  const maxY = Math.max(...allY) + padding;
  const viewWidth = maxX - minX;
  const viewHeight = maxY - minY;

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) {
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
      // Cursor tilt for car
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        cursorX.set(cx * 6);
        cursorY.set(cy * 4);
      }
    },
    [dragging, dragStart, cursorX, cursorY]
  );

  const handleMouseUp = () => setDragging(false);

  const recenter = () => {
    setPan({ x: 0, y: 0 });
    setZoom(0.85);
  };

  const focusCar = () => {
    if (currentNode) {
      setPan({ x: -currentNode.x * zoom, y: -currentNode.y * zoom });
    }
  };

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.max(0.3, Math.min(2, z + delta)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Map Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-surface-container-lowest rounded-2xl border border-outline-variant/10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ perspective: "1200px" }}
      >
        {/* Dot Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(var(--color-outline-variant) 1px, transparent 1px)",
            backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />

        {/* Subtle radial glow behind map */}
        <div className="absolute inset-0 pointer-events-none bg-radial-glow opacity-50" />

        {/* SVG Map Layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            x: pan.x,
            y: pan.y,
            scale: zoom,
            rotateX: tiltY,
            rotateY: tiltX,
          }}
          transition={{ type: "tween", duration: 0.05 }}
        >
          <svg
            viewBox={`${minX} ${minY} ${viewWidth} ${viewHeight}`}
            className="w-full h-full overflow-visible"
            style={{ minWidth: viewWidth, minHeight: viewHeight }}
          >
            <defs>
              {/* Animated dash pattern for active roads */}
              <pattern id="road-dash" width="24" height="4" patternUnits="userSpaceOnUse">
                <rect width="12" height="4" fill="var(--color-outline-variant)" opacity="0.3" rx="2">
                  <animate attributeName="x" values="0;24" dur="1.5s" repeatCount="indefinite" />
                </rect>
              </pattern>
              {/* Glow filter */}
              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="burnout-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ===== EDGES ===== */}
            {edges.map((edge) => {
              const from = getNodeById(nodes, edge.from);
              const to = getNodeById(nodes, edge.to);
              if (!from || !to) return null;
              const d = edgePath(from, to);
              const isActive = from.state !== "locked" && to.state !== "locked";

              return (
                <g key={`${edge.from}-${edge.to}`}>
                  {/* Road casing */}
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--color-surface-container)"
                    strokeWidth="28"
                    strokeLinecap="round"
                    opacity={isActive ? 1 : 0.3}
                  />
                  {/* Road surface */}
                  <path
                    d={d}
                    fill="none"
                    stroke={
                      edge.burnout
                        ? "var(--color-error-container)"
                        : "var(--color-surface-container-high)"
                    }
                    strokeWidth="22"
                    strokeLinecap="round"
                    opacity={isActive ? 1 : 0.3}
                  />
                  {/* Center dashes */}
                  <path
                    d={d}
                    fill="none"
                    stroke={
                      edge.burnout
                        ? "var(--color-tertiary)"
                        : isActive
                        ? "var(--color-primary)"
                        : "var(--color-outline-variant)"
                    }
                    strokeWidth="2"
                    strokeDasharray="8 16"
                    strokeLinecap="round"
                    opacity={isActive ? 0.6 : 0.15}
                  >
                    {isActive && (
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;-48"
                        dur={edge.burnout ? "0.8s" : "2s"}
                        repeatCount="indefinite"
                      />
                    )}
                  </path>
                  {/* Burnout warning glow */}
                  {edge.burnout && isActive && (
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--color-tertiary-container)"
                      strokeWidth="30"
                      strokeLinecap="round"
                      opacity="0.08"
                      filter="url(#burnout-glow)"
                    />
                  )}
                </g>
              );
            })}

            {/* ===== NODES ===== */}
            {nodes.map((node) => {
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode?.id === node.id;
              const isRoot = node.id === "root";
              const isCompleted = node.state === "completed";
              const isCurrent = node.state === "current";
              const isLocked = node.state === "locked";
              const isBurnout = node.burnoutRisk === "High";
              const radius = isRoot ? 28 : isCurrent ? 22 : 18;

              return (
                <g
                  key={node.id}
                  data-node
                  className="cursor-pointer"
                  onClick={() => !isRoot && setSelectedNode(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Current node pulse */}
                  {isCurrent && (
                    <>
                      <circle cx={node.x} cy={node.y} r={radius + 14} fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.15">
                        <animate attributeName="r" values={`${radius + 8};${radius + 20};${radius + 8}`} dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={node.x} cy={node.y} r={radius + 6} fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.25">
                        <animate attributeName="r" values={`${radius + 4};${radius + 12};${radius + 4}`} dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.08;0.3" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}

                  {/* Burnout warning pulse */}
                  {isBurnout && !isLocked && !isRoot && (
                    <circle cx={node.x} cy={node.y} r={radius + 10} fill="none" stroke="var(--color-tertiary-container)" strokeWidth="2" opacity="0.2">
                      <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Hover ring */}
                  {(isHovered || isSelected) && !isRoot && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 4}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="2"
                      opacity="0.4"
                    />
                  )}

                  {/* Main circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={
                      isRoot
                        ? "var(--color-surface-container-high)"
                        : isCompleted
                        ? "var(--color-primary-container)"
                        : isCurrent
                        ? "var(--color-primary)"
                        : "var(--color-surface-container)"
                    }
                    stroke={
                      isRoot
                        ? "var(--color-outline-variant)"
                        : isBurnout && !isLocked
                        ? "var(--color-tertiary)"
                        : isCompleted || isCurrent
                        ? "var(--color-primary)"
                        : "var(--color-outline-variant)"
                    }
                    strokeWidth={isCurrent ? 3 : 2}
                    opacity={isLocked ? 0.4 : 1}
                    filter={isCurrent ? "url(#node-glow)" : undefined}
                  />

                  {/* Node icon text */}
                  {isRoot ? (
                    <text x={node.x} y={node.y + 5} textAnchor="middle" className="text-[14px]" fill="var(--color-on-surface)" fontWeight="800">
                      YOU
                    </text>
                  ) : isCompleted ? (
                    <text x={node.x} y={node.y + 5} textAnchor="middle" className="text-[14px]" fill="white" fontWeight="800">
                      ✓
                    </text>
                  ) : isCurrent ? (
                    <text x={node.x} y={node.y + 5} textAnchor="middle" className="text-[14px]" fill="white" fontWeight="800">
                      ▶
                    </text>
                  ) : (
                    <text x={node.x} y={node.y + 4} textAnchor="middle" className="text-[10px]" fill="var(--color-outline)" fontWeight="700">
                      {node.stageIdx + 1}
                    </text>
                  )}

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + radius + 16}
                    textAnchor="middle"
                    className="text-[10px]"
                    fill={isCurrent ? "var(--color-primary)" : isLocked ? "var(--color-outline)" : "var(--color-on-surface)"}
                    fontWeight={isCurrent ? "800" : "600"}
                    opacity={isLocked ? 0.4 : 1}
                  >
                    {node.label.length > 22 ? node.label.slice(0, 20) + "…" : node.label}
                  </text>

                  {/* Burnout warning icon */}
                  {isBurnout && !isLocked && !isRoot && (
                    <g transform={`translate(${node.x + radius - 4}, ${node.y - radius + 2})`}>
                      <circle r="8" fill="var(--color-tertiary-container)" />
                      <text x="0" y="4" textAnchor="middle" className="text-[9px]" fill="var(--color-on-tertiary-container)" fontWeight="800">!</text>
                    </g>
                  )}

                  {/* Career label at first branch node */}
                  {node.stageIdx === 0 && !isRoot && (
                    <text
                      x={node.x}
                      y={node.y - radius - 10}
                      textAnchor="middle"
                      className="text-[9px]"
                      fill={isBurnout ? "var(--color-tertiary)" : "var(--color-primary)"}
                      fontWeight="800"
                      letterSpacing="0.08em"
                    >
                      {careers[node.careerIdx]?.title.toUpperCase()}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ===== CAR ===== */}
            {currentNode && (
              <motion.g
                animate={{
                  x: currentNode.x,
                  y: currentNode.y - 44,
                }}
                transition={{ type: "spring", stiffness: 40, damping: 12, duration: 1.5 }}
              >
                {/* Shadow */}
                <ellipse rx="12" ry="4" fill="black" opacity="0.15" transform="translate(0, 28)" />
                {/* Car body */}
                <rect x="-11" y="-18" width="22" height="36" rx="7" fill="var(--color-primary)" stroke="var(--color-on-primary)" strokeWidth="1" />
                {/* Windshield */}
                <rect x="-7" y="-10" width="14" height="8" rx="3" fill="var(--color-surface)" opacity="0.25" />
                {/* Headlights */}
                <circle cx="-5" cy="15" r="2.5" fill="white" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="5" cy="15" r="2.5" fill="white" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite" />
                </circle>
                {/* Taillights */}
                <circle cx="-5" cy="-16" r="2" fill="var(--color-tertiary)" opacity="0.6" />
                <circle cx="5" cy="-16" r="2" fill="var(--color-tertiary)" opacity="0.6" />
              </motion.g>
            )}
          </svg>
        </motion.div>
      </div>

      {/* ===== CONTROLS ===== */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-surface-container/80 backdrop-blur-xl rounded-xl border border-outline-variant/15 p-1 shadow-xl">
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-outline-variant/10 mx-1.5" />
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-outline-variant/10 mx-1.5" />
          <button
            onClick={recenter}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={focusCar}
          className="w-11 h-11 bg-primary rounded-xl shadow-xl flex items-center justify-center text-on-primary hover:brightness-110 active:scale-95 transition-all"
          title="Locate Car"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <div className="bg-surface-container/80 backdrop-blur-xl rounded-xl border border-outline-variant/15 px-3 py-2 shadow-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Journey Active
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-surface-container/80 backdrop-blur-xl rounded-xl border border-outline-variant/15 px-4 py-3 shadow-xl">
        <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-primary rounded-full" /> Optimal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-tertiary rounded-full" /> High Burnout
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)]" /> Current
          </span>
        </div>
      </div>

      {/* ===== SIDE PANEL ===== */}
      <JourneyPanel
        node={selectedNode}
        career={selectedNode && selectedNode.careerIdx >= 0 ? careers[selectedNode.careerIdx] : null}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
