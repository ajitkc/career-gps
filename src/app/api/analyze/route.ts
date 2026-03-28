import { NextResponse } from "next/server";
import { analyzeProfile } from "@/lib/llm";
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

    const analysis = await analyzeProfile(body);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 }
    );
  }
}
