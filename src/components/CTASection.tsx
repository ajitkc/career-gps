"use client";

import { motion } from "framer-motion";
import AnimatedGradient from "./AnimatedGradient";
import AnimatedButton from "./ui/animated-button";

export default function CTASection() {
  return (
    <section id="cta" className="relative py-32 overflow-hidden">
      {/* Same animated gradient as hero */}
      <AnimatedGradient
        config={{ preset: "Prism" }}
        noise={{ opacity: 0.3, scale: 1 }}
      />
      <div className="absolute inset-0 z-[1] bg-surface/60 pointer-events-none" />
      {/* Top blend from previous section */}
      <div className="absolute top-0 left-0 right-0 h-40 z-[1] bg-gradient-to-b from-surface to-transparent pointer-events-none" />
      {/* Bottom blend into footer */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-[1] bg-gradient-to-t from-surface to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl tracking-tight text-on-surface mb-5 leading-snug">
            <span className="font-headline font-bold">Ready to</span>
            <br />
            <span className="font-serif italic font-normal text-4xl sm:text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container pt-0 pb-1 pr-4 inline-block leading-tight" style={{ WebkitBoxDecorationBreak: "clone" }}>
              take control?
            </span>
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg max-w-xl mx-auto mb-10 font-body">
            Join 15,000+ professionals who stopped wandering and started
            arriving.
          </p>
          <div className="flex justify-center">
            <AnimatedButton href="/onboarding">
              Start your journey today
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
