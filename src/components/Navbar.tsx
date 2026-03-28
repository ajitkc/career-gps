"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";

const navLinks = [
  { label: "Journey", href: "#journey" },
  { label: "Careers", href: "#careers" },
  { label: "Burnout", href: "#burnout" },
  { label: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/60 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
          : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center group-hover:bg-primary-container/30 transition-colors">
            <Navigation className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-on-surface font-headline">
            Career GPS
          </span>
        </a>

        {/* Nav Links — Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-on-surface/70 hover:text-on-surface text-sm font-medium tracking-wide transition-colors font-headline"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/onboarding"
          className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg font-headline font-bold text-sm tracking-wide active:scale-95 transition-transform hover:shadow-lg hover:shadow-primary/20"
        >
          Start Journey
        </a>
      </div>
    </motion.nav>
  );
}
