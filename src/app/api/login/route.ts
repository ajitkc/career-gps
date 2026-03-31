import { NextResponse } from "next/server";
import { supabase, fetchStoredAnalysis } from "@/lib/supabase";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email: string; password: string };

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find profile by email
    const { data: profiles } = await supabase()
      .from("profiles")
      .select("*")
      .ilike("email", email.trim())
      .order("created_at", { ascending: false })
      .limit(1);

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ found: false, reason: "no_account" });
    }

    const row = profiles[0];

    // Verify password
    if (!row.password_hash || !(await verifyPassword(password, row.password_hash))) {
      return NextResponse.json({ found: false, reason: "wrong_password" });
    }

    const profileId = row.id;

    // Fetch skills, interests, analysis, burnout
    const [skillsRes, interestsRes, analysis, burnoutRes] = await Promise.all([
      supabase().from("user_skills").select("skill").eq("profile_id", profileId),
      supabase().from("user_interests").select("interest").eq("profile_id", profileId),
      fetchStoredAnalysis(profileId),
      supabase().from("burnout_assessments").select("score, level, risk_window, factors").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(1).single(),
    ]);

    const profile = {
      name: row.name,
      email: row.email || "",
      education: row.education,
      currentStatus: row.current_status,
      skills: (skillsRes.data ?? []).map((s: { skill: string }) => s.skill),
      interests: (interestsRes.data ?? []).map((i: { interest: string }) => i.interest),
      weeklyStudyHours: row.weekly_study_hours,
      weeklyWorkHours: row.weekly_work_hours,
      sleepQuality: row.sleep_quality,
      emotionalState: row.emotional_state,
      currentGoal: row.current_goal,
      educationLevel: row.education_level || "bachelors",
      degreeField: row.degree_field || "other",
      careerStage: "exploring",
    };

    const burnoutScore = burnoutRes.data ? {
      score: burnoutRes.data.score,
      level: burnoutRes.data.level as "low" | "medium" | "high",
      riskWindow: burnoutRes.data.risk_window,
      factors: burnoutRes.data.factors as { label: string; impact: "low" | "medium" | "high" }[],
    } : null;

    return NextResponse.json({
      found: true,
      profileId,
      profile,
      analysis,
      burnoutScore,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
