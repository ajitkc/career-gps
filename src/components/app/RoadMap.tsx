"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, MapPin, Car } from "lucide-react";
import type { CareerMatch } from "@/types";
import NodeModal from "./NodeModal";

interface RoadNode {
  id: string;
  label: string;
  stage: string;
  state: "completed" | "current" | "locked";
  careerIdx: number;
}

function buildNodes(careers: CareerMatch[], activeCareerIdx: number): RoadNode[] {
  const career = careers[activeCareerIdx];
  if (!career) return [];
  // The current node is index 0 (starting role)
  return career.progression.map((stage, i) => ({
    id: `${activeCareerIdx}-${i}`,
    label: stage,
    stage: i === 0 ? career.estimated_timeline.to_first_role : i === Math.floor(career.progression.length / 2) ? career.estimated_timeline.to_mid_level : i === career.progression.length - 1 ? career.estimated_timeline.to_senior : "",
    state: i === 0 ? "completed" : i === 1 ? "current" : "locked",
    careerIdx: activeCareerIdx,
  }));
}

// SVG path points for the winding road
function getNodePositions(count: number, width: number) {
  const positions: { x: number; y: number }[] = [];
  const ySpacing = 140;
  const startY = 60;
  const centerX = width / 2;
  const amplitude = Math.min(120, width * 0.25);

  for (let i = 0; i < count; i++) {
    const x = centerX + (i % 2 === 0 ? -amplitude : amplitude);
    const y = startY + i * ySpacing;
    positions.push({ x, y });
  }
  return positions;
}

function buildPath(positions: { x: number; y: number }[]) {
  if (positions.length < 2) return "";
  let d = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const cpY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export default function RoadMap({ careers }: { careers: CareerMatch[] }) {
  const [activeCareerIdx, setActiveCareerIdx] = useState(0);
  const [selectedNode, setSelectedNode] = useState<RoadNode | null>(null);

  const nodes = buildNodes(careers, activeCareerIdx);
  const svgWidth = 400;
  const positions = getNodePositions(nodes.length, svgWidth);
  const svgHeight = positions.length > 0 ? positions[positions.length - 1].y + 80 : 400;
  const pathD = buildPath(positions);

  const currentIdx = nodes.findIndex((n) => n.state === "current");
  const carPos = currentIdx >= 0 ? positions[currentIdx] : positions[0];

  // Path progress (how much of the path to color)
  const progressFraction = currentIdx >= 0 ? (currentIdx + 0.5) / nodes.length : 0;

  return (
    <div className="space-y-6">
      {/* Career Path Selector */}
      <div className="flex gap-2 p-1 bg-surface-container rounded-xl overflow-x-auto">
        {careers.map((career, i) => (
          <button
            key={career.title}
            onClick={() => setActiveCareerIdx(i)}
            className={`flex-shrink-0 py-2.5 px-4 rounded-lg text-xs font-bold font-label uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCareerIdx === i
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {career.title}
          </button>
        ))}
      </div>

      {/* Road Visualization */}
      <div className="bg-surface-container-high rounded-2xl border border-outline-variant/10 p-4 md:p-8 overflow-hidden">
        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-md"
            style={{ height: `${svgHeight}px`, maxHeight: "700px" }}
          >
            {/* Road Background */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-surface-container)"
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Road Surface */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-surface-container-lowest)"
              strokeWidth="40"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center Dashes */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-outline-variant)"
              strokeWidth="2"
              strokeDasharray="12 20"
              strokeLinecap="round"
              opacity={0.4}
            />
            {/* Progress Overlay */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progressFraction * svgHeight * 1.5} ${svgHeight * 3}`}
              opacity={0.6}
            />

            {/* Nodes */}
            {nodes.map((node, i) => {
              const pos = positions[i];
              const isCompleted = node.state === "completed";
              const isCurrent = node.state === "current";
              const isLocked = node.state === "locked";

              return (
                <g key={node.id}>
                  {/* Click area */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={32}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node)}
                  />

                  {/* Glow */}
                  {isCurrent && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={30}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="2"
                      opacity={0.3}
                    >
                      <animate attributeName="r" values="30;38;30" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={24}
                    fill={
                      isCompleted
                        ? "var(--color-primary-container)"
                        : isCurrent
                        ? "var(--color-primary)"
                        : "var(--color-surface-container)"
                    }
                    stroke={
                      isCompleted
                        ? "var(--color-primary)"
                        : isCurrent
                        ? "var(--color-primary)"
                        : "var(--color-outline-variant)"
                    }
                    strokeWidth={isCurrent ? 3 : 2}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedNode(node)}
                    opacity={isLocked ? 0.5 : 1}
                  />

                  {/* Icon */}
                  <g
                    transform={`translate(${pos.x - 8}, ${pos.y - 8})`}
                    className="pointer-events-none"
                  >
                    {isCompleted && (
                      <Check size={16} className="text-on-primary" stroke="white" />
                    )}
                    {isCurrent && (
                      <MapPin size={16} stroke="white" />
                    )}
                    {isLocked && (
                      <Lock size={16} stroke="var(--color-outline)" />
                    )}
                  </g>

                  {/* Label */}
                  <text
                    x={i % 2 === 0 ? pos.x + 36 : pos.x - 36}
                    y={pos.y - 6}
                    textAnchor={i % 2 === 0 ? "start" : "end"}
                    className="text-[11px] font-bold"
                    fill="var(--color-on-surface)"
                  >
                    {node.label}
                  </text>
                  {node.stage && (
                    <text
                      x={i % 2 === 0 ? pos.x + 36 : pos.x - 36}
                      y={pos.y + 10}
                      textAnchor={i % 2 === 0 ? "start" : "end"}
                      className="text-[9px]"
                      fill="var(--color-on-surface-variant)"
                    >
                      {node.stage}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Car Indicator */}
            {carPos && (
              <motion.g
                animate={{ x: carPos.x, y: carPos.y - 40 }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
              >
                <g transform="translate(-14, -14)">
                  <rect x="2" y="0" width="24" height="28" rx="6" fill="var(--color-primary)" />
                  <rect x="5" y="6" width="18" height="10" rx="3" fill="var(--color-surface)" opacity="0.3" />
                  <circle cx="8" cy="26" r="3" fill="white" opacity="0.8" />
                  <circle cx="20" cy="26" r="3" fill="white" opacity="0.8" />
                </g>
              </motion.g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-outline-variant/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-container border-2 border-primary" />
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Current
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-surface-container border-2 border-outline-variant opacity-50" />
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              Locked
            </span>
          </div>
        </div>
      </div>

      {/* Node Modal */}
      <NodeModal
        node={selectedNode}
        career={selectedNode ? careers[selectedNode.careerIdx] : null}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
