"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SectionBadge from "./ui/section-badge";

const HighwayScene = dynamic(() => import("./HighwayScene"), { ssr: false });

export default function HighwaySection() {
  return (
    <section id="highway" className="relative w-full overflow-hidden bg-surface">
      {/* Top blend into hero */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-surface to-transparent z-10 pointer-events-none" />

      {/* Heading */}
      <div className="relative z-20 text-center pt-24 pb-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <SectionBadge>Your Career Paths</SectionBadge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-on-surface">
            <span className="font-headline font-bold">Multiple roads. </span>
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-container pr-1">One journey.</span>
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg max-w-xl mx-auto mt-3">
            Every career path converges toward your goals. Move your mouse to explore.
          </p>
        </motion.div>
      </div>

      {/* Career path labels */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50"
        >
          <span className="text-secondary/60">Design</span>
          <span className="text-primary/60">Engineering</span>
          <span className="text-primary font-black">Your Path</span>
          <span className="text-primary/60">Data</span>
          <span className="text-secondary/60">Management</span>
        </motion.div>
      </div>

      {/* Three.js Highway — full width, taller */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full h-[600px] md:h-[750px] lg:h-[850px]"
      >
        <HighwayScene />
      </motion.div>

      {/* Bottom blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent z-10 pointer-events-none" />
    </section>
  );
}
