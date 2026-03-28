"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navigation, Map, User, Activity, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import AssistantBubble from "./AssistantBubble";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Journey", icon: Map },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/burnout", label: "Burnout", icon: Activity },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, reset } = useStore();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Nav */}
      <nav className="bg-surface/60 backdrop-blur-xl border-b border-outline-variant/15 sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center group-hover:bg-primary-container/30 transition-colors">
              <Navigation className="w-4 h-4 text-primary" />
            </div>
            <span className="font-headline font-bold text-on-surface tracking-tighter text-lg">
              Career GPS
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-surface-container rounded-xl">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-label uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <span className="text-xs text-on-surface-variant font-medium hidden sm:block">
                Hey, {profile.name}
              </span>
            )}
            <button
              onClick={() => {
                reset();
                window.location.href = "/";
              }}
              className="flex items-center gap-1.5 text-xs font-label text-on-surface-variant/60 hover:text-on-surface transition-colors"
              title="Start Over"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container/80 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Floating Assistant */}
      <AssistantBubble />
    </div>
  );
}
