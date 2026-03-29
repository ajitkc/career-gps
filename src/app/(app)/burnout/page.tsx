"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, Heart, Shield, Clock,
  TrendingDown, Moon, Briefcase, GraduationCap, Brain, Pencil, Check, X, Zap,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { calculateBurnoutScore } from "@/lib/burnout";

const card = "bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10";
const cardStat = "bg-surface-container-high rounded-xl p-5 border border-outline-variant/10 text-center";

function Gauge({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 60 ? "var(--color-tertiary-container)" : score >= 35 ? "var(--color-secondary)" : "var(--color-primary)";
  return (
    <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
      <path d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`} fill="none" stroke="var(--color-surface-container-highest)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      <text x={size / 2} y={size / 2 - 5} textAnchor="middle" className="text-3xl font-headline" fill="var(--color-on-surface)" fontWeight="800">{score}</text>
      <text x={size / 2} y={size / 2 + 15} textAnchor="middle" className="text-[10px] uppercase" fill="var(--color-on-surface-variant)" fontWeight="700" letterSpacing="0.1em">/ 100</text>
    </svg>
  );
}

function TrafficRoad({ level }: { level: "low" | "medium" | "high" }) {
  const blockCount = level === "low" ? 4 : level === "medium" ? 8 : 14;
  const color = level === "low" ? "bg-primary/25" : level === "medium" ? "bg-secondary/35" : "bg-tertiary-container/50";
  return (
    <div className="relative h-28 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
      <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-outline-variant/20 -translate-x-1/2" />
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1.5 p-4">
        {Array.from({ length: blockCount }).map((_, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04, duration: 0.3 }}
            className={`w-7 h-3.5 rounded-sm ${color} ${level === "high" && i < 4 ? "burnout-pulse" : ""}`} />
        ))}
      </div>
      {level === "high" && <div className="absolute inset-0 bg-gradient-to-t from-tertiary-container/15 to-transparent pointer-events-none" />}
      <div className="absolute bottom-2 right-3 text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">
        {level === "low" ? "Clear Road" : level === "medium" ? "Moderate Traffic" : "Heavy Traffic"}
      </div>
    </div>
  );
}

export default function BurnoutPage() {
  const store = useStore();
  const { profile, burnoutScore, analysis } = store;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{ weeklyWorkHours: number; weeklyStudyHours: number; sleepQuality: "poor" | "fair" | "good" | "great"; emotionalState: import("@/types").EmotionalState }>({ weeklyWorkHours: 0, weeklyStudyHours: 0, sleepQuality: "fair", emotionalState: "neutral" });

  if (!profile || !burnoutScore || !analysis) return null;

  const burnout = analysis.burnout;
  const levelColor = burnoutScore.level === "low" ? "text-primary" : burnoutScore.level === "medium" ? "text-secondary" : "text-tertiary";
  const topCareer = analysis.career_matches[0]?.title || "your career";

  const startEdit = () => {
    setDraft({ weeklyWorkHours: profile.weeklyWorkHours, weeklyStudyHours: profile.weeklyStudyHours, sleepQuality: profile.sleepQuality, emotionalState: profile.emotionalState });
    setEditing(true);
  };
  const discard = () => setEditing(false);
  const save = async () => {
    const updated = { ...profile, ...draft };
    store.setProfile(updated);
    store.setBurnoutScore(calculateBurnoutScore(updated));
    setEditing(false);
    if (store.profileId) {
      try {
        await fetch("/api/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: store.profileId, profile: draft }),
        });
      } catch { /* silent */ }
    }
  };

  // Personalized next steps
  const totalHours = profile.weeklyWorkHours + profile.weeklyStudyHours;
  const nextSteps = [];
  if (burnoutScore.level === "high") {
    nextSteps.push("Immediately reduce your weekly hours by at least 10h");
    nextSteps.push("Take 2-3 complete rest days this week");
    nextSteps.push("Talk to someone you trust about how you're feeling");
  } else if (burnoutScore.level === "medium") {
    nextSteps.push("Set a hard stop time for study each day");
    nextSteps.push("Schedule one full rest day per week");
  }
  if (profile.sleepQuality === "poor" || profile.sleepQuality === "fair") {
    nextSteps.push(`Improve sleep: aim for 8 hours for 5 consecutive nights`);
  }
  if (totalHours >= 50) {
    nextSteps.push(`Cut total weekly hours from ${totalHours}h to under 45h`);
  }
  nextSteps.push(`Focus on one ${topCareer} skill this week instead of many`);
  nextSteps.push("20-minute daily walk — proven to reduce cognitive fatigue");

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-tertiary font-label text-[10px] tracking-[0.3em] uppercase font-bold">Vital Monitoring</span>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mt-1">Burnout Monitor</h1>
        <p className="text-on-surface-variant text-sm mt-1">Your mental load, tracked honestly. No sugarcoating.</p>
      </motion.div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className={`${card} flex flex-col items-center justify-center py-8 h-full`}>
            <Gauge score={burnoutScore.score} />
            <div className={`font-headline text-2xl font-extrabold capitalize mt-2 ${levelColor}`}>{burnoutScore.level} Risk</div>
            <div className="flex items-center gap-2 mt-2 text-on-surface-variant text-sm"><Clock className="w-4 h-4" />{burnoutScore.riskWindow}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className={`${card} flex flex-col space-y-4 py-8 h-full`}>
            <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Traffic Level</div>
            <TrafficRoad level={burnoutScore.level} />
            <p className="text-xs text-on-surface-variant leading-relaxed italic">
              {burnoutScore.level === "low" ? "Smooth sailing. Your current pace looks sustainable."
                : burnoutScore.level === "medium" ? "Traffic is building. Minor adjustments now prevent a full stop later."
                : "Red zone. Your roadmap needs a recovery detour immediately."}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Editable Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Your Stats</span>
            {!editing ? (
              <button onClick={startEdit} className="ml-auto p-1 rounded-md hover:bg-surface-container transition-colors"><Pencil className="w-3.5 h-3.5 text-on-surface-variant" /></button>
            ) : (
              <div className="ml-auto flex gap-2">
                <button onClick={discard} className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant border border-outline-variant/15 hover:bg-surface-container transition-all">Discard</button>
                <button onClick={save} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:brightness-110 transition-all">Save</button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={cardStat}><Briefcase className="w-5 h-5 text-primary mx-auto mb-2" /><div className="font-headline text-2xl font-extrabold">{profile.weeklyWorkHours}h</div><div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Work / Week</div></div>
              <div className={cardStat}><GraduationCap className="w-5 h-5 text-secondary mx-auto mb-2" /><div className="font-headline text-2xl font-extrabold">{profile.weeklyStudyHours}h</div><div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Study / Week</div></div>
              <div className={cardStat}><Moon className="w-5 h-5 text-tertiary mx-auto mb-2" /><div className="font-headline text-2xl font-extrabold capitalize">{profile.sleepQuality}</div><div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Sleep</div></div>
              <div className={cardStat}><Brain className="w-5 h-5 text-primary mx-auto mb-2" /><div className="font-headline text-2xl font-extrabold capitalize">{profile.emotionalState.replace("_", " ")}</div><div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Mood</div></div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-primary" /> Work hours</label><span className="font-headline font-bold text-primary">{draft.weeklyWorkHours}h</span></div>
                <input type="range" min={0} max={80} value={draft.weeklyWorkHours} onChange={(e) => setDraft((d) => ({ ...d, weeklyWorkHours: Number(e.target.value) }))} className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-secondary" /> Study hours</label><span className="font-headline font-bold text-secondary">{draft.weeklyStudyHours}h</span></div>
                <input type="range" min={0} max={60} value={draft.weeklyStudyHours} onChange={(e) => setDraft((d) => ({ ...d, weeklyStudyHours: Number(e.target.value) }))} className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary" />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2"><Moon className="w-3.5 h-3.5 text-tertiary" /> Sleep quality</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(["poor", "fair", "good", "great"] as const).map((q) => (
                    <button key={q} type="button" onClick={() => setDraft((d) => ({ ...d, sleepQuality: q }))}
                      className={`py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${draft.sleepQuality === q ? "border-primary/40 bg-primary/10 text-primary" : "border-outline-variant/15 text-on-surface-variant hover:bg-surface-container"}`}>{q}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2"><Brain className="w-3.5 h-3.5 text-primary" /> Mood</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(["motivated", "excited", "neutral", "anxious", "stuck", "overwhelmed", "burned_out"] as const).map((e) => (
                    <button key={e} type="button" onClick={() => setDraft((d) => ({ ...d, emotionalState: e }))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold capitalize transition-all ${draft.emotionalState === e ? "border-primary/40 bg-primary/10 text-primary" : "border-outline-variant/15 text-on-surface-variant hover:bg-surface-container"}`}>{e.replace("_", " ")}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Personalized Next Steps */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <div className={card}>
          <div className="flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-primary" /><span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">What You Should Do Next</span></div>
          <div className="space-y-2">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-container/50 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-[10px] font-bold text-primary">{i + 1}</span></div>
                <span className="text-sm text-on-surface-variant">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Contributing Factors */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className={card}>
          <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-tertiary" /><span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Contributing Factors</span></div>
          <div className="space-y-3">
            {burnoutScore.factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${factor.impact === "high" ? "bg-tertiary-container" : factor.impact === "medium" ? "bg-secondary" : "bg-primary"}`} />
                <span className="text-sm text-on-surface-variant flex-1">{factor.label}</span>
                <span className={`text-[10px] font-bold uppercase ${factor.impact === "high" ? "text-tertiary" : factor.impact === "medium" ? "text-secondary" : "text-primary"}`}>{factor.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className={`${card} h-full`}>
            <div className="flex items-center gap-2 mb-4"><TrendingDown className="w-4 h-4 text-tertiary" /><span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">What We Noticed</span></div>
            <ul className="space-y-3">
              {burnout.reasons.map((reason, i) => (
                <li key={i} className="text-sm text-on-surface-variant leading-relaxed flex gap-2"><span className="text-tertiary mt-0.5">-</span>{reason}</li>
              ))}
            </ul>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className={`${card} h-full`}>
            <div className="flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-primary" /><span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Recovery Protocol</span></div>
            <div className="space-y-2">
              {burnout.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-surface-container/50 rounded-xl"><Heart className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /><span className="text-sm text-on-surface-variant">{rec}</span></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
