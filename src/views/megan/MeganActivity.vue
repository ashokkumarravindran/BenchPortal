<script setup>
import { useMarketplaceStore } from "../../stores/marketplace";

const market = useMarketplaceStore();

const icons = {
  qa: "💬",
  status: "📈",
  claim: "🙋",
  abandoned: "⚠️",
  reassign: "🔁",
  published: "✅",
};
</script>

<template>
  <div class="activity">
    <h1>Activity</h1>
    <p class="subtitle">Everything happening across your opportunities, in one feed — no chasing required.</p>

    <div class="card feed-card">
      <div v-if="market.activity.length === 0" class="empty-note">No activity yet.</div>
      <div v-for="event in market.activity" :key="event.id" class="feed-item">
        <span class="feed-icon">{{ icons[event.type] || "•" }}</span>
        <div class="feed-body">
          <router-link :to="`/opportunity/${event.opportunityId}`" class="feed-title">{{ event.opportunityTitle }}</router-link>
          <div class="feed-text">{{ event.text }}</div>
          <div class="feed-time">{{ new Date(event.at).toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
}
.subtitle {
  color: var(--sl-ink-secondary);
  font-size: 14px;
  margin-top: -8px;
}
.feed-card {
  padding: 8px 24px;
}
.feed-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--sl-border);
}
.feed-item:last-child {
  border-bottom: none;
}
.feed-icon {
  font-size: 18px;
}
.feed-title {
  font-weight: 600;
  color: var(--sl-navy);
  font-size: 14px;
}
.feed-text {
  font-size: 13px;
  color: var(--sl-ink);
  margin-top: 2px;
}
.feed-time {
  font-size: 11px;
  color: var(--sl-ink-secondary);
  margin-top: 3px;
}
.empty-note {
  padding: 24px 0;
  color: var(--sl-ink-secondary);
  font-size: 13px;
}
</style>
