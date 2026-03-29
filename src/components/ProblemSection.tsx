"use client";

import { motion } from "framer-motion";
import { HelpCircle, Flame, Brain, TrendingDown } from "lucide-react";
import SectionBadge from "./ui/section-badge";
import { GlowCard } from "./ui/spotlight-card";

const problems = [
  {
    icon: HelpCircle,
    title: "Confusion",
    description: "Overwhelmed by options. No clear starting point. Every path looks the same.",
    glow: "blue" as const,
  },
  {
    icon: TrendingDown,
    title: "Pressure",
    description: "Society demands a decision now. But rushed choices lead to regret.",
    glow: "blue" as const,
  },
  {
    icon: Flame,
    title: "Burnout",
    description: "Grinding without direction drains energy. 76% of professionals report career fatigue.",
    glow: "blue" as const,
  },
  {
    icon: Brain,
    title: "Uncertainty",
    description: "Markets shift. Industries evolve. Yesterday's safe bet is tomorrow's dead end.",
    glow: "blue" as const,
  },
];

export default function ProblemSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-20"
        >
          <SectionBadge>The Problem</SectionBadge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4">
            <span className="font-headline font-bold">The road is </span>
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container pr-1">broken</span>
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-base md:text-lg font-body">
            Most people navigate careers blindfolded. We&apos;re changing that.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <GlowCard glowColor={problem.glow} className="h-full group">
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-on-surface-variant mb-5 group-hover:scale-110 transition-transform">
                  <problem.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-headline font-bold mb-2 text-on-surface">
                  {problem.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed font-body">
                  {problem.description}
                </p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
