// ============================================================
// Career GPS — Type System
// ============================================================

// --- User Profile ---

export type CurrentStatus =
  | "student"
  | "recent_graduate"
  | "working_professional"
  | "career_switcher";

export type EmotionalState =
  | "motivated"
  | "neutral"
  | "overwhelmed"
  | "stuck"
  | "burned_out"
  | "anxious"
  | "excited";

export type CareerStage =
  | "exploring"
  | "student"
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "lead";

export type EducationLevel = "high_school" | "bachelors" | "masters" | "other";
export type DegreeField = "computer_science" | "it" | "engineering" | "science" | "management" | "commerce" | "arts" | "biology" | "other";

export interface UserProfile {
  name: string;
  email: string;
  education: string;
  educationLevel: EducationLevel;
  degreeField: DegreeField;
  currentStatus: CurrentStatus;
  skills: string[];
  interests: string[];
  weeklyStudyHours: number;
  weeklyWorkHours: number;
  sleepQuality: "poor" | "fair" | "good" | "great";
  emotionalState: EmotionalState;
  currentGoal: string;
  /** Where the user currently is in their career */
  careerStage: CareerStage;
}

// --- LLM Response Contract ---

export interface CareerMatch {
  title: string;
  fit_reason: string;
  difficulty: "Easy" | "Medium" | "Hard";
  growth: "Low" | "Medium" | "High";
  stress_level: "Low" | "Medium" | "High";
  starting_role: string;
  progression: string[];
  estimated_timeline: {
    to_first_role: string;
    to_mid_level: string;
    to_senior: string;
  };
}

export interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  tasks: string[];
}

export interface Roadmap {
  current_stage: string;
  next_30_days: RoadmapStep[];
  next_3_months: RoadmapStep[];
  next_6_months: RoadmapStep[];
  next_12_months: RoadmapStep[];
}

export interface BurnoutAssessment {
  stress_level: "Low" | "Medium" | "High";
  burnout_risk: "Low" | "Medium" | "High";
  risk_window: string;
  reasons: string[];
  recommendations: string[];
}

export interface Resource {
  title: string;
  type: "youtube" | "article" | "course" | "docs" | "project";
  reason: string;
  url: string;
}

export interface AnalysisResponse {
  user_summary: {
    name: string;
    education: string;
    current_status: string;
  };
  career_matches: CareerMatch[];
  roadmap: Roadmap;
  burnout: BurnoutAssessment;
  resources: Resource[];
}

// --- Check-in ---

export interface CheckInInput {
  message: string;
  emotionalState?: EmotionalState;
}

export interface CheckInResponse {
  acknowledgment: string;
  insight: string;
  updated_recommendations: string[];
  updated_burnout: BurnoutAssessment;
  suggested_resources: Resource[];
  /** If the conversation warrants new/updated career paths, Gemini returns them here */
  updated_career_matches?: CareerMatch[];
}

// --- Burnout Scoring (deterministic) ---

export type BurnoutLevel = "low" | "medium" | "high";

export interface BurnoutScore {
  level: BurnoutLevel;
  score: number; // 0-100
  riskWindow: string;
  factors: { label: string; impact: "low" | "medium" | "high" }[];
}

// --- App State ---

export interface AppState {
  profile: UserProfile | null;
  analysis: AnalysisResponse | null;
  burnoutScore: BurnoutScore | null;
  checkIns: { input: CheckInInput; response: CheckInResponse; timestamp: string }[];
  isLoading: boolean;
  /** The node ID representing the user's actual current career position */
  careerCheckpoint: string | null;
  /** Supabase profile row ID for persisting check-ins */
  profileId: string | null;
  /** Base64 data URL for profile picture */
  avatarUrl: string | null;
}
