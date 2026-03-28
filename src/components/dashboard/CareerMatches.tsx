"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Gauge, Flame, ChevronDown, ArrowRight } from "lucide-react";
import type { CareerMatch } from "@/types";

const difficultyColor: Record<string, string> = {
  Easy: "text-primary bg-primary/10",
  Medium: "text-secondary bg-secondary/10",
  Hard: "text-tertiary bg-tertiary/10",
};

const growthColor: Record<string, string> = {
  Low: "text-on-surface-variant",
  Medium: "text-secondary",
  High: "text-primary",
};

export default function CareerMatches({ careers }: { careers: CareerMatch[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-headline text-xl font-bold">Your Career Matches</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Based on your skills, interests, and goals
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {careers.map((career, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <motion.div
              key={career.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-surface-container-high rounded-2xl border transition-all ${
                isExpanded ? "border-primary/30" : "border-outline-variant/10"
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-headline font-bold text-sm">
                    #{i + 1}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg">{career.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${difficultyColor[career.difficulty]}`}>
                        {career.difficulty}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-1 ${growthColor[career.growth]}`}>
                        <TrendingUp className="w-3 h-3" /> {career.growth} growth
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-on-surface-variant transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-5">
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {career.fit_reason}
                      </p>

                      {/* Metrics row */}
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

                      {/* Starting role */}
                      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                        <div className="text-[10px] font-label uppercase tracking-widest text-primary font-bold mb-1">
                          Starting Role
                        </div>
                        <div className="font-headline font-bold">{career.starting_role}</div>
                      </div>

                      {/* Progression */}
                      <div>
                        <div className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold mb-3">
                          Career Progression
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {career.progression.map((role, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <span className="px-3 py-1.5 bg-surface-container rounded-lg text-xs font-bold">
                                {role}
                              </span>
                              {j < career.progression.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-outline" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-[10px] text-on-surface-variant uppercase mb-1">First Role</div>
                          <div className="font-headline font-bold text-sm text-primary">
                            {career.estimated_timeline.to_first_role}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-on-surface-variant uppercase mb-1">Mid-Level</div>
                          <div className="font-headline font-bold text-sm">
                            {career.estimated_timeline.to_mid_level}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] text-on-surface-variant uppercase mb-1">Senior</div>
                          <div className="font-headline font-bold text-sm">
                            {career.estimated_timeline.to_senior}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
