import type { AnalysisResponse, CheckInResponse } from "@/types";

/**
 * Mock response seeded for the "Bob" scenario:
 * Fresh CS graduate, knows JS/Python/Java/C++, interested in AI/Data/SWE,
 * doing 9-5 traineeship + courses, feeling stuck.
 */
export const MOCK_ANALYSIS: AnalysisResponse = {
  user_summary: {
    name: "Bob",
    education: "Bachelor's in Computer Science",
    current_status: "Recent Graduate",
  },
  career_matches: [
    {
      title: "Software Engineer",
      fit_reason:
        "Your programming foundation across multiple languages is strong. Software engineering offers the most direct path given your current skills — you can start contributing quickly while building depth.",
      difficulty: "Medium",
      growth: "High",
      stress_level: "Medium",
      starting_role: "Junior Developer / Trainee",
      progression: [
        "Trainee / Intern",
        "Junior Developer",
        "Mid-level Developer",
        "Senior Developer",
        "Staff Engineer / Engineering Manager",
      ],
      estimated_timeline: {
        to_first_role: "0-3 months",
        to_mid_level: "2-3 years",
        to_senior: "4-6 years",
      },
    },
    {
      title: "Data Scientist / ML Engineer",
      fit_reason:
        "Your interest in AI and data combined with Python and problem-solving skills makes this a natural fit. The learning curve is steeper, but the growth ceiling is high and the field is expanding fast.",
      difficulty: "Hard",
      growth: "High",
      stress_level: "Medium",
      starting_role: "Junior Data Analyst / ML Intern",
      progression: [
        "Data Analyst",
        "Junior Data Scientist",
        "Data Scientist",
        "Senior Data Scientist",
        "ML Lead / Principal Scientist",
      ],
      estimated_timeline: {
        to_first_role: "3-6 months",
        to_mid_level: "2-4 years",
        to_senior: "5-7 years",
      },
    },
    {
      title: "Backend / API Engineer",
      fit_reason:
        "With Java, Python, and JS in your toolkit, backend engineering is a low-friction entry point. It pairs well with your problem-solving mindset and can eventually branch into distributed systems or platform work.",
      difficulty: "Medium",
      growth: "High",
      stress_level: "Low",
      starting_role: "Junior Backend Developer",
      progression: [
        "Junior Backend Developer",
        "Backend Developer",
        "Senior Backend Engineer",
        "Principal Engineer / Architect",
      ],
      estimated_timeline: {
        to_first_role: "0-2 months",
        to_mid_level: "2-3 years",
        to_senior: "4-6 years",
      },
    },
  ],
  roadmap: {
    current_stage: "Entry-level learner with traineeship experience",
    next_30_days: [
      {
        title: "Lock in your primary track",
        description:
          "Pick one career path as your main focus. You can always pivot later, but scattered effort now will slow you down.",
        duration: "Week 1",
        tasks: [
          "Research day-in-the-life content for your top 2 paths",
          "Talk to 2 people already working in those roles",
          "Pick one path and commit for the next 3 months",
        ],
      },
      {
        title: "Build your first project",
        description:
          "Nothing beats learning by doing. Start a small project that demonstrates the skills employers are looking for.",
        duration: "Weeks 2-4",
        tasks: [
          "Choose a project idea (portfolio site, API, data dashboard)",
          "Set up GitHub repo with clean README",
          "Ship a working v1 by end of month",
          "Write a brief case study of what you built and why",
        ],
      },
    ],
    next_3_months: [
      {
        title: "Deepen core skills",
        description:
          "Go beyond tutorials. Build real things, contribute to open source, or pick up a meaningful side project.",
        duration: "Months 1-3",
        tasks: [
          "Complete one focused online course (not 5 half-finished ones)",
          "Build 2 portfolio projects that solve real problems",
          "Start writing about what you learn (blog, Twitter, LinkedIn)",
          "Apply to 10-15 relevant positions per month",
        ],
      },
    ],
    next_6_months: [
      {
        title: "Establish professional presence",
        description:
          "Your portfolio and network are your resume. Focus on visibility and credibility.",
        duration: "Months 3-6",
        tasks: [
          "Have 3+ polished portfolio projects on GitHub",
          "Optimize LinkedIn with keywords for target roles",
          "Attend 2-3 meetups or virtual events in your field",
          "Practice system design or data interviews weekly",
        ],
      },
    ],
    next_12_months: [
      {
        title: "Level up and specialize",
        description:
          "By now you should be in a role or close. Start specializing in a niche that excites you.",
        duration: "Months 6-12",
        tasks: [
          "Identify a specialization (e.g., ML ops, distributed systems, data pipelines)",
          "Lead a feature or small project at work",
          "Mentor someone newer than you — teaching accelerates mastery",
          "Plan your 2-year trajectory",
        ],
      },
    ],
  },
  burnout: {
    stress_level: "High",
    burnout_risk: "Medium",
    risk_window: "4-8 weeks if workload continues unchanged",
    reasons: [
      "Combining a 9-to-5 traineeship with self-study courses leaves very little recovery time",
      "Feeling stuck often comes from doing too many things at once without clear progress markers",
      "No clear boundary between work-learning and personal-learning creates an always-on mindset",
    ],
    recommendations: [
      "Set a hard stop time for study each day — even 30 minutes of true rest matters",
      "Focus on ONE course or project at a time instead of juggling several",
      "Schedule at least one full day per week with zero career-related activity",
      "Move your body daily — even a 20-minute walk reduces cognitive fatigue",
      "Track your wins weekly — you are making progress even when it does not feel like it",
    ],
  },
  resources: [
    {
      title: "CS50's Web Programming with Python and JavaScript",
      type: "course",
      reason:
        "A rigorous but practical course that bridges your CS fundamentals with real web development",
      url: "https://cs50.harvard.edu/web/",
    },
    {
      title: "Build a Full Stack App with Next.js",
      type: "youtube",
      reason: "Hands-on project tutorial that adds a real project to your portfolio",
      url: "https://youtube.com/watch?v=example-nextjs",
    },
    {
      title: "Designing Machine Learning Systems (Chip Huyen)",
      type: "article",
      reason: "Great overview of ML engineering if you want to explore the data/AI path",
      url: "https://huyenchip.com/machine-learning-systems-design/",
    },
    {
      title: "Python Data Science Handbook",
      type: "docs",
      reason: "Free online reference for pandas, matplotlib, and scikit-learn",
      url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
    },
    {
      title: "Build a REST API from Scratch",
      type: "project",
      reason: "Perfect portfolio project that demonstrates backend skills employers look for",
      url: "https://example.com/rest-api-project",
    },
    {
      title: "The Missing Semester of Your CS Education",
      type: "course",
      reason: "Covers shell, Git, debugging, and dev tools that CS degrees skip but jobs require",
      url: "https://missing.csail.mit.edu/",
    },
  ],
};

export const MOCK_CHECKIN_RESPONSE: CheckInResponse = {
  acknowledgment:
    "It makes total sense that you are feeling this way. Juggling a traineeship and self-study is genuinely hard, and feeling stuck does not mean you are failing — it usually means you are at a plateau, which is a normal part of learning.",
  insight:
    "The fastest way through a plateau is to ship something small. Instead of consuming more content, try building one tiny thing this week that you can show someone.",
  updated_recommendations: [
    "Pause all courses for one week and build a small project instead",
    "Write down 3 things you have learned in the past month — you know more than you think",
    "Reduce study to 1 hour per weekday and take weekends fully off",
    "Apply to 3 positions this week — even if you feel 'not ready'",
    "Talk to one person in your target field — a real conversation beats 10 tutorials",
  ],
  updated_burnout: {
    stress_level: "High",
    burnout_risk: "Medium",
    risk_window: "4-6 weeks at current pace",
    reasons: [
      "Still feeling stuck suggests the current study approach is not clicking",
      "High effort without visible progress is a classic burnout accelerator",
    ],
    recommendations: [
      "Switch from passive learning to active building",
      "Set one clear weekly goal instead of a vague monthly one",
      "Celebrate small wins — they compound",
    ],
  },
  suggested_resources: [
    {
      title: "How to Escape Tutorial Hell",
      type: "youtube",
      reason: "Addresses exactly the pattern you might be in right now",
      url: "https://youtube.com/watch?v=example-tutorial-hell",
    },
    {
      title: "Build Something, Not Everything",
      type: "article",
      reason: "Short read on focused project-based learning",
      url: "https://example.com/focused-learning",
    },
  ],
};
