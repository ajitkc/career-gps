"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lock, MapPin } from "lucide-react";
import { journeyMilestones } from "@/data/careers";

const milestoneColors = [
  { border: "border-primary", bg: "bg-primary", text: "text-primary", glow: "shadow-[0_0_20px_rgba(46,91,255,0.4)]" },
  { border: "border-secondary", bg: "bg-secondary", text: "text-secondary", glow: "shadow-[0_0_20px_rgba(216,185,255,0.3)]" },
  { border: "border-primary-container", bg: "bg-primary-container", text: "text-primary-container", glow: "shadow-[0_0_20px_rgba(46,91,255,0.3)]" },
  { border: "border-tertiary", bg: "bg-tertiary", text: "text-tertiary", glow: "shadow-[0_0_20px_rgba(255,179,174,0.3)]" },
];

export default function JourneyRoad() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="journey" className="py-32 relative overflow-hidden bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-20"
        >
          <span className="text-primary font-label text-xs tracking-[0.3em] uppercase font-semibold mb-4 block">
            Your Journey
          </span>
          <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Milestone Blueprint
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </motion.div>

        {/* Vertical Road */}
        <div className="relative flex flex-col items-center">
          {/* Central Path Line */}
          <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 via-outline-variant/20 to-tertiary/50" />

          {journeyMilestones.map((milestone, i) => {
            const colors = milestoneColors[i % milestoneColors.length];
            const isRight = i % 2 === 0;
            const isExpanded = expandedId === milestone.id;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className={`relative w-full flex flex-col items-center ${
                  i < journeyMilestones.length - 1 ? "mb-32" : ""
                } md:flex-row ${isRight ? "" : "md:flex-row-reverse"} md:items-center md:justify-between`}
              >
                {/* Desktop Label */}
                <div
                  className={`md:w-5/12 hidden md:block ${
                    isRight ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`font-label text-xs tracking-widest ${colors.text} font-bold uppercase`}
                  >
                    {milestone.time}
                  </span>
                  <h3 className="text-2xl font-headline font-bold mt-2">
                    {milestone.description}
                  </h3>
                </div>

                {/* Milestone Node */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : milestone.id)
                  }
                  className={`z-10 bg-surface border-4 ${colors.border} w-16 h-16 rounded-full flex items-center justify-center ${colors.glow} cursor-pointer hover:scale-110 transition-transform`}
                >
                  {milestone.completed ? (
                    <CheckCircle2
                      className={`w-6 h-6 ${colors.text}`}
                    />
                  ) : i === journeyMilestones.findIndex((m) => !m.completed) ? (
                    <MapPin className={`w-6 h-6 ${colors.text}`} />
                  ) : (
                    <Lock className="w-5 h-5 text-outline" />
                  )}
                </button>

                {/* Content Card */}
                <div
                  className={`md:w-5/12 mt-6 md:mt-0 ${
                    isRight ? "md:text-left md:pl-0" : "md:text-right md:pr-0"
                  }`}
                >
                  {/* Mobile label */}
                  <div className="md:hidden mb-3 text-center">
                    <span
                      className={`font-label text-xs tracking-widest ${colors.text} font-bold uppercase`}
                    >
                      {milestone.time}
                    </span>
                    <h3 className="text-lg font-headline font-bold mt-1">
                      {milestone.description}
                    </h3>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10">
                    <AnimatePresence mode="wait">
                      {isExpanded ? (
                        <motion.ul
                          key="tasks"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          {milestone.tasks.map((task, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-3 text-sm"
                            >
                              <CheckCircle2
                                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  milestone.completed
                                    ? colors.text
                                    : "text-outline"
                                }`}
                              />
                              <span className="text-on-surface-variant">
                                {task}
                              </span>
                            </li>
                          ))}
                        </motion.ul>
                      ) : (
                        <motion.p
                          key="summary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-on-surface-variant italic text-sm"
                        >
                          Click the milestone to see your tasks
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
