import { NextResponse } from "next/server";
import { processCheckIn } from "@/lib/llm";
import { saveCheckIn } from "@/lib/supabase";
import type { UserProfile, AnalysisResponse, CheckInInput } from "@/types";

interface CheckInBody {
  profile: UserProfile;
  analysis: AnalysisResponse;
  checkIn: CheckInInput;
  profileId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckInBody;

    if (!body.profile || !body.analysis || !body.checkIn?.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call Gemini for check-in response
    const response = await processCheckIn(body.profile, body.analysis, body.checkIn);

    // Persist to Supabase if we have a profileId
    if (body.profileId) {
      try {
        await saveCheckIn(body.profileId, body.checkIn, response);
      } catch (dbErr) {
        console.error("Supabase checkin save failed (non-blocking):", dbErr);
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}
