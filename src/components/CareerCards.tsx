"use client";

import { motion } from "framer-motion";
import { Palette, Megaphone, BarChart3 } from "lucide-react";
import SectionBadge from "./ui/section-badge";
import { GlowCard } from "./ui/spotlight-card";
import AnimatedButton from "./ui/animated-button";
import { careers } from "@/data/careers";

const iconMap: Record<string, React.ElementType> = { Palette, Megaphone, BarChart3 };

function StressBar({ percent }: { percent: number }) {
  const segments = 4;
  const filled = Math.ceil((percent / 100) * segments);
  return (
    <div className="h-1.5 rounded-full flex gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} className={`h-full flex-1 rounded-full transition-all ${
          i < filled ? "bg-primary/60" : "bg-surface-container-high"
        }`} />
      ))}
    </div>
  );
}

export default function CareerCards() {
  return (
    <section id="careers" className="py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header — centered, consistent style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-20"
        >
          <SectionBadge>Discover</SectionBadge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4">
            <span className="font-headline font-bold">Choose Your </span>
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container pr-1">Lane</span>
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-base md:text-lg font-body">
            Different paths require different fuels. We&apos;ve mapped the terrain for the world&apos;s most sought-after careers.
          </p>
        </motion.div>

        {/* Cards — GlowCard with brand glow */}
        <div className="grid md:grid-cols-3 gap-8">
          {careers.map((career, i) => {
            const Icon = iconMap[career.icon];

            return (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.4, 0, 0.2, 1] }}
              >
                <GlowCard glowColor="blue" className="h-full flex flex-col group">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      {Icon && <Icon className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-label text-on-surface-variant/50 uppercase tracking-widest">Growth</span>
                      <span className="text-primary font-headline font-bold text-lg">{career.growth}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{career.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-body mb-6">{career.description}</p>

                  {/* Metrics */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5 uppercase font-label tracking-widest text-on-surface-variant/60">
                        <span>Growth Potential</span>
                        <span className="text-primary font-bold">{career.growthPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${career.growthPercent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5 uppercase font-label tracking-widest text-on-surface-variant/60">
                        <span>Stress Level</span>
                        <span className="font-bold">{career.stress}</span>
                      </div>
                      <StressBar percent={career.stressPercent} />
                    </div>
                  </div>

                  {/* CTA — navigates to onboarding */}
                  <div className="mt-auto pt-2 flex justify-start">
                    <AnimatedButton href="/onboarding" size="sm" variant="outline">
                      Analyze Path
                    </AnimatedButton>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
