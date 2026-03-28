"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Heart, Activity, Shield, Clock } from "lucide-react";
import type { BurnoutScore, BurnoutAssessment } from "@/types";

function TrafficVisualization({ level }: { level: BurnoutScore["level"] }) {
  const blockCount = level === "low" ? 3 : level === "medium" ? 7 : 12;
  const color =
    level === "low" ? "bg-primary/30" : level === "medium" ? "bg-secondary/40" : "bg-tertiary-container/60";

  return (
    <div className="relative h-20 bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10">
      <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-outline-variant/30 -translate-x-1/2" />
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1.5 p-3">
        {Array.from({ length: blockCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`w-6 h-3 rounded-sm ${color} ${level === "high" && i < 3 ? "burnout-pulse" : ""}`}
          />
        ))}
      </div>
      {level === "high" && (
        <div className="absolute inset-0 bg-gradient-to-t from-tertiary-container/15 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

export default function BurnoutSection({
  burnoutScore,
  burnoutAssessment,
}: {
  burnoutScore: BurnoutScore;
  burnoutAssessment: BurnoutAssessment;
}) {
  const levelColor =
    burnoutScore.level === "low"
      ? "text-primary"
      : burnoutScore.level === "medium"
      ? "text-secondary"
      : "text-tertiary";

  const levelBg =
    burnoutScore.level === "low"
      ? "bg-primary/10 border-primary/20"
      : burnoutScore.level === "medium"
      ? "bg-secondary/10 border-secondary/20"
      : "bg-tertiary-container/20 border-tertiary/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-headline text-xl font-bold">Burnout Monitor</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Your mental load, tracked honestly
          </p>
        </div>
        <Activity className="w-5 h-5 text-tertiary" />
      </div>

      <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10 space-y-6">
        {/* Score + Traffic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`rounded-xl border p-5 ${levelBg}`}>
            <div className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">
              Burnout Risk Score
            </div>
            <div className="flex items-end gap-3">
              <span className={`font-headline text-4xl font-extrabold ${levelColor}`}>
                {burnoutScore.score}
              </span>
              <span className="text-on-surface-variant text-sm mb-1">/ 100</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Clock className="w-3 h-3 text-on-surface-variant" />
              <span className="text-xs text-on-surface-variant">{burnoutScore.riskWindow}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">
              Traffic Level
            </div>
            <TrafficVisualization level={burnoutScore.level} />
            <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant">
              <span>Clear</span>
              <span>Moderate</span>
              <span>Congested</span>
            </div>
          </div>
        </div>

        {/* Contributing factors */}
        <div>
          <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            What&apos;s contributing
          </div>
          <div className="space-y-2">
            {burnoutScore.factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    factor.impact === "high"
                      ? "bg-tertiary-container"
                      : factor.impact === "medium"
                      ? "bg-secondary"
                      : "bg-primary"
                  }`}
                />
                <span className="text-sm text-on-surface-variant">{factor.label}</span>
                <span
                  className={`text-[10px] font-bold uppercase ml-auto ${
                    factor.impact === "high"
                      ? "text-tertiary"
                      : factor.impact === "medium"
                      ? "text-secondary"
                      : "text-primary"
                  }`}
                >
                  {factor.impact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LLM Reasons */}
        {burnoutAssessment.reasons.length > 0 && (
          <div className="bg-surface-container rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-tertiary" />
              <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                What we noticed
              </span>
            </div>
            <ul className="space-y-2">
              {burnoutAssessment.reasons.map((reason, i) => (
                <li key={i} className="text-sm text-on-surface-variant leading-relaxed flex gap-2">
                  <span className="text-outline mt-1">-</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
              What to do about it
            </span>
          </div>
          <div className="space-y-2">
            {burnoutAssessment.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-container rounded-xl">
                <Heart className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-on-surface-variant">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
