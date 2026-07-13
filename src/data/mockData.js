// Mock seed data standing in for the systems the real build would call:
// Me@Slalom (profile/skills), Slack/Teams/email intake, AI validation service,
// internal training catalog. Shapes follow PRD §3.2 TR-4 data model.

let idCounter = 1000;
export function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export const BENCH_CAPACITY_HOURS = 40;

export const demandSources = [
  { id: "sales-pursuit", label: "Sales & pursuit support", color: "var(--sl-blue)" },
  { id: "capability-building", label: "Building delivery capabilities", color: "var(--sl-teal)" },
  { id: "internal-initiative", label: "Internal initiative", color: "var(--sl-purple)" },
  { id: "other", label: "Other", color: "var(--sl-ink-secondary)" },
];

export const skillCatalog = [
  "React", "Vue.js", "Node.js", "AWS", "Data Engineering", "Salesforce",
  "Change Management", "UX Research", "Agile Coaching", "Generative AI",
  "Power BI", "Snowflake", "Product Strategy", "QA Automation", "Figma",
];

// ---- Jordan's consultant profile (pre-populated from Me@Slalom + self-declared aspirations) ----
export const consultantProfile = {
  id: "jordan-rivera",
  name: "Jordan Rivera",
  title: "Senior Consultant, Technology Enablement",
  availableHoursPerWeek: 35,
  onboardingComplete: false,
  skills: [
    { name: "React", level: "Advanced", source: "me@slalom" },
    { name: "Node.js", level: "Advanced", source: "me@slalom" },
    { name: "AWS", level: "Intermediate", source: "me@slalom" },
    { name: "Agile Coaching", level: "Intermediate", source: "me@slalom" },
  ],
  aspirations: [
    { name: "Generative AI", addedAt: "2026-06-02" },
  ],
  lastEditedAt: "2026-06-02",
  recognition: {
    points: 140,
    badges: ["First Claim", "Fast Responder"],
  },
};

// ---- Learning catalog (mock internal training) ----
export const learningCatalog = [
  { skill: "Generative AI", title: "Applied GenAI for Consultants", provider: "Slalom Build", hours: 6 },
  { skill: "Generative AI", title: "Prompt Engineering Foundations", provider: "Slalom Learn", hours: 3 },
  { skill: "Data Engineering", title: "Modern Data Stack Bootcamp", provider: "Slalom Build", hours: 8 },
  { skill: "Change Management", title: "Leading Change at Slalom", provider: "Slalom Learn", hours: 4 },
  { skill: "Power BI", title: "Power BI for Consultants", provider: "Slalom Learn", hours: 5 },
];

// ---- Opportunities (already vetted + published, per "intake is now automated") ----
// requiredTraining is a UI-only mock of a future learning-portal deep link: when any
// entry is incomplete, claiming is disabled in the prototype. No real integration.
export const opportunities = [
  {
    id: "opp-1",
    title: "GenAI readiness assessment for retail pursuit",
    description: "Build a lightweight GenAI maturity assessment deck to support the upcoming retail client pursuit. Includes a scoring rubric and 3 use-case sketches.",
    requester: "Megan Smith",
    requesterTitle: "Capability Lead, Data & AI",
    requesterResponseHint: "Usually replies within a few hours",
    demandSource: "sales-pursuit",
    skillsRequired: ["Generative AI", "Product Strategy"],
    estimatedHours: 24,
    businessValueScore: 88,
    status: "published",
    successCriteria: "Deck reviewed and approved by pursuit lead before Friday client call.",
    tools: ["PowerPoint", "Slalom GenAI Sandbox"],
    createdAt: "2026-07-08",
    claimedBy: null,
    claimedAt: null,
    hoursLogged: 0,
    requiredTraining: [
      { title: "Applied GenAI for Consultants", provider: "Slalom Build", completed: false, url: "#" },
    ],
    qaThread: [],
  },
  {
    id: "opp-2",
    title: "Automate onboarding checklist with a Node.js service",
    description: "Replace the manual new-hire checklist spreadsheet with a small internal service that tracks completion and sends reminders.",
    requester: "Megan Smith",
    requesterTitle: "Capability Lead, Data & AI",
    requesterResponseHint: "Usually replies within a few hours",
    demandSource: "capability-building",
    skillsRequired: ["Node.js", "AWS"],
    estimatedHours: 32,
    businessValueScore: 74,
    status: "published",
    successCriteria: "Service deployed to internal sandbox; tracks at least 5 checklist items with reminder emails.",
    tools: ["AWS", "GitHub"],
    createdAt: "2026-07-05",
    claimedBy: null,
    claimedAt: null,
    hoursLogged: 0,
    requiredTraining: [],
    qaThread: [],
  },
  {
    id: "opp-3",
    title: "Bench dashboard UX pass",
    description: "Review the internal bench-health dashboard prototype and propose UX improvements to reduce time-to-insight for capability leads.",
    requester: "Alice Li",
    requesterTitle: "Change Lead, Bench Experience",
    requesterResponseHint: "Usually replies same day",
    demandSource: "internal-initiative",
    skillsRequired: ["UX Research", "Figma"],
    estimatedHours: 16,
    businessValueScore: 61,
    status: "published",
    successCriteria: "Annotated Figma file with at least 5 concrete recommendations.",
    tools: ["Figma"],
    createdAt: "2026-07-10",
    claimedBy: null,
    claimedAt: null,
    hoursLogged: 0,
    requiredTraining: [],
    qaThread: [],
  },
  {
    id: "opp-4",
    title: "Prompt library for delivery teams",
    description: "Curate and document a reusable prompt library for common delivery tasks (status reports, retros, risk logs) using Slalom's GenAI tooling.",
    requester: "Megan Smith",
    requesterTitle: "Capability Lead, Data & AI",
    requesterResponseHint: "Usually replies within a few hours",
    demandSource: "capability-building",
    skillsRequired: ["Generative AI", "Agile Coaching"],
    estimatedHours: 20,
    businessValueScore: 79,
    status: "in-progress",
    successCriteria: "10+ documented prompts, each with example output, published to the internal wiki.",
    tools: ["Slalom GenAI Sandbox", "Confluence"],
    createdAt: "2026-06-28",
    claimedBy: "jordan-rivera",
    claimedAt: "2026-07-09T14:50:00",
    hoursLogged: 11,
    requiredTraining: [
      { title: "Prompt Engineering Foundations", provider: "Slalom Learn", completed: true, url: "#" },
    ],
    qaThread: [
      { id: "qa-1", author: "Megan Smith", text: "Happy to jump on a call if you want to align on scope before you dive in.", at: "2026-07-09T15:10:00" },
      { id: "qa-2", author: "Jordan Rivera", text: "Thanks! I'll start with status reports + retros and share a draft by Thursday.", at: "2026-07-09T16:02:00" },
    ],
  },
  {
    id: "opp-5",
    title: "Salesforce data cleanup for pursuit reporting",
    description: "Cleanse duplicate and stale records in the pursuit-tracking Salesforce instance ahead of quarterly reporting.",
    requester: "Megan Smith",
    requesterTitle: "Capability Lead, Data & AI",
    requesterResponseHint: "Usually replies within a few hours",
    demandSource: "sales-pursuit",
    skillsRequired: ["Salesforce"],
    estimatedHours: 12,
    businessValueScore: 52,
    status: "published",
    successCriteria: "Duplicate rate below 2%; stale (12mo+ untouched) records archived.",
    tools: ["Salesforce"],
    createdAt: "2026-07-11",
    claimedBy: null,
    claimedAt: null,
    hoursLogged: 0,
    requiredTraining: [],
    qaThread: [],
  },
  {
    id: "opp-6",
    title: "QA automation for internal timesheet tool",
    description: "Stood-up but stalled when the prior consultant rolled onto a client engagement. Needs someone to pick up the automated regression suite.",
    requester: "Megan Smith",
    requesterTitle: "Capability Lead, Data & AI",
    requesterResponseHint: "Usually replies within a few hours",
    demandSource: "internal-initiative",
    skillsRequired: ["QA Automation"],
    estimatedHours: 28,
    businessValueScore: 58,
    status: "abandoned",
    successCriteria: "Regression suite covers core timesheet submission and approval flows.",
    tools: ["Playwright", "GitHub Actions"],
    createdAt: "2026-06-10",
    claimedBy: null,
    claimedAt: null,
    hoursLogged: 0,
    requiredTraining: [],
    abandonedReason: "Previous consultant (Priya M.) rolled onto a client engagement on 2026-07-01 with no handoff.",
    qaThread: [],
  },
];

// ---- Status updates (Jordan reporting progress back into the system) ----
export const statusUpdates = [
  {
    id: "su-1",
    opportunityId: "opp-4",
    author: "Jordan Rivera",
    text: "Drafted 6 of 10 prompts (status reports + retros). Sharing for early feedback.",
    hoursLogged: 11,
    status: "in-progress",
    at: "2026-07-11T14:30:00",
  },
];

// ---- AI validation exceptions — the only submissions that reach Megan (human-in-the-loop) ----
export const exceptions = [
  {
    id: "exc-1",
    draft: {
      title: "Help me with my client deck",
      description: "need someone to make my slides look nicer for a meeting tomorrow",
      requester: "Tom Alvarez",
      demandSource: "sales-pursuit",
      estimatedHours: 2,
    },
    aiDecision: "flagged-reject",
    aiRationale: "Estimated effort is under the 1-hour self-service threshold and lacks a problem statement, goal, or success criteria (FR-12a rubric). Recommend returning to requester for clarification or self-service.",
    scoreBreakdown: { businessValue: 20, definitionQuality: 15, aging: 5, feasibility: 40 },
    status: "pending",
    submittedAt: "2026-07-12T09:00:00",
  },
  {
    id: "exc-2",
    draft: {
      title: "Migrate legacy reporting scripts to Snowflake",
      description: "Our internal reporting scripts still run against the old warehouse. Needs migration and validation against 3 key dashboards.",
      requester: "Megan Smith",
      demandSource: "capability-building",
      estimatedHours: 560,
    },
    aiDecision: "flagged-reject",
    aiRationale: "Estimated hours (560) exceed the 2-4 week bench-window guideline and should be split into smaller, independently claimable items before publishing.",
    scoreBreakdown: { businessValue: 82, definitionQuality: 70, aging: 10, feasibility: 25 },
    status: "pending",
    submittedAt: "2026-07-12T11:20:00",
  },
  {
    id: "exc-3",
    draft: {
      title: "Executive-ready AI use-case brief for board meeting",
      description: "Prepare a 2-page brief on 3 high-value AI use cases for the August board meeting, tied to current account growth targets.",
      requester: "Jon Foss",
      demandSource: "internal-initiative",
      estimatedHours: 18,
    },
    aiDecision: "flagged-approve",
    aiRationale: "High business value (executive-sponsored, board-visible) and well-defined, but flagged for human sign-off given executive visibility per admin exception policy.",
    scoreBreakdown: { businessValue: 95, definitionQuality: 88, aging: 2, feasibility: 90 },
    status: "pending",
    submittedAt: "2026-07-13T08:15:00",
  },
];

// ---- Activity feed events (Megan's aggregated view across her opportunities) ----
export const activityEvents = [
  { id: "act-1", type: "qa", opportunityId: "opp-4", opportunityTitle: "Prompt library for delivery teams", text: "Jordan Rivera replied in Q&A.", at: "2026-07-09T16:02:00" },
  { id: "act-2", type: "status", opportunityId: "opp-4", opportunityTitle: "Prompt library for delivery teams", text: "Jordan Rivera posted a status update (11/20 hrs logged).", at: "2026-07-11T14:30:00" },
  { id: "act-3", type: "claim", opportunityId: "opp-4", opportunityTitle: "Prompt library for delivery teams", text: "Jordan Rivera claimed this opportunity.", at: "2026-07-09T14:50:00" },
  { id: "act-4", type: "abandoned", opportunityId: "opp-6", opportunityTitle: "QA automation for internal timesheet tool", text: "Flagged as abandoned — consultant rolled onto a client engagement.", at: "2026-07-01T10:00:00" },
];
