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

    // Validate required fields with specific error messages
    const missing: string[] = [];
    if (!body.name?.trim()) missing.push("name");
    if (!body.email?.trim()) missing.push("email");
    if (!body.education?.trim()) {
      // Auto-compose from educationLevel + degreeField if education is empty
      if (body.educationLevel && body.degreeField) {
        const levels: Record<string, string> = { high_school: "High School", bachelors: "Bachelor's", masters: "Master's", other: "Other" };
        const fields: Record<string, string> = { computer_science: "Computer Science", it: "IT", engineering: "Engineering", science: "Science", management: "Management", commerce: "Commerce", arts: "Arts", biology: "Biology", other: "General" };
        body.education = `${levels[body.educationLevel] || body.educationLevel} in ${fields[body.degreeField] || body.degreeField}`;
      } else {
        missing.push("education");
      }
    }
    if (!body.skills || body.skills.length === 0) missing.push("skills (at least one)");
    if (!body.interests || body.interests.length === 0) missing.push("interests (at least one)");

    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }

    // Check for duplicate email
    if (body.email) {
      const { data: existing } = await supabase()
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

    console.log("[analyze] Profile:", { name: body.name, skills: body.skills, interests: body.interests, education: body.education });

    const passwordHash = body.password ? await hashPassword(body.password) : undefined;
    const burnoutScore = calculateBurnoutScore(body);
    const analysis = await analyzeProfile(body);

    console.log("[analyze] Careers:", analysis.career_matches.map((c) => c.title));

    let profileId: string | null = null;
    try {
      profileId = await saveProfileAndAnalysis(body, analysis, burnoutScore, passwordHash);
    } catch (dbErr) {
      console.error("Supabase save failed:", dbErr);
    }

    return NextResponse.json({ ...analysis, profileId, burnoutScore });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json({ error: "Failed to analyze profile" }, { status: 500 });
  }
}
