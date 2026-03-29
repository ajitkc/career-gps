import type { AnalysisResponse, CheckInResponse, UserProfile, CheckInInput } from "@/types";
import { buildAnalysisPrompt, buildCheckInPrompt } from "./prompts";
import { generateMockAnalysis, generateMockCheckIn } from "@/data/mock-response";

async function callGemini(prompt: string, retries = 2): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 16384, responseMimeType: "application/json" },
      }),
    });

    if (response.status === 429 && attempt < retries - 1) {
      const wait = (attempt + 1) * 5000;
      console.log(`[llm] Rate limited, retrying in ${wait / 1000}s (attempt ${attempt + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${error.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  }

  throw new Error("Gemini API: max retries exceeded");
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

function shouldUseMock(): boolean {
  return process.env.USE_MOCK === "true" || !process.env.GEMINI_API_KEY;
}

export async function analyzeProfile(profile: UserProfile): Promise<AnalysisResponse> {
  if (shouldUseMock()) {
    console.log("[llm] MOCK mode — generating personalized mock for:", profile.name, "skills:", profile.skills, "interests:", profile.interests);
    await new Promise((r) => setTimeout(r, 800));
    return generateMockAnalysis(profile);
  }

  console.log("[llm] Calling Gemini — skills: [%s], interests: [%s], education: %s",
    profile.skills.join(", "), profile.interests.join(", "), profile.education);

  const prompt = buildAnalysisPrompt(profile);
  const raw = await callGemini(prompt);
  const result = parseJSON<AnalysisResponse>(raw);

  console.log("[llm] Gemini returned %d careers: %s",
    result.career_matches.length, result.career_matches.map((c) => c.title).join(", "));

  return result;
}

export async function processCheckIn(
  profile: UserProfile,
  analysis: AnalysisResponse,
  checkIn: CheckInInput
): Promise<CheckInResponse> {
  if (shouldUseMock()) {
    console.log("[llm] MOCK check-in for:", profile.name, "message:", checkIn.message.slice(0, 50));
    await new Promise((r) => setTimeout(r, 500));
    return generateMockCheckIn(profile, analysis, checkIn.message);
  }

  const summaryStr = `Career matches: ${analysis.career_matches.map((c) => c.title).join(", ")}. Current stage: ${analysis.roadmap.current_stage}. Burnout risk: ${analysis.burnout.burnout_risk}.`;
  const prompt = buildCheckInPrompt(profile, summaryStr, checkIn);
  const raw = await callGemini(prompt);
  return parseJSON<CheckInResponse>(raw);
}
