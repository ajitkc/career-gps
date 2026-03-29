import { NextResponse } from "next/server";
import { saveProfileAndAnalysis } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";
import { generateMockAnalysis } from "@/data/mock-response";
import { calculateBurnoutScore } from "@/lib/burnout";
import type { UserProfile } from "@/types";

/** GET /api/seed-demo — creates a demo user for presentation */
export async function GET() {
  try {
    const profile: UserProfile = {
      name: "Alex Demo",
      email: "demo@careergps.app",
      education: "Bachelor's in Arts",
      educationLevel: "bachelors",
      degreeField: "arts",
      currentStatus: "recent_graduate",
      skills: ["Design", "HTML/CSS", "Python", "Communication", "Problem Solving"],
      interests: ["UX Design", "Web Development", "AI / Machine Learning"],
      weeklyStudyHours: 20,
      weeklyWorkHours: 25,
      sleepQuality: "fair",
      emotionalState: "motivated",
      currentGoal: "Transition into tech — either UX design or frontend development",
      careerStage: "exploring",
    };

    const analysis = generateMockAnalysis(profile);
    const burnoutScore = calculateBurnoutScore(profile);
    const passwordHash = await hashPassword("demo123");

    const profileId = await saveProfileAndAnalysis(profile, analysis, burnoutScore, passwordHash);

    return NextResponse.json({
      success: true,
      profileId,
      credentials: { email: "demo@careergps.app", password: "demo123" },
      careers: analysis.career_matches.map((c) => c.title),
    });
  } catch (error) {
    console.error("Seed demo error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
