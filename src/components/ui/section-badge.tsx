"use client";

export default function SectionBadge({ children, align = "center" }: { children: React.ReactNode; align?: "center" | "left" }) {
  return (
    <div className={`mb-5 flex ${align === "left" ? "justify-start" : "justify-center"}`}>
      <div className="relative inline-flex items-center gap-2 rounded-full border border-outline-variant/15 bg-white/[0.06] backdrop-blur-sm px-4 py-1.5 shadow-sm overflow-hidden">
        <div className="absolute inset-0 z-0 animate-badge-shine" />
        <span className="relative z-10 text-xs font-medium text-on-surface-variant tracking-wide capitalize">
          {children}
        </span>
      </div>
    </div>
  );
}
