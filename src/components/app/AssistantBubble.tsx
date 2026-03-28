"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Loader2, Sparkles, Bot,
  Frown, RefreshCcw, Compass, AlertTriangle,
  Check, XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { CheckInResponse, CareerMatch } from "@/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  /** If Gemini returned new career paths, attach them for the save prompt */
  pendingCareers?: CareerMatch[];
}

const QUICK_ACTIONS = [
  { label: "I feel stuck", icon: Frown },
  { label: "Burned out", icon: AlertTriangle },
  { label: "Next step", icon: Compass },
  { label: "Switch", icon: RefreshCcw },
];

const TRY_ASKING = [
  "What should I focus on this week?",
  "Am I on the right track?",
  "I need beginner resources",
  "How do I deal with imposter syndrome?",
];

export default function AssistantBubble() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Proactive greeting — only once
  useEffect(() => {
    if (open && !hasGreeted && store.profile) {
      setMessages([{
        role: "assistant",
        content: `Hey ${store.profile.name}! How are you feeling today? I'm here if you need guidance, want to vent, or just need a nudge forward.`,
        timestamp: new Date(),
      }]);
      setHasGreeted(true);
    }
  }, [open, hasGreeted, store.profile]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const saveUpdatedCareers = async (careers: CareerMatch[]) => {
    if (!store.profileId || !store.analysis) return;
    setSavingUpdate(true);
    try {
      const updatedAnalysis = { ...store.analysis, career_matches: careers };
      const res = await fetch("/api/update-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: store.profileId, analysis: updatedAnalysis }),
      });
      if (res.ok) {
        store.setAnalysis(updatedAnalysis);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "Done! Your career roadmap has been updated with the new paths. Check your dashboard to see the changes.",
          timestamp: new Date(),
        }]);
      } else {
        throw new Error();
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't save the update right now. You can try again later.",
        timestamp: new Date(),
      }]);
    } finally {
      setSavingUpdate(false);
    }
  };

  const dismissUpdate = () => {
    setMessages((prev) => [...prev, {
      role: "assistant",
      content: "No problem! Your current career paths remain unchanged.",
      timestamp: new Date(),
    }]);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || !store.profile || !store.analysis) return;

    setHasInteracted(true);
    setMessages((prev) => [...prev, { role: "user", content: msg, timestamp: new Date() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: store.profile, analysis: store.analysis, checkIn: { message: msg }, profileId: store.profileId }),
      });
      if (!res.ok) throw new Error();
      const data: CheckInResponse = await res.json();
      store.addCheckIn({ message: msg }, data);

      let reply = data.acknowledgment;
      if (data.insight) reply += "\n\n" + data.insight;
      if (data.updated_recommendations.length > 0) {
        reply += "\n\n" + data.updated_recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n");
      }

      // Check if Gemini returned updated career paths
      const hasNewCareers = data.updated_career_matches && data.updated_career_matches.length > 0;

      if (hasNewCareers) {
        reply += "\n\nI've identified new career paths based on our conversation:";
        data.updated_career_matches!.forEach((c, i) => {
          reply += `\n${i + 1}. ${c.title} — ${c.fit_reason.slice(0, 80)}...`;
        });
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: reply,
        timestamp: new Date(),
        pendingCareers: hasNewCareers ? data.updated_career_matches : undefined,
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Try again?", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bubble button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-6 z-[60] w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-full shadow-[0_8px_32px_rgba(46,91,255,0.4)] flex items-center justify-center text-on-primary active:scale-95 transition-transform"
          >
            <Bot className="w-6 h-6" />
            {!hasGreeted && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-tertiary rounded-full border-2 border-surface animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 md:bottom-8 right-6 z-[60] w-[400px] max-w-[calc(100vw-3rem)] h-[560px] bg-surface-container-low rounded-2xl border border-outline-variant/15 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                  <Bot className="w-5 h-5 text-on-primary" />
                </div>
                <div>
                  <div className="font-headline font-bold text-sm">Career Assistant</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] text-on-surface-variant">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            {/* Message List — scrollable */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-on-primary rounded-br-md"
                        : "bg-surface-container-high text-on-surface rounded-bl-md"
                    }`}>
                      {msg.content}
                    </div>
                  </div>

                  {/* Save updated career track prompt */}
                  {msg.pendingCareers && msg.pendingCareers.length > 0 && (
                    <div className="flex justify-start mt-2">
                      <div className="w-6 mr-2 flex-shrink-0" />
                      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 max-w-[80%]">
                        <p className="text-xs font-bold text-primary mb-2">
                          Would you like to save this updated career track?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              saveUpdatedCareers(msg.pendingCareers!);
                              // Remove pending from this message
                              setMessages((prev) => prev.map((m, j) => j === i ? { ...m, pendingCareers: undefined } : m));
                            }}
                            disabled={savingUpdate}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
                          >
                            {savingUpdate ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Yes, update
                          </button>
                          <button
                            onClick={() => {
                              dismissUpdate();
                              setMessages((prev) => prev.map((m, j) => j === i ? { ...m, pendingCareers: undefined } : m));
                            }}
                            disabled={savingUpdate}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant/15 text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            No thanks
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-surface-container-high rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* "Try Asking" — only shown at start, before any user interaction */}
              {!hasInteracted && !loading && (
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Try asking</div>
                  <div className="flex flex-col gap-1.5">
                    {TRY_ASKING.map((s) => (
                      <button key={s} onClick={() => sendMessage(s)}
                        className="text-left px-3 py-2 bg-surface-container border border-outline-variant/10 text-on-surface-variant rounded-xl text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions — ALWAYS visible, fixed above input */}
            <div className="px-4 py-2 border-t border-outline-variant/10 flex-shrink-0 bg-surface-container-low/80">
              <div className="flex gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action.label} onClick={() => sendMessage(action.label)} disabled={loading}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-container border border-outline-variant/10 rounded-lg text-[10px] font-bold text-on-surface-variant hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-40 flex-shrink-0">
                    <action.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input — always at bottom */}
            <div className="px-4 py-3 border-t border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-xl flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-sm text-on-surface placeholder:text-outline focus:border-primary/40 focus:outline-none transition-all"
                  disabled={loading}
                />
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-40">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
