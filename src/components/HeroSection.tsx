"use client";

import { motion } from "framer-motion";
import { ChevronDown, Navigation } from "lucide-react";
import AnimatedGradient from "./AnimatedGradient";
import AnimatedButton from "./ui/animated-button";

export default function HeroSection() {
  return (
    <header className="relative flex flex-col items-center justify-center overflow-hidden min-h-screen">
      {/* Animated gradient background */}
      <AnimatedGradient
        config={{ preset: "Prism" }}
        noise={{ opacity: 0.3, scale: 1 }}
      />
      <div className="absolute inset-0 z-[1] bg-surface/60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 z-[1] bg-gradient-to-t from-surface to-transparent pointer-events-none" />

      {/* Content — centered in the viewport */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center flex-1">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="mb-5 flex justify-center"
        >
          <div className="group relative inline-flex items-center gap-2.5 rounded-full border border-outline-variant/15 bg-white/[0.06] backdrop-blur-sm p-1 pr-4 shadow-sm overflow-hidden cursor-default">
            <div className="absolute inset-0 z-0 animate-badge-shine" />
            <span className="relative z-10 rounded-full bg-primary/15 p-1.5 flex items-center justify-center">
              <Navigation className="w-3 h-3 text-primary" />
            </span>
            <span className="relative z-10 text-xs font-medium text-on-surface-variant tracking-wide capitalize">
              For Students &amp; Early Professionals
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="text-3xl sm:text-4xl md:text-6xl tracking-tight text-on-surface mb-5 leading-snug"
        >
          <span className="whitespace-nowrap font-headline font-bold">Stop guessing your future.</span>
          <br />
          <span className="font-serif italic font-normal text-4xl sm:text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container pt-0 pb-1 pr-4 inline-block leading-tight" style={{ WebkitBoxDecorationBreak: "clone" }}>
            Start navigating it.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-on-surface-variant text-base md:text-lg max-w-xl mx-auto mb-10 font-body"
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
          <AnimatedButton href="/onboarding">
            Start Your Journey
          </AnimatedButton>
          <AnimatedButton href="#highway" variant="outline">
            See How It Works
          </AnimatedButton>
        </motion.div>
      </div>

      {/* Explore — pinned to very bottom of viewport */}
      <motion.a
        href="#highway"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative z-10 pb-6 flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-label text-on-surface-variant">
          Explore
        </span>
        <ChevronDown className="w-5 h-5 text-on-surface-variant animate-bounce" />
      </motion.a>
    </header>
  );
}
