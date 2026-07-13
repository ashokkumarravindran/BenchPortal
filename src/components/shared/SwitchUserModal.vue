<script setup>
import { useAppStore } from "../../stores/app";
import { useRouter } from "vue-router";
import Icon from "./Icon.vue";

defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);

const app = useAppStore();
const router = useRouter();

const personas = [
  { id: "jordan", name: "Jordan Rivera", role: "Consultant on the bench", initials: "JR" },
  { id: "megan", name: "Megan Smith", role: "Bench Manager / Requester", initials: "MS" },
];

function pick(personaId) {
  app.setPersona(personaId);
  router.push(personaId === "megan" ? "/megan" : "/jordan");
  emit("close");
}
</script>

<template>
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="modal card">
      <div class="modal-header">
        <h2>Switch user</h2>
        <button class="btn-ghost close-btn" @click="emit('close')"><Icon name="x" :size="18" /></button>
      </div>

      <div class="disclaimer">
        <Icon name="bulb" :size="15" />
        <span>Prototype only — in production, identity comes from your Slalom SSO login, not a manual switch like this.</span>
      </div>

      <button
        v-for="p in personas"
        :key="p.id"
        class="persona-option"
        :class="{ active: app.currentPersona === p.id }"
        @click="pick(p.id)"
      >
        <div class="persona-avatar">{{ p.initials }}</div>
        <div class="persona-info">
          <div class="persona-name">{{ p.name }}</div>
          <div class="persona-role">{{ p.role }}</div>
        </div>
        <Icon v-if="app.currentPersona === p.id" name="checkCircle" :size="18" class="persona-check" />
      </button>
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
  z-index: 60;
  padding: 24px;
}
.modal {
  width: 100%;
  max-width: 420px;
  padding: 24px;
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
.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: var(--sl-blue-tint);
  color: var(--sl-blue);
  border-radius: var(--sl-radius-sm);
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.4;
}
.persona-option {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--sl-border);
  background: var(--sl-white);
  border-radius: var(--sl-radius-md);
  padding: 12px 14px;
  cursor: pointer;
  text-align: left;
}
.persona-option:hover {
  border-color: var(--sl-blue);
  background: var(--sl-blue-tint);
}
.persona-option.active {
  border-color: var(--sl-blue);
  background: var(--sl-blue-tint);
}
.persona-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--sl-navy);
  color: var(--sl-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}
.persona-info {
  flex: 1;
  min-width: 0;
}
.persona-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--sl-navy);
}
.persona-role {
  font-size: 12px;
  color: var(--sl-ink-secondary);
}
.persona-check {
  color: var(--sl-blue);
  flex-shrink: 0;
}
</style>
