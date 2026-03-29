import type { BurnoutRisk } from "@/data/careers";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBurnoutColor(risk: BurnoutRisk) {
  switch (risk) {
    case "low":
      return { text: "text-primary", bg: "bg-primary", glow: "neon-glow-primary", label: "Low Risk" };
    case "medium":
      return { text: "text-secondary", bg: "bg-secondary", glow: "neon-glow-secondary", label: "Moderate" };
    case "high":
      return { text: "text-tertiary", bg: "bg-tertiary-container", glow: "neon-glow-tertiary", label: "High Risk" };
  }
}

export function getStressColor(level: "Low" | "Medium" | "High") {
  switch (level) {
    case "Low":
      return "primary";
    case "Medium":
      return "secondary";
    case "High":
      return "tertiary";
  }
}
