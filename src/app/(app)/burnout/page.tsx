"use client";

import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, Heart, Shield, Clock,
  TrendingDown, Moon, Briefcase, GraduationCap, Brain,
} from "lucide-react";
import { useStore } from "@/lib/store";

function Gauge({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 60 ? "var(--color-tertiary-container)" : score >= 35 ? "var(--color-secondary)" : "var(--color-primary)";

  return (
    <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
      {/* Background arc */}
      <path
        d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
        fill="none"
        stroke="var(--color-surface-container-highest)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Progress arc */}
      <path
        d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
      {/* Score text */}
      <text
        x={size / 2}
        y={size / 2 - 5}
        textAnchor="middle"
        className="text-3xl font-headline"
        fill="var(--color-on-surface)"
        fontWeight="800"
      >
        {score}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 15}
        textAnchor="middle"
        className="text-[10px] uppercase"
        fill="var(--color-on-surface-variant)"
        fontWeight="700"
        letterSpacing="0.1em"
      >
        / 100
      </text>
    </svg>
  );
}

function TrafficRoad({ level }: { level: "low" | "medium" | "high" }) {
  const blockCount = level === "low" ? 4 : level === "medium" ? 8 : 14;
  const color =
    level === "low" ? "bg-primary/25" : level === "medium" ? "bg-secondary/35" : "bg-tertiary-container/50";
  return (
    <div className="relative h-28 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
      <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-outline-variant/20 -translate-x-1/2" />
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1.5 p-4">
        {Array.from({ length: blockCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className={`w-7 h-3.5 rounded-sm ${color} ${
              level === "high" && i < 4 ? "burnout-pulse" : ""
            }`}
          />
        ))}
      </div>
      {level === "high" && (
        <div className="absolute inset-0 bg-gradient-to-t from-tertiary-container/15 to-transparent pointer-events-none" />
      )}
      <div className="absolute bottom-2 right-3 text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">
        {level === "low" ? "Clear Road" : level === "medium" ? "Moderate Traffic" : "Heavy Traffic"}
      </div>
    </div>
  );
}

export default function BurnoutPage() {
  const { profile, burnoutScore, analysis } = useStore();

  if (!profile || !burnoutScore || !analysis) return null;

  const burnout = analysis.burnout;
  const levelColor =
    burnoutScore.level === "low"
      ? "text-primary"
      : burnoutScore.level === "medium"
      ? "text-secondary"
      : "text-tertiary";

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-tertiary font-label text-[10px] tracking-[0.3em] uppercase font-bold">
          Vital Monitoring
        </span>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
          Burnout Monitor
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Your mental load, tracked honestly. No sugarcoating.
        </p>
      </motion.div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10 flex flex-col items-center"
        >
          <Gauge score={burnoutScore.score} />
          <div className={`font-headline text-2xl font-extrabold capitalize mt-2 ${levelColor}`}>
            {burnoutScore.level} Risk
          </div>
          <div className="flex items-center gap-2 mt-2 text-on-surface-variant text-sm">
            <Clock className="w-4 h-4" />
            {burnoutScore.riskWindow}
          </div>
        </motion.div>

        {/* Traffic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10 space-y-4"
        >
          <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
            Traffic Level
          </div>
          <TrafficRoad level={burnoutScore.level} />
          <p className="text-xs text-on-surface-variant leading-relaxed italic">
            {burnoutScore.level === "low"
              ? "Smooth sailing. Your current pace looks sustainable."
              : burnoutScore.level === "medium"
              ? "Traffic is building. Minor adjustments now prevent a full stop later."
              : "Red zone. Your roadmap needs a recovery detour immediately."}
          </p>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Your Stats
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-high rounded-xl p-5 border border-outline-variant/10 text-center">
            <Briefcase className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-headline text-2xl font-extrabold">{profile.weeklyWorkHours}h</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              Work / Week
            </div>
          </div>
          <div className="bg-surface-container-high rounded-xl p-5 border border-outline-variant/10 text-center">
            <GraduationCap className="w-5 h-5 text-secondary mx-auto mb-2" />
            <div className="font-headline text-2xl font-extrabold">{profile.weeklyStudyHours}h</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              Study / Week
            </div>
          </div>
          <div className="bg-surface-container-high rounded-xl p-5 border border-outline-variant/10 text-center">
            <Moon className="w-5 h-5 text-tertiary mx-auto mb-2" />
            <div className="font-headline text-2xl font-extrabold capitalize">{profile.sleepQuality}</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              Sleep Quality
            </div>
          </div>
          <div className="bg-surface-container-high rounded-xl p-5 border border-outline-variant/10 text-center">
            <Brain className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-headline text-2xl font-extrabold capitalize">
              {profile.emotionalState.replace("_", " ")}
            </div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              Mood
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contributing Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-tertiary" />
          <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
            Contributing Factors
          </span>
        </div>
        <div className="space-y-3">
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
              <span className="text-sm text-on-surface-variant flex-1">{factor.label}</span>
              <span
                className={`text-[10px] font-bold uppercase ${
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
      </motion.div>

      {/* AI Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-tertiary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
              What We Noticed
            </span>
          </div>
          <ul className="space-y-3">
            {burnout.reasons.map((reason, i) => (
              <li key={i} className="text-sm text-on-surface-variant leading-relaxed flex gap-2">
                <span className="text-tertiary mt-0.5">-</span>
                {reason}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
              What To Do About It
            </span>
          </div>
          <div className="space-y-2">
            {burnout.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-container rounded-xl">
                <Heart className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-on-surface-variant">{rec}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
