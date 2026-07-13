<script setup>
import { reactive } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";

const market = useMarketplaceStore();
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
</script>

<template>
  <div class="exceptions">
    <h1>Review queue</h1>
    <p class="subtitle">
      Intake, AI scoring, and publishing all run automatically. These are the exceptions the AI
      couldn't resolve on its own — a human stays in the loop by design, and only for genuine
      edge cases.
    </p>

    <div v-if="market.pendingExceptions.length === 0" class="card empty-state">
      Nothing waiting on you right now.
    </div>

    <div v-for="exc in market.pendingExceptions" :key="exc.id" class="card exception-card">
      <div class="exception-header">
        <div>
          <span class="pill" :class="exc.aiDecision === 'flagged-approve' ? 'pill-approve' : 'pill-reject'">
            AI suggests: {{ exc.aiDecision === "flagged-approve" ? "Approve" : "Reject / revise" }}
          </span>
          <h3>{{ exc.draft.title }}</h3>
          <div class="meta-line">From {{ exc.draft.requester }} · {{ exc.draft.estimatedHours }} hrs estimated · submitted {{ new Date(exc.submittedAt).toLocaleDateString() }}</div>
        </div>
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
</template>

<style scoped>
.exceptions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
}
.subtitle {
  color: var(--sl-ink-secondary);
  font-size: 14px;
  margin-top: -8px;
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
</style>
