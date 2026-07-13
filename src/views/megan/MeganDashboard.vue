<script setup>
import { computed } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";
import StatCard from "../../components/shared/StatCard.vue";

const market = useMarketplaceStore();
const kpis = computed(() => market.kpis);

const agingMax = computed(() => Math.max(1, ...Object.values(kpis.value.agingBuckets)));
</script>

<template>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <h1>Bench health</h1>
        <p class="subtitle">Intake and AI vetting run automatically — you're only pulled in where it matters.</p>
      </div>
      <button class="btn btn-secondary">Export report</button>
    </div>

    <div class="stat-grid">
      <StatCard label="Bench utilization" :value="`${kpis.utilizationPct}%`" hint="~1,000 consultants/week on bench" accent="var(--sl-blue)" />
      <StatCard label="Published" :value="kpis.published" hint="Live in the marketplace" />
      <StatCard label="Claimed / In progress" :value="kpis.claimed + kpis.inProgress" />
      <StatCard label="Completed" :value="kpis.completed" accent="var(--sl-green)" />
      <StatCard label="Needs attention" :value="kpis.abandoned" hint="Stalled — continuity risk" accent="var(--sl-coral)" />
      <StatCard label="Pending your review" :value="kpis.pendingReview" hint="AI-flagged exceptions" accent="var(--sl-purple)" />
      <StatCard label="Avg. time to claim" :value="`${kpis.avgTimeToClaimDays}d`" />
      <StatCard label="Total opportunities" :value="kpis.total" />
    </div>

    <div class="panel-row">
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

      <div class="card attention-card">
        <h3>Needs attention</h3>
        <div class="attention-row">
          <span>AI-flagged exceptions awaiting review</span>
          <router-link to="/megan/exceptions" class="btn btn-ghost btn-sm">Review ({{ kpis.pendingReview }})</router-link>
        </div>
        <div class="attention-row">
          <span>Opportunities stalled or abandoned</span>
          <router-link to="/megan/opportunities" class="btn btn-ghost btn-sm">View ({{ kpis.abandoned }})</router-link>
        </div>
      </div>
    </div>
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
}
.subtitle {
  color: var(--sl-ink-secondary);
  font-size: 14px;
  margin-top: 4px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.panel-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
}
.aging-card,
.attention-card {
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
.attention-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--sl-border);
  font-size: 14px;
}
.attention-row:last-child {
  border-bottom: none;
}
@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .panel-row {
    grid-template-columns: 1fr;
  }
}
</style>
