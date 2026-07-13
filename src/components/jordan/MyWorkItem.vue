<script setup>
import { ref, computed } from "vue";
import { useMarketplaceStore, daysAgo } from "../../stores/marketplace";
import StatusPill from "../shared/StatusPill.vue";
import Icon from "../shared/Icon.vue";

const props = defineProps({ opportunity: { type: Object, required: true } });
const market = useMarketplaceStore();

const hours = ref(props.opportunity.hoursLogged);
const note = ref("");

function saveUpdate() {
  market.logHours(props.opportunity.id, Number(hours.value), note.value.trim() || "Progress update.");
  note.value = "";
}

function setStatus(status) {
  market.setOpportunityStatus(props.opportunity.id, status);
}

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

    <div class="status-controls">
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
        <button class="status-btn status-btn-complete" @click="setStatus('completed')">
          <Icon name="checkCircle" :size="13" /> Mark complete
        </button>
      </div>
    </div>

    <div class="hours-row">
      <span class="section-label">Hours logged</span>
      <div class="hours-control">
        <input v-model="hours" type="range" min="0" :max="opportunity.estimatedHours" step="1" />
        <span class="hours-value">{{ hours }} / {{ opportunity.estimatedHours }} hrs</span>
      </div>
      <textarea v-model="note" class="textarea" rows="2" placeholder="What did you get done? Any blockers?" />
      <button class="btn btn-primary btn-sm save-btn" @click="saveUpdate">Post update</button>
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
.hours-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--sl-border);
  padding-top: 14px;
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
.hours-control {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hours-control input[type="range"] {
  flex: 1;
}
.hours-value {
  font-weight: 700;
  color: var(--sl-navy);
  font-size: 13px;
  min-width: 76px;
  text-align: right;
}
.save-btn {
  align-self: flex-start;
}
.learning-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--sl-ink-secondary);
  border-top: 1px solid var(--sl-border);
  padding-top: 12px;
}
.learning-pill {
  background: #f1edfb;
  color: #6947b8;
}
</style>
