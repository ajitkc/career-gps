"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import AppShell from "@/components/app/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, analysis } = useStore();

  useEffect(() => {
    if (!profile || !analysis) {
      const t = setTimeout(() => {
        if (!profile || !analysis) router.push("/onboarding");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [profile, analysis, router]);

  if (!profile || !analysis) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant text-sm">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
