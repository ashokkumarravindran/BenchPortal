<script setup>
import { reactive } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";
import Icon from "../shared/Icon.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);
const market = useMarketplaceStore();

const blankForm = () => ({
  title: "",
  description: "",
  demandSource: "capability-building",
  estimatedHours: 20,
  successCriteria: "",
  skillsRequired: "",
  tools: "",
});
const form = reactive(blankForm());

function submit() {
  if (!form.title.trim() || !form.description.trim()) return;
  market.submitOpportunity({
    title: form.title.trim(),
    description: form.description.trim(),
    demandSource: form.demandSource,
    estimatedHours: Number(form.estimatedHours) || 1,
    successCriteria: form.successCriteria.trim(),
    skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
    tools: form.tools.split(",").map((s) => s.trim()).filter(Boolean),
  });
  Object.assign(form, blankForm());
  emit("close");
}
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="modal card">
      <div class="modal-header">
        <h2>New opportunity</h2>
        <button class="btn-ghost close-btn" @click="emit('close')"><Icon name="x" :size="18" /></button>
      </div>
      <p class="subtitle">
        Submitting here publishes straight to the marketplace — automated vetting only applies to
        intake from Slack, Teams, and email.
      </p>

      <div class="field">
        <label class="section-label">Title</label>
        <input v-model="form.title" class="input" placeholder="e.g. Data model review for retail pursuit" />
      </div>

      <div class="field">
        <label class="section-label">Description</label>
        <textarea v-model="form.description" class="textarea" rows="3" placeholder="What needs to get done?" />
      </div>

      <div class="field-row">
        <div class="field">
          <label class="section-label">Demand source</label>
          <select v-model="form.demandSource" class="select">
            <option v-for="ds in market.demandSources" :key="ds.id" :value="ds.id">{{ ds.label }}</option>
          </select>
        </div>
        <div class="field">
          <label class="section-label">Estimated hours</label>
          <input v-model="form.estimatedHours" type="number" min="1" class="input" />
        </div>
      </div>

      <div class="field">
        <label class="section-label">Success criteria</label>
        <input v-model="form.successCriteria" class="input" placeholder="How will you know it's done?" />
      </div>

      <div class="field-row">
        <div class="field">
          <label class="section-label">Skills (comma separated)</label>
          <input v-model="form.skillsRequired" class="input" placeholder="e.g. Power BI, Data Engineering" />
        </div>
        <div class="field">
          <label class="section-label">Tools (comma separated)</label>
          <input v-model="form.tools" class="input" placeholder="e.g. Snowflake, Figma" />
        </div>
      </div>

      <div class="save-row">
        <button class="btn btn-secondary" @click="emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="submit">Publish opportunity</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 10, 37, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}
.modal {
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.close-btn {
  padding: 4px;
}
.subtitle {
  color: var(--sl-ink-secondary);
  font-size: 13px;
  margin-top: -8px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.field-row {
  display: flex;
  gap: 14px;
}
.save-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}
</style>
