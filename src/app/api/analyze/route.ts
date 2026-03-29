import { NextResponse } from "next/server";
import { analyzeProfile } from "@/lib/llm";
import { supabase, saveProfileAndAnalysis } from "@/lib/supabase";
import { calculateBurnoutScore } from "@/lib/burnout";
import { hashPassword } from "@/lib/auth";
import type { UserProfile } from "@/types";

interface AnalyzeBody extends UserProfile {
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeBody;

    if (!body.name || !body.education || !body.skills?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for duplicate email BEFORE doing anything expensive
    if (body.email) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", body.email.trim())
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in instead." },
          { status: 409 }
        );
      }
    }

    console.log("[analyze] Profile received:", {
      name: body.name, skills: body.skills, interests: body.interests,
      education: body.education, goal: body.currentGoal,
    });

    // Hash password first (fast), then call Gemini (slow) and save in parallel
    const passwordHash = body.password ? await hashPassword(body.password) : undefined;
    const burnoutScore = calculateBurnoutScore(body);

    // Call Gemini for career analysis
    const analysis = await analyzeProfile(body);

    console.log("[analyze] Gemini returned", analysis.career_matches.length, "careers:",
      analysis.career_matches.map((c) => c.title));

    // Persist to Supabase
    let profileId: string | null = null;
    try {
      profileId = await saveProfileAndAnalysis(body, analysis, burnoutScore, passwordHash);
    } catch (dbErr) {
      console.error("Supabase save failed (non-blocking):", dbErr);
    }

    return NextResponse.json({ ...analysis, profileId, burnoutScore });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json({ error: "Failed to analyze profile" }, { status: 500 });
  }
}
