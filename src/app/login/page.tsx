"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, User, Zap, Heart } from "lucide-react";
import Logo from "@/components/ui/logo";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const store = useStore();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundProfile, setFoundProfile] = useState<{
    name: string; education: string; skills: string[]; interests: string[];
  } | null>(null);

  const canProceed = email.trim().includes("@") && password.length >= 1;

  const handleLogin = async () => {
    if (!canProceed) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) throw new Error("Login request failed");
      const data = await res.json();

      if (!data.found) {
        setError(
          data.reason === "wrong_password"
            ? "Incorrect password. Please try again."
            : "No account found with this email."
        );
        setLoading(false);
        return;
      }

      // Show profile card
      setFoundProfile({
        name: data.profile.name,
        education: data.profile.education,
        skills: data.profile.skills,
        interests: data.profile.interests,
      });
      setStep(1);

      // Hydrate the store
      store.setProfile(data.profile);
      if (data.profileId) store.setProfileId(data.profileId);
      if (data.analysis) store.setAnalysis(data.analysis);
      if (data.burnoutScore) store.setBurnoutScore(data.burnoutScore);

      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = step === 0 ? 50 : 100;
  const inputCls = "w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl text-on-surface placeholder:text-outline focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-300";

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header — same as onboarding */}
      <nav className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/15 px-6 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" aria-label="Career GPS home"><Logo className="h-6 w-auto" /></a>
          <span className="text-[10px] font-label text-on-surface-variant tracking-widest uppercase font-bold">Log In</span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-2">
                {step === 0 ? <Lock className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-primary" />}
                <span className="text-sm font-headline font-bold text-on-surface">{step === 0 ? "Your Credentials" : "Welcome Back"}</span>
              </div>
              <span className="text-xs font-label text-primary font-bold">{progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
                animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} />
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-panel rounded-3xl border border-outline-variant/10 p-8 md:p-10">
            <AnimatePresence mode="wait">
              {/* Step 0: Email + Password */}
              {step === 0 && (
                <motion.div key="credentials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl tracking-tight mb-2 font-headline font-bold">Welcome back</h2>
                      <p className="text-on-surface-variant">Enter your email and password to load your career roadmap.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-1.5 block">Email address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                          <input type="email" value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(null); }}
                            onKeyDown={(e) => e.key === "Enter" && document.getElementById("login-pw")?.focus()}
                            placeholder="you@example.com" className={`${inputCls} pl-11`} autoFocus />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-on-surface-variant mb-1.5 block">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                          <input id="login-pw" type={showPassword ? "text" : "password"} value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(null); }}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            placeholder="Your password" className={`${inputCls} pl-11 pr-16`} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-error-container/20 border border-error/20 rounded-xl">
                        <p className="text-sm text-error font-medium">{error}</p>
                      </div>
                    )}

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                      <p className="text-sm text-on-surface-variant">
                        <span className="font-bold text-primary">Don&apos;t have an account?</span>{" "}
                        <a href="/onboarding" className="underline hover:text-primary transition-colors">Get started here</a> — it only takes 2 minutes.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Found Profile */}
              {step === 1 && foundProfile && (
                <motion.div key="found" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl tracking-tight mb-2 font-headline font-bold">Hey, {foundProfile.name}!</h2>
                      <p className="text-on-surface-variant">Loading your career roadmap...</p>
                    </div>
                    <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                          <span className="text-lg font-bold text-on-primary uppercase">{foundProfile.name?.charAt(0) || "?"}</span>
                        </div>
                        <div>
                          <div className="font-headline font-bold">{foundProfile.name}</div>
                          <div className="text-xs text-on-surface-variant">{foundProfile.education}</div>
                        </div>
                      </div>
                      {foundProfile.skills.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-primary" /> Skills
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {foundProfile.skills.slice(0, 6).map((s) => (
                              <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">{s}</span>
                            ))}
                            {foundProfile.skills.length > 6 && <span className="text-xs text-outline">+{foundProfile.skills.length - 6}</span>}
                          </div>
                        </div>
                      )}
                      {foundProfile.interests.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Heart className="w-3 h-3 text-secondary" /> Interests
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {foundProfile.interests.slice(0, 6).map((s) => (
                              <span key={s} className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-bold">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-bold">Redirecting to dashboard...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {step === 0 && (
              <div className="flex items-center justify-between mt-10 pt-8 border-t border-outline-variant/10">
                <a href="/" className="flex items-center gap-2 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-widest">
                  <ArrowLeft className="w-4 h-4" />Home
                </a>
                <button onClick={handleLogin} disabled={!canProceed || loading}
                  className="relative overflow-hidden flex items-center gap-3 font-headline font-bold text-sm py-3.5 px-8 rounded-full bg-white text-surface group/fill disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary-container rounded-[inherit] translate-y-full group-hover/fill:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 flex items-center gap-3 transition-colors duration-150 group-hover/fill:text-white">
                    {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Logging in...</>) : (<>Log In<ArrowRight className="w-4 h-4" /></>)}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
