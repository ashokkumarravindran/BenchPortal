<script setup>
import { ref, computed } from "vue";
import { useMarketplaceStore, daysAgo } from "../../stores/marketplace";
import StatusPill from "../../components/shared/StatusPill.vue";

const market = useMarketplaceStore();
const statusFilter = ref("all");

const filtered = computed(() => {
  if (statusFilter.value === "all") return market.opportunities;
  return market.opportunities.filter((o) => o.status === statusFilter.value);
});

function reassign(id) {
  market.reassign(id);
}
</script>

<template>
  <div class="opportunities">
    <div class="header-row">
      <div>
        <h1>Opportunities</h1>
        <p class="subtitle">Everything published to the marketplace, plus anything stalled that needs a continuity decision.</p>
      </div>
      <select v-model="statusFilter" class="select filter-select">
        <option value="all">All statuses</option>
        <option value="published">Published</option>
        <option value="claimed">Claimed</option>
        <option value="in-progress">In progress</option>
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
          <tr v-for="o in filtered" :key="o.id">
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
</template>

<style scoped>
.opportunities {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.subtitle {
  color: var(--sl-ink-secondary);
  font-size: 14px;
  margin-top: 4px;
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
</style>
