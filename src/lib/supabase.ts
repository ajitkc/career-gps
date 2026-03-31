import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile, AnalysisResponse, CheckInInput, CheckInResponse, BurnoutScore } from "@/types";

/** Server-side Supabase client for API routes (lazy-initialized to avoid build-time errors) */
let _supabase: SupabaseClient | null = null;

export function supabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    );
  }
  return _supabase;
}

// ============================================================
// SAVE PROFILE + ANALYSIS
// ============================================================

export async function saveProfileAndAnalysis(
  profile: UserProfile,
  analysis: AnalysisResponse,
  burnoutScore: BurnoutScore | null,
  passwordHash?: string
): Promise<string> {
  // 1. Insert profile
  const { data: profileRow, error: profileErr } = await supabase()
    .from("profiles")
    .insert({
      name: profile.name,
      email: profile.email || null,
      password_hash: passwordHash || "",
      education: profile.education,
      education_level: profile.educationLevel || "bachelors",
      degree_field: profile.degreeField || "other",
      current_status: profile.currentStatus,
      weekly_study_hours: profile.weeklyStudyHours,
      weekly_work_hours: profile.weeklyWorkHours,
      sleep_quality: profile.sleepQuality,
      emotional_state: profile.emotionalState,
      current_goal: profile.currentGoal,
    })
    .select("id")
    .single();

  if (profileErr) throw new Error(`Profile save failed: ${profileErr.message}`);
  const profileId = profileRow.id;

  // 2. Insert skills
  if (profile.skills.length > 0) {
    await supabase().from("user_skills").insert(
      profile.skills.map((skill) => ({ profile_id: profileId, skill }))
    );
  }

  // 3. Insert interests
  if (profile.interests.length > 0) {
    await supabase().from("user_interests").insert(
      profile.interests.map((interest) => ({ profile_id: profileId, interest }))
    );
  }

  await saveAnalysisForProfile(profileId, analysis, burnoutScore);

  return profileId;
}

// ============================================================
// SAVE / REPLACE ANALYSIS DATA FOR A PROFILE
// ============================================================

export async function saveAnalysisForProfile(
  profileId: string,
  analysis: AnalysisResponse,
  burnoutScore: BurnoutScore | null
): Promise<void> {
  // Delete existing analysis data (replace strategy)
  await Promise.all([
    supabase().from("career_recommendations").delete().eq("profile_id", profileId),
    supabase().from("roadmaps").delete().eq("profile_id", profileId),
    supabase().from("burnout_assessments").delete().eq("profile_id", profileId),
    supabase().from("resources").delete().eq("profile_id", profileId),
  ]);

  // Insert career recommendations
  if (analysis.career_matches.length > 0) {
    await supabase().from("career_recommendations").insert(
      analysis.career_matches.map((c) => ({
        profile_id: profileId,
        title: c.title,
        fit_reason: c.fit_reason,
        difficulty: c.difficulty,
        growth: c.growth,
        stress_level: c.stress_level,
        starting_role: c.starting_role,
        progression: c.progression,
        estimated_timeline: c.estimated_timeline,
      }))
    );
  }

  // Insert roadmap
  await supabase().from("roadmaps").insert({
    profile_id: profileId,
    current_stage: analysis.roadmap.current_stage,
    next_30_days: analysis.roadmap.next_30_days,
    next_3_months: analysis.roadmap.next_3_months,
    next_6_months: analysis.roadmap.next_6_months,
    next_12_months: analysis.roadmap.next_12_months,
  });

  // Insert burnout assessment
  await supabase().from("burnout_assessments").insert({
    profile_id: profileId,
    score: burnoutScore?.score ?? 0,
    level: burnoutScore?.level ?? "low",
    risk_window: burnoutScore?.riskWindow ?? "Sustainable",
    factors: burnoutScore?.factors ?? [],
    stress_level: analysis.burnout.stress_level,
    burnout_risk: analysis.burnout.burnout_risk,
    reasons: analysis.burnout.reasons,
    recommendations: analysis.burnout.recommendations,
  });

  // Insert resources
  if (analysis.resources.length > 0) {
    await supabase().from("resources").insert(
      analysis.resources.map((r) => ({
        profile_id: profileId,
        title: r.title,
        type: r.type,
        reason: r.reason,
        url: r.url,
      }))
    );
  }
}

// ============================================================
// SAVE CHECK-IN
// ============================================================

export async function saveCheckIn(
  profileId: string,
  checkIn: CheckInInput,
  response: CheckInResponse
): Promise<void> {
  await supabase().from("checkins").insert({
    profile_id: profileId,
    message: checkIn.message,
    emotional_state: checkIn.emotionalState ?? null,
    acknowledgment: response.acknowledgment,
    insight: response.insight,
    updated_recommendations: response.updated_recommendations,
    updated_burnout: response.updated_burnout,
    suggested_resources: response.suggested_resources,
  });
}

// ============================================================
// FETCH FULL ANALYSIS FROM DB
// ============================================================

export async function fetchStoredAnalysis(profileId: string): Promise<AnalysisResponse | null> {
  // Fetch all data in parallel
  const [profileRes, careersRes, roadmapRes, burnoutRes, resourcesRes] = await Promise.all([
    supabase().from("profiles").select("*").eq("id", profileId).single(),
    supabase().from("career_recommendations").select("*").eq("profile_id", profileId).order("created_at"),
    supabase().from("roadmaps").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(1).single(),
    supabase().from("burnout_assessments").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(1).single(),
    supabase().from("resources").select("*").eq("profile_id", profileId),
  ]);

  const profile = profileRes.data;
  const careers = careersRes.data;
  const roadmap = roadmapRes.data;
  const burnout = burnoutRes.data;
  const resources = resourcesRes.data;

  if (!profile || !careers?.length || !roadmap) return null;

  return {
    user_summary: {
      name: profile.name,
      education: profile.education,
      current_status: profile.current_status,
    },
    career_matches: careers.map((c) => ({
      title: c.title,
      fit_reason: c.fit_reason,
      difficulty: c.difficulty,
      growth: c.growth,
      stress_level: c.stress_level,
      starting_role: c.starting_role,
      progression: c.progression as string[],
      estimated_timeline: c.estimated_timeline as { to_first_role: string; to_mid_level: string; to_senior: string },
    })),
    roadmap: {
      current_stage: roadmap.current_stage,
      next_30_days: roadmap.next_30_days as AnalysisResponse["roadmap"]["next_30_days"],
      next_3_months: roadmap.next_3_months as AnalysisResponse["roadmap"]["next_3_months"],
      next_6_months: roadmap.next_6_months as AnalysisResponse["roadmap"]["next_6_months"],
      next_12_months: roadmap.next_12_months as AnalysisResponse["roadmap"]["next_12_months"],
    },
    burnout: burnout ? {
      stress_level: burnout.stress_level,
      burnout_risk: burnout.burnout_risk,
      risk_window: burnout.risk_window,
      reasons: burnout.reasons as string[],
      recommendations: burnout.recommendations as string[],
    } : { stress_level: "Low" as const, burnout_risk: "Low" as const, risk_window: "Sustainable", reasons: [], recommendations: [] },
    resources: (resources ?? []).map((r) => ({
      title: r.title,
      type: r.type as "youtube" | "article" | "course" | "docs" | "project",
      reason: r.reason,
      url: r.url,
    })),
  };
}

// ============================================================
// FETCH PROFILE
// ============================================================

export async function fetchProfile(profileId: string): Promise<UserProfile | null> {
  const { data: row } = await supabase()
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (!row) return null;

  const { data: skills } = await supabase()
    .from("user_skills")
    .select("skill")
    .eq("profile_id", profileId);

  const { data: interests } = await supabase()
    .from("user_interests")
    .select("interest")
    .eq("profile_id", profileId);

  return {
    name: row.name,
    email: row.email || "",
    education: row.education,
    educationLevel: row.education_level || "bachelors",
    degreeField: row.degree_field || "other",
    currentStatus: row.current_status,
    skills: (skills ?? []).map((s: { skill: string }) => s.skill),
    interests: (interests ?? []).map((i: { interest: string }) => i.interest),
    weeklyStudyHours: row.weekly_study_hours,
    weeklyWorkHours: row.weekly_work_hours,
    sleepQuality: row.sleep_quality,
    emotionalState: row.emotional_state,
    currentGoal: row.current_goal,
    careerStage: "exploring",
  };
}
