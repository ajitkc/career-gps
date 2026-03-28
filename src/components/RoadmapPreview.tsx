"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Zap } from "lucide-react";
import SectionBadge from "./ui/section-badge";
import { careers } from "@/data/careers";

export default function RoadmapPreview() {
  const career = careers[0]; // UI/UX Designer as the sample roadmap

  return (
    <section id="roadmap" className="py-32 bg-surface relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-20"
        >
          <SectionBadge>Sample Roadmap</SectionBadge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4">
            <span className="font-headline font-bold">{career.title}, </span>
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container pr-1">Your Path</span>
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-base md:text-lg font-body">
            A structured, time-bound progression from beginner to industry-ready.
          </p>
        </motion.div>

        {/* Roadmap Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="glass-panel rounded-2xl p-8 md:p-12 border border-outline-variant/10 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-8 border-b border-outline-variant/10">
            <div>
              <h3 className="font-headline text-2xl font-bold">{career.title}</h3>
              <p className="text-on-surface-variant text-sm mt-1">
                Difficulty: {career.difficulty} · Growth: {career.growth}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
              <Zap className="w-4 h-4 text-primary" />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-outline font-bold block">
                  Est. Duration
                </span>
                <span className="font-headline font-bold text-primary text-sm">
                  12 Months
                </span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-0">
            {career.steps.map((step, i) => {
              const isCompleted = i < 2;
              const isCurrent = i === 2;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.08,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="relative flex gap-6"
                >
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(46,91,255,0.5)]">
                        <div className="w-2 h-2 rounded-full bg-on-primary" />
                      </div>
                    ) : (
                      <Circle className="w-6 h-6 text-outline flex-shrink-0" />
                    )}
                    {i < career.steps.length - 1 && (
                      <div
                        className={`w-px flex-1 min-h-8 ${
                          isCompleted ? "bg-primary/40" : "bg-outline-variant/20"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`pb-8 ${
                      !isCompleted && !isCurrent ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <h4
                        className={`font-headline font-bold ${
                          isCurrent ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        {step.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-outline" />
                      <span className="text-xs text-on-surface-variant font-label">
                        {step.time}
                      </span>
                    </div>
                    {step.description && (
                      <p className="text-sm text-on-surface-variant mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
