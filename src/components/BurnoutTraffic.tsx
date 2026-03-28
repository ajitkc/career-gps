"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Heart, Activity, Shield } from "lucide-react";
import type { BurnoutRisk } from "@/data/careers";

const burnoutLevels: { risk: BurnoutRisk; label: string; description: string }[] = [
  { risk: "low", label: "Light Traffic", description: "Smooth sailing. Your pace is sustainable." },
  { risk: "medium", label: "Moderate Traffic", description: "Approaching limits. Minor adjustments recommended." },
  { risk: "high", label: "Heavy Traffic", description: "Burnout zone. Immediate recovery needed." },
];

function TrafficLane({ risk }: { risk: BurnoutRisk }) {
  const blockCount = risk === "low" ? 3 : risk === "medium" ? 6 : 10;
  const blockColor =
    risk === "low"
      ? "bg-primary/30"
      : risk === "medium"
      ? "bg-secondary/40"
      : "bg-tertiary-container/60";
  const glowClass = risk === "high" ? "burnout-pulse" : "";

  return (
    <div className="relative w-full h-48 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
      {/* Road center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-outline-variant/30 -translate-x-1/2" />

      {/* Traffic blocks */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-4">
        {Array.from({ length: blockCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`w-8 h-4 rounded-sm ${blockColor} ${
              risk === "high" && i < 4 ? glowClass : ""
            }`}
          />
        ))}
      </div>

      {/* Red glow overlay for high burnout */}
      {risk === "high" && (
        <div className="absolute inset-0 bg-gradient-to-t from-tertiary-container/20 to-transparent pointer-events-none" />
      )}

      {/* Label */}
      <div className="absolute bottom-3 left-3">
        <span
          className={`text-[10px] uppercase tracking-widest font-bold ${
            risk === "low"
              ? "text-primary"
              : risk === "medium"
              ? "text-secondary"
              : "text-tertiary"
          }`}
        >
          {risk === "low" ? "Clear" : risk === "medium" ? "Moderate" : "Congested"}
        </span>
      </div>
    </div>
  );
}

export default function BurnoutTraffic() {
  const [activeRisk, setActiveRisk] = useState<BurnoutRisk>("high");
  const activeLevel = burnoutLevels.find((l) => l.risk === activeRisk)!;

  return (
    <section id="burnout" className="py-32 bg-surface-container-low relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#d02a30_0%,transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="bg-tertiary-container/20 text-tertiary px-4 py-1 rounded-full text-xs font-bold font-label tracking-widest uppercase mb-6 inline-block">
            Vital Monitoring
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8">
            Avoid the Red Zones
          </h2>
          <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
            Most roadmaps ignore the driver. We don&apos;t. Our AI monitors your
            velocity and detects signs of fatigue before you hit the wall.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface/50 border border-tertiary/20 group hover:border-tertiary/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface">
                  Dynamic Fatigue Detection
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Real-time alerts when task density exceeds recovery capacity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface/50 border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface">
                  Auto-Correcting Pace
                </h4>
                <p className="text-sm text-on-surface-variant">
                  The road widens and slows down when your stress meter peaks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface/50 border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface">
                  Recovery Protocols
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Scheduled recovery periods auto-injected into your roadmap.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right — Traffic Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-6"
        >
          {/* Risk Toggle */}
          <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
            {burnoutLevels.map((level) => (
              <button
                key={level.risk}
                onClick={() => setActiveRisk(level.risk)}
                className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold font-label uppercase tracking-wider transition-all ${
                  activeRisk === level.risk
                    ? level.risk === "low"
                      ? "bg-primary/20 text-primary"
                      : level.risk === "medium"
                      ? "bg-secondary/20 text-secondary"
                      : "bg-tertiary-container/30 text-tertiary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {level.risk}
              </button>
            ))}
          </div>

          {/* Traffic Visualization */}
          <TrafficLane risk={activeRisk} />

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container rounded-xl p-4 text-center">
              <Activity className="w-4 h-4 text-primary mx-auto mb-2" />
              <span className="text-[10px] text-on-surface-variant uppercase block">
                Focus
              </span>
              <span className="font-headline font-bold text-primary">
                {activeRisk === "high" ? "32%" : activeRisk === "medium" ? "61%" : "88%"}
              </span>
            </div>
            <div className="bg-surface-container rounded-xl p-4 text-center">
              <AlertTriangle className="w-4 h-4 text-tertiary mx-auto mb-2" />
              <span className="text-[10px] text-on-surface-variant uppercase block">
                Stress
              </span>
              <span className="font-headline font-bold text-tertiary">
                {activeRisk === "high" ? "89%" : activeRisk === "medium" ? "54%" : "18%"}
              </span>
            </div>
            <div className="bg-surface-container rounded-xl p-4 text-center">
              <Heart className="w-4 h-4 text-secondary mx-auto mb-2" />
              <span className="text-[10px] text-on-surface-variant uppercase block">
                Recovery
              </span>
              <span className="font-headline font-bold text-secondary">
                {activeRisk === "high" ? "12%" : activeRisk === "medium" ? "45%" : "91%"}
              </span>
            </div>
          </div>

          {/* Alert Card */}
          {activeRisk === "high" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-tertiary-container border border-tertiary/30 neon-glow-tertiary"
            >
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-on-tertiary-container" />
                <span className="font-bold text-on-tertiary-container">
                  High burnout risk detected
                </span>
              </div>
              <p className="text-sm text-on-tertiary-container/80">
                Velocity exceeding baseline by 42%. Schedule a recovery period
                immediately.
              </p>
            </motion.div>
          )}

          {activeRisk === "medium" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-secondary-container/20 border border-secondary/20"
            >
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-secondary" />
                <span className="font-bold text-on-surface">
                  {activeLevel.label}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                {activeLevel.description}
              </p>
            </motion.div>
          )}

          {activeRisk === "low" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-primary/10 border border-primary/20"
            >
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-bold text-on-surface">
                  {activeLevel.label}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                {activeLevel.description}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
