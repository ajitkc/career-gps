"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Activity, ArrowRight, Zap, BookOpen } from "lucide-react";
import { useStore } from "@/lib/store";
import CityCareerMap from "@/components/app/CityCareerMap";

const card = "bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10";

export default function CareersPage() {
  const { profile, analysis } = useStore();
  const [selectedCareer, setSelectedCareer] = useState<{ idx: number; ts: number } | null>(null);

  if (!profile || !analysis) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-primary font-label text-[10px] tracking-[0.3em] uppercase font-bold">Discover</span>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mt-1">Choose Your Lane</h1>
        <p className="text-on-surface-variant text-sm mt-1">Different paths require different fuels. We&apos;ve mapped the terrain for your most suited careers.</p>
      </motion.div>

      {/* Career Cards with Growth/Stress bars */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {analysis.career_matches.map((career, i) => {
          const growthPct = career.growth === "High" ? 85 + i * 4 : career.growth === "Medium" ? 60 + i * 5 : 35 + i * 5;
          const stressSegs = career.stress_level === "High" ? 4 : career.stress_level === "Medium" ? 2 : 1;
          return (
            <div key={career.title} className={`${card} space-y-5 transition-colors duration-200 hover:border-primary/25 cursor-pointer`}
              onClick={() => setSelectedCareer({ idx: i, ts: Date.now() })}>
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Growth</div>
                  <div className="text-xl font-headline font-extrabold text-primary">+{growthPct}%</div>
                </div>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg">{career.title}</h3>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">{career.fit_reason}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold mb-2">
                  <span className="text-on-surface-variant">Growth Potential</span>
                  <span className="text-primary">{growthPct}%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${growthPct}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.1 }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold mb-2">
                  <span className="text-on-surface-variant">Stress Level</span>
                  <span className="text-on-surface-variant">{career.stress_level}</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((seg) => (
                    <div key={seg} className={`h-2 flex-1 rounded-full ${seg <= stressSegs ? "bg-primary" : "bg-surface-container-highest"}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{career.difficulty}</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{career.stress_level} stress</span>
              </div>
              <button className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/15 rounded-xl text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary/25 transition-all flex items-center justify-center gap-2">
                Analyze Path <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </motion.div>

      {/* Career Comparison */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Career Comparison</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left py-3 text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Career</th>
                  <th className="text-center py-3 text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Difficulty</th>
                  <th className="text-center py-3 text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Growth</th>
                  <th className="text-center py-3 text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Stress</th>
                  <th className="text-center py-3 text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">First Role</th>
                  <th className="text-center py-3 text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">To Senior</th>
                </tr>
              </thead>
              <tbody>
                {analysis.career_matches.map((c, i) => (
                  <tr key={i} className="border-b border-outline-variant/5 last:border-0">
                    <td className="py-3 font-bold text-on-surface">{c.title}</td>
                    <td className={`py-3 text-center font-bold ${c.difficulty === "Hard" ? "text-tertiary" : c.difficulty === "Medium" ? "text-secondary" : "text-primary"}`}>{c.difficulty}</td>
                    <td className={`py-3 text-center font-bold ${c.growth === "High" ? "text-primary" : "text-on-surface-variant"}`}>{c.growth}</td>
                    <td className={`py-3 text-center font-bold ${c.stress_level === "High" ? "text-tertiary" : "text-on-surface-variant"}`}>{c.stress_level}</td>
                    <td className="py-3 text-center text-on-surface-variant">{c.estimated_timeline.to_first_role}</td>
                    <td className="py-3 text-center text-on-surface-variant">{c.estimated_timeline.to_senior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Interactive Map */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
        <div className="text-xs font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant">Interactive Career Map</div>
        <div className="relative h-[500px] md:h-[580px] rounded-2xl overflow-hidden border border-outline-variant/10">
          <CityCareerMap careers={analysis.career_matches} externalCareerIdx={selectedCareer?.idx ?? null} externalTs={selectedCareer?.ts ?? 0} />
        </div>
      </motion.div>

      {/* Resources */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-secondary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Learning Resources</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.resources.map((res, i) => (
              <a key={i} href={res.url} target="_blank" rel="noopener noreferrer"
                className="p-3 bg-surface-container rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all group">
                <div className="text-xs font-bold group-hover:text-primary transition-colors">{res.title}</div>
                <div className="text-[10px] text-on-surface-variant capitalize mt-0.5">{res.type}</div>
                <div className="text-[10px] text-on-surface-variant mt-1 line-clamp-1">{res.reason}</div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
