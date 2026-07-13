<script setup>
import { ref, computed } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";
import Icon from "../shared/Icon.vue";

const market = useMarketplaceStore();
const unreadCount = computed(() => market.notifications.filter((n) => !n.read).length);
const showNotifications = ref(false);

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) market.markNotificationsRead();
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
          <div class="notif-wrap">
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
          <router-link to="/jordan" class="avatar-link">
            <div class="avatar-sm">{{ market.profile.name.split(" ").map(p => p[0]).join("") }}</div>
          </router-link>
        </div>
      </div>
      <div class="brand-stripe" />
    </header>
    <main class="content">
      <router-view />
    </main>
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
.notif-wrap {
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
}
.content {
  flex: 1;
  max-width: 1160px;
  margin: 0 auto;
  width: 100%;
  padding: 32px 24px 64px;
}
</style>
