import type { AnalysisResponse, CheckInResponse, UserProfile, CheckInInput } from "@/types";
import { buildAnalysisPrompt, buildCheckInPrompt } from "./prompts";
import { MOCK_ANALYSIS, MOCK_CHECKIN_RESPONSE } from "@/data/mock-response";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const USE_MOCK = process.env.USE_MOCK === "true" || !GEMINI_API_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are Career GPS, a career guidance AI. Always respond with valid JSON only.\n\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code blocks if present
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

export async function analyzeProfile(profile: UserProfile): Promise<AnalysisResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      ...MOCK_ANALYSIS,
      user_summary: {
        name: profile.name,
        education: profile.education,
        current_status: profile.currentStatus.replace("_", " "),
      },
    };
  }

  const prompt = buildAnalysisPrompt(profile);
  const raw = await callGemini(prompt);
  return parseJSON<AnalysisResponse>(raw);
}

export async function processCheckIn(
  profile: UserProfile,
  analysis: AnalysisResponse,
  checkIn: CheckInInput
): Promise<CheckInResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return MOCK_CHECKIN_RESPONSE;
  }

  const summaryStr = `Career matches: ${analysis.career_matches.map((c) => c.title).join(", ")}. Current stage: ${analysis.roadmap.current_stage}. Burnout risk: ${analysis.burnout.burnout_risk}.`;
  const prompt = buildCheckInPrompt(profile, summaryStr, checkIn);
  const raw = await callGemini(prompt);
  return parseJSON<CheckInResponse>(raw);
}
