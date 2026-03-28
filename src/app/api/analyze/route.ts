import { NextResponse } from "next/server";
import { analyzeProfile } from "@/lib/llm";
import { saveProfileAndAnalysis } from "@/lib/supabase";
import { calculateBurnoutScore } from "@/lib/burnout";
import type { UserProfile } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UserProfile;

    if (!body.name || !body.education || !body.skills?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call Gemini for career analysis
    const analysis = await analyzeProfile(body);

    // Calculate deterministic burnout score
    const burnoutScore = calculateBurnoutScore(body);

    // Persist to Supabase (non-blocking — don't fail the response if DB write fails)
    let profileId: string | null = null;
    try {
      profileId = await saveProfileAndAnalysis(body, analysis, burnoutScore);
    } catch (dbErr) {
      console.error("Supabase save failed (non-blocking):", dbErr);
    }

    return NextResponse.json({ ...analysis, profileId });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 }
    );
  }
}
