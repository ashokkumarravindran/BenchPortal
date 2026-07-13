<script setup>
import { computed } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";

const market = useMarketplaceStore();
const pct = computed(() => Math.min(100, (market.committedHours / market.capacityHours) * 100));
const isFull = computed(() => market.remainingCapacity === 0);
</script>

<template>
  <div class="capacity">
    <div class="capacity-row">
      <span class="section-label">Bench capacity</span>
      <span class="capacity-value">{{ market.committedHours }} / {{ market.capacityHours }} hrs</span>
    </div>
    <div class="capacity-track">
      <div class="capacity-fill" :class="{ full: isFull }" :style="{ width: pct + '%' }" />
    </div>
    <div class="capacity-note">{{ market.remainingCapacity }} hrs available to claim right now</div>
  </div>
</template>

<style scoped>
.capacity {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.capacity-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.capacity-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--sl-navy);
}
.capacity-track {
  height: 8px;
  background: var(--sl-surface-muted);
  border-radius: 999px;
  overflow: hidden;
}
.capacity-fill {
  height: 100%;
  background: var(--sl-blue);
  border-radius: 999px;
  transition: width 0.2s ease;
}
.capacity-fill.full {
  background: var(--sl-coral);
}
.capacity-note {
  font-size: 11px;
  color: var(--sl-ink-secondary);
}
</style>
