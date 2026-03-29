"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, MapPin, Clock, Zap, Target } from "lucide-react";
import { useStore } from "@/lib/store";

const card = "bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10";

export default function RoadmapPage() {
  const { profile, analysis } = useStore();

  if (!profile || !analysis) return null;

  const roadmap = analysis.roadmap;
  const topCareer = analysis.career_matches[0];

  const milestones = [
    { label: "Day 1", title: "The Spark — Initial Vector", data: roadmap.next_30_days[0], status: "completed" as const },
    { label: "Week 1", title: "Velocity — Building Momentum", data: roadmap.next_30_days[1], status: "current" as const },
    { label: "Month 1-3", title: "Steady Ascension — Real Progress", data: roadmap.next_3_months[0], status: "upcoming" as const },
    { label: "Month 3-6", title: "Establishing Credibility", data: roadmap.next_6_months[0], status: "upcoming" as const },
    { label: "Month 6-12", title: "Specialization & Mastery", data: roadmap.next_12_months[0], status: "locked" as const },
  ].filter((m) => m.data);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-primary font-label text-[10px] tracking-[0.3em] uppercase font-bold">Your Journey</span>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mt-1">Milestone Blueprint</h1>
        <p className="text-on-surface-variant text-sm mt-1">Scroll through your career checkpoints. Each milestone maps to your actual skills and goals.</p>
      </motion.div>

      {/* Milestone Timeline */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="space-y-0">
          {milestones.map((milestone, i) => (
            <div key={i} className="flex gap-4 md:gap-8">
              {/* Timeline column */}
              <div className="flex flex-col items-center w-24 flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  milestone.status === "completed" ? "bg-primary text-on-primary" :
                  milestone.status === "current" ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-surface" :
                  "bg-surface-container-high text-on-surface-variant"
                }`}>
                  {milestone.status === "completed" ? <CheckCircle2 className="w-6 h-6" /> :
                   milestone.status === "current" ? <MapPin className="w-6 h-6" /> :
                   <Circle className="w-6 h-6" />}
                </div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-2">{milestone.label}</div>
                <div className="text-[10px] text-on-surface-variant text-center leading-tight mt-0.5">{milestone.title.split("—")[0]?.trim()}</div>
                {i < milestones.length - 1 && <div className={`w-px flex-1 min-h-8 mt-2 ${milestone.status === "completed" ? "bg-primary/40" : "bg-outline-variant/20"}`} />}
              </div>
              {/* Card */}
              <div className={`flex-1 mb-6 ${card} ${milestone.status === "current" ? "border-primary/30 shadow-[0_0_20px_-4px_rgba(59,130,246,0.15)]" : ""}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/15 text-primary px-2.5 py-1 rounded-full">{milestone.label}</span>
                  {milestone.status === "completed" && <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Completed</span>}
                  {milestone.status === "current" && <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Current</span>}
                </div>
                <h3 className="font-headline font-bold text-lg">{milestone.title}</h3>
                <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">{milestone.data!.description}</p>
                <div className="mt-4 space-y-2">
                  {milestone.data!.tasks.map((task, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${milestone.status === "completed" ? "text-primary" : "text-on-surface-variant"}`}>
                        {milestone.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </div>
                      <span className="text-sm text-on-surface-variant">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Career Path Progression */}
      {topCareer && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <div className="text-xs font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            {topCareer.title}, Your Path
          </div>
          <div className={card}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-headline font-bold text-xl">{topCareer.title}</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Difficulty: {topCareer.difficulty} · Growth: {topCareer.growth}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Est. Duration</span>
                </div>
                <div className="font-headline font-bold text-lg text-primary">{topCareer.estimated_timeline.to_senior || "4-6 years"}</div>
              </div>
            </div>
            <div className="space-y-0">
              {topCareer.progression.map((role, i) => {
                const isCompleted = i === 0;
                const isCurrent = i === 1;
                const durations = ["Day 1-5", "Week 1-2", "Month 1", "Month 3", "Month 6", "Year 1"];
                return (
                  <div key={i} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-primary flex-shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_var(--color-primary)]">
                          <div className="w-3 h-3 rounded-full bg-white" />
                        </div>
                      ) : (
                        <Circle className="w-7 h-7 text-outline flex-shrink-0" />
                      )}
                      {i < topCareer.progression.length - 1 && (
                        <div className={`w-px flex-1 min-h-12 ${isCompleted ? "bg-primary/40" : "bg-outline-variant/20"}`} />
                      )}
                    </div>
                    <div className={`pb-6 ${!isCompleted && !isCurrent ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-headline font-bold ${isCurrent ? "text-primary text-base" : "text-sm"}`}>{role}</span>
                        {isCurrent && <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Current</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{durations[i] || `Month ${i * 3}`}</span>
                      </div>
                      {isCurrent && (
                        <p className="text-xs text-on-surface-variant mt-1.5">
                          Focus on building practical experience with {profile.skills.slice(0, 2).join(" and ") || "your core skills"}.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* All Career Progressions */}
      {analysis.career_matches.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <div className="text-xs font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant">All Career Progressions</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.career_matches.slice(1).map((career, ci) => (
              <div key={ci} className={card}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-headline font-bold">{career.title}</h4>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">{career.estimated_timeline.to_senior}</span>
                  </div>
                </div>
                <div className="space-y-0">
                  {career.progression.map((role, j) => (
                    <div key={j} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {j === 0 ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" /> : <Circle className="w-5 h-5 text-outline flex-shrink-0" />}
                        {j < career.progression.length - 1 && <div className={`w-px flex-1 min-h-6 ${j === 0 ? "bg-primary/40" : "bg-outline-variant/20"}`} />}
                      </div>
                      <div className="pb-3">
                        <span className={`text-xs font-bold ${j === 0 ? "" : "text-on-surface-variant"}`}>{role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
