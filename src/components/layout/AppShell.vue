<script setup>
import { ref, computed } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";
import { useAppStore } from "../../stores/app";
import Icon from "../shared/Icon.vue";
import SwitchUserModal from "../shared/SwitchUserModal.vue";

const market = useMarketplaceStore();
const app = useAppStore();

const isJordan = computed(() => app.currentPersona === "jordan");
const unreadCount = computed(() => market.notifications.filter((n) => !n.read).length);
const showNotifications = ref(false);
const showProfileMenu = ref(false);
const showSwitchModal = ref(false);

const identity = computed(() =>
  isJordan.value
    ? { name: "Jordan Rivera", role: "Consultant", initials: "JR" }
    : { name: "Megan Smith", role: "Bench Manager", initials: "MS" }
);

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  showProfileMenu.value = false;
  if (showNotifications.value) market.markNotificationsRead();
}

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value;
  showNotifications.value = false;
}

function openSwitchModal() {
  showSwitchModal.value = true;
  showProfileMenu.value = false;
}
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-left">
          <span class="wordmark">slalom</span>
          <span class="app-name">Bench Marketplace</span>
        </div>
        <div class="topbar-right">
          <div v-if="isJordan" class="notif-wrap">
            <button class="notif-bell" aria-label="Notifications" @click="toggleNotifications">
              <Icon name="bell" :size="18" />
              <span v-if="unreadCount" class="notif-badge">{{ unreadCount }}</span>
            </button>
            <div v-if="showNotifications" class="notif-dropdown card">
              <div v-if="market.notifications.length === 0" class="notif-empty">You're all caught up.</div>
              <div v-for="n in market.notifications" :key="n.id" class="notif-item">
                {{ n.text }}
              </div>
            </div>
          </div>

          <div class="profile-wrap">
            <button class="avatar-link" @click="toggleProfileMenu">
              <div class="avatar-sm">{{ identity.initials }}</div>
            </button>
            <div v-if="showProfileMenu" class="profile-dropdown card">
              <div class="profile-dropdown-header">
                <div class="avatar-sm">{{ identity.initials }}</div>
                <div>
                  <div class="profile-dropdown-name">{{ identity.name }}</div>
                  <div class="profile-dropdown-role">{{ identity.role }}</div>
                </div>
              </div>
              <button class="profile-dropdown-item" @click="openSwitchModal">
                <Icon name="user" :size="14" /> Switch user
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="brand-stripe" />
    </header>
    <main class="content" :class="{ 'content-wide': !isJordan }">
      <router-view />
    </main>

    <SwitchUserModal :open="showSwitchModal" @close="showSwitchModal = false" />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.topbar {
  background: var(--sl-navy);
  position: sticky;
  top: 0;
  z-index: 20;
}
.topbar-inner {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 14px 24px;
}
.topbar-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.wordmark {
  color: var(--sl-white);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.02em;
}
.app-name {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.notif-wrap,
.profile-wrap {
  position: relative;
}
.notif-bell {
  position: relative;
  color: var(--sl-white);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 7px;
  border-radius: 8px;
  display: flex;
}
.notif-bell:hover {
  background: rgba(255, 255, 255, 0.08);
}
.notif-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--sl-coral);
  color: var(--sl-white);
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  min-width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}
.notif-dropdown {
  position: absolute;
  right: 0;
  top: 40px;
  width: 280px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 30;
}
.notif-item {
  font-size: 13px;
  padding: 8px 10px;
  border-radius: var(--sl-radius-sm);
}
.notif-item:hover {
  background: var(--sl-surface-muted);
}
.notif-empty {
  font-size: 13px;
  color: var(--sl-ink-secondary);
  padding: 8px 10px;
}
.avatar-link {
  display: flex;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}
.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--sl-blue);
  color: var(--sl-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}
.profile-dropdown {
  position: absolute;
  right: 0;
  top: 42px;
  width: 240px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 30;
}
.profile-dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px 10px;
  border-bottom: 1px solid var(--sl-border);
  margin-bottom: 4px;
}
.profile-dropdown-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--sl-navy);
}
.profile-dropdown-role {
  font-size: 11px;
  color: var(--sl-ink-secondary);
}
.profile-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  padding: 8px 6px;
  border-radius: var(--sl-radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--sl-navy);
  cursor: pointer;
  text-align: left;
}
.profile-dropdown-item:hover {
  background: var(--sl-surface-muted);
}
.content {
  flex: 1;
  max-width: 1160px;
  margin: 0 auto;
  width: 100%;
  padding: 32px 24px 64px;
}
.content-wide {
  max-width: 1360px;
}
</style>
