<script setup>
import { ref, computed, watch } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";
import { skillCatalog } from "../../data/mockData";
import Icon from "../shared/Icon.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);

const market = useMarketplaceStore();

const skills = ref([...market.profile.skills]);
const aspirations = ref([...market.profile.aspirations]);
const newAspiration = ref("");
const newSkill = ref("");

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      skills.value = [...market.profile.skills];
      aspirations.value = [...market.profile.aspirations];
    }
  }
);

const availableAspirationOptions = computed(() =>
  skillCatalog.filter((s) => !aspirations.value.some((a) => a.name === s))
);

function addAspiration() {
  if (!newAspiration.value) return;
  aspirations.value.push({ name: newAspiration.value, addedAt: new Date().toISOString().slice(0, 10) });
  newAspiration.value = "";
}
function removeAspiration(name) {
  aspirations.value = aspirations.value.filter((a) => a.name !== name);
}
function addSkill() {
  if (!newSkill.value.trim()) return;
  skills.value.push({ name: newSkill.value.trim(), level: "Self-reported", source: "self-declared" });
  newSkill.value = "";
}
function removeSkill(name) {
  skills.value = skills.value.filter((s) => s.name !== name);
}

function save() {
  if (!market.profile.onboardingComplete) {
    market.completeOnboarding({ aspirations: aspirations.value });
  }
  market.updateProfile({ skills: skills.value, aspirations: aspirations.value });
  emit("close");
}
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="modal card">
      <div class="modal-header">
        <h2>{{ market.profile.onboardingComplete ? "Edit profile" : "Welcome — let's set up your profile" }}</h2>
        <button class="btn-ghost close-btn" @click="emit('close')"><Icon name="x" :size="18" /></button>
      </div>
      <p class="subtitle">
        Your current skills are pre-populated from <strong>Me@Slalom</strong>. Tell us what you want
        to learn next, and bench work will be matched to build those skills — with Slalom training
        surfaced alongside it.
      </p>

      <div class="section">
        <h3>Current skills</h3>
        <p class="section-hint">Pulled from Me@Slalom where available. Add anything missing.</p>
        <div class="tag-list">
          <span v-for="s in skills" :key="s.name" class="pill skill-tag">
            {{ s.name }}
            <span class="source-tag" :class="s.source === 'me@slalom' ? 'source-me' : 'source-self'">
              {{ s.source === "me@slalom" ? "Me@Slalom" : "Self-declared" }}
            </span>
            <button class="tag-remove" @click="removeSkill(s.name)"><Icon name="x" :size="12" /></button>
          </span>
        </div>
        <div class="add-row">
          <input v-model="newSkill" class="input" placeholder="Add a skill not listed" @keyup.enter="addSkill" />
          <button class="btn btn-secondary btn-sm" @click="addSkill">Add</button>
        </div>
      </div>

      <div class="section">
        <h3>What do you want to learn?</h3>
        <p class="section-hint">
          Aspirational skills — we'll match you to stretch opportunities that build them, and
          suggest related Slalom training.
        </p>
        <div class="tag-list">
          <span v-for="a in aspirations" :key="a.name" class="pill aspiration-tag">
            {{ a.name }}
            <button class="tag-remove" @click="removeAspiration(a.name)"><Icon name="x" :size="12" /></button>
          </span>
          <span v-if="aspirations.length === 0" class="empty-note">No learning goals added yet.</span>
        </div>
        <div class="add-row">
          <select v-model="newAspiration" class="select">
            <option value="" disabled>Choose a skill to learn…</option>
            <option v-for="s in availableAspirationOptions" :key="s" :value="s">{{ s }}</option>
          </select>
          <button class="btn btn-secondary btn-sm" @click="addAspiration">Add</button>
        </div>
      </div>

      <div class="save-row">
        <span class="last-edited">Last edited {{ new Date(market.profile.lastEditedAt).toLocaleDateString() }}</span>
        <button class="btn btn-primary" @click="save">
          {{ market.profile.onboardingComplete ? "Save changes" : "Finish onboarding" }}
        </button>
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
  gap: 16px;
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
  margin-top: -10px;
}
.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--sl-border);
  padding-top: 16px;
}
.section-hint {
  font-size: 12px;
  color: var(--sl-ink-secondary);
  margin-top: -6px;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.skill-tag {
  background: var(--sl-surface-muted);
  color: var(--sl-navy);
  gap: 8px;
  padding: 6px 6px 6px 12px;
}
.aspiration-tag {
  background: #f1edfb;
  color: #6947b8;
  gap: 8px;
  padding: 6px 6px 6px 12px;
}
.source-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 980px;
}
.source-me {
  background: var(--sl-blue-tint);
  color: var(--sl-blue);
}
.source-self {
  background: #eee;
  color: var(--sl-ink-secondary);
}
.tag-remove {
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  display: flex;
  opacity: 0.6;
  padding: 0;
}
.tag-remove:hover {
  opacity: 1;
}
.add-row {
  display: flex;
  gap: 8px;
}
.save-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}
.last-edited {
  font-size: 12px;
  color: var(--sl-ink-secondary);
}
.empty-note {
  font-size: 13px;
  color: var(--sl-ink-secondary);
}
</style>
