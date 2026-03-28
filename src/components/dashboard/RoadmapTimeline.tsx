"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import type { Roadmap, RoadmapStep } from "@/types";

const PERIODS = [
  { key: "next_30_days" as const, label: "30 Days", color: "primary" },
  { key: "next_3_months" as const, label: "3 Months", color: "secondary" },
  { key: "next_6_months" as const, label: "6 Months", color: "primary-container" },
  { key: "next_12_months" as const, label: "12 Months", color: "tertiary" },
];

function StepCard({ step, index, color }: { step: RoadmapStep; index: number; color: string }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="relative flex gap-4">
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1">
        <div className={`w-3 h-3 rounded-full bg-${color} flex-shrink-0`} />
        <div className="w-px flex-1 bg-outline-variant/20 mt-1" />
      </div>

      <div className="pb-6 flex-1">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-left group"
        >
          <h4 className="font-headline font-bold text-sm group-hover:text-primary transition-colors">
            {step.title}
          </h4>
          <ChevronRight
            className={`w-3 h-3 text-outline transition-transform ${open ? "rotate-90" : ""}`}
          />
          <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {step.duration}
          </span>
        </button>

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 space-y-2"
          >
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {step.description}
            </p>
            <ul className="space-y-1.5">
              {step.tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <Circle className="w-3 h-3 text-outline flex-shrink-0 mt-0.5" />
                  <span className="text-on-surface-variant">{task}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapTimeline({ roadmap }: { roadmap: Roadmap }) {
  const [activePeriod, setActivePeriod] = useState<(typeof PERIODS)[number]["key"]>("next_30_days");

  const activeSteps = roadmap[activePeriod];
  const activeMeta = PERIODS.find((p) => p.key === activePeriod)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-headline text-xl font-bold">Your Roadmap</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Current stage: {roadmap.current_stage}
          </p>
        </div>
        <Calendar className="w-5 h-5 text-primary" />
      </div>

      {/* Period Tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-xl mb-6">
        {PERIODS.map((period) => (
          <button
            key={period.key}
            onClick={() => setActivePeriod(period.key)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold font-label uppercase tracking-wider transition-all ${
              activePeriod === period.key
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
        {activeSteps.length > 0 ? (
          activeSteps.map((step, i) => (
            <StepCard key={i} step={step} index={i} color={activeMeta.color} />
          ))
        ) : (
          <p className="text-sm text-on-surface-variant text-center py-8">
            No steps defined for this period yet.
          </p>
        )}
      </div>
    </motion.div>
  );
}
