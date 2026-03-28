import type { UserProfile, BurnoutScore, EmotionalState } from "@/types";

const EMOTIONAL_WEIGHTS: Record<EmotionalState, number> = {
  motivated: 0,
  excited: 5,
  neutral: 10,
  anxious: 30,
  stuck: 40,
  overwhelmed: 55,
  burned_out: 80,
};

const SLEEP_WEIGHTS: Record<string, number> = {
  great: 0,
  good: 5,
  fair: 20,
  poor: 40,
};

export function calculateBurnoutScore(profile: UserProfile): BurnoutScore {
  const factors: BurnoutScore["factors"] = [];
  let totalScore = 0;

  // Factor 1: Total weekly hours (work + study)
  const totalHours = profile.weeklyWorkHours + profile.weeklyStudyHours;
  let hoursImpact: "low" | "medium" | "high" = "low";
  if (totalHours >= 60) {
    totalScore += 35;
    hoursImpact = "high";
  } else if (totalHours >= 45) {
    totalScore += 20;
    hoursImpact = "medium";
  } else if (totalHours >= 30) {
    totalScore += 10;
    hoursImpact = "low";
  }
  factors.push({ label: `${totalHours}h/week total workload`, impact: hoursImpact });

  // Factor 2: Emotional state
  const emotionalScore = EMOTIONAL_WEIGHTS[profile.emotionalState] ?? 10;
  totalScore += emotionalScore;
  const emotionalImpact: "low" | "medium" | "high" =
    emotionalScore >= 40 ? "high" : emotionalScore >= 20 ? "medium" : "low";
  factors.push({
    label: `Feeling ${profile.emotionalState.replace("_", " ")}`,
    impact: emotionalImpact,
  });

  // Factor 3: Sleep quality
  const sleepScore = SLEEP_WEIGHTS[profile.sleepQuality] ?? 10;
  totalScore += sleepScore;
  factors.push({
    label: `${profile.sleepQuality} sleep quality`,
    impact: sleepScore >= 30 ? "high" : sleepScore >= 15 ? "medium" : "low",
  });

  // Factor 4: Ambition vs capacity mismatch
  const hasHighGoal = profile.currentGoal.length > 20;
  const isOverloaded = totalHours >= 50;
  if (hasHighGoal && isOverloaded) {
    totalScore += 15;
    factors.push({
      label: "High ambition + heavy schedule",
      impact: "high",
    });
  }

  // Factor 5: Multiple skill areas (context switching)
  if (profile.skills.length > 5) {
    totalScore += 8;
    factors.push({
      label: `${profile.skills.length} skills to maintain`,
      impact: "medium",
    });
  }

  // Clamp
  const score = Math.min(100, Math.max(0, totalScore));

  // Level
  let level: BurnoutScore["level"];
  let riskWindow: string;
  if (score >= 60) {
    level = "high";
    riskWindow = "2-4 weeks if current pace continues";
  } else if (score >= 35) {
    level = "medium";
    riskWindow = "6-8 weeks if nothing changes";
  } else {
    level = "low";
    riskWindow = "Sustainable at current pace";
  }

  return { level, score, riskWindow, factors };
}
