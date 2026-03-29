"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, User, Activity, ChevronDown, LogOut } from "lucide-react";
import Logo from "@/components/ui/logo";
import { useStore } from "@/lib/store";
import AssistantBubble from "./AssistantBubble";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Journey", icon: Map },
  { href: "/burnout", label: "Burnout", icon: Activity },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, reset, avatarUrl } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Nav */}
      <nav className="bg-surface/60 backdrop-blur-xl border-b border-outline-variant/15 sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" aria-label="Career GPS home">
            <Logo className="h-7 w-auto" />
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

          {/* Hi, Name dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-sm font-bold text-on-primary uppercase">
                  {profile?.name?.charAt(0) || "?"}
                </div>
              )}
              <span className="text-sm font-medium text-on-surface hidden sm:block">
                Hi, {profile?.name || "there"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-high rounded-xl border border-outline-variant/15 shadow-2xl overflow-hidden z-50">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                >
                  <User className="w-4 h-4 text-on-surface-variant" />
                  View Profile
                </Link>
                <div className="h-px bg-outline-variant/10" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    reset();
                    window.location.href = "/";
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-surface-container transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
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
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all ${
              pathname === "/profile" ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Floating Assistant */}
      <AssistantBubble />
    </div>
  );
}
