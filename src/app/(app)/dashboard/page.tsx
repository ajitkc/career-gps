"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Maximize2, Minimize2, Zap, BookOpen, ArrowRight,
  TrendingUp, Flame, Shield, Activity, User, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import CityCareerMap from "@/components/app/CityCareerMap";

const card = "bg-surface-container-high rounded-2xl p-5 border border-outline-variant/10 transition-colors duration-200 hover:border-primary/25";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant">{children}</div>;
}

function CareerCarousel({ careers, onSelect }: { careers: import("@/types").CareerMatch[]; onSelect: (i: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const isScrollable = careers.length > 3;

  const check = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 10,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 10,
    });
  }, []);

  const scroll = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const gap = 16;
    const cardW = (el.clientWidth - gap * 2) / 3;
    el.scrollBy({ left: dir * (cardW + gap), behavior: "smooth" });
  };

  const renderCard = (career: import("@/types").CareerMatch, i: number) => (
    <div key={career.title}
      className={`${card} cursor-pointer ${isScrollable ? "flex-shrink-0 snap-start" : ""}`}
      style={isScrollable ? { width: "calc((100% - 32px) / 3)" } : undefined}
      onClick={() => onSelect(i)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-headline font-bold text-sm">{career.title}</h4>
        {i === 0 && <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/15 text-primary px-2 py-0.5 rounded-full">Top Match</span>}
      </div>
      <div className="flex items-center gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" />{career.growth}</span>
        <span className="flex items-center gap-1"><Flame className={`w-3 h-3 ${career.stress_level === "High" ? "text-tertiary" : "text-on-surface-variant"}`} />{career.stress_level}</span>
        <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{career.difficulty}</span>
      </div>
      <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">{career.fit_reason}</p>
      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-on-surface-variant">
        {career.progression.slice(0, 3).map((role, j) => (
          <span key={j} className="flex items-center gap-1">
            {j > 0 && <ArrowRight className="w-2.5 h-2.5 text-outline" />}
            <span className="truncate max-w-[80px]">{role}</span>
          </span>
        ))}
        {career.progression.length > 3 && <span className="text-outline">+{career.progression.length - 3}</span>}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="space-y-3">
      {/* Section header with count + arrows */}
      <div className="flex items-center justify-between">
        <SectionTitle>Career Paths ({careers.length})</SectionTitle>
        {isScrollable && (
          <div className="flex items-center gap-2">
            <button onClick={() => scroll(-1)} disabled={!canScroll.left}
              className="w-7 h-7 rounded-full bg-surface-container border border-outline-variant/15 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/25 disabled:opacity-25 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => scroll(1)} disabled={!canScroll.right}
              className="w-7 h-7 rounded-full bg-surface-container border border-outline-variant/15 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/25 disabled:opacity-25 transition-all">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Cards */}
      <div ref={scrollRef} onScroll={check}
        className={isScrollable
          ? "flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          : "grid grid-cols-1 md:grid-cols-3 gap-4"
        }
        {...(isScrollable ? { onMouseEnter: check } : {})}
      >
        {careers.map((career, i) => renderCard(career, i))}
      </div>
    </motion.div>
  );
}
const cardStatic = "bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10";

export default function DashboardPage() {
  const { profile, analysis, burnoutScore, avatarUrl } = useStore();
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<{ idx: number; ts: number } | null>(null);

  if (!profile || !analysis) return null;

  const roadmap = analysis.roadmap;

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#14161a]">
        <CityCareerMap careers={analysis.career_matches} externalCareerIdx={selectedCareer?.idx ?? null} externalTs={selectedCareer?.ts ?? 0} />
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary font-label text-[10px] tracking-[0.3em] uppercase font-bold">Your Journey</span>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mt-1">Career Roadmap</h1>
            <p className="text-on-surface-variant text-sm mt-1">{roadmap.current_stage}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-surface-container-high rounded-xl px-4 py-3 border border-outline-variant/10">
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Paths</div>
              <div className="font-headline font-bold text-primary text-lg">{analysis.career_matches.length}</div>
            </div>
            <div className="bg-surface-container-high rounded-xl px-4 py-3 border border-outline-variant/10">
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Burnout</div>
              <div className={`font-headline font-bold text-lg capitalize ${burnoutScore?.level === "low" ? "text-primary" : burnoutScore?.level === "medium" ? "text-secondary" : "text-tertiary"}`}>
                {burnoutScore?.level || "—"}
              </div>
            </div>
            <button onClick={() => setFullscreen(true)}
              className="bg-surface-container-high hover:bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/10 hover:border-primary/20 transition-all flex items-center gap-2 text-on-surface-variant hover:text-primary">
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Fullscreen</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Map */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-4">
        <SectionTitle>Interactive Journey Map</SectionTitle>
        <div className="relative h-[500px] md:h-[580px] rounded-2xl overflow-hidden border border-outline-variant/10">
          <CityCareerMap careers={analysis.career_matches} externalCareerIdx={selectedCareer?.idx ?? null} externalTs={selectedCareer?.ts ?? 0} />
        </div>
      </motion.div>

      {/* Career Matches */}
      <CareerCarousel careers={analysis.career_matches} onSelect={(i) => setSelectedCareer({ idx: i, ts: Date.now() })} />

      {/* Roadmap & Resources */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4">
        <SectionTitle>Roadmap & Resources</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`md:col-span-2 ${cardStatic}`}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Next 30-Day Focus</span>
          </div>
          {roadmap.next_30_days.length > 0 ? (
            <div className="space-y-4">
              {roadmap.next_30_days.map((step, i) => (
                <div key={i}>
                  <h4 className="font-headline font-bold text-sm">{step.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{step.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {step.tasks.slice(0, 3).map((task, j) => (
                      <span key={j} className="px-2.5 py-1 bg-surface-container rounded-lg text-[10px] text-on-surface-variant border border-outline-variant/5">{task}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">No immediate actions defined.</p>
          )}
        </div>

        <div className={cardStatic}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-secondary" />
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Top Resources</span>
          </div>
          <div className="space-y-3">
            {analysis.resources.slice(0, 4).map((res, i) => (
              <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="text-xs font-bold group-hover:text-primary transition-colors truncate">{res.title}</div>
                <div className="text-[10px] text-on-surface-variant capitalize">{res.type}</div>
              </a>
            ))}
          </div>
        </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="space-y-4">
        <SectionTitle>Quick Links</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {burnoutScore && (
          <a href="/burnout" className={`block group ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-tertiary" />
                <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Burnout Monitor</span>
              </div>
              <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
            </div>
            <div className="flex items-center gap-4">
              <div className={`font-headline text-4xl font-extrabold ${burnoutScore.level === "low" ? "text-primary" : burnoutScore.level === "medium" ? "text-secondary" : "text-tertiary"}`}>{burnoutScore.score}</div>
              <div>
                <div className="text-sm font-bold capitalize">{burnoutScore.level} Risk</div>
                <div className="text-xs text-on-surface-variant">{burnoutScore.riskWindow}</div>
              </div>
            </div>
            {burnoutScore.factors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap gap-2">
                {burnoutScore.factors.slice(0, 3).map((f, i) => (
                  <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.impact === "high" ? "bg-tertiary/10 text-tertiary" : f.impact === "medium" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>{f.label}</span>
                ))}
              </div>
            )}
          </a>
        )}

        <a href="/profile" className={`block group ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Your Profile</span>
            </div>
            <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
          </div>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                <span className="text-lg font-bold text-on-primary uppercase">{profile?.name?.charAt(0) || "?"}</span>
              </div>
            )}
            <div>
              <div className="font-headline font-bold">{profile?.name}</div>
              <div className="text-xs text-on-surface-variant">{profile?.education}</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap gap-1.5">
            {profile?.skills.slice(0, 4).map((s) => (
              <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-medium">{s}</span>
            ))}
            {(profile?.skills.length ?? 0) > 4 && <span className="text-[10px] text-outline">+{(profile?.skills.length ?? 0) - 4}</span>}
          </div>
        </a>
        </div>
      </motion.div>
    </div>
  );
}
