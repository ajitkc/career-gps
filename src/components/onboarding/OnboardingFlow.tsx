"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, GraduationCap, Briefcase, Zap, Heart,
  Clock, Moon, Brain, Target, ArrowRight, ArrowLeft,
  X, Plus, Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { calculateBurnoutScore } from "@/lib/burnout";
import type { UserProfile, CurrentStatus, EmotionalState, CareerStage } from "@/types";

const STEPS = [
  { id: "basics", label: "About You", icon: User },
  { id: "skills", label: "Skills & Interests", icon: Zap },
  { id: "routine", label: "Your Routine", icon: Clock },
  { id: "mindset", label: "How You Feel", icon: Heart },
  { id: "goal", label: "Your Goal", icon: Target },
];

const STATUS_OPTIONS: { value: CurrentStatus; label: string; desc: string }[] = [
  { value: "student", label: "Student", desc: "Currently studying" },
  { value: "recent_graduate", label: "Recent Graduate", desc: "Finished school recently" },
  { value: "working_professional", label: "Working Professional", desc: "Currently employed" },
  { value: "career_switcher", label: "Career Switcher", desc: "Looking to change fields" },
];

const EMOTIONAL_OPTIONS: { value: EmotionalState; label: string; emoji: string }[] = [
  { value: "motivated", label: "Motivated", emoji: "+" },
  { value: "excited", label: "Excited", emoji: "!" },
  { value: "neutral", label: "Neutral", emoji: "~" },
  { value: "anxious", label: "Anxious", emoji: "?" },
  { value: "stuck", label: "Stuck", emoji: "=" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "#" },
  { value: "burned_out", label: "Burned Out", emoji: "x" },
];

const SKILL_SUGGESTIONS = [
  "JavaScript", "Python", "Java", "C++", "React", "Node.js",
  "SQL", "Git", "HTML/CSS", "TypeScript", "Problem Solving",
  "Communication", "Design", "Data Analysis", "Machine Learning",
];

const INTEREST_SUGGESTIONS = [
  "AI / Machine Learning", "Web Development", "Mobile Apps", "Data Science",
  "Cloud Computing", "Cybersecurity", "Game Development", "DevOps",
  "Product Management", "UX Design", "Blockchain", "Robotics",
];

function TagInput({
  tags,
  onAdd,
  onRemove,
  suggestions,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onAdd(val);
      setInput("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-on-surface placeholder:text-outline focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-3 bg-primary-container text-on-primary-container rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary rounded-lg text-xs font-bold"
            >
              {tag}
              <button type="button" onClick={() => onRemove(tag)} className="hover:text-on-surface transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions
          .filter((s) => !tags.includes(s))
          .slice(0, 8)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onAdd(s)}
              className="px-3 py-1.5 bg-surface-container border border-outline-variant/10 text-on-surface-variant rounded-lg text-xs font-medium hover:bg-surface-container-high hover:text-on-surface transition-all"
            >
              + {s}
            </button>
          ))}
      </div>
    </div>
  );
}

export default function OnboardingFlow() {
  const router = useRouter();
  const store = useStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UserProfile>({
    name: "",
    education: "",
    currentStatus: "student",
    skills: [],
    interests: [],
    weeklyStudyHours: 10,
    weeklyWorkHours: 0,
    sleepQuality: "fair",
    emotionalState: "neutral",
    currentGoal: "",
    careerStage: "exploring" as const,
  });

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canProceed = () => {
    switch (step) {
      case 0: return form.name.trim().length > 0 && form.education.trim().length > 0;
      case 1: return form.skills.length > 0 && form.interests.length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return form.currentGoal.trim().length > 0;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      store.setProfile(form);
      store.setBurnoutScore(calculateBurnoutScore(form));
      // Set initial checkpoint based on career stage
      const stageToLevel: Record<string, number> = {
        exploring: 0, student: 0, intern: 0, junior: 1, mid: 2, senior: 3, lead: 4,
      };
      const level = stageToLevel[form.careerStage] ?? 0;
      store.setCareerCheckpoint(`c0-s${level}`);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const analysis = await res.json();
      store.setAnalysis(analysis);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <nav className="bg-surface/60 backdrop-blur-xl border-b border-outline-variant/15 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="font-headline font-bold text-on-surface tracking-tighter text-lg">
            Career GPS
          </a>
          <span className="text-xs font-label text-on-surface-variant tracking-widest uppercase">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = STEPS[step].icon;
                  return <Icon className="w-4 h-4 text-primary" />;
                })()}
                <span className="text-sm font-headline font-bold text-on-surface">
                  {STEPS[step].label}
                </span>
              </div>
              <span className="text-xs font-label text-primary font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-panel rounded-2xl border border-outline-variant/10 p-8 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Step 0: Basics */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                        Let&apos;s get to know you
                      </h2>
                      <p className="text-on-surface-variant">
                        No pressure — just the basics so we can give you relevant guidance.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-1.5 block">
                          What should we call you?
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your first name"
                          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-on-surface placeholder:text-outline focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-1.5 block">
                          Education background
                        </label>
                        <input
                          type="text"
                          value={form.education}
                          onChange={(e) => update("education", e.target.value)}
                          placeholder="e.g. Bachelor's in Computer Science"
                          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-on-surface placeholder:text-outline focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-3 block">
                          Where are you right now?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => update("currentStatus", opt.value)}
                              className={`p-4 rounded-xl border text-left transition-all ${
                                form.currentStatus === opt.value
                                  ? "border-primary/40 bg-primary/10"
                                  : "border-outline-variant/15 bg-surface-container-lowest hover:bg-surface-container"
                              }`}
                            >
                              <div className="font-headline font-bold text-sm">{opt.label}</div>
                              <div className="text-xs text-on-surface-variant mt-0.5">{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-3 block">
                          Where are you in your career?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { value: "exploring" as CareerStage, label: "Just Exploring" },
                            { value: "student" as CareerStage, label: "Student" },
                            { value: "intern" as CareerStage, label: "Intern / Trainee" },
                            { value: "junior" as CareerStage, label: "Junior / Entry-level" },
                            { value: "mid" as CareerStage, label: "Mid-level" },
                            { value: "senior" as CareerStage, label: "Senior / Lead" },
                          ]).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => update("careerStage", opt.value)}
                              className={`p-3 rounded-xl border text-left transition-all text-sm font-headline font-bold ${
                                form.careerStage === opt.value
                                  ? "border-primary/40 bg-primary/10"
                                  : "border-outline-variant/15 bg-surface-container-lowest hover:bg-surface-container"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Skills & Interests */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                        What do you bring to the table?
                      </h2>
                      <p className="text-on-surface-variant">
                        Add your skills and what excites you. Be honest — there are no wrong answers.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" /> Your Skills
                        </label>
                        <TagInput
                          tags={form.skills}
                          onAdd={(s) => update("skills", [...form.skills, s])}
                          onRemove={(s) => update("skills", form.skills.filter((x) => x !== s))}
                          suggestions={SKILL_SUGGESTIONS}
                          placeholder="Type a skill and press Enter"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-secondary" /> Your Interests
                        </label>
                        <TagInput
                          tags={form.interests}
                          onAdd={(s) => update("interests", [...form.interests, s])}
                          onRemove={(s) => update("interests", form.interests.filter((x) => x !== s))}
                          suggestions={INTEREST_SUGGESTIONS}
                          placeholder="Type an interest and press Enter"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Routine */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                        What does your week look like?
                      </h2>
                      <p className="text-on-surface-variant">
                        This helps us understand your capacity and burnout risk. Be realistic.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-primary" />
                          Weekly work hours
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={0}
                            max={80}
                            value={form.weeklyWorkHours}
                            onChange={(e) => update("weeklyWorkHours", Number(e.target.value))}
                            className="flex-1 h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <span className="w-16 text-right font-headline font-bold text-primary">
                            {form.weeklyWorkHours}h
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-secondary" />
                          Weekly study/learning hours
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={0}
                            max={60}
                            value={form.weeklyStudyHours}
                            onChange={(e) => update("weeklyStudyHours", Number(e.target.value))}
                            className="flex-1 h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                          />
                          <span className="w-16 text-right font-headline font-bold text-secondary">
                            {form.weeklyStudyHours}h
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-3 flex items-center gap-2">
                          <Moon className="w-4 h-4 text-tertiary" />
                          Sleep quality
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(["poor", "fair", "good", "great"] as const).map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => update("sleepQuality", q)}
                              className={`py-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                                form.sleepQuality === q
                                  ? "border-primary/40 bg-primary/10 text-primary"
                                  : "border-outline-variant/15 text-on-surface-variant hover:bg-surface-container"
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Emotional State */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                        How are you feeling right now?
                      </h2>
                      <p className="text-on-surface-variant">
                        There&apos;s no wrong answer. This helps us calibrate our advice to where you actually are.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {EMOTIONAL_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("emotionalState", opt.value)}
                          className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                            form.emotionalState === opt.value
                              ? "border-primary/40 bg-primary/10"
                              : "border-outline-variant/15 bg-surface-container-lowest hover:bg-surface-container"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                              form.emotionalState === opt.value
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            <Brain className="w-5 h-5" />
                          </div>
                          <span className="font-headline font-bold">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Goal */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                        What are you trying to achieve?
                      </h2>
                      <p className="text-on-surface-variant">
                        Tell us in your own words. &quot;Get a job in AI&quot; or &quot;figure out what I want to do&quot; — both are valid.
                      </p>
                    </div>

                    <textarea
                      value={form.currentGoal}
                      onChange={(e) => update("currentGoal", e.target.value)}
                      placeholder="e.g. I want to land my first developer job within 6 months while keeping my sanity intact"
                      rows={4}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-on-surface placeholder:text-outline focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                      <p className="text-sm text-on-surface-variant">
                        <span className="font-bold text-primary">Quick tip:</span> The more specific you are, the more useful your roadmap will be. &quot;Learn React&quot; is good, &quot;Build a portfolio site with React and get hired as a junior frontend dev&quot; is better.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-error-container/20 border border-error/20 rounded-xl">
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-outline-variant/10">
              <button
                onClick={back}
                disabled={step === 0}
                className="flex items-center gap-2 text-sm font-label font-semibold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-widest disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={next}
                disabled={!canProceed() || loading}
                className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label text-sm font-extrabold py-4 px-10 rounded-xl shadow-xl hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : step < STEPS.length - 1 ? (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Generate My Roadmap
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
