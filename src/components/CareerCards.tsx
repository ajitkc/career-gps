"use client";

import { motion } from "framer-motion";
import { Palette, Megaphone, BarChart3 } from "lucide-react";
import { careers } from "@/data/careers";

const iconMap: Record<string, React.ElementType> = {
  Palette,
  Megaphone,
  BarChart3,
};

const colorStyles: Record<string, { accent: string; accentBg: string; border: string; btnHover: string }> = {
  primary: {
    accent: "text-primary",
    accentBg: "bg-primary/10",
    border: "hover:border-primary/40",
    btnHover: "hover:bg-primary hover:text-on-primary",
  },
  secondary: {
    accent: "text-secondary",
    accentBg: "bg-secondary/10",
    border: "hover:border-secondary/40",
    btnHover: "hover:bg-secondary hover:text-on-secondary",
  },
  tertiary: {
    accent: "text-tertiary",
    accentBg: "bg-tertiary/10",
    border: "hover:border-tertiary/40",
    btnHover: "hover:bg-tertiary hover:text-on-tertiary",
  },
};

function StressBar({ percent, color }: { percent: number; color: string }) {
  const segments = 4;
  const filled = Math.ceil((percent / 100) * segments);

  const segmentColors: Record<string, string[]> = {
    primary: ["bg-primary/60", "bg-primary/40", "bg-primary/20", "bg-primary/10"],
    secondary: ["bg-secondary/60", "bg-secondary/40", "bg-secondary/20", "bg-secondary/10"],
    tertiary: ["bg-tertiary-container/80", "bg-tertiary-container/60", "bg-tertiary-container/40", "bg-tertiary-container/20"],
  };

  return (
    <div className="h-2 bg-surface-container-highest rounded-full flex gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-full flex-1 rounded-full transition-all ${
            i < filled
              ? segmentColors[color]?.[i] ?? "bg-outline/20"
              : "bg-surface-container-low"
          }`}
        />
      ))}
    </div>
  );
}

export default function CareerCards() {
  return (
    <section id="careers" className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-20"
        >
          <span className="text-primary font-label text-xs tracking-[0.3em] uppercase font-semibold mb-4 block">
            Discover
          </span>
          <h2 className="font-headline text-4xl font-bold mb-4">
            Choose Your Lane
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            Different paths require different fuels. We&apos;ve mapped the terrain
            for the world&apos;s most sought-after careers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {careers.map((career, i) => {
            const Icon = iconMap[career.icon];
            const styles = colorStyles[career.color];
            const isHighlight = career.growthPercent >= 95;

            return (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.12,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className={`relative group rounded-2xl p-8 border flex flex-col justify-between transition-all duration-500 ${
                  isHighlight
                    ? "bg-surface-container-high/40 border-primary-container/40 shadow-[0_0_40px_-15px_rgba(46,91,255,0.4)] overflow-hidden"
                    : `bg-surface-container-high border-outline-variant/10 ${styles.border}`
                }`}
              >
                {/* Highlight Glow */}
                {isHighlight && (
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-container/20 blur-[80px] pointer-events-none" />
                )}

                {/* Badge */}
                {isHighlight && (
                  <div className="absolute -top-3 right-4 bg-primary-container text-on-primary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Elite Path
                  </div>
                )}

                <div className="space-y-6 relative z-10">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div
                      className={`w-14 h-14 rounded-2xl ${styles.accentBg} flex items-center justify-center ${styles.accent} group-hover:scale-110 transition-transform`}
                    >
                      {Icon && <Icon className="w-7 h-7" />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-label text-on-surface-variant/60 uppercase tracking-widest">
                        Growth
                      </span>
                      <span
                        className={`${styles.accent} font-headline font-bold text-lg`}
                      >
                        {career.growth}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-headline font-bold">
                      {career.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
                      {career.description}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4 pt-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1 uppercase font-label tracking-tighter text-on-surface-variant">
                        <span>Growth Potential</span>
                        <span className={`${styles.accent} font-bold`}>
                          {career.growthPercent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${career.growthPercent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                          className={`h-full ${
                            career.color === "primary"
                              ? "bg-primary"
                              : career.color === "secondary"
                              ? "bg-secondary"
                              : "bg-primary-container"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-2 uppercase font-label tracking-tighter text-on-surface-variant">
                        <span>Stress Level</span>
                        <span className={`${styles.accent} font-bold`}>
                          {career.stress}
                        </span>
                      </div>
                      <StressBar
                        percent={career.stressPercent}
                        color={career.color}
                      />
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  className={`mt-8 w-full py-4 rounded-xl border border-outline-variant/30 font-headline font-bold text-sm transition-all duration-300 active:scale-95 relative z-10 ${
                    isHighlight
                      ? "bg-gradient-to-r from-primary to-primary-container text-on-primary-container shadow-xl shadow-primary-container/20 hover:brightness-110 border-0"
                      : `${styles.accent} hover:bg-white/5`
                  }`}
                >
                  Analyze Path
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
