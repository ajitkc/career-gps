import { NextResponse } from "next/server";
import { fetchStoredAnalysis, fetchProfile } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json({ error: "Missing profile ID" }, { status: 400 });
    }

    const [profile, analysis] = await Promise.all([
      fetchProfile(profileId),
      fetchStoredAnalysis(profileId),
    ]);

    if (!profile || !analysis) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile, analysis });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
