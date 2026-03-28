"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Maximize2, Minimize2, Zap, BookOpen, ArrowRight,
  TrendingUp, Flame, Shield, Activity, User,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { GlowCard } from "@/components/ui/spotlight-card";
import CityCareerMap from "@/components/app/CityCareerMap";

export default function DashboardPage() {
  const { profile, analysis, burnoutScore } = useStore();
  const [fullscreen, setFullscreen] = useState(false);

  if (!profile || !analysis) return null;

  const roadmap = analysis.roadmap;

  // Fullscreen — map takes the entire screen
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#14161a]">
        <CityCareerMap careers={analysis.career_matches} />
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-20 z-30 w-10 h-10 bg-[#1a1c20]/90 backdrop-blur-xl border border-[#2a2d32] rounded-xl flex items-center justify-center text-[#8e90a2] hover:text-white hover:bg-[#2a2d32] transition-all shadow-xl"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary font-label text-[10px] tracking-[0.3em] uppercase font-bold">
              Your Journey
            </span>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
              Career Roadmap
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              {roadmap.current_stage}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-surface-container-high rounded-xl px-4 py-3 border border-outline-variant/10">
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Paths
              </div>
              <div className="font-headline font-bold text-primary text-lg">
                {analysis.career_matches.length}
              </div>
            </div>
            <div className="bg-surface-container-high rounded-xl px-4 py-3 border border-outline-variant/10">
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Burnout
              </div>
              <div
                className={`font-headline font-bold text-lg capitalize ${
                  burnoutScore?.level === "low"
                    ? "text-primary"
                    : burnoutScore?.level === "medium"
                    ? "text-secondary"
                    : "text-tertiary"
                }`}
              >
                {burnoutScore?.level || "—"}
              </div>
            </div>
            <button
              onClick={() => setFullscreen(true)}
              className="bg-surface-container-high hover:bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/10 hover:border-primary/20 transition-all flex items-center gap-2 text-on-surface-variant hover:text-primary"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Fullscreen</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative h-[500px] md:h-[580px] rounded-2xl overflow-hidden border border-outline-variant/10"
      >
        <CityCareerMap careers={analysis.career_matches} />
      </motion.div>

      {/* Career Matches Strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {analysis.career_matches.map((career, i) => (
          <GlowCard key={career.title}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-headline font-bold text-sm">{career.title}</h4>
              {i === 0 && (
                <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                  Top Match
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                {career.growth}
              </span>
              <span className="flex items-center gap-1">
                <Flame
                  className={`w-3 h-3 ${
                    career.stress_level === "High" ? "text-tertiary" : "text-on-surface-variant"
                  }`}
                />
                {career.stress_level}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {career.difficulty}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
              {career.fit_reason}
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-[10px] text-on-surface-variant">
              {career.progression.slice(0, 3).map((role, j) => (
                <span key={j} className="flex items-center gap-1">
                  {j > 0 && <ArrowRight className="w-2.5 h-2.5 text-outline" />}
                  <span className="truncate max-w-[80px]">{role}</span>
                </span>
              ))}
              {career.progression.length > 3 && (
                <span className="text-outline">+{career.progression.length - 3}</span>
              )}
            </div>
          </GlowCard>
        ))}
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Next 30-Day Focus */}
        <GlowCard className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
              Next 30-Day Focus
            </span>
          </div>
          {roadmap.next_30_days.length > 0 ? (
            <div className="space-y-4">
              {roadmap.next_30_days.map((step, i) => (
                <div key={i}>
                  <h4 className="font-headline font-bold text-sm">{step.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {step.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {step.tasks.slice(0, 3).map((task, j) => (
                      <span
                        key={j}
                        className="px-2.5 py-1 bg-surface-container rounded-lg text-[10px] text-on-surface-variant border border-outline-variant/5"
                      >
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              No immediate actions defined.
            </p>
          )}
        </GlowCard>

        {/* Resources */}
        <GlowCard>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-secondary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
              Top Resources
            </span>
          </div>
          <div className="space-y-3">
            {analysis.resources.slice(0, 4).map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="text-xs font-bold group-hover:text-primary transition-colors truncate">
                  {res.title}
                </div>
                <div className="text-[10px] text-on-surface-variant capitalize">
                  {res.type}
                </div>
              </a>
            ))}
          </div>
        </GlowCard>
      </motion.div>

      {/* Burnout Quick Glance + Profile */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Burnout */}
        {burnoutScore && (
          <a href="/burnout" className="block group">
            <GlowCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-tertiary" />
                  <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                    Burnout Monitor
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`font-headline text-4xl font-extrabold ${
                    burnoutScore.level === "low"
                      ? "text-primary"
                      : burnoutScore.level === "medium"
                      ? "text-secondary"
                      : "text-tertiary"
                  }`}
                >
                  {burnoutScore.score}
                </div>
                <div>
                  <div className="text-sm font-bold capitalize">
                    {burnoutScore.level} Risk
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {burnoutScore.riskWindow}
                  </div>
                </div>
              </div>
              {burnoutScore.factors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap gap-2">
                  {burnoutScore.factors.slice(0, 3).map((f, i) => (
                    <span
                      key={i}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        f.impact === "high"
                          ? "bg-tertiary/10 text-tertiary"
                          : f.impact === "medium"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              )}
            </GlowCard>
          </a>
        )}

        {/* Profile Quick */}
        <a href="/profile" className="block group">
          <GlowCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                  Your Profile
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                <User className="w-6 h-6 text-on-primary" />
              </div>
              <div>
                <div className="font-headline font-bold">{profile?.name}</div>
                <div className="text-xs text-on-surface-variant">
                  {profile?.education}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap gap-1.5">
              {profile?.skills.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-medium"
                >
                  {s}
                </span>
              ))}
              {(profile?.skills.length ?? 0) > 4 && (
                <span className="text-[10px] text-outline">
                  +{(profile?.skills.length ?? 0) - 4}
                </span>
              )}
            </div>
          </GlowCard>
        </a>
      </motion.div>
    </div>
  );
}
