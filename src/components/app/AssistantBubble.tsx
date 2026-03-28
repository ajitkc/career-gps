"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Loader2, Sparkles, Bot,
  Frown, RefreshCcw, Compass, AlertTriangle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { CheckInResponse } from "@/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: "I feel stuck", icon: Frown },
  { label: "I feel burned out", icon: AlertTriangle },
  { label: "Suggest next step", icon: Compass },
  { label: "Switch careers", icon: RefreshCcw },
];

const CHAT_SUGGESTIONS = [
  "What should I focus on this week?",
  "Am I on the right track?",
  "I need beginner resources",
  "How do I deal with imposter syndrome?",
];

export default function AssistantBubble() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [showQuickBar, setShowQuickBar] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Proactive greeting
  useEffect(() => {
    if (open && !hasGreeted && store.profile) {
      setMessages([
        {
          role: "assistant",
          content: `Hey ${store.profile.name}! How are you feeling today? I'm here if you need guidance, want to vent, or just need a nudge in the right direction.`,
          timestamp: new Date(),
        },
      ]);
      setHasGreeted(true);
    }
  }, [open, hasGreeted, store.profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || !store.profile || !store.analysis) return;

    setOpen(true);
    setShowQuickBar(false);
    const userMsg: ChatMessage = { role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: store.profile,
          analysis: store.analysis,
          checkIn: { message: msg },
        }),
      });

      if (!res.ok) throw new Error();
      const data: CheckInResponse = await res.json();
      store.addCheckIn({ message: msg }, data);

      let reply = data.acknowledgment;
      if (data.insight) reply += "\n\n" + data.insight;
      if (data.updated_recommendations.length > 0) {
        reply +=
          "\n\nHere's what I'd suggest:\n" +
          data.updated_recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that. Could you try again?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== PERSISTENT QUICK ACTION BAR ===== */}
      <AnimatePresence>
        {!open && showQuickBar && store.profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 right-20 md:right-24 z-[59] flex items-center gap-2"
          >
            {QUICK_ACTIONS.map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(action.label)}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface-container/90 backdrop-blur-xl border border-outline-variant/15 rounded-xl shadow-lg text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all text-[11px] font-bold"
              >
                <action.icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== BUBBLE BUTTON ===== */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => { setOpen(true); setShowQuickBar(false); }}
            className="fixed bottom-24 md:bottom-8 right-6 z-[60] w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-full shadow-[0_8px_32px_rgba(46,91,255,0.4)] flex items-center justify-center text-on-primary active:scale-95 transition-transform"
          >
            <Bot className="w-6 h-6" />
            {/* Notification dot */}
            {messages.length === 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-tertiary rounded-full border-2 border-surface animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ===== CHAT PANEL ===== */}
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-xl">
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
              <button
                onClick={() => { setOpen(false); setShowQuickBar(true); }}
                className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-on-primary rounded-br-md"
                        : "bg-surface-container-high text-on-surface rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-surface-container-high rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Initial suggestions */}
              {messages.length <= 1 && !loading && (
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                    Try asking
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {CHAT_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-left px-3 py-2 bg-surface-container border border-outline-variant/10 text-on-surface-variant rounded-xl text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-sm text-on-surface placeholder:text-outline focus:border-primary/40 focus:outline-none transition-all"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
                >
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
