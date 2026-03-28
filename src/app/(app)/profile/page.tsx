"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, GraduationCap, Briefcase, Zap, Heart, Target,
  CheckCircle2, Circle, ArrowRight, Clock,
} from "lucide-react";
import { useStore } from "@/lib/store";

const TABS = ["Overview", "Skills", "Interests", "Progress"] as const;
type Tab = (typeof TABS)[number];

export default function ProfilePage() {
  const { profile, analysis, burnoutScore } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  if (!profile || !analysis) return null;

  const statusLabels: Record<string, string> = {
    student: "Student",
    recent_graduate: "Recent Graduate",
    working_professional: "Working Professional",
    career_switcher: "Career Switcher",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-on-primary" />
          </div>
          <div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">{profile.name}</h1>
            <p className="text-on-surface-variant text-sm">
              {statusLabels[profile.currentStatus]} · {profile.education}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold font-label uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Overview */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                    Education
                  </span>
                </div>
                <p className="font-headline font-bold">{profile.education}</p>
              </div>
              <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                    Status
                  </span>
                </div>
                <p className="font-headline font-bold">
                  {statusLabels[profile.currentStatus]}
                </p>
              </div>
            </div>
            <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                  Current Goal
                </span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">{profile.currentGoal}</p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                <span className="font-bold text-primary">Summary: </span>
                {analysis.user_summary.name} is a {analysis.user_summary.current_status.toLowerCase()} with a background in {analysis.user_summary.education}. Top career match: {analysis.career_matches[0]?.title}.
              </p>
            </div>
          </div>
        )}

        {/* Skills */}
        {activeTab === "Skills" && (
          <div className="space-y-4">
            <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                  Your Skills ({profile.skills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.skills.map((skill) => (
                  <div
                    key={skill}
                    className="px-4 py-2.5 bg-primary/10 border border-primary/15 rounded-xl"
                  >
                    <span className="text-sm font-bold text-primary">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
              <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">
                Skills matched to career paths
              </div>
              {analysis.career_matches.map((career, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-outline-variant/5 last:border-0">
                  <span className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                    #{i + 1}
                  </span>
                  <span className="text-sm font-bold flex-1">{career.title}</span>
                  <span className={`text-[10px] font-bold uppercase ${career.difficulty === "Hard" ? "text-tertiary" : career.difficulty === "Medium" ? "text-secondary" : "text-primary"}`}>
                    {career.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {activeTab === "Interests" && (
          <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-secondary" />
              <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                Your Interests ({profile.interests.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.interests.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center gap-3 px-4 py-3 bg-secondary/10 border border-secondary/15 rounded-xl"
                >
                  <Heart className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-bold text-on-surface">{interest}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {activeTab === "Progress" && (
          <div className="space-y-6">
            <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">
                  Current Stage
                </span>
              </div>
              <div className="font-headline text-lg font-bold text-primary mb-1">
                {analysis.roadmap.current_stage}
              </div>
              <p className="text-xs text-on-surface-variant">
                Based on your profile and career analysis
              </p>
            </div>

            {/* Career progression per path */}
            {analysis.career_matches.map((career, i) => (
              <div
                key={i}
                className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10"
              >
                <h4 className="font-headline font-bold text-sm mb-4">{career.title}</h4>
                <div className="space-y-0">
                  {career.progression.map((role, j) => {
                    const isCompleted = j === 0;
                    const isCurrent = j === 1;
                    return (
                      <div key={j} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          ) : isCurrent ? (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_var(--color-primary)]">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          ) : (
                            <Circle className="w-5 h-5 text-outline flex-shrink-0" />
                          )}
                          {j < career.progression.length - 1 && (
                            <div className={`w-px flex-1 min-h-6 ${isCompleted ? "bg-primary/40" : "bg-outline-variant/20"}`} />
                          )}
                        </div>
                        <div className={`pb-4 ${!isCompleted && !isCurrent ? "opacity-50" : ""}`}>
                          <span className={`text-sm font-bold ${isCurrent ? "text-primary" : ""}`}>
                            {role}
                          </span>
                          {isCurrent && (
                            <span className="ml-2 text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                              Target
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
