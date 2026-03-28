import { NextResponse } from "next/server";
import { processCheckIn } from "@/lib/llm";
import type { UserProfile, AnalysisResponse, CheckInInput } from "@/types";

interface CheckInBody {
  profile: UserProfile;
  analysis: AnalysisResponse;
  checkIn: CheckInInput;
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

    const response = await processCheckIn(body.profile, body.analysis, body.checkIn);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}
