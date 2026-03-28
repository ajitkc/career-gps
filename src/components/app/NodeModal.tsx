"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowRight, Gauge, TrendingUp, Flame, Clock, ChevronRight,
  BookOpen, Zap,
} from "lucide-react";
import type { CareerMatch } from "@/types";
import SidePanel from "./SidePanel";

interface NodeLike {
  id: string;
  label: string;
  stage: string;
  state: "completed" | "current" | "locked";
}

export default function NodeModal({
  node,
  career,
  onClose,
}: {
  node: NodeLike | null;
  career: CareerMatch | null;
  onClose: () => void;
}) {
  const [showPanel, setShowPanel] = useState(false);

  if (!node || !career) return null;

  const stageIdx = career.progression.indexOf(node.label);
  const isStart = stageIdx === 0;
  const isMid = stageIdx === Math.floor(career.progression.length / 2);
  const isEnd = stageIdx === career.progression.length - 1;
  const timeline = isStart
    ? career.estimated_timeline.to_first_role
    : isMid
    ? career.estimated_timeline.to_mid_level
    : isEnd
    ? career.estimated_timeline.to_senior
    : "";

  return (
    <>
      <AnimatePresence>
        {node && !showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-x-4 top-[15%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] z-[71] bg-surface-container-low rounded-2xl border border-outline-variant/15 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-on-surface-variant" />
                </button>

                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 ${
                    node.state === "completed"
                      ? "bg-primary/15 text-primary"
                      : node.state === "current"
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {node.state === "completed" ? "Completed" : node.state === "current" ? "You Are Here" : "Upcoming"}
                </div>

                <h3 className="font-headline text-2xl font-extrabold tracking-tight pr-8">
                  {node.label}
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">{career.title} Path</p>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 space-y-5">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-container rounded-xl p-3 text-center">
                    <Gauge className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="text-[10px] text-on-surface-variant uppercase">Difficulty</div>
                    <div className="font-headline font-bold text-sm">{career.difficulty}</div>
                  </div>
                  <div className="bg-surface-container rounded-xl p-3 text-center">
                    <TrendingUp className="w-4 h-4 text-secondary mx-auto mb-1" />
                    <div className="text-[10px] text-on-surface-variant uppercase">Growth</div>
                    <div className="font-headline font-bold text-sm">{career.growth}</div>
                  </div>
                  <div className="bg-surface-container rounded-xl p-3 text-center">
                    <Flame className="w-4 h-4 text-tertiary mx-auto mb-1" />
                    <div className="text-[10px] text-on-surface-variant uppercase">Stress</div>
                    <div className="font-headline font-bold text-sm">{career.stress_level}</div>
                  </div>
                </div>

                {/* Timeline */}
                {timeline && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-primary font-bold">
                        Estimated Timeline
                      </div>
                      <div className="text-sm font-headline font-bold">{timeline}</div>
                    </div>
                  </div>
                )}

                {/* Why it fits */}
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {career.fit_reason}
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setShowPanel(true)}
                    className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    Explore More
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <SidePanel
        open={showPanel}
        career={career}
        onClose={() => {
          setShowPanel(false);
          onClose();
        }}
      />
    </>
  );
}
