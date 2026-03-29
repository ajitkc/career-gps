"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  User, GraduationCap, Briefcase, Zap, Heart, Target,
  CheckCircle2, Circle, Clock, Mail, Lock, Pencil, Check, X, Plus, Loader2, Camera, Moon, Brain,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { calculateBurnoutScore } from "@/lib/burnout";
import { generateMockAnalysis } from "@/data/mock-response";
import type { UserProfile } from "@/types";

const SKILL_SUGGESTIONS = [
  "JavaScript", "Python", "Java", "C++", "React", "Node.js",
  "SQL", "Git", "HTML/CSS", "TypeScript", "Problem Solving",
  "Communication", "Design", "Data Analysis", "Machine Learning",
  "Writing", "Research", "Excel", "Leadership", "Marketing",
];

const INTEREST_SUGGESTIONS = [
  "AI / Machine Learning", "Web Development", "Mobile Apps", "Data Science",
  "Cloud Computing", "Cybersecurity", "Game Development", "DevOps",
  "Product Management", "UX Design", "Blockchain", "Robotics",
  "Digital Marketing", "Finance", "Healthcare", "Consulting",
];

const TABS = ["Overview", "Skills", "Interests", "Progress"] as const;
type Tab = (typeof TABS)[number];

const card = "bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10";
const inputCls = "w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-on-surface text-sm focus:border-primary/40 focus:outline-none transition-all";

function EditableField({ label, icon: Icon, value, onSave, locked }: {
  label: string; icon: React.ElementType; value: string; onSave: (v: string) => void; locked?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => { if (draft.trim()) { onSave(draft.trim()); setEditing(false); } };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
        {locked ? (
          <Lock className="w-3 h-3 text-outline ml-auto" />
        ) : !editing ? (
          <button onClick={() => setEditing(true)} className="ml-auto p-1 rounded-md hover:bg-surface-container transition-colors">
            <Pencil className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        ) : null}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} className={inputCls} autoFocus />
          <button onClick={save} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Check className="w-4 h-4" /></button>
          <button onClick={cancel} className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <p className={`font-headline font-bold ${locked ? "text-on-surface-variant" : ""}`}>{value}</p>
      )}
    </div>
  );
}

function EditableTextarea({ label, icon: Icon, value, onSave }: {
  label: string; icon: React.ElementType; value: string; onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => { if (draft.trim()) { onSave(draft.trim()); setEditing(false); } };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
        {!editing && (
          <button onClick={() => setEditing(true)} className="ml-auto p-1 rounded-md hover:bg-surface-container transition-colors">
            <Pencil className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3}
            className={`${inputCls} resize-none`} autoFocus />
          <div className="flex gap-2 justify-end">
            <button onClick={cancel} className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
            <button onClick={save} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:brightness-110 transition-all">Save</button>
          </div>
        </div>
      ) : (
        <p className="text-on-surface-variant leading-relaxed">{value}</p>
      )}
    </div>
  );
}

function EditableTags({ label, icon: Icon, tags, onSave, color = "primary", suggestions = [] }: {
  label: string; icon: React.ElementType; tags: string[]; onSave: (tags: string[]) => void; color?: "primary" | "secondary"; suggestions?: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(tags);
  const [input, setInput] = useState("");

  const add = (v?: string) => { const val = (v || input).trim(); if (val && !draft.includes(val)) { setDraft([...draft, val]); setInput(""); } };
  const remove = (t: string) => setDraft(draft.filter((x) => x !== t));
  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(tags); setEditing(false); };

  const tagBg = color === "primary" ? "bg-primary/10 text-primary border-primary/15" : "bg-secondary/10 text-secondary border-secondary/15";
  const availableSuggestions = suggestions.filter((s) => !draft.includes(s));

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${color === "primary" ? "text-primary" : "text-secondary"}`} />
        <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">{label} ({tags.length})</span>
        {!editing && (
          <button onClick={() => { setDraft(tags); setEditing(true); }} className="ml-auto p-1 rounded-md hover:bg-surface-container transition-colors">
            <Pencil className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
              placeholder="Type and press Enter" className={`flex-1 ${inputCls}`} autoFocus />
            <button onClick={() => add()} className="px-3 py-2 bg-primary-container text-on-primary-container rounded-lg"><Plus className="w-4 h-4" /></button>
          </div>
          {/* Selected tags */}
          <div className="flex flex-wrap gap-2">
            {draft.map((t) => (
              <span key={t} className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${tagBg} border rounded-lg text-xs font-bold`}>
                {t}
                <button onClick={() => remove(t)} className="hover:opacity-60"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          {/* Suggestions */}
          {availableSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.slice(0, 10).map((s) => (
                <button key={s} type="button" onClick={() => add(s)}
                  className="px-3 py-1.5 bg-surface-container border border-outline-variant/10 text-on-surface-variant rounded-lg text-xs font-medium hover:bg-surface-container-high hover:text-on-surface transition-all">
                  + {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={cancel} className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
            <button onClick={save} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:brightness-110 transition-all">Save</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((t) => (
            <div key={t} className={`px-4 py-2.5 ${tagBg} border rounded-xl`}>
              <span className="text-sm font-bold">{t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoutineEditor({ profile, onSave, saving }: { profile: UserProfile; onSave: (u: Partial<UserProfile>) => Promise<void>; saving: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    weeklyWorkHours: profile.weeklyWorkHours,
    weeklyStudyHours: profile.weeklyStudyHours,
    sleepQuality: profile.sleepQuality,
    emotionalState: profile.emotionalState,
  });

  const startEdit = () => {
    setDraft({ weeklyWorkHours: profile.weeklyWorkHours, weeklyStudyHours: profile.weeklyStudyHours, sleepQuality: profile.sleepQuality, emotionalState: profile.emotionalState });
    setEditing(true);
  };
  const discard = () => setEditing(false);
  const save = async () => {
    await onSave(draft);
    setEditing(false);
  };
  const hasChanges = draft.weeklyWorkHours !== profile.weeklyWorkHours || draft.weeklyStudyHours !== profile.weeklyStudyHours || draft.sleepQuality !== profile.sleepQuality || draft.emotionalState !== profile.emotionalState;

  return (
    <div className={card}>
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-4 h-4 text-primary" />
        <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Weekly Routine</span>
        {!editing ? (
          <button onClick={startEdit} className="ml-auto p-1 rounded-md hover:bg-surface-container transition-colors">
            <Pencil className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
            <button onClick={discard} className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container border border-outline-variant/15 transition-all">Discard</button>
            <button onClick={save} disabled={!hasChanges || saving} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:brightness-110 disabled:opacity-40 transition-all">Save</button>
          </div>
        )}
      </div>

      {!editing ? (
        /* Read-only view */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-container rounded-xl p-3 text-center">
            <Briefcase className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="font-headline font-bold text-lg">{profile.weeklyWorkHours}h</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Work / Week</div>
          </div>
          <div className="bg-surface-container rounded-xl p-3 text-center">
            <GraduationCap className="w-4 h-4 text-secondary mx-auto mb-1" />
            <div className="font-headline font-bold text-lg">{profile.weeklyStudyHours}h</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Study / Week</div>
          </div>
          <div className="bg-surface-container rounded-xl p-3 text-center">
            <Moon className="w-4 h-4 text-tertiary mx-auto mb-1" />
            <div className="font-headline font-bold text-lg capitalize">{profile.sleepQuality}</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Sleep</div>
          </div>
          <div className="bg-surface-container rounded-xl p-3 text-center">
            <Brain className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="font-headline font-bold text-lg capitalize">{profile.emotionalState.replace("_", " ")}</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Mood</div>
          </div>
        </div>
      ) : (
        /* Edit view */
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-primary" /> Work hours</label>
              <span className="font-headline font-bold text-primary">{draft.weeklyWorkHours}h</span>
            </div>
            <input type="range" min={0} max={80} value={draft.weeklyWorkHours}
              onChange={(e) => setDraft((d) => ({ ...d, weeklyWorkHours: Number(e.target.value) }))}
              className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-secondary" /> Study hours</label>
              <span className="font-headline font-bold text-secondary">{draft.weeklyStudyHours}h</span>
            </div>
            <input type="range" min={0} max={60} value={draft.weeklyStudyHours}
              onChange={(e) => setDraft((d) => ({ ...d, weeklyStudyHours: Number(e.target.value) }))}
              className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary" />
          </div>
          <div>
            <label className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2"><Moon className="w-3.5 h-3.5 text-tertiary" /> Sleep quality</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(["poor", "fair", "good", "great"] as const).map((q) => (
                <button key={q} type="button" onClick={() => setDraft((d) => ({ ...d, sleepQuality: q }))}
                  className={`py-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${draft.sleepQuality === q ? "border-primary/40 bg-primary/10 text-primary" : "border-outline-variant/15 text-on-surface-variant hover:bg-surface-container"}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2"><Brain className="w-3.5 h-3.5 text-primary" /> Emotional state</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(["motivated", "excited", "neutral", "anxious", "stuck", "overwhelmed", "burned_out"] as const).map((e) => (
                <button key={e} type="button" onClick={() => setDraft((d) => ({ ...d, emotionalState: e }))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold capitalize transition-all ${draft.emotionalState === e ? "border-primary/40 bg-primary/10 text-primary" : "border-outline-variant/15 text-on-surface-variant hover:bg-surface-container"}`}>
                  {e.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const store = useStore();
  const { profile, analysis, profileId, avatarUrl } = store;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!profile || !analysis) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return; // 2MB limit
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Resize to 200x200 to keep localStorage small
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d")!;
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
        store.setAvatarUrl(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const statusLabels: Record<string, string> = {
    student: "Student",
    recent_graduate: "Recent Graduate",
    working_professional: "Working Professional",
    career_switcher: "Career Switcher",
  };

  const saveField = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    store.setProfile(updated);
    // Recalculate burnout if hours, sleep, or emotional state changed
    if ("weeklyWorkHours" in updates || "weeklyStudyHours" in updates || "sleepQuality" in updates || "emotionalState" in updates) {
      store.setBurnoutScore(calculateBurnoutScore(updated));
    }
    if (!profileId) return;
    setSaving(true);
    try {
      await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, profile: updates }),
      });
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const saveTags = async (field: "skills" | "interests", tags: string[]) => {
    const updated = { ...profile, [field]: tags };
    store.setProfile(updated);
    // Regenerate career suggestions and burnout based on new skills/interests
    store.setBurnoutScore(calculateBurnoutScore(updated));
    const newAnalysis = generateMockAnalysis(updated);
    store.setAnalysis(newAnalysis);
    // Persist to DB
    if (!profileId) return;
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, profile: {}, [field]: tags }),
        }),
        fetch("/api/update-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, analysis: newAnalysis }),
        }),
      ]);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-5">
          <button onClick={() => fileRef.current?.click()}
            className="relative w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden group">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                <span className="text-2xl font-bold text-on-primary uppercase">{profile.name?.charAt(0) || "?"}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </button>
          <div className="flex-1">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">{profile.name}</h1>
            <p className="text-on-surface-variant text-sm">{statusLabels[profile.currentStatus]} · {profile.education}</p>
            {profile.email && (
              <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                <Mail className="w-3.5 h-3.5" />
                <span className="text-xs">{profile.email}</span>
                <Lock className="w-3 h-3 text-outline" />
              </div>
            )}
          </div>
          {saving && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold font-label uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? "bg-primary/15 text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {activeTab === "Overview" && (
          <div className="space-y-6">
            {profile.email && (
              <EditableField label="Email" icon={Mail} value={profile.email} onSave={() => {}} locked />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField label="Name" icon={User} value={profile.name} onSave={(v) => saveField({ name: v })} />
              <EditableField label="Education" icon={GraduationCap} value={profile.education} onSave={(v) => saveField({ education: v })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField label="Status" icon={Briefcase} value={statusLabels[profile.currentStatus]} onSave={() => {}} locked />
              <EditableField label="Career Stage" icon={Clock} value={profile.careerStage} onSave={() => {}} locked />
            </div>
            <EditableTextarea label="Current Goal" icon={Target} value={profile.currentGoal} onSave={(v) => saveField({ currentGoal: v })} />
            {/* Weekly Routine — edit-locked with save/discard */}
            <RoutineEditor profile={profile} onSave={saveField} saving={saving} />

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                <span className="font-bold text-primary">Summary: </span>
                {analysis.user_summary.name} is a {analysis.user_summary.current_status.toLowerCase()} with a background in {analysis.user_summary.education}. Top career match: {analysis.career_matches[0]?.title}.
              </p>
            </div>
          </div>
        )}

        {activeTab === "Skills" && (
          <div className="space-y-4">
            <EditableTags label="Your Skills" icon={Zap} tags={profile.skills} onSave={(t) => saveTags("skills", t)} suggestions={SKILL_SUGGESTIONS} />
            <div className={card}>
              <div className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-3">Skills matched to career paths</div>
              {analysis.career_matches.map((career, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-outline-variant/5 last:border-0">
                  <span className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant">#{i + 1}</span>
                  <span className="text-sm font-bold flex-1">{career.title}</span>
                  <span className={`text-[10px] font-bold uppercase ${career.difficulty === "Hard" ? "text-tertiary" : career.difficulty === "Medium" ? "text-secondary" : "text-primary"}`}>{career.difficulty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Interests" && (
          <EditableTags label="Your Interests" icon={Heart} tags={profile.interests} onSave={(t) => saveTags("interests", t)} color="secondary" suggestions={INTEREST_SUGGESTIONS} />
        )}

        {activeTab === "Progress" && (
          <div className="space-y-6">
            <div className={card}>
              <div className="flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-primary" /><span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Current Stage</span></div>
              <div className="font-headline text-lg font-bold text-primary mb-1">{analysis.roadmap.current_stage}</div>
              <p className="text-xs text-on-surface-variant">Based on your profile and career analysis</p>
            </div>

            {analysis.career_matches.map((career, i) => (
              <div key={i} className={card}>
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
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_var(--color-primary)]"><div className="w-2 h-2 rounded-full bg-white" /></div>
                          ) : (
                            <Circle className="w-5 h-5 text-outline flex-shrink-0" />
                          )}
                          {j < career.progression.length - 1 && <div className={`w-px flex-1 min-h-6 ${isCompleted ? "bg-primary/40" : "bg-outline-variant/20"}`} />}
                        </div>
                        <div className={`pb-4 ${!isCompleted && !isCurrent ? "opacity-50" : ""}`}>
                          <span className={`text-sm font-bold ${isCurrent ? "text-primary" : ""}`}>{role}</span>
                          {isCurrent && <span className="ml-2 text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Target</span>}
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
