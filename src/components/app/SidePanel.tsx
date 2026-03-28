"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowRight, BookOpen, Play, FileText, Code, Globe,
  ExternalLink, Clock, TrendingUp, CheckCircle2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { CareerMatch, Resource } from "@/types";

const typeIcons: Record<Resource["type"], React.ElementType> = {
  youtube: Play,
  article: FileText,
  course: BookOpen,
  docs: Globe,
  project: Code,
};

export default function SidePanel({
  open,
  career,
  onClose,
}: {
  open: boolean;
  career: CareerMatch | null;
  onClose: () => void;
}) {
  const { analysis } = useStore();

  if (!career) return null;

  const resources = analysis?.resources || [];
  const roadmap = analysis?.roadmap;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[80] backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] z-[81] bg-surface-container-low border-l border-outline-variant/15 shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">
                  Career Deep Dive
                </div>
                <h3 className="font-headline text-xl font-extrabold tracking-tight">
                  {career.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-surface-container-high flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-8">
              {/* Career Progression */}
              <div>
                <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                  Full Progression
                </div>
                <div className="space-y-0">
                  {career.progression.map((role, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            i === 0
                              ? "bg-primary-container text-white"
                              : i === 1
                              ? "bg-primary text-white shadow-[0_0_10px_var(--color-primary)]"
                              : "bg-surface-container border border-outline-variant/30"
                          }`}
                        >
                          {i === 0 ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className={`text-xs font-bold ${i > 1 ? "text-outline" : ""}`}>{i + 1}</span>
                          )}
                        </div>
                        {i < career.progression.length - 1 && (
                          <div
                            className={`w-px flex-1 min-h-8 ${
                              i === 0 ? "bg-primary/40" : "bg-outline-variant/20"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <h4
                          className={`font-headline font-bold text-sm ${
                            i === 1 ? "text-primary" : ""
                          }`}
                        >
                          {role}
                        </h4>
                        {i === 1 && (
                          <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Your Target
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Estimates */}
              <div>
                <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                  Timeline Estimates
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "First Role", value: career.estimated_timeline.to_first_role },
                    { label: "Mid-Level", value: career.estimated_timeline.to_mid_level },
                    { label: "Senior", value: career.estimated_timeline.to_senior },
                  ].map((t) => (
                    <div key={t.label} className="bg-surface-container rounded-xl p-3 text-center">
                      <Clock className="w-3 h-3 text-on-surface-variant mx-auto mb-1" />
                      <div className="text-[10px] text-on-surface-variant uppercase">{t.label}</div>
                      <div className="font-headline font-bold text-xs text-primary">{t.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap Next Steps */}
              {roadmap && roadmap.next_30_days.length > 0 && (
                <div>
                  <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                    Next 30-Day Actions
                  </div>
                  <div className="space-y-3">
                    {roadmap.next_30_days.map((step, i) => (
                      <div
                        key={i}
                        className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/10"
                      >
                        <h4 className="font-headline font-bold text-sm mb-1">{step.title}</h4>
                        <p className="text-xs text-on-surface-variant mb-2">{step.description}</p>
                        <ul className="space-y-1">
                          {step.tasks.map((task, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-on-surface-variant">
                              <ArrowRight className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {resources.length > 0 && (
                <div>
                  <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                    Recommended Resources
                  </div>
                  <div className="space-y-2">
                    {resources.slice(0, 4).map((res, i) => {
                      const Icon = typeIcons[res.type] || Globe;
                      return (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                              {res.title}
                            </div>
                            <div className="text-[10px] text-on-surface-variant">{res.reason}</div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-outline opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-outline-variant/20 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-all"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
