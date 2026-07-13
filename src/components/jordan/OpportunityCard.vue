<script setup>
import { computed } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";
import StatusPill from "../shared/StatusPill.vue";
import Icon from "../shared/Icon.vue";

const props = defineProps({
  opportunity: { type: Object, required: true },
  showMatch: { type: Boolean, default: false },
});

const market = useMarketplaceStore();
const demandSourceLabel = computed(() => {
  const ds = market.demandSources.find((d) => d.id === props.opportunity.demandSource);
  return ds ? ds.label : props.opportunity.demandSource;
});

const overCapacity = computed(
  () => props.opportunity.status === "published" && props.opportunity.estimatedHours > market.remainingCapacity
);

const trainingRequired = computed(() => {
  const list = props.opportunity.requiredTraining || [];
  return list.length > 0 && !list.every((t) => t.completed);
});
</script>

<template>
  <router-link :to="`/opportunity/${opportunity.id}`" class="opp-card card">
    <div class="opp-top">
      <span class="pill source-pill">{{ demandSourceLabel }}</span>
      <span v-if="showMatch" class="match-badge">
        <Icon name="sparkle" :size="12" />{{ opportunity.matchScore }}% match
      </span>
      <StatusPill v-else :status="opportunity.status" />
    </div>
    <h3 class="opp-title">{{ opportunity.title }}</h3>
    <p class="opp-desc">{{ opportunity.description }}</p>
    <div class="chip-row">
      <span v-for="s in opportunity.skillsRequired" :key="s" class="pill skill-chip">{{ s }}</span>
      <span v-if="trainingRequired" class="pill training-chip">
        <Icon name="book" :size="11" /> Training required
      </span>
    </div>
    <div class="opp-footer">
      <span class="effort-badge" :class="{ 'effort-warning': overCapacity }">
        <Icon name="clock" :size="12" />{{ opportunity.estimatedHours }} hrs effort
      </span>
      <span>&middot;</span>
      <span>{{ opportunity.requester }}</span>
    </div>
    <div v-if="overCapacity" class="capacity-hint">Exceeds your remaining bench capacity</div>
  </router-link>
</template>

<style scoped>
.opp-card {
  display: block;
  padding: 18px 20px;
  transition: box-shadow 0.15s ease, transform 0.1s ease;
}
.opp-card:hover {
  box-shadow: var(--sl-shadow-md);
  transform: translateY(-1px);
}
.opp-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.source-pill {
  background: var(--sl-surface-muted);
  color: var(--sl-ink-secondary);
}
.match-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--sl-blue-tint);
  color: var(--sl-blue);
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 980px;
}
.opp-title {
  font-size: 16px;
  margin-bottom: 6px;
}
.opp-desc {
  color: var(--sl-ink-secondary);
  font-size: 13px;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.chip-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.skill-chip {
  background: var(--sl-surface-muted);
  color: var(--sl-navy);
  font-size: 11px;
}
.training-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff4e5;
  color: #a06400;
  font-size: 11px;
}
.opp-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sl-ink-secondary);
}
.effort-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--sl-navy);
}
.effort-warning {
  color: var(--sl-coral);
}
.capacity-hint {
  margin-top: 6px;
  font-size: 11px;
  color: var(--sl-coral);
}
</style>
