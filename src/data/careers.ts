export type BurnoutRisk = "low" | "medium" | "high";

export interface CareerStep {
  title: string;
  time: string;
  description?: string;
}

export interface Career {
  title: string;
  icon: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  growth: string;
  growthPercent: number;
  stress: "Low" | "Medium" | "High";
  stressPercent: number;
  description: string;
  steps: CareerStep[];
  burnoutRisk: BurnoutRisk;
  color: "primary" | "secondary" | "tertiary";
}

export const careers: Career[] = [
  {
    title: "UI/UX Designer",
    icon: "Palette",
    difficulty: "Medium",
    growth: "+24%",
    growthPercent: 94,
    stress: "Medium",
    stressPercent: 45,
    description:
      "Crafting seamless digital experiences through visual empathy and data-driven design.",
    steps: [
      { title: "Learn Figma Basics", time: "Day 1–5", description: "Master Auto Layout, Components, and Constraints" },
      { title: "Design Principles", time: "Week 1", description: "Color theory, typography, spacing systems" },
      { title: "First App Design", time: "Week 2", description: "Complete a mobile app redesign challenge" },
      { title: "User Research", time: "Week 3", description: "Conduct user interviews and create personas" },
      { title: "Portfolio Project", time: "Month 1", description: "End-to-end case study with UX process" },
      { title: "Design System", time: "Month 2", description: "Build a reusable component library" },
      { title: "Senior Portfolio", time: "Year 1", description: "3+ case studies demonstrating strategic thinking" },
    ],
    burnoutRisk: "medium",
    color: "primary",
  },
  {
    title: "Digital Marketer",
    icon: "Megaphone",
    difficulty: "Medium",
    growth: "+12%",
    growthPercent: 81,
    stress: "High",
    stressPercent: 85,
    description:
      "Orchestrating multi-channel strategies to scale products and build brand presence at speed.",
    steps: [
      { title: "Marketing Fundamentals", time: "Day 1–5", description: "Learn the marketing funnel and key metrics" },
      { title: "SEO & Content Basics", time: "Week 1", description: "Keyword research, on-page optimization" },
      { title: "Social Media Strategy", time: "Week 2", description: "Build and execute a content calendar" },
      { title: "Paid Advertising", time: "Week 3", description: "Google Ads & Meta Ads fundamentals" },
      { title: "Analytics Deep Dive", time: "Month 1", description: "GA4, attribution models, conversion tracking" },
      { title: "Campaign Launch", time: "Month 2", description: "Plan and execute a full campaign" },
      { title: "Growth Lead", time: "Year 1", description: "Own a P&L and scale acquisition channels" },
    ],
    burnoutRisk: "high",
    color: "secondary",
  },
  {
    title: "Data Analyst",
    icon: "BarChart3",
    difficulty: "Hard",
    growth: "+38%",
    growthPercent: 98,
    stress: "Low",
    stressPercent: 30,
    description:
      "Decoding complex datasets to predict trends, surface insights, and drive strategic decisions.",
    steps: [
      { title: "SQL & Spreadsheets", time: "Day 1–5", description: "Master queries, pivots, and data cleaning" },
      { title: "Python for Data", time: "Week 1", description: "Pandas, NumPy, and Matplotlib basics" },
      { title: "Visualization", time: "Week 2", description: "Tableau or Power BI dashboard creation" },
      { title: "Statistical Analysis", time: "Week 3", description: "Hypothesis testing, regression, correlation" },
      { title: "First Analysis Project", time: "Month 1", description: "End-to-end dataset exploration & report" },
      { title: "Machine Learning Intro", time: "Month 2", description: "Supervised learning fundamentals" },
      { title: "Senior Analyst", time: "Year 1", description: "Lead data strategy for a product vertical" },
    ],
    burnoutRisk: "low",
    color: "tertiary",
  },
];

export interface Milestone {
  id: string;
  label: string;
  time: string;
  description: string;
  tasks: string[];
  completed: boolean;
}

export const journeyMilestones: Milestone[] = [
  {
    id: "day-1",
    label: "D1",
    time: "Day 1",
    description: "The Spark — Initial Vector",
    tasks: [
      "Profile indexing & market alignment audit",
      "Skills assessment quiz",
      "Set your career north star",
    ],
    completed: true,
  },
  {
    id: "week-1",
    label: "W1",
    time: "Week 1",
    description: "Velocity — Building Momentum",
    tasks: [
      "Complete core fundamentals module",
      "Join your cohort community",
      "First hands-on project started",
    ],
    completed: true,
  },
  {
    id: "month-1",
    label: "M1",
    time: "Month 1",
    description: "Steady Ascension — Real Progress",
    tasks: [
      "40% proficiency in core technical stack",
      "Portfolio piece #1 completed",
      "Burnout check-in & pace calibration",
    ],
    completed: false,
  },
  {
    id: "year-1",
    label: "Y1",
    time: "Year 1",
    description: "The New Standard — Mastery",
    tasks: [
      "Full-time immersion in chosen vertical",
      "Senior-level portfolio & network",
      "Career transition complete",
    ],
    completed: false,
  },
];
