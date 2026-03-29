import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

interface UpdateBody {
  profileId: string;
  profile: Partial<UserProfile>;
  skills?: string[];
  interests?: string[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateBody;
    if (!body.profileId) {
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    const { profileId, profile, skills, interests } = body;

    // Update profile fields (exclude email — locked)
    const updates: Record<string, unknown> = {};
    if (profile.name !== undefined) updates.name = profile.name;
    if (profile.education !== undefined) updates.education = profile.education;
    if (profile.currentStatus !== undefined) updates.current_status = profile.currentStatus;
    if (profile.currentGoal !== undefined) updates.current_goal = profile.currentGoal;
    if (profile.weeklyWorkHours !== undefined) updates.weekly_work_hours = profile.weeklyWorkHours;
    if (profile.weeklyStudyHours !== undefined) updates.weekly_study_hours = profile.weeklyStudyHours;
    if (profile.sleepQuality !== undefined) updates.sleep_quality = profile.sleepQuality;
    if (profile.emotionalState !== undefined) updates.emotional_state = profile.emotionalState;
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length > 1) {
      await supabase.from("profiles").update(updates).eq("id", profileId);
    }

    // Replace skills
    if (skills) {
      await supabase.from("user_skills").delete().eq("profile_id", profileId);
      if (skills.length > 0) {
        await supabase.from("user_skills").insert(
          skills.map((skill) => ({ profile_id: profileId, skill }))
        );
      }
    }

    // Replace interests
    if (interests) {
      await supabase.from("user_interests").delete().eq("profile_id", profileId);
      if (interests.length > 0) {
        await supabase.from("user_interests").insert(
          interests.map((interest) => ({ profile_id: profileId, interest }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
