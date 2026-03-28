"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <header className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background: 3D Road Perspective */}
      <div className="absolute inset-0 z-0 road-perspective">
        <div className="road-surface absolute inset-0 bg-gradient-to-b from-transparent via-surface-container-low to-surface flex justify-center">
          <div className="w-96 h-[200%] bg-gradient-to-b from-surface-container-highest/20 to-surface-container-lowest border-x border-outline-variant/10 relative">
            <div className="absolute inset-y-0 left-1/2 w-1 border-l-2 border-dashed border-primary/40 -translate-x-1/2" />
          </div>
        </div>
      </div>

      {/* Atmospheric Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="inline-block text-primary font-label text-xs tracking-[0.3em] uppercase font-semibold mb-6 opacity-80">
            For students & early professionals
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-6 leading-tight"
        >
          Stop guessing your future.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container">
            Start navigating it.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body"
        >
          You are not behind. You just need a clearer route. Tell us where you are,
          and we&apos;ll map where you could go — while keeping burnout in check.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="/onboarding"
            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-10 py-5 rounded-xl font-headline font-bold text-lg hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all duration-300"
          >
            Start Your Journey
          </a>
          <a
            href="#journey"
            className="glass-panel px-10 py-5 rounded-xl font-headline font-bold text-lg text-on-surface-variant border border-outline-variant/15 hover:bg-white/5 transition-all duration-300"
          >
            See How It Works
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-label text-on-surface-variant">
          Explore
        </span>
        <ChevronDown className="w-5 h-5 text-on-surface-variant animate-bounce" />
      </motion.div>
    </header>
  );
}
