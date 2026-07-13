<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: "" },
  accent: { type: String, default: "var(--sl-blue)" },
});
</script>

<template>
  <div class="card stat-card">
    <div class="section-label">{{ label }}</div>
    <div class="stat-value" :style="{ color: accent }">{{ value }}</div>
    <div v-if="hint" class="stat-hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.stat-value {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.stat-hint {
  font-size: 12px;
  color: var(--sl-ink-secondary);
}
</style>
