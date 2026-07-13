<script setup>
import { ref, computed } from "vue";
import { useMarketplaceStore, daysAgo, computeAutoHours } from "../../stores/marketplace";
import StatusPill from "../shared/StatusPill.vue";
import Icon from "../shared/Icon.vue";

const props = defineProps({ opportunity: { type: Object, required: true } });
const market = useMarketplaceStore();

const note = ref("");
const autoHours = computed(() => computeAutoHours(props.opportunity));
const remainingHours = computed(() => Math.max(0, props.opportunity.estimatedHours - autoHours.value));
const progressPct = computed(() => Math.round((remainingHours.value / props.opportunity.estimatedHours) * 100));

function saveUpdate() {
  market.postStatusUpdate(props.opportunity.id, note.value.trim() || "Progress update.");
  note.value = "";
}

function setStatus(status) {
  market.setOpportunityStatus(props.opportunity.id, status);
}

// Two-step complete: confirm -> brief success message -> then actually
// transition status (which drops this item out of the active list).
const completeStage = ref("idle"); // 'idle' | 'confirm' | 'success'

function startComplete() {
  completeStage.value = "confirm";
}
function cancelComplete() {
  completeStage.value = "idle";
}
function confirmComplete() {
  completeStage.value = "success";
  setTimeout(() => {
    market.setOpportunityStatus(props.opportunity.id, "completed");
  }, 1600);
}

const updates = computed(() =>
  market.statusUpdates
    .filter((u) => u.opportunityId === props.opportunity.id)
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))
);

const relevantLearning = computed(() => {
  const aspirationalSkills = new Set(market.profile.aspirations.map((a) => a.name));
  const relevantSkills = props.opportunity.skillsRequired.filter((s) => aspirationalSkills.has(s));
  if (relevantSkills.length === 0) return [];
  return market.learningCatalog.filter((c) => relevantSkills.includes(c.skill));
});
</script>

<template>
  <div class="card work-item">
    <div class="work-header">
      <div>
        <StatusPill :status="opportunity.status" />
        <h3>{{ opportunity.title }}</h3>
        <div class="meta-line">
          For {{ opportunity.requester }} · {{ opportunity.estimatedHours }} hrs effort · started
          {{ daysAgo(opportunity.claimedAt) }}d ago
        </div>
      </div>
      <router-link :to="`/opportunity/${opportunity.id}`" class="btn btn-secondary btn-sm">
        <Icon name="chat" :size="14" /> Conversation
      </router-link>
    </div>

    <div v-if="completeStage === 'idle'" class="status-controls">
      <span class="section-label">Status</span>
      <div class="status-buttons">
        <button
          class="status-btn"
          :class="{ active: opportunity.status === 'in-progress' }"
          @click="setStatus('in-progress')"
        >
          In progress
        </button>
        <button
          class="status-btn"
          :class="{ active: opportunity.status === 'blocked' }"
          @click="setStatus('blocked')"
        >
          Blocked
        </button>
        <button class="status-btn status-btn-complete" @click="startComplete">
          <Icon name="checkCircle" :size="13" /> Mark complete
        </button>
      </div>
    </div>

    <div v-else-if="completeStage === 'confirm'" class="status-controls confirm-box">
      <div class="confirm-text">
        Mark <strong>{{ opportunity.title }}</strong> as complete? You'll earn 50 points and a badge.
      </div>
      <div class="confirm-actions">
        <button class="btn btn-secondary btn-sm" @click="cancelComplete">Cancel</button>
        <button class="btn btn-primary btn-sm" @click="confirmComplete">Yes, mark complete</button>
      </div>
    </div>

    <div v-else class="status-controls success-box">
      <Icon name="checkCircle" :size="16" />
      <span>Marked complete — +50 points and a new badge earned!</span>
    </div>

    <div class="hours-row">
      <div class="hours-label-row">
        <span class="section-label">Hours remaining</span>
        <span class="hours-value">{{ remainingHours }} / {{ opportunity.estimatedHours }} hrs</span>
      </div>
      <div class="hours-track">
        <div class="hours-fill" :style="{ width: progressPct + '%' }" />
      </div>
      <div class="hours-hint">Auto-tracked from your claim date — counts down on its own, no manual entry needed.</div>

      <textarea v-model="note" class="textarea" rows="2" placeholder="What did you get done? Any blockers?" />
      <button class="btn btn-primary btn-sm save-btn" @click="saveUpdate">Post update</button>
    </div>

    <div v-if="updates.length" class="feed">
      <span class="section-label">Update history</span>
      <div v-for="u in updates" :key="u.id" class="feed-item">
        <StatusPill :status="u.status" />
        <div class="feed-body">
          <p class="feed-text">{{ u.text }}</p>
          <div class="feed-meta">{{ Math.max(0, opportunity.estimatedHours - u.hoursLogged) }}/{{ opportunity.estimatedHours }} hrs remaining · {{ new Date(u.at).toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <div v-if="relevantLearning.length" class="learning-row">
      <Icon name="book" :size="14" />
      <span>Related training:</span>
      <span v-for="l in relevantLearning" :key="l.title" class="pill learning-pill">{{ l.title }}</span>
    </div>
  </div>
</template>

<style scoped>
.work-item {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.work-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.work-header .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.meta-line {
  color: var(--sl-ink-secondary);
  font-size: 13px;
  margin-top: 4px;
}
.status-controls,
.hours-row,
.feed,
.learning-row {
  border-top: 1px solid var(--sl-border);
  padding-top: 14px;
}
.status-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.status-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.status-btn {
  border: 1px solid var(--sl-border);
  background: var(--sl-white);
  color: var(--sl-navy);
  padding: 7px 14px;
  border-radius: 980px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.status-btn.active {
  background: var(--sl-navy);
  color: var(--sl-white);
  border-color: var(--sl-navy);
}
.status-btn-complete {
  color: #2f8a3f;
  border-color: #cfe9d4;
}
.status-btn-complete:hover {
  background: #eaf7ec;
}
.confirm-box {
  background: #fff4e5;
  border-radius: var(--sl-radius-sm);
  padding: 12px 14px;
  margin: 0 -22px;
  padding-left: 22px;
  padding-right: 22px;
}
.confirm-text {
  font-size: 13px;
  color: var(--sl-ink);
}
.confirm-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.success-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eaf7ec;
  color: #2f8a3f;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--sl-radius-sm);
  padding: 12px 14px;
  margin: 0 -22px;
  padding-left: 22px;
  padding-right: 22px;
}
.hours-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hours-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.hours-value {
  font-weight: 700;
  color: var(--sl-navy);
  font-size: 13px;
}
.hours-track {
  height: 8px;
  background: var(--sl-surface-muted);
  border-radius: 999px;
  overflow: hidden;
}
.hours-fill {
  height: 100%;
  background: var(--sl-blue);
  border-radius: 999px;
  transition: width 0.2s ease;
}
.hours-hint {
  font-size: 11px;
  color: var(--sl-ink-secondary);
  margin-bottom: 4px;
}
.save-btn {
  align-self: flex-start;
}
.feed {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.feed-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.feed-body {
  min-width: 0;
}
.feed-text {
  font-size: 13px;
  color: var(--sl-ink);
}
.feed-meta {
  font-size: 11px;
  color: var(--sl-ink-secondary);
  margin-top: 2px;
}
.learning-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--sl-ink-secondary);
}
.learning-pill {
  background: #f1edfb;
  color: #6947b8;
}
</style>
