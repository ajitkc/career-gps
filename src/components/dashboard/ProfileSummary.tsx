"use client";

import { motion } from "framer-motion";
import { User, GraduationCap, Briefcase, Zap, Heart } from "lucide-react";
import type { UserProfile, BurnoutScore } from "@/types";

export default function ProfileSummary({
  profile,
  burnoutScore,
}: {
  profile: UserProfile;
  burnoutScore: BurnoutScore | null;
}) {
  const statusLabels: Record<string, string> = {
    student: "Student",
    recent_graduate: "Recent Graduate",
    working_professional: "Working Professional",
    career_switcher: "Career Switcher",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="bg-surface-container-high rounded-2xl p-6 md:p-8 border border-outline-variant/10"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-on-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-headline text-2xl font-extrabold tracking-tight">
            Hey, {profile.name}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            You are not behind. You just need a clearer route.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-lg text-xs font-bold text-on-surface-variant">
              <GraduationCap className="w-3 h-3" />
              {profile.education}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-lg text-xs font-bold text-on-surface-variant">
              <Briefcase className="w-3 h-3" />
              {statusLabels[profile.currentStatus] || profile.currentStatus}
            </span>
          </div>
        </div>

        {/* Burnout badge */}
        {burnoutScore && (
          <div
            className={`px-4 py-3 rounded-xl border text-center flex-shrink-0 ${
              burnoutScore.level === "low"
                ? "bg-primary/10 border-primary/20"
                : burnoutScore.level === "medium"
                ? "bg-secondary/10 border-secondary/20"
                : "bg-tertiary-container/20 border-tertiary/20"
            }`}
          >
            <div className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">
              Burnout Risk
            </div>
            <div
              className={`font-headline font-bold text-lg capitalize ${
                burnoutScore.level === "low"
                  ? "text-primary"
                  : burnoutScore.level === "medium"
                  ? "text-secondary"
                  : "text-tertiary"
              }`}
            >
              {burnoutScore.level}
            </div>
          </div>
        )}
      </div>

      {/* Skills & Interests row */}
      <div className="mt-6 pt-6 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">
              Skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <span key={s} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Heart className="w-3 h-3 text-secondary" />
            <span className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest">
              Interests
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((i) => (
              <span key={i} className="px-2 py-1 bg-secondary/10 text-secondary rounded-md text-xs font-medium">
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
