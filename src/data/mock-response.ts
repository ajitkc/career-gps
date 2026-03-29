import type { AnalysisResponse, CheckInResponse, UserProfile, CareerMatch } from "@/types";

// ============================================================
// CAREER POOL — covers tech, business, science, arts, etc.
// Each career has: tags (skills/interests), degreeFields it fits, and the career data
// ============================================================

interface CareerTemplate {
  tags: string[];
  degreeFields: string[];
  career: Omit<CareerMatch, "fit_reason"> & { fitTemplate: string };
}

const CAREER_POOL: CareerTemplate[] = [
  // --- TECH ---
  { tags: ["javascript", "react", "html/css", "typescript", "node.js", "web development", "frontend"], degreeFields: ["computer_science", "it", "engineering"],
    career: { title: "Frontend Developer", fitTemplate: "Your skills in {skills} combined with your interest in {interests} make frontend development a strong fit.", difficulty: "Medium", growth: "High", stress_level: "Medium", starting_role: "Junior Frontend Developer", progression: ["Junior Frontend Dev", "Frontend Developer", "Senior Frontend Dev", "Lead Frontend Engineer", "Principal Engineer"], estimated_timeline: { to_first_role: "1-3 months", to_mid_level: "2-3 years", to_senior: "4-6 years" } } },
  { tags: ["python", "machine learning", "ai", "data science", "data analysis", "ai / machine learning", "statistics"], degreeFields: ["computer_science", "it", "science", "engineering"],
    career: { title: "Data Scientist / ML Engineer", fitTemplate: "Your background in {education} combined with skills in {skills} positions you well for data science and machine learning.", difficulty: "Hard", growth: "High", stress_level: "Medium", starting_role: "Junior Data Analyst", progression: ["Data Analyst", "Junior Data Scientist", "Data Scientist", "Senior Data Scientist", "ML Lead / Principal"], estimated_timeline: { to_first_role: "2-4 months", to_mid_level: "2-4 years", to_senior: "5-7 years" } } },
  { tags: ["java", "python", "node.js", "sql", "git", "backend", "cloud computing", "devops", "c++"], degreeFields: ["computer_science", "it", "engineering"],
    career: { title: "Backend Engineer", fitTemplate: "With {skills} in your toolkit, backend engineering leverages your problem-solving abilities and offers steady career growth.", difficulty: "Medium", growth: "High", stress_level: "Low", starting_role: "Junior Backend Developer", progression: ["Junior Backend Dev", "Backend Developer", "Senior Backend Engineer", "Staff Engineer", "Principal Architect"], estimated_timeline: { to_first_role: "1-2 months", to_mid_level: "2-3 years", to_senior: "4-6 years" } } },
  { tags: ["mobile apps", "react", "swift", "kotlin", "flutter", "game development"], degreeFields: ["computer_science", "it", "engineering"],
    career: { title: "Mobile App Developer", fitTemplate: "Your interest in {interests} translates directly to mobile development where demand continues to grow.", difficulty: "Medium", growth: "High", stress_level: "Medium", starting_role: "Junior Mobile Developer", progression: ["Junior Mobile Dev", "Mobile Developer", "Senior Mobile Dev", "Mobile Lead", "Mobile Architect"], estimated_timeline: { to_first_role: "2-4 months", to_mid_level: "2-3 years", to_senior: "4-6 years" } } },
  { tags: ["cybersecurity", "networking", "linux", "security"], degreeFields: ["computer_science", "it", "engineering"],
    career: { title: "Cybersecurity Analyst", fitTemplate: "Your interest in {interests} combined with your technical foundation opens doors in the high-demand cybersecurity field.", difficulty: "Hard", growth: "High", stress_level: "Medium", starting_role: "Junior Security Analyst", progression: ["Security Intern", "Security Analyst", "Senior Security Engineer", "Security Architect", "CISO"], estimated_timeline: { to_first_role: "3-6 months", to_mid_level: "3-4 years", to_senior: "6-8 years" } } },
  { tags: ["cloud computing", "devops", "docker", "kubernetes", "aws", "linux"], degreeFields: ["computer_science", "it", "engineering"],
    career: { title: "Cloud / DevOps Engineer", fitTemplate: "Your interest in {interests} and technical skills make cloud/DevOps engineering a high-growth path with excellent pay.", difficulty: "Medium", growth: "High", stress_level: "Medium", starting_role: "Junior DevOps Engineer", progression: ["Junior DevOps", "DevOps Engineer", "Senior DevOps", "Platform Lead", "VP Infrastructure"], estimated_timeline: { to_first_role: "2-4 months", to_mid_level: "2-3 years", to_senior: "5-7 years" } } },
  { tags: ["design", "ux design", "figma", "ui", "ux research", "adobe"], degreeFields: ["computer_science", "it", "arts", "other"],
    career: { title: "UX/UI Designer", fitTemplate: "Your creative skills in {skills} paired with interest in {interests} make UX/UI design a compelling career path.", difficulty: "Medium", growth: "High", stress_level: "Low", starting_role: "Junior UX Designer", progression: ["UX Intern", "Junior Designer", "UX Designer", "Senior Designer", "Head of Design"], estimated_timeline: { to_first_role: "2-4 months", to_mid_level: "2-3 years", to_senior: "5-7 years" } } },
  { tags: ["blockchain", "solidity", "web3", "cryptocurrency"], degreeFields: ["computer_science", "it", "engineering"],
    career: { title: "Blockchain Developer", fitTemplate: "Your technical skills combined with interest in {interests} position you for Web3 development.", difficulty: "Hard", growth: "High", stress_level: "High", starting_role: "Junior Smart Contract Dev", progression: ["Junior Web3 Dev", "Blockchain Developer", "Senior Blockchain Engineer", "Protocol Lead"], estimated_timeline: { to_first_role: "3-6 months", to_mid_level: "2-3 years", to_senior: "4-6 years" } } },
  // --- BUSINESS / MANAGEMENT ---
  { tags: ["product management", "communication", "leadership", "strategy", "problem solving"], degreeFields: ["management", "commerce", "computer_science", "it"],
    career: { title: "Product Manager", fitTemplate: "Your {skills} skills combined with {education} background make product management a strong leadership-track career.", difficulty: "Medium", growth: "High", stress_level: "Medium", starting_role: "Associate Product Manager", progression: ["Associate PM", "Product Manager", "Senior PM", "Director of Product", "VP of Product"], estimated_timeline: { to_first_role: "3-6 months", to_mid_level: "2-4 years", to_senior: "5-8 years" } } },
  { tags: ["marketing", "digital marketing", "social media", "content", "seo", "analytics"], degreeFields: ["management", "commerce", "arts", "other"],
    career: { title: "Digital Marketing Manager", fitTemplate: "Your interest in {interests} and {skills} skills align well with digital marketing, a field with diverse creative and analytical opportunities.", difficulty: "Easy", growth: "Medium", stress_level: "Medium", starting_role: "Marketing Intern", progression: ["Marketing Intern", "Marketing Coordinator", "Marketing Manager", "Senior Marketing Manager", "Head of Marketing"], estimated_timeline: { to_first_role: "1-2 months", to_mid_level: "2-3 years", to_senior: "5-7 years" } } },
  { tags: ["finance", "accounting", "excel", "financial analysis", "banking"], degreeFields: ["commerce", "management", "science"],
    career: { title: "Financial Analyst", fitTemplate: "Your {education} background combined with {skills} skills makes financial analysis a strong career with clear progression.", difficulty: "Medium", growth: "Medium", stress_level: "High", starting_role: "Junior Financial Analyst", progression: ["Junior Analyst", "Financial Analyst", "Senior Analyst", "Finance Manager", "CFO"], estimated_timeline: { to_first_role: "1-3 months", to_mid_level: "3-4 years", to_senior: "7-10 years" } } },
  { tags: ["consulting", "problem solving", "communication", "strategy", "analysis"], degreeFields: ["management", "commerce", "engineering", "science"],
    career: { title: "Management Consultant", fitTemplate: "Your analytical {skills} skills and {education} background are exactly what top consulting firms look for.", difficulty: "Hard", growth: "High", stress_level: "High", starting_role: "Junior Consultant", progression: ["Analyst", "Consultant", "Senior Consultant", "Manager", "Partner"], estimated_timeline: { to_first_role: "2-4 months", to_mid_level: "3-5 years", to_senior: "8-12 years" } } },
  { tags: ["hr", "recruitment", "people management", "communication", "leadership"], degreeFields: ["management", "arts", "commerce", "other"],
    career: { title: "HR Manager", fitTemplate: "Your {skills} skills and interest in people management make HR a rewarding career path.", difficulty: "Easy", growth: "Medium", stress_level: "Low", starting_role: "HR Coordinator", progression: ["HR Coordinator", "HR Generalist", "HR Manager", "Senior HR Manager", "VP of People"], estimated_timeline: { to_first_role: "1-2 months", to_mid_level: "3-4 years", to_senior: "6-8 years" } } },
  // --- SCIENCE / BIOLOGY ---
  { tags: ["research", "biology", "lab", "chemistry", "biotech", "healthcare"], degreeFields: ["biology", "science"],
    career: { title: "Biotech Research Scientist", fitTemplate: "Your {education} background and skills in {skills} directly apply to biotech research.", difficulty: "Hard", growth: "High", stress_level: "Medium", starting_role: "Research Assistant", progression: ["Research Assistant", "Junior Scientist", "Research Scientist", "Senior Scientist", "Principal Investigator"], estimated_timeline: { to_first_role: "1-3 months", to_mid_level: "3-5 years", to_senior: "7-10 years" } } },
  { tags: ["healthcare", "biology", "patient care", "medicine", "public health"], degreeFields: ["biology", "science"],
    career: { title: "Healthcare Administrator", fitTemplate: "Your {education} foundation combined with interest in {interests} opens doors in healthcare management.", difficulty: "Medium", growth: "High", stress_level: "Medium", starting_role: "Healthcare Coordinator", progression: ["Coordinator", "Administrator", "Senior Administrator", "Director", "VP of Operations"], estimated_timeline: { to_first_role: "2-4 months", to_mid_level: "3-5 years", to_senior: "7-10 years" } } },
  { tags: ["environmental", "sustainability", "science", "research", "data analysis"], degreeFields: ["science", "biology", "engineering"],
    career: { title: "Environmental Scientist", fitTemplate: "Your {skills} skills and {education} background align with the growing field of environmental science.", difficulty: "Medium", growth: "Medium", stress_level: "Low", starting_role: "Junior Environmental Analyst", progression: ["Junior Analyst", "Environmental Scientist", "Senior Scientist", "Lead Researcher", "Director"], estimated_timeline: { to_first_role: "2-4 months", to_mid_level: "3-5 years", to_senior: "7-10 years" } } },
  // --- ARTS ---
  { tags: ["writing", "content", "creative writing", "journalism", "editing", "communication"], degreeFields: ["arts", "other"],
    career: { title: "Content Strategist / Writer", fitTemplate: "Your {skills} skills and creative background make content strategy a natural fit with growing demand.", difficulty: "Easy", growth: "Medium", stress_level: "Low", starting_role: "Junior Content Writer", progression: ["Junior Writer", "Content Writer", "Senior Writer", "Content Strategist", "Head of Content"], estimated_timeline: { to_first_role: "1-2 months", to_mid_level: "2-3 years", to_senior: "4-6 years" } } },
  { tags: ["photography", "video", "film", "media", "creative", "design"], degreeFields: ["arts", "other"],
    career: { title: "Creative Director / Media Producer", fitTemplate: "Your creative talents in {skills} and passion for {interests} open doors to media production.", difficulty: "Medium", growth: "Medium", stress_level: "Medium", starting_role: "Junior Creative", progression: ["Junior Creative", "Designer/Editor", "Senior Creative", "Art Director", "Creative Director"], estimated_timeline: { to_first_role: "2-4 months", to_mid_level: "3-4 years", to_senior: "6-8 years" } } },
  // --- ENGINEERING (non-software) ---
  { tags: ["mechanical", "manufacturing", "cad", "design", "engineering", "physics"], degreeFields: ["engineering", "science"],
    career: { title: "Mechanical / Industrial Engineer", fitTemplate: "Your {education} background and {skills} skills are the foundation of engineering careers with excellent stability.", difficulty: "Medium", growth: "Medium", stress_level: "Medium", starting_role: "Junior Engineer", progression: ["Junior Engineer", "Engineer", "Senior Engineer", "Lead Engineer", "Engineering Director"], estimated_timeline: { to_first_role: "1-3 months", to_mid_level: "3-5 years", to_senior: "7-10 years" } } },
  { tags: ["civil", "construction", "architecture", "surveying", "structural"], degreeFields: ["engineering"],
    career: { title: "Civil / Structural Engineer", fitTemplate: "Your {education} degree directly qualifies you for civil engineering roles with strong job security.", difficulty: "Medium", growth: "Medium", stress_level: "Medium", starting_role: "Graduate Engineer", progression: ["Graduate Engineer", "Site Engineer", "Senior Engineer", "Project Manager", "Director"], estimated_timeline: { to_first_role: "0-2 months", to_mid_level: "3-5 years", to_senior: "7-10 years" } } },
];

// ============================================================
// GENERATE PERSONALIZED MOCK ANALYSIS
// ============================================================

// ============================================================
// CAREER-SPECIFIC RESOURCES
// ============================================================

const RESOURCE_MAP: Record<string, { title: string; type: "course" | "youtube" | "article" | "project" | "docs"; reason: string; url: string }[]> = {
  "Frontend Developer": [
    { title: "The Odin Project — Full Stack JavaScript", type: "course", reason: "Comprehensive free curriculum for frontend + full-stack", url: "https://www.theodinproject.com/" },
    { title: "Build a Modern React App (Fireship)", type: "youtube", reason: "Quick practical React project walkthrough", url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM" },
    { title: "CSS Tricks — A Complete Guide to Flexbox", type: "article", reason: "Master CSS layout fundamentals", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
    { title: "Build a Portfolio Website", type: "project", reason: "Your first portfolio piece for job applications", url: "https://github.com/topics/portfolio-website" },
    { title: "MDN Web Docs — JavaScript", type: "docs", reason: "The definitive JS reference", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  ],
  "Backend Engineer": [
    { title: "Node.js — The Complete Guide (Udemy)", type: "course", reason: "Deep dive into server-side JavaScript", url: "https://www.udemy.com/course/nodejs-the-complete-guide/" },
    { title: "Build a REST API from Scratch", type: "project", reason: "Demonstrates backend skills employers look for", url: "https://github.com/topics/rest-api" },
    { title: "System Design Primer", type: "article", reason: "Learn how to design scalable systems", url: "https://github.com/donnemartin/system-design-primer" },
    { title: "Traversy Media — Express.js Crash Course", type: "youtube", reason: "Quick API framework tutorial", url: "https://www.youtube.com/watch?v=L72fhGm1tfE" },
    { title: "PostgreSQL Documentation", type: "docs", reason: "Master your database", url: "https://www.postgresql.org/docs/" },
  ],
  "Data Scientist / ML Engineer": [
    { title: "fast.ai — Practical Deep Learning", type: "course", reason: "Top-down approach to learning ML that works", url: "https://www.fast.ai/" },
    { title: "Kaggle Learn — Intro to Machine Learning", type: "course", reason: "Hands-on ML with real datasets", url: "https://www.kaggle.com/learn/intro-to-machine-learning" },
    { title: "3Blue1Brown — Neural Networks", type: "youtube", reason: "Best visual explanation of how neural nets work", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
    { title: "Build a Data Dashboard with Python", type: "project", reason: "Practical data viz project for your portfolio", url: "https://github.com/topics/data-dashboard" },
    { title: "scikit-learn Documentation", type: "docs", reason: "Essential ML library reference", url: "https://scikit-learn.org/stable/documentation.html" },
  ],
  "UX/UI Designer": [
    { title: "Google UX Design Certificate", type: "course", reason: "Industry-recognized UX credential", url: "https://grow.google/certificates/ux-design/" },
    { title: "Figma Tutorial for Beginners", type: "youtube", reason: "Master the #1 design tool", url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8" },
    { title: "Laws of UX", type: "article", reason: "Core UX principles every designer should know", url: "https://lawsofux.com/" },
    { title: "Redesign a Popular App", type: "project", reason: "Classic portfolio piece that shows your process", url: "https://uxdesign.cc/" },
    { title: "Figma Community Resources", type: "docs", reason: "Free templates and design systems", url: "https://www.figma.com/community" },
  ],
  "Cybersecurity Analyst": [
    { title: "TryHackMe — Complete Beginner Path", type: "course", reason: "Hands-on cybersecurity learning", url: "https://tryhackme.com/" },
    { title: "CompTIA Security+ Study Guide", type: "article", reason: "Industry standard security certification", url: "https://www.comptia.org/certifications/security" },
    { title: "NetworkChuck — Ethical Hacking", type: "youtube", reason: "Engaging intro to penetration testing", url: "https://www.youtube.com/c/NetworkChuck" },
    { title: "Build a Home Security Lab", type: "project", reason: "Practice in a safe environment", url: "https://github.com/topics/security-lab" },
    { title: "OWASP Top 10", type: "docs", reason: "Must-know web security vulnerabilities", url: "https://owasp.org/www-project-top-ten/" },
  ],
  "Digital Marketing Manager": [
    { title: "Google Digital Marketing Certificate", type: "course", reason: "Free certification from Google", url: "https://grow.google/certificates/digital-marketing-ecommerce/" },
    { title: "HubSpot Marketing Blog", type: "article", reason: "Stay current on marketing trends", url: "https://blog.hubspot.com/marketing" },
    { title: "Neil Patel — SEO Tutorial", type: "youtube", reason: "Learn SEO from a top practitioner", url: "https://www.youtube.com/user/neaborncreative" },
    { title: "Create a Social Media Campaign", type: "project", reason: "Hands-on marketing portfolio piece", url: "https://blog.hootsuite.com/" },
    { title: "Google Analytics Academy", type: "docs", reason: "Master analytics — essential for any marketer", url: "https://analytics.google.com/analytics/academy/" },
  ],
  "Product Manager": [
    { title: "Product School — Free PM Course", type: "course", reason: "Intro to product management fundamentals", url: "https://productschool.com/" },
    { title: "Lenny's Newsletter", type: "article", reason: "Top PM newsletter with actionable advice", url: "https://www.lennysnewsletter.com/" },
    { title: "How to Get Into Product Management", type: "youtube", reason: "Realistic career transition advice", url: "https://www.youtube.com/results?search_query=product+management+career" },
    { title: "Write a Product Spec Document", type: "project", reason: "Core PM skill to practice", url: "https://github.com/topics/product-management" },
    { title: "Inspired by Marty Cagan (Book)", type: "docs", reason: "The PM bible — how to build products people love", url: "https://www.svpg.com/inspired-how-to-create-products-customers-love/" },
  ],
  "Mobile App Developer": [
    { title: "Flutter & Dart — The Complete Guide", type: "course", reason: "Build cross-platform mobile apps", url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/" },
    { title: "Fireship — Flutter in 100 Seconds", type: "youtube", reason: "Quick overview of Flutter", url: "https://www.youtube.com/watch?v=lHn9OqWGsWA" },
    { title: "Build a Weather App", type: "project", reason: "Classic mobile portfolio project", url: "https://github.com/topics/weather-app" },
    { title: "React Native Docs", type: "docs", reason: "Alternative mobile framework reference", url: "https://reactnative.dev/docs/getting-started" },
    { title: "Mobile App Design Best Practices", type: "article", reason: "Design patterns for mobile UX", url: "https://developer.apple.com/design/human-interface-guidelines/" },
  ],
  "Creative Director / Media Producer": [
    { title: "Adobe Creative Cloud Tutorials", type: "course", reason: "Master industry-standard creative tools", url: "https://helpx.adobe.com/creative-cloud/tutorials.html" },
    { title: "The Futur — Chris Do", type: "youtube", reason: "Business of design and creativity", url: "https://www.youtube.com/c/thefuturishere" },
    { title: "Build a Creative Portfolio", type: "project", reason: "Essential for any creative career", url: "https://www.behance.net/" },
    { title: "Creative Bloq", type: "article", reason: "Stay inspired with design trends", url: "https://www.creativebloq.com/" },
    { title: "Behance Community", type: "docs", reason: "Showcase work and connect with creatives", url: "https://www.behance.net/" },
  ],
};

const DEFAULT_RESOURCES = [
  { title: "Learning How to Learn (Coursera)", type: "course" as const, reason: "Meta-learning skills for any career", url: "https://www.coursera.org/learn/learning-how-to-learn" },
  { title: "Atomic Habits by James Clear", type: "article" as const, reason: "Build systems for career growth", url: "https://jamesclear.com/atomic-habits" },
  { title: "Ali Abdaal — Productivity Tips", type: "youtube" as const, reason: "Evidence-based productivity", url: "https://www.youtube.com/c/aliabdaal" },
  { title: "Build Something — Anything", type: "project" as const, reason: "The best learning is doing", url: "https://github.com/" },
  { title: "LinkedIn Learning", type: "docs" as const, reason: "Broad skill development platform", url: "https://www.linkedin.com/learning/" },
];

export function generateResources(careers: CareerMatch[], profile: UserProfile) {
  const resources: { title: string; type: "course" | "youtube" | "article" | "project" | "docs"; reason: string; url: string }[] = [];
  const seen = new Set<string>();

  // Add resources for top 2 careers
  for (const career of careers.slice(0, 2)) {
    const careerResources = RESOURCE_MAP[career.title] || [];
    for (const r of careerResources) {
      if (!seen.has(r.title)) { resources.push(r); seen.add(r.title); }
      if (resources.length >= 6) break;
    }
  }

  // Fill remaining with defaults
  for (const r of DEFAULT_RESOURCES) {
    if (resources.length >= 8) break;
    if (!seen.has(r.title)) { resources.push(r); seen.add(r.title); }
  }

  return resources;
}

export function generateMockAnalysis(profile: UserProfile): AnalysisResponse {
  const skills = profile.skills.map((s) => s.toLowerCase());
  const interests = profile.interests.map((i) => i.toLowerCase());
  const degreeField = profile.degreeField || "other";

  // Score each career
  const scored = CAREER_POOL.map((cp) => {
    let score = 0;
    // Skill matching (strongest signal)
    cp.tags.forEach((tag) => {
      if (skills.some((s) => s.includes(tag) || tag.includes(s))) score += 3;
    });
    // Interest matching
    cp.tags.forEach((tag) => {
      if (interests.some((i) => i.includes(tag) || tag.includes(i))) score += 2;
    });
    // Degree field matching
    if (cp.degreeFields.includes(degreeField)) score += 4;
    // Education text matching
    const edu = profile.education.toLowerCase();
    cp.tags.forEach((tag) => { if (edu.includes(tag)) score += 1; });
    return { ...cp, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((c) => c.score > 0).slice(0, 5);
  while (top.length < 3) {
    const next = scored.find((c) => !top.includes(c));
    if (next) top.push(next); else break;
  }

  const careers: CareerMatch[] = top.map((c) => {
    const matchedSkills = profile.skills.filter((s) => c.tags.some((t) => s.toLowerCase().includes(t) || t.includes(s.toLowerCase())));
    const matchedInterests = profile.interests.filter((i) => c.tags.some((t) => i.toLowerCase().includes(t) || t.includes(i.toLowerCase())));
    return {
      ...c.career,
      fit_reason: c.career.fitTemplate
        .replace("{skills}", matchedSkills.length > 0 ? matchedSkills.join(", ") : profile.skills.slice(0, 2).join(", ") || "your skills")
        .replace("{interests}", matchedInterests.length > 0 ? matchedInterests.join(", ") : profile.interests[0] || "your interests")
        .replace("{education}", profile.education),
    };
  });

  const topTitle = careers[0]?.title || "your chosen field";
  const totalHours = profile.weeklyWorkHours + profile.weeklyStudyHours;
  const burnoutLevel = totalHours >= 55 ? "High" : totalHours >= 35 ? "Medium" : "Low";
  const burnoutRisk = profile.emotionalState === "burned_out" || profile.emotionalState === "overwhelmed" ? "High"
    : totalHours >= 50 || profile.sleepQuality === "poor" ? "Medium" : "Low";

  return {
    user_summary: { name: profile.name, education: profile.education, current_status: profile.currentStatus.replace("_", " ") },
    career_matches: careers,
    roadmap: {
      current_stage: `${profile.currentStatus.replace("_", " ")} exploring ${topTitle}`,
      next_30_days: [
        { title: `Focus on ${topTitle} fundamentals`, description: `Leverage your ${profile.skills.slice(0, 2).join(", ")} skills to build a foundation. Start with hands-on projects.`, duration: "Weeks 1-2", tasks: [`Research what ${topTitle} roles require`, `Start a small project using ${profile.skills[0] || "your primary skill"}`, "Set up a portfolio or GitHub"] },
        { title: "Build your first project", description: "Ship something small but complete.", duration: "Weeks 3-4", tasks: [`Build a project combining ${profile.skills.slice(0, 2).join(" and ")}`, "Write a case study", "Get feedback from someone in the field"] },
      ],
      next_3_months: [{ title: `Deepen ${profile.skills[0] || "core"} expertise`, description: `Go beyond basics in ${topTitle}.`, duration: "Months 1-3", tasks: ["Complete one focused course", "Build 2 portfolio projects", "Connect with 5 professionals", "Apply to 10+ positions"] }],
      next_6_months: [{ title: "Establish credibility", description: "Portfolio and network are your resume.", duration: "Months 3-6", tasks: ["3+ polished projects", "Attend meetups", `Practice ${topTitle} interviews weekly`] }],
      next_12_months: [{ title: "Specialize and level up", description: `Find your niche within ${topTitle}.`, duration: "Months 6-12", tasks: ["Pick a specialization", "Lead a project at work", "Mentor someone newer"] }],
    },
    burnout: {
      stress_level: burnoutLevel as "Low" | "Medium" | "High", burnout_risk: burnoutRisk as "Low" | "Medium" | "High",
      risk_window: burnoutRisk === "High" ? "2-4 weeks" : burnoutRisk === "Medium" ? "6-8 weeks" : "Sustainable",
      reasons: [`${totalHours}h/week total workload`, `Sleep: ${profile.sleepQuality}`, `Mood: ${profile.emotionalState.replace("_", " ")}`],
      recommendations: ["Set a hard stop time daily", "ONE course/project at a time", "One full rest day per week", "20-min daily walk", "Track wins weekly"],
    },
    resources: generateResources(careers, profile),
  };
}

// ============================================================
// MOCK CHECK-IN RESPONSE
// ============================================================

export function generateMockCheckIn(profile: UserProfile, analysis: AnalysisResponse, message: string): CheckInResponse {
  const msg = message.toLowerCase();
  const topCareer = analysis.career_matches[0]?.title || "your career";
  const totalHours = profile.weeklyWorkHours + profile.weeklyStudyHours;
  const burnedOut = msg.includes("burn") || msg.includes("tired") || msg.includes("exhaust") || msg.includes("overwhelm");
  const feelsStuck = msg.includes("stuck") || msg.includes("lost") || msg.includes("confused");
  const wantsNext = msg.includes("next") || msg.includes("step") || msg.includes("focus") || msg.includes("what should");
  const wantsCareer = msg.includes("switch") || msg.includes("change") || msg.includes("career") || msg.includes("suggestion") || msg.includes("path") || msg.includes("explore") || wantsNext;

  let ack: string, insight: string, recs: string[];
  if (burnedOut) {
    ack = `I hear you, ${profile.name}. Working ${totalHours}h/week is genuinely exhausting. Feeling burned out means you've been pushing hard — not that you're failing.`;
    insight = "Rest strategically. One week of recovery saves a month of diminished output.";
    recs = ["Take 2-3 days off from study", `Reduce study hours from ${profile.weeklyStudyHours}h to ${Math.max(5, profile.weeklyStudyHours - 10)}h`, "Do something fun and non-career", "Sleep 8 hours for 5 nights straight", "Return to ONE thing at a time"];
  } else if (feelsStuck) {
    ack = `Feeling stuck is frustrating, ${profile.name}, but it's a normal plateau — a sign you've been learning.`;
    insight = "The fastest way through: ship something small. Building beats consuming.";
    recs = ["Pause courses for a week, build instead", "Write down 3 things you learned this month", `Apply to 3 ${topCareer} positions`, "Talk to someone in your target field", "Set tiny daily goals"];
  } else if (wantsNext) {
    ack = `Great question, ${profile.name}! Let me help you prioritize.`;
    insight = `For ${topCareer}, build a project showing your ${profile.skills[0] || "core"} skills to employers.`;
    recs = [`Build a portfolio project with ${profile.skills.slice(0, 2).join(" + ")}`, `Study job descriptions for ${topCareer}`, "Dedicate 2 weeks to one skill gap", "Update LinkedIn for target role", "Schedule 2 informational interviews"];
  } else {
    ack = `Thanks for checking in, ${profile.name}! Every step counts.`;
    insight = `You're on a solid path toward ${topCareer}. Consistency beats intensity.`;
    recs = ["Continue building with hands-on projects", "Review your roadmap", "Reach out to your network", "Celebrate a recent win"];
  }

  return {
    acknowledgment: ack, insight,
    updated_recommendations: recs,
    updated_burnout: { stress_level: burnedOut ? "High" : "Medium", burnout_risk: burnedOut ? "High" : "Low", risk_window: burnedOut ? "2-4 weeks" : "Sustainable", reasons: [`${totalHours}h/week`], recommendations: burnedOut ? ["Reduce hours", "Sleep more"] : ["Stay consistent"] },
    suggested_resources: [
      { title: `${topCareer} guide`, type: "article", reason: "Relevant to your path", url: "https://example.com/guide" },
      { title: "Developer burnout tips", type: "youtube", reason: "Manage your workload", url: "https://youtube.com/watch?v=example" },
    ],
    updated_career_matches: wantsCareer ? analysis.career_matches.slice(0, 3) : undefined,
  };
}

// Backward compat exports
export const MOCK_ANALYSIS: AnalysisResponse = generateMockAnalysis({
  name: "User", email: "", education: "Bachelor's in Computer Science", educationLevel: "bachelors", degreeField: "computer_science",
  currentStatus: "student", skills: ["JavaScript", "Python"], interests: ["Web Development"],
  weeklyStudyHours: 10, weeklyWorkHours: 20, sleepQuality: "fair", emotionalState: "neutral", currentGoal: "Get a job", careerStage: "exploring",
});
export const MOCK_CHECKIN_RESPONSE: CheckInResponse = generateMockCheckIn(
  { name: "User", email: "", education: "CS", educationLevel: "bachelors", degreeField: "computer_science", currentStatus: "student", skills: ["JavaScript"], interests: ["Web Development"], weeklyStudyHours: 10, weeklyWorkHours: 20, sleepQuality: "fair", emotionalState: "neutral", currentGoal: "Get a job", careerStage: "exploring" },
  MOCK_ANALYSIS, "I feel stuck"
);
