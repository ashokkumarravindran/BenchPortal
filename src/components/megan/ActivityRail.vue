<script setup>
import { computed } from "vue";
import { useMarketplaceStore, daysAgo } from "../../stores/marketplace";
import Icon from "../shared/Icon.vue";

const emit = defineEmits(["go-to-review"]);
const market = useMarketplaceStore();

const messages = computed(() =>
  market.activity.filter((a) => a.type === "qa" && !a.text.startsWith("Megan Smith")).slice(0, 6)
);

const alerts = computed(() =>
  market.activity.filter((a) => a.type === "abandoned").slice(0, 6)
);
</script>

<template>
  <div class="rail">
    <div class="rail-header">
      <Icon name="bell" :size="16" />
      <h3>Activity &amp; Alerts</h3>
    </div>

    <div class="card rail-section">
      <div class="rail-section-header">
        <span class="section-label">Needs your review</span>
        <span v-if="market.pendingExceptions.length" class="count-badge">{{ market.pendingExceptions.length }}</span>
      </div>
      <div v-if="market.pendingExceptions.length === 0" class="empty-note">Nothing waiting on you.</div>
      <button
        v-for="exc in market.pendingExceptions"
        :key="exc.id"
        class="rail-item"
        @click="emit('go-to-review')"
      >
        <Icon name="briefcase" :size="14" class="rail-item-icon" />
        <div class="rail-item-body">
          <div class="rail-item-title">{{ exc.draft.title }}</div>
          <div class="rail-item-meta">From {{ exc.draft.requester }} · flagged by AI</div>
        </div>
      </button>
    </div>

    <div class="card rail-section">
      <div class="rail-section-header">
        <span class="section-label">Messages from consultants</span>
      </div>
      <div v-if="messages.length === 0" class="empty-note">No new messages.</div>
      <router-link v-for="m in messages" :key="m.id" :to="`/opportunity/${m.opportunityId}`" class="rail-item">
        <Icon name="chat" :size="14" class="rail-item-icon" />
        <div class="rail-item-body">
          <div class="rail-item-title">{{ m.opportunityTitle }}</div>
          <div class="rail-item-meta">{{ m.text }} · {{ daysAgo(m.at) }}d ago</div>
        </div>
      </router-link>
    </div>

    <div class="card rail-section">
      <div class="rail-section-header">
        <span class="section-label">Alerts</span>
        <span v-if="alerts.length" class="count-badge count-badge-alert">{{ alerts.length }}</span>
      </div>
      <div v-if="alerts.length === 0" class="empty-note">No continuity risks right now.</div>
      <router-link v-for="a in alerts" :key="a.id" :to="`/opportunity/${a.opportunityId}`" class="rail-item">
        <Icon name="clock" :size="14" class="rail-item-icon rail-item-icon-alert" />
        <div class="rail-item-body">
          <div class="rail-item-title">{{ a.opportunityTitle }}</div>
          <div class="rail-item-meta">{{ a.text }}</div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.rail {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 92px;
}
.rail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--sl-navy);
}
.rail-header h3 {
  margin: 0;
  font-size: 15px;
}
.rail-section {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rail-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.count-badge {
  background: var(--sl-purple);
  color: var(--sl-white);
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 1px 8px;
}
.count-badge-alert {
  background: var(--sl-coral);
}
.rail-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 6px;
  border-radius: var(--sl-radius-sm);
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
}
.rail-item:hover {
  background: var(--sl-surface-muted);
}
.rail-item-icon {
  color: var(--sl-blue);
  margin-top: 2px;
  flex-shrink: 0;
}
.rail-item-icon-alert {
  color: var(--sl-coral);
}
.rail-item-body {
  min-width: 0;
}
.rail-item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--sl-navy);
}
.rail-item-meta {
  font-size: 12px;
  color: var(--sl-ink-secondary);
  margin-top: 1px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.empty-note {
  font-size: 12px;
  color: var(--sl-ink-secondary);
  padding: 4px 6px;
}
</style>
