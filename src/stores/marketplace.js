import { defineStore } from "pinia";
import {
  opportunities as seedOpportunities,
  exceptions as seedExceptions,
  activityEvents as seedActivity,
  statusUpdates as seedStatusUpdates,
  consultantProfile as seedProfile,
  learningCatalog,
  demandSources,
  BENCH_CAPACITY_HOURS,
  nextId,
} from "../data/mockData";

function daysAgo(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

// Assumed pace for auto-tracking progress on an active claim: consultants split
// bench time across active items, so hours accrue gradually rather than being
// self-reported. No manual input — hours logged is derived from claimedAt.
const ASSUMED_HOURS_PER_DAY = 4;

function computeAutoHours(opportunity) {
  if (!opportunity.claimedAt) return 0;
  return Math.min(opportunity.estimatedHours, daysAgo(opportunity.claimedAt) * ASSUMED_HOURS_PER_DAY);
}

// Simple skill-overlap match score used for the "pushed matches" feed (FR-2 / TR-19).
function matchScore(opportunity, profile) {
  const known = new Set(profile.skills.map((s) => s.name));
  const aspirational = new Set(profile.aspirations.map((a) => a.name));
  let score = 0;
  opportunity.skillsRequired.forEach((skill) => {
    if (known.has(skill)) score += 60 / opportunity.skillsRequired.length;
    else if (aspirational.has(skill)) score += 40 / opportunity.skillsRequired.length;
  });
  if (opportunity.estimatedHours <= profile.availableHoursPerWeek) score += 15;
  score += Math.min(15, opportunity.businessValueScore / 8);
  return Math.round(Math.min(100, score));
}

const ACTIVE_STATUSES = ["in-progress", "blocked"];

export const useMarketplaceStore = defineStore("marketplace", {
  state: () => ({
    opportunities: seedOpportunities.map((o) => ({
      ...o,
      qaThread: [...o.qaThread],
      requiredTraining: (o.requiredTraining || []).map((t) => ({ ...t })),
    })),
    exceptions: seedExceptions.map((e) => ({ ...e })),
    activity: [...seedActivity],
    statusUpdates: [...seedStatusUpdates],
    profile: { ...seedProfile, skills: [...seedProfile.skills], aspirations: [...seedProfile.aspirations] },
    learningCatalog,
    demandSources,
    capacityHours: BENCH_CAPACITY_HOURS,
    onboardingPromptDismissed: false,
    notifications: [
      { id: "n-1", text: "You were matched to a new opportunity: “Bench dashboard UX pass”.", read: false, at: "2026-07-12T09:00:00" },
      { id: "n-2", text: "Megan Smith replied on “Prompt library for delivery teams”.", read: false, at: "2026-07-09T16:02:00" },
    ],
  }),

  getters: {
    publishedOpportunities: (state) =>
      state.opportunities.filter((o) => o.status === "published"),

    matchedOpportunities(state) {
      return state.opportunities
        .filter((o) => o.status === "published")
        .map((o) => ({ ...o, matchScore: matchScore(o, state.profile) }))
        .sort((a, b) => b.matchScore - a.matchScore);
    },

    myActiveWork: (state) =>
      state.opportunities.filter(
        (o) => o.claimedBy === state.profile.id && ACTIVE_STATUSES.includes(o.status)
      ),

    myCompletedWork: (state) =>
      state.opportunities.filter((o) => o.claimedBy === state.profile.id && o.status === "completed"),

    committedHours() {
      return this.myActiveWork.reduce((sum, o) => sum + o.estimatedHours, 0);
    },

    remainingCapacity(state) {
      return Math.max(0, state.capacityHours - this.committedHours);
    },

    opportunityById: (state) => (id) => state.opportunities.find((o) => o.id === id),

    pendingExceptions: (state) => state.exceptions.filter((e) => e.status === "pending"),

    abandonedOpportunities: (state) =>
      state.opportunities.filter((o) => o.status === "abandoned"),

    kpis(state) {
      const total = state.opportunities.length;
      const byStatus = (s) => state.opportunities.filter((o) => o.status === s).length;
      const claimed = state.opportunities.filter((o) => o.claimedAt);
      const avgTimeToClaimDays =
        claimed.length === 0
          ? 0
          : Math.round(
              claimed.reduce((sum, o) => {
                const created = new Date(o.createdAt).getTime();
                const claimedAt = new Date(o.claimedAt).getTime();
                return sum + (claimedAt - created) / (1000 * 60 * 60 * 24);
              }, 0) / claimed.length
            );
      const bench = 1000; // per PRD: ~1,000 consultants/week on the bench
      const engaged = 1; // mock: 1 active consultant in this prototype (Jordan)
      return {
        published: byStatus("published"),
        inProgress: byStatus("in-progress"),
        blocked: byStatus("blocked"),
        completed: byStatus("completed"),
        abandoned: byStatus("abandoned"),
        pendingReview: state.exceptions.filter((e) => e.status === "pending").length,
        total,
        avgTimeToClaimDays,
        utilizationPct: Math.round((engaged / bench) * 100 * 10) / 10,
        agingBuckets: bucketAging(state.opportunities),
      };
    },
  },

  actions: {
    claimOpportunity(opportunityId) {
      const opp = this.opportunities.find((o) => o.id === opportunityId);
      if (!opp || opp.status !== "published") return;

      const incompleteTraining = (opp.requiredTraining || []).filter((t) => !t.completed);
      if (incompleteTraining.length > 0) {
        throw new Error(
          `Complete required training first: ${incompleteTraining.map((t) => t.title).join(", ")}.`
        );
      }
      if (opp.estimatedHours > this.remainingCapacity) {
        throw new Error(
          `This is ${opp.estimatedHours} hrs, but you only have ${this.remainingCapacity} hrs of bench capacity left (40 hr cap).`
        );
      }

      opp.status = "in-progress";
      opp.claimedBy = this.profile.id;
      opp.claimedAt = new Date().toISOString();
      opp.hoursLogged = 0;
      this.activity.unshift({
        id: nextId("act"),
        type: "claim",
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        text: `${this.profile.name} claimed this opportunity.`,
        at: opp.claimedAt,
      });
    },

    addQaMessage(opportunityId, author, text) {
      const opp = this.opportunities.find((o) => o.id === opportunityId);
      if (!opp) return;
      const entry = { id: nextId("qa"), author, text, at: new Date().toISOString() };
      opp.qaThread.push(entry);
      this.activity.unshift({
        id: nextId("act"),
        type: "qa",
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        text: `${author} posted in Q&A.`,
        at: entry.at,
      });
    },

    postStatusUpdate(opportunityId, text) {
      const opp = this.opportunities.find((o) => o.id === opportunityId);
      if (!opp) return;
      opp.hoursLogged = computeAutoHours(opp);
      const update = {
        id: nextId("su"),
        opportunityId,
        author: this.profile.name,
        text,
        hoursLogged: opp.hoursLogged,
        status: opp.status,
        at: new Date().toISOString(),
      };
      this.statusUpdates.unshift(update);
      this.activity.unshift({
        id: nextId("act"),
        type: "status",
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        text: `${this.profile.name} posted a status update (${opp.hoursLogged}/${opp.estimatedHours} hrs logged).`,
        at: update.at,
      });
    },

    setOpportunityStatus(opportunityId, status) {
      const opp = this.opportunities.find((o) => o.id === opportunityId);
      if (!opp) return;
      opp.status = status;
      this.activity.unshift({
        id: nextId("act"),
        type: "status",
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        text: `${this.profile.name} marked this as ${status.replace("-", " ")}.`,
        at: new Date().toISOString(),
      });
      if (status === "completed") {
        opp.hoursLogged = opp.estimatedHours;
        this.profile.recognition.points += 50;
        this.profile.recognition.badges.push(`Completed: ${opp.title}`);
      }
    },

    toggleTraining(opportunityId, trainingIndex) {
      const opp = this.opportunities.find((o) => o.id === opportunityId);
      if (!opp || !opp.requiredTraining[trainingIndex]) return;
      opp.requiredTraining[trainingIndex].completed = !opp.requiredTraining[trainingIndex].completed;
    },

    approveException(exceptionId, note) {
      const exc = this.exceptions.find((e) => e.id === exceptionId);
      if (!exc) return;
      exc.status = "approved";
      exc.reviewNote = note || "";
      exc.reviewedAt = new Date().toISOString();
      const opp = {
        id: nextId("opp"),
        title: exc.draft.title,
        description: exc.draft.description,
        requester: exc.draft.requester,
        demandSource: exc.draft.demandSource,
        skillsRequired: exc.draft.skillsRequired || [],
        estimatedHours: exc.draft.estimatedHours,
        businessValueScore: exc.scoreBreakdown.businessValue,
        status: "published",
        successCriteria: exc.draft.successCriteria || "Defined during admin review.",
        tools: exc.draft.tools || [],
        createdAt: new Date().toISOString(),
        claimedBy: null,
        claimedAt: null,
        hoursLogged: 0,
        requiredTraining: [],
        qaThread: [],
      };
      this.opportunities.unshift(opp);
      this.activity.unshift({
        id: nextId("act"),
        type: "published",
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        text: "Published to the marketplace after admin review.",
        at: opp.createdAt,
      });
    },

    rejectException(exceptionId, note) {
      const exc = this.exceptions.find((e) => e.id === exceptionId);
      if (!exc) return;
      exc.status = "rejected";
      exc.reviewNote = note || "";
      exc.reviewedAt = new Date().toISOString();
    },

    flagAsAbandoned(opportunityId, reason) {
      const opp = this.opportunities.find((o) => o.id === opportunityId);
      if (!opp) return;
      opp.status = "abandoned";
      opp.abandonedReason = reason;
      this.activity.unshift({
        id: nextId("act"),
        type: "abandoned",
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        text: `Flagged as abandoned — ${reason}`,
        at: new Date().toISOString(),
      });
    },

    reassign(opportunityId) {
      const opp = this.opportunities.find((o) => o.id === opportunityId);
      if (!opp) return;
      opp.status = "published";
      opp.claimedBy = null;
      opp.claimedAt = null;
      opp.hoursLogged = 0;
      opp.abandonedReason = null;
      this.activity.unshift({
        id: nextId("act"),
        type: "reassign",
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        text: "Reopened for claim after continuity review.",
        at: new Date().toISOString(),
      });
    },

    completeOnboarding({ aspirations }) {
      this.profile.aspirations = aspirations;
      this.profile.onboardingComplete = true;
      this.profile.lastEditedAt = new Date().toISOString();
    },

    updateProfile({ skills, aspirations }) {
      if (skills) this.profile.skills = skills;
      if (aspirations) this.profile.aspirations = aspirations;
      this.profile.lastEditedAt = new Date().toISOString();
    },

    markNotificationsRead() {
      this.notifications.forEach((n) => (n.read = true));
    },

    dismissOnboardingPrompt() {
      this.onboardingPromptDismissed = true;
    },
  },
});

function bucketAging(opportunities) {
  const buckets = { "0-3d": 0, "4-7d": 0, "8-14d": 0, "15d+": 0 };
  opportunities
    .filter((o) => o.status === "published")
    .forEach((o) => {
      const age = daysAgo(o.createdAt);
      if (age <= 3) buckets["0-3d"] += 1;
      else if (age <= 7) buckets["4-7d"] += 1;
      else if (age <= 14) buckets["8-14d"] += 1;
      else buckets["15d+"] += 1;
    });
  return buckets;
}

export { daysAgo, computeAutoHours };
