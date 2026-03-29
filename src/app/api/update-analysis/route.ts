import { NextResponse } from "next/server";
import { saveAnalysisForProfile } from "@/lib/supabase";
import type { AnalysisResponse } from "@/types";

interface UpdateBody {
  profileId: string;
  analysis: AnalysisResponse;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateBody;

    if (!body.profileId || !body.analysis) {
      return NextResponse.json({ error: "Missing profileId or analysis" }, { status: 400 });
    }

    await saveAnalysisForProfile(body.profileId, body.analysis, null);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update analysis error:", error);
    return NextResponse.json({ error: "Failed to update analysis" }, { status: 500 });
  }
}
