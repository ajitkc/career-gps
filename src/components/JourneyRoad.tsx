"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, MapPin, Circle } from "lucide-react";
import SectionBadge from "./ui/section-badge";
import { GlowCard } from "./ui/spotlight-card";
import { journeyMilestones } from "@/data/careers";

export default function JourneyRoad() {
  const [activeIdx, setActiveIdx] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"));
            if (!isNaN(idx)) setActiveIdx(idx);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-25% 0px -25% 0px" }
    );
    cardRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="journey" className="py-32 relative overflow-hidden bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-20"
        >
          <SectionBadge>Your Journey</SectionBadge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4">
            <span className="font-headline font-bold">Milestone </span>
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container pr-1">Blueprint</span>
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-base md:text-lg font-body">
            Scroll through your career checkpoints.
          </p>
        </motion.div>

        {/* Two columns: sticky left nav + scrolling right cards */}
        <div className="max-w-3xl mx-auto">
          {/* Stacked rows: each row has dot+label aligned with its card */}
          <div className="flex-1 min-w-0 space-y-6">
            {journeyMilestones.map((milestone, i) => {
              const isActive = i === activeIdx;
              const isCompleted = milestone.completed;
              const isCurrent = !isCompleted && i === journeyMilestones.findIndex((m) => !m.completed);
              const isPast = i < activeIdx || isCompleted;

              return (
                <div
                  key={milestone.id}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  data-idx={i}
                  className="flex gap-6 md:gap-10"
                >
                  {/* Left dot + label — positioned with the card */}
                  <div className="hidden md:flex flex-col items-center w-40 flex-shrink-0 pt-6">
                    <button
                      onClick={() => cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-white shadow-[0_0_20px_rgba(46,91,255,0.4)] scale-110"
                          : isPast
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-container-high text-outline"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <MapPin className="w-4 h-4" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <div className={`text-[10px] font-bold uppercase tracking-widest mt-2 transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-on-surface-variant/40"
                    }`}>
                      {milestone.time}
                    </div>
                    <div className={`text-xs font-headline text-center mt-1 transition-all duration-300 leading-tight ${
                      isActive ? "text-on-surface font-bold" : "text-on-surface-variant/40"
                    }`}>
                      {milestone.description.split("—")[0].trim()}
                    </div>
                    {/* Connector line to next card */}
                    {i < journeyMilestones.length - 1 && (
                      <div className={`w-px flex-1 mt-3 transition-colors duration-500 ${
                        isPast ? "bg-primary/30" : "bg-outline-variant/15"
                      }`} />
                    )}
                  </div>

                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`flex-1 min-w-0 transition-all duration-500 ${
                      isActive ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <GlowCard glowColor="blue" className="w-full">
                      <div className="flex items-center gap-3 mb-4">
                        {/* Mobile-only icon */}
                        <div className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isActive && (isCompleted || isCurrent)
                            ? "bg-primary text-white"
                            : isCompleted
                            ? "bg-primary/20 text-primary"
                            : "bg-surface-container-high text-outline"
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? <MapPin className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {milestone.time}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/50">Completed</span>
                        )}
                      </div>

                      <h3 className="text-lg md:text-xl font-headline font-bold text-on-surface mb-4">
                        {milestone.description}
                      </h3>

                      <ul className="space-y-2.5">
                        {milestone.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isCompleted ? "bg-primary/20" : "bg-surface-container-high"
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-2.5 h-2.5 text-primary" /> : <Circle className="w-2.5 h-2.5 text-outline" />}
                            </div>
                            <span className="text-sm text-on-surface-variant leading-relaxed font-body">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </GlowCard>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
