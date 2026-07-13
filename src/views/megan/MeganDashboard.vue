<script setup>
import { ref, reactive, computed } from "vue";
import { useMarketplaceStore, daysAgo } from "../../stores/marketplace";
import StatCard from "../../components/shared/StatCard.vue";
import StatusPill from "../../components/shared/StatusPill.vue";
import Icon from "../../components/shared/Icon.vue";
import ActivityRail from "../../components/megan/ActivityRail.vue";
import NewOpportunityModal from "../../components/megan/NewOpportunityModal.vue";

const market = useMarketplaceStore();
const kpis = computed(() => market.kpis);
const agingMax = computed(() => Math.max(1, ...Object.values(kpis.value.agingBuckets)));

const tabs = [
  { id: "overview", label: "Overview", icon: "sparkle" },
  { id: "opportunities", label: "Opportunities", icon: "briefcase" },
  { id: "review", label: "Review queue", icon: "checkCircle" },
];
const activeTab = ref("overview");

const newOppModalOpen = ref(false);

const statusFilter = ref("all");
const filteredOpportunities = computed(() => {
  if (statusFilter.value === "all") return market.opportunities;
  return market.opportunities.filter((o) => o.status === statusFilter.value);
});

function reassign(id) {
  market.reassign(id);
}

const notes = reactive({});
function approve(id) {
  market.approveException(id, notes[id] || "");
  delete notes[id];
}
function reject(id) {
  market.rejectException(id, notes[id] || "");
  delete notes[id];
}
const scoreLabels = {
  businessValue: "Business value",
  definitionQuality: "Definition quality",
  aging: "Aging",
  feasibility: "Feasibility",
};

function exportReport() {
  const rows = [["Title", "Status", "Demand source", "Estimated hours", "Requester", "Created"]];
  market.opportunities.forEach((o) => {
    rows.push([o.title, o.status, o.demandSource, o.estimatedHours, o.requester, o.createdAt]);
  });
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bench-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <h1>Welcome back, Megan</h1>
        <p class="subtitle">Bench health, at a glance. Intake and AI vetting run automatically — you're only pulled in where it matters.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportReport">
          <Icon name="briefcase" :size="14" /> Export report
        </button>
        <button class="btn btn-primary" @click="newOppModalOpen = true">
          <Icon name="plus" :size="14" /> New opportunity
        </button>
      </div>
    </div>

    <div class="layout">
      <div class="main-col">
        <div class="tab-bar">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="tab-btn"
            :class="{ active: activeTab === t.id }"
            @click="activeTab = t.id"
          >
            <Icon :name="t.icon" :size="15" />
            {{ t.label }}
            <span v-if="t.id === 'review' && market.pendingExceptions.length" class="tab-count">{{ market.pendingExceptions.length }}</span>
          </button>
        </div>

        <div v-if="activeTab === 'overview'" class="tab-panel">
          <div class="stat-grid">
            <StatCard label="Bench utilization" :value="`${kpis.utilizationPct}%`" hint="~1,000 consultants/week on bench" accent="var(--sl-blue)" />
            <StatCard label="Published" :value="kpis.published" hint="Live in the marketplace" />
            <StatCard label="In progress / blocked" :value="kpis.inProgress + kpis.blocked" />
            <StatCard label="Completed" :value="kpis.completed" accent="var(--sl-green)" />
            <StatCard label="Needs attention" :value="kpis.abandoned" hint="Stalled — continuity risk" accent="var(--sl-coral)" />
            <StatCard label="Pending your review" :value="kpis.pendingReview" hint="AI-flagged exceptions" accent="var(--sl-purple)" />
            <StatCard label="Avg. time to claim" :value="`${kpis.avgTimeToClaimDays}d`" />
            <StatCard label="Total opportunities" :value="kpis.total" />
          </div>

          <div class="card aging-card">
            <h3>Aging of published opportunities</h3>
            <div class="aging-bars">
              <div v-for="(count, bucket) in kpis.agingBuckets" :key="bucket" class="aging-bar-row">
                <span class="aging-label">{{ bucket }}</span>
                <div class="aging-track">
                  <div class="aging-fill" :style="{ width: (count / agingMax) * 100 + '%' }" />
                </div>
                <span class="aging-count">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'opportunities'" class="tab-panel">
          <div class="filters">
            <select v-model="statusFilter" class="select filter-select">
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="in-progress">In progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Needs attention</option>
            </select>
          </div>
          <div class="card table-card">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Claimed by</th>
                  <th>Age</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in filteredOpportunities" :key="o.id">
                  <td class="title-cell">
                    <router-link :to="`/opportunity/${o.id}`">{{ o.title }}</router-link>
                    <div v-if="o.status === 'abandoned'" class="abandoned-hint">{{ o.abandonedReason }}</div>
                  </td>
                  <td><StatusPill :status="o.status" /></td>
                  <td>{{ o.claimedBy ? "Jordan Rivera" : "—" }}</td>
                  <td>{{ daysAgo(o.createdAt) }}d</td>
                  <td class="actions-cell">
                    <button v-if="o.status === 'abandoned'" class="btn btn-secondary btn-sm" @click="reassign(o.id)">
                      Reopen for claim
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="tab-panel">
          <p class="subtitle">
            These are the exceptions the AI couldn't resolve on its own — everything else publishes
            automatically.
          </p>
          <div v-if="market.pendingExceptions.length === 0" class="card empty-state">
            Nothing waiting on you right now.
          </div>
          <div v-for="exc in market.pendingExceptions" :key="exc.id" class="card exception-card">
            <div class="exception-header">
              <span class="pill" :class="exc.aiDecision === 'flagged-approve' ? 'pill-approve' : 'pill-reject'">
                AI suggests: {{ exc.aiDecision === "flagged-approve" ? "Approve" : "Reject / revise" }}
              </span>
              <h3>{{ exc.draft.title }}</h3>
              <div class="meta-line">From {{ exc.draft.requester }} · {{ exc.draft.estimatedHours }} hrs estimated · submitted {{ new Date(exc.submittedAt).toLocaleDateString() }}</div>
            </div>

            <p class="draft-desc">{{ exc.draft.description }}</p>

            <div class="rationale-box">
              <div class="section-label">Why the AI flagged this</div>
              <p>{{ exc.aiRationale }}</p>
            </div>

            <div class="score-grid">
              <div v-for="(val, key) in exc.scoreBreakdown" :key="key" class="score-item">
                <span class="score-label">{{ scoreLabels[key] }}</span>
                <div class="score-track">
                  <div class="score-fill" :style="{ width: val + '%' }" />
                </div>
                <span class="score-value">{{ val }}</span>
              </div>
            </div>

            <textarea v-model="notes[exc.id]" class="textarea" rows="2" placeholder="Optional note for the audit trail…" />

            <div class="exception-actions">
              <button class="btn btn-primary btn-sm" @click="approve(exc.id)">Approve &amp; publish</button>
              <button class="btn btn-danger btn-sm" @click="reject(exc.id)">Reject</button>
            </div>
          </div>
        </div>
      </div>

      <div class="side-col">
        <ActivityRail @go-to-review="activeTab = 'review'" />
      </div>
    </div>

    <NewOpportunityModal :open="newOppModalOpen" @close="newOppModalOpen = false" />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.subtitle {
  color: var(--sl-ink-secondary);
  font-size: 14px;
  margin-top: 4px;
}
.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.header-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.layout {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 24px;
  align-items: start;
}
.main-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.side-col {
  min-width: 0;
}

.tab-bar {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--sl-border);
}
.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sl-ink-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab-btn:hover {
  color: var(--sl-navy);
}
.tab-btn.active {
  color: var(--sl-navy);
  border-bottom-color: var(--sl-blue);
}
.tab-count {
  background: var(--sl-purple);
  color: var(--sl-white);
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 1px 7px;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.aging-card {
  padding: 20px 24px;
}
.aging-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.aging-bar-row {
  display: grid;
  grid-template-columns: 60px 1fr 24px;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.aging-track {
  height: 8px;
  background: var(--sl-surface-muted);
  border-radius: 999px;
  overflow: hidden;
}
.aging-fill {
  height: 100%;
  background: var(--sl-blue);
  border-radius: 999px;
}
.aging-count {
  text-align: right;
  color: var(--sl-ink-secondary);
}

.filters {
  display: flex;
  gap: 10px;
}
.filter-select {
  max-width: 220px;
}
.table-card {
  padding: 8px;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th {
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--sl-ink-secondary);
  padding: 12px 14px;
  border-bottom: 1px solid var(--sl-border);
}
td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--sl-border);
  vertical-align: top;
}
tr:last-child td {
  border-bottom: none;
}
.title-cell a {
  color: var(--sl-navy);
  font-weight: 600;
}
.abandoned-hint {
  font-size: 12px;
  color: var(--sl-coral);
  margin-top: 2px;
}
.actions-cell {
  text-align: right;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--sl-ink-secondary);
}
.exception-card {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pill-approve {
  background: #eaf7ec;
  color: #2f8a3f;
}
.pill-reject {
  background: #fdeeec;
  color: #e8543e;
}
.meta-line {
  font-size: 12px;
  color: var(--sl-ink-secondary);
  margin-top: 4px;
}
.draft-desc {
  font-size: 14px;
}
.rationale-box {
  background: var(--sl-surface-muted);
  border-radius: var(--sl-radius-sm);
  padding: 12px 14px;
}
.rationale-box p {
  font-size: 13px;
  margin-top: 4px;
}
.score-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.score-item {
  display: grid;
  grid-template-columns: 110px 1fr 28px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.score-track {
  height: 6px;
  background: var(--sl-border);
  border-radius: 999px;
  overflow: hidden;
}
.score-fill {
  height: 100%;
  background: var(--sl-purple);
}
.score-value {
  text-align: right;
  color: var(--sl-ink-secondary);
}
.exception-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
