"use client";

import { motion } from "framer-motion";
import { HelpCircle, Flame, Brain, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: HelpCircle,
    title: "Confusion",
    description: "Overwhelmed by options. No clear starting point. Every path looks the same.",
    color: "primary",
  },
  {
    icon: TrendingDown,
    title: "Pressure",
    description: "Society demands a decision now. But rushed choices lead to regret.",
    color: "secondary",
  },
  {
    icon: Flame,
    title: "Burnout",
    description: "Grinding without direction drains energy. 76% of professionals report career fatigue.",
    color: "tertiary",
  },
  {
    icon: Brain,
    title: "Uncertainty",
    description: "Markets shift. Industries evolve. Yesterday's safe bet is tomorrow's dead end.",
    color: "primary",
  },
];

const colorMap: Record<string, { iconBg: string; iconText: string; border: string }> = {
  primary: {
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    border: "hover:border-primary/40",
  },
  secondary: {
    iconBg: "bg-secondary/10",
    iconText: "text-secondary",
    border: "hover:border-secondary/40",
  },
  tertiary: {
    iconBg: "bg-tertiary/10",
    iconText: "text-tertiary",
    border: "hover:border-tertiary/40",
  },
};

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
          <span className="text-primary font-label text-xs tracking-[0.3em] uppercase font-semibold mb-4 block">
            The Problem
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            The road is broken
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-lg">
            Most people navigate careers blindfolded. We&apos;re changing that.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => {
            const colors = colorMap[problem.color];
            return (
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
                className={`bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10 ${colors.border} transition-all duration-500 group`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center ${colors.iconText} mb-6 group-hover:scale-110 transition-transform`}
                >
                  <problem.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">
                  {problem.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
