"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import type { CheckInResponse, EmotionalState } from "@/types";

const QUICK_PROMPTS = [
  "I feel stuck",
  "I feel burned out",
  "I want to switch careers",
  "I need beginner resources",
  "I feel like I am not making progress",
];

export default function CheckInWidget() {
  const store = useStore();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<CheckInResponse | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleSubmit = async (text?: string) => {
    const msg = text || message;
    if (!msg.trim() || !store.profile || !store.analysis) return;

    setLoading(true);
    setShowResponse(false);

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

      if (!res.ok) throw new Error("Check-in failed");
      const data: CheckInResponse = await res.json();
      setLastResponse(data);
      setShowResponse(true);
      store.addCheckIn({ message: msg }, data);
      setMessage("");
    } catch {
      // Silently fail for MVP
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-headline text-xl font-bold">Check In</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Tell us how you are doing — we will adjust your guidance
          </p>
        </div>
        <MessageCircle className="w-5 h-5 text-primary" />
      </div>

      <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10 space-y-4">
        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSubmit(prompt)}
              disabled={loading}
              className="px-3 py-1.5 bg-surface-container border border-outline-variant/10 text-on-surface-variant rounded-lg text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Or type anything — how you feel, what you need..."
            className="flex-1 px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-on-surface placeholder:text-outline focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm"
            disabled={loading}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !message.trim()}
            className="px-4 py-3 bg-primary-container text-on-primary-container rounded-xl font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Response */}
        <AnimatePresence>
          {showResponse && lastResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 pt-4 border-t border-outline-variant/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-on-surface leading-relaxed">
                    {lastResponse.acknowledgment}
                  </p>
                  <p className="text-sm text-on-surface-variant leading-relaxed italic">
                    {lastResponse.insight}
                  </p>

                  {lastResponse.updated_recommendations.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">
                        Next Steps
                      </span>
                      {lastResponse.updated_recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
                          <span className="text-primary font-bold">{i + 1}.</span>
                          {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
