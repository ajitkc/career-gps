"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section id="cta" className="py-32 relative overflow-hidden">
      {/* Radial background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,#b8c3ff_0%,transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="font-headline text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">
            Ready to take control?
          </h2>
          <p className="text-on-surface-variant text-lg mb-12 max-w-xl mx-auto">
            Join 15,000+ professionals who stopped wandering and started
            arriving.
          </p>
          <a
            href="/onboarding"
            className="group bg-gradient-to-r from-primary to-primary-container text-on-primary px-12 py-6 rounded-2xl font-headline font-black text-xl tracking-tight shadow-2xl hover:scale-105 transition-transform active:scale-95 duration-300 neon-glow-primary inline-flex items-center gap-3"
          >
            Start your personalized journey today
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
