"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X, Gauge, TrendingUp, Flame, Clock, ArrowRight,
  BookOpen, Play, FileText, Code, Globe, ExternalLink,
  CheckCircle2, Circle, AlertTriangle, Zap, Heart,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { CareerMatch, Resource } from "@/types";

interface PanelNode {
  id: string;
  label: string;
  state: "completed" | "current" | "locked";
  careerIdx: number;
  stageIdx: number;
  burnoutRisk?: "Low" | "Medium" | "High";
}

const typeIcons: Record<Resource["type"], React.ElementType> = {
  youtube: Play,
  article: FileText,
  course: BookOpen,
  docs: Globe,
  project: Code,
};

export default function JourneyPanel({
  node,
  career,
  onClose,
}: {
  node: PanelNode | null;
  career: CareerMatch | null;
  onClose: () => void;
}) {
  const { analysis, burnoutScore } = useStore();

  const isOpen = !!node && !!career;
  const resources = analysis?.resources || [];
  const roadmap = analysis?.roadmap;

  const stageIdx = node?.stageIdx ?? 0;
  const isStart = stageIdx === 0;
  const isMid = career ? stageIdx === Math.floor(career.progression.length / 2) : false;
  const isEnd = career ? stageIdx === career.progression.length - 1 : false;
  const timeline = career
    ? isStart
      ? career.estimated_timeline.to_first_role
      : isMid
      ? career.estimated_timeline.to_mid_level
      : isEnd
      ? career.estimated_timeline.to_senior
      : ""
    : "";

  const isBurnout = career?.stress_level === "High";

  return (
    <AnimatePresence>
      {isOpen && node && career && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-0 right-0 bottom-0 w-full md:w-[420px] z-30 bg-surface-container-low/95 backdrop-blur-2xl border-l border-outline-variant/15 shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      node.state === "completed"
                        ? "text-primary"
                        : node.state === "current"
                        ? "text-primary"
                        : "text-outline"
                    }`}
                  >
                    {node.state === "completed" ? "Completed" : node.state === "current" ? "You Are Here" : "Upcoming"}
                  </span>
                  {isBurnout && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-tertiary">
                      <AlertTriangle className="w-3 h-3" />
                      High Stress
                    </span>
                  )}
                </div>
                <h3 className="font-headline text-xl font-extrabold tracking-tight truncate">
                  {node.label}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{career.title} Path</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center transition-colors flex-shrink-0 ml-3"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-container rounded-xl p-3 text-center">
                <Gauge className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                <div className="text-[9px] text-on-surface-variant uppercase">Difficulty</div>
                <div className="font-headline font-bold text-xs">{career.difficulty}</div>
              </div>
              <div className="bg-surface-container rounded-xl p-3 text-center">
                <TrendingUp className="w-3.5 h-3.5 text-secondary mx-auto mb-1" />
                <div className="text-[9px] text-on-surface-variant uppercase">Growth</div>
                <div className="font-headline font-bold text-xs">{career.growth}</div>
              </div>
              <div className="bg-surface-container rounded-xl p-3 text-center">
                <Flame className={`w-3.5 h-3.5 mx-auto mb-1 ${isBurnout ? "text-tertiary" : "text-on-surface-variant"}`} />
                <div className="text-[9px] text-on-surface-variant uppercase">Stress</div>
                <div className={`font-headline font-bold text-xs ${isBurnout ? "text-tertiary" : ""}`}>
                  {career.stress_level}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {timeline && (
              <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-primary font-bold">
                    Estimated Timeline
                  </div>
                  <div className="text-sm font-headline font-bold">{timeline}</div>
                </div>
              </div>
            )}

            {/* Burnout Warning */}
            {isBurnout && (
              <div className="p-4 bg-tertiary-container/10 border border-tertiary/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-tertiary" />
                  <span className="text-xs font-bold text-tertiary uppercase tracking-widest">
                    Burnout Risk
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  This path has higher stress levels. Make sure to build in recovery periods and monitor your pace.
                </p>
              </div>
            )}

            {/* Why it fits */}
            <div>
              <div className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Why This Fits You
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {career.fit_reason}
              </p>
            </div>

            {/* Full Progression */}
            <div>
              <div className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                Career Progression
              </div>
              <div className="space-y-0">
                {career.progression.map((role, i) => {
                  const isThis = i === node.stageIdx;
                  const isPast = i < node.stageIdx || node.state === "completed";
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {isPast || (isThis && node.state === "completed") ? (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : isThis ? (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_var(--color-primary)]">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-outline flex-shrink-0" />
                        )}
                        {i < career.progression.length - 1 && (
                          <div className={`w-px flex-1 min-h-5 ${isPast ? "bg-primary/40" : "bg-outline-variant/20"}`} />
                        )}
                      </div>
                      <div className={`pb-3 ${!isPast && !isThis ? "opacity-40" : ""}`}>
                        <span className={`text-xs font-bold ${isThis ? "text-primary" : ""}`}>{role}</span>
                        {isThis && (
                          <span className="ml-2 text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Grid */}
            <div>
              <div className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Timeline Estimates
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: "First Role", v: career.estimated_timeline.to_first_role },
                  { l: "Mid-Level", v: career.estimated_timeline.to_mid_level },
                  { l: "Senior", v: career.estimated_timeline.to_senior },
                ].map((t) => (
                  <div key={t.l} className="bg-surface-container rounded-lg p-2.5 text-center">
                    <div className="text-[8px] text-on-surface-variant uppercase">{t.l}</div>
                    <div className="font-headline font-bold text-[11px] text-primary">{t.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            {roadmap && roadmap.next_30_days.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                    Next Actions
                  </span>
                </div>
                {roadmap.next_30_days.slice(0, 1).map((step, i) => (
                  <div key={i} className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
                    <h4 className="font-headline font-bold text-xs mb-1">{step.title}</h4>
                    <ul className="space-y-1">
                      {step.tasks.slice(0, 3).map((task, j) => (
                        <li key={j} className="flex items-start gap-2 text-[11px] text-on-surface-variant">
                          <ArrowRight className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                    Resources
                  </span>
                </div>
                <div className="space-y-2">
                  {resources.slice(0, 3).map((res, i) => {
                    const Icon = typeIcons[res.type] || Globe;
                    return (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold truncate group-hover:text-primary transition-colors">
                            {res.title}
                          </div>
                          <div className="text-[9px] text-on-surface-variant capitalize">{res.type}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-outline opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
