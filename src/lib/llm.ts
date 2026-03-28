import type { AnalysisResponse, CheckInResponse, UserProfile, CheckInInput } from "@/types";
import { buildAnalysisPrompt, buildCheckInPrompt } from "./prompts";
import { MOCK_ANALYSIS, MOCK_CHECKIN_RESPONSE } from "@/data/mock-response";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const USE_MOCK = process.env.USE_MOCK === "true" || !OPENAI_API_KEY;

async function callLLM(prompt: string): Promise<string> {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are Career GPS, a career guidance AI. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code blocks if present
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

export async function analyzeProfile(profile: UserProfile): Promise<AnalysisResponse> {
  if (USE_MOCK) {
    // Return mock with user's actual name/education
    await new Promise((r) => setTimeout(r, 1500)); // Simulate latency
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
  const raw = await callLLM(prompt);
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
  const raw = await callLLM(prompt);
  return parseJSON<CheckInResponse>(raw);
}
