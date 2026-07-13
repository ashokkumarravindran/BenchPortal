<script setup>
import { ref, computed, onMounted } from "vue";
import { useMarketplaceStore } from "../../stores/marketplace";
import OpportunityCard from "../../components/jordan/OpportunityCard.vue";
import ProfileModal from "../../components/jordan/ProfileModal.vue";
import CapacityBar from "../../components/jordan/CapacityBar.vue";
import MyWorkItem from "../../components/jordan/MyWorkItem.vue";
import Icon from "../../components/shared/Icon.vue";

const market = useMarketplaceStore();

const profileModalOpen = ref(false);
onMounted(() => {
  if (!market.profile.onboardingComplete && !market.onboardingPromptDismissed) {
    profileModalOpen.value = true;
  }
});

function closeProfileModal() {
  profileModalOpen.value = false;
  market.dismissOnboardingPrompt();
}

const tabs = [
  { id: "matched", label: "Matched for you", icon: "sparkle" },
  { id: "all", label: "All opportunities", icon: "briefcase" },
  { id: "mywork", label: "My work", icon: "checkCircle" },
];
const activeTab = ref("matched");

const matched = computed(() => market.matchedOpportunities);

const query = ref("");
const sourceFilter = ref("all");
const filtered = computed(() => {
  return market.publishedOpportunities.filter((o) => {
    const matchesQuery =
      !query.value ||
      o.title.toLowerCase().includes(query.value.toLowerCase()) ||
      o.skillsRequired.some((s) => s.toLowerCase().includes(query.value.toLowerCase()));
    const matchesSource = sourceFilter.value === "all" || o.demandSource === sourceFilter.value;
    return matchesQuery && matchesSource;
  });
});

const visibleSkills = computed(() => market.profile.skills.slice(0, 5));
const extraSkillCount = computed(() => Math.max(0, market.profile.skills.length - 5));
</script>

<template>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <h1>Welcome back, {{ market.profile.name.split(" ")[0] }}</h1>
        <p class="subtitle">Everything matched to you, in one place.</p>
      </div>
    </div>

    <div class="layout">
      <!-- Main column -->
      <div class="main-col">
        <div class="tab-bar">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="tab-btn"
            :class="{ active: activeTab === t.id }"
            @click="activeTab = t.id"
          >
            <Icon :name="t.icon" :size="15" />
            {{ t.label }}
            <span v-if="t.id === 'mywork' && market.myActiveWork.length" class="tab-count">{{ market.myActiveWork.length }}</span>
          </button>
        </div>

        <div v-if="activeTab === 'matched'" class="tab-panel">
          <p class="subtitle">Pushed to you based on your skills and what you want to learn next.</p>
          <div class="grid">
            <OpportunityCard v-for="opp in matched" :key="opp.id" :opportunity="opp" :show-match="true" />
          </div>
        </div>

        <div v-else-if="activeTab === 'all'" class="tab-panel">
          <div class="filters">
            <div class="search-input-wrap">
              <Icon name="search" :size="15" class="search-icon" />
              <input v-model="query" class="input search-input" placeholder="Search by title or skill…" />
            </div>
            <select v-model="sourceFilter" class="select filter-select">
              <option value="all">All demand sources</option>
              <option v-for="ds in market.demandSources" :key="ds.id" :value="ds.id">{{ ds.label }}</option>
            </select>
          </div>
          <div v-if="filtered.length === 0" class="card empty-state">No opportunities match your filters.</div>
          <div class="grid">
            <OpportunityCard v-for="opp in filtered" :key="opp.id" :opportunity="opp" />
          </div>
        </div>

        <div v-else class="tab-panel">
          <div v-if="market.myActiveWork.length === 0" class="card empty-state">
            <p>Nothing in progress right now.</p>
            <button class="btn btn-primary btn-sm" @click="activeTab = 'matched'">Find something to work on</button>
          </div>
          <MyWorkItem v-for="opp in market.myActiveWork" :key="opp.id" :opportunity="opp" />

          <div v-if="market.myCompletedWork.length" class="completed-section">
            <div class="section-label">Completed</div>
            <div v-for="opp in market.myCompletedWork" :key="opp.id" class="completed-row">
              <span>{{ opp.title }}</span>
              <span class="completed-hours">{{ opp.estimatedHours }} hrs</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="side-col">
        <div class="card profile-card">
          <div class="profile-card-header">
            <div class="avatar-sm">{{ market.profile.name.split(" ").map(p => p[0]).join("") }}</div>
            <div>
              <div class="profile-name">{{ market.profile.name }}</div>
              <div class="profile-title">{{ market.profile.title }}</div>
            </div>
            <button class="btn-ghost edit-btn" @click="profileModalOpen = true"><Icon name="pencil" :size="15" /></button>
          </div>

          <div class="profile-section">
            <div class="section-label">Skills</div>
            <div class="chip-row">
              <span v-for="s in visibleSkills" :key="s.name" class="pill mini-chip">{{ s.name }}</span>
              <span v-if="extraSkillCount" class="pill mini-chip-muted">+{{ extraSkillCount }}</span>
            </div>
          </div>

          <div class="profile-section">
            <div class="section-label">Learning goals</div>
            <div v-if="market.profile.aspirations.length === 0" class="empty-note">None yet.</div>
            <div class="chip-row">
              <span v-for="a in market.profile.aspirations" :key="a.name" class="pill aspiration-chip">{{ a.name }}</span>
            </div>
          </div>

          <div class="profile-section divider">
            <CapacityBar />
          </div>

          <div class="profile-section divider">
            <div class="section-label">Recognition</div>
            <div class="points-row">
              <Icon name="award" :size="20" />
              <span class="points-value">{{ market.profile.recognition.points }}</span>
              <span class="points-label">points</span>
            </div>
            <div class="chip-row">
              <span v-for="b in market.profile.recognition.badges" :key="b" class="pill badge-chip">{{ b }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProfileModal :open="profileModalOpen" @close="closeProfileModal" />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.subtitle {
  color: var(--sl-ink-secondary);
  font-size: 14px;
  margin-top: 4px;
}
.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}
.main-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.side-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 92px;
}

.tab-bar {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--sl-border);
}
.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sl-ink-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab-btn:hover {
  color: var(--sl-navy);
}
.tab-btn.active {
  color: var(--sl-navy);
  border-bottom-color: var(--sl-blue);
}
.tab-count {
  background: var(--sl-blue);
  color: var(--sl-white);
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 1px 7px;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.filters {
  display: flex;
  gap: 10px;
}
.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: var(--sl-ink-secondary);
}
.search-input {
  padding-left: 34px;
}
.filter-select {
  max-width: 220px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--sl-ink-secondary);
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.completed-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}
.completed-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--sl-ink-secondary);
  padding: 8px 4px;
  border-bottom: 1px solid var(--sl-border);
}
.completed-hours {
  font-weight: 600;
  color: var(--sl-navy);
}

.profile-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.profile-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-sm {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--sl-navy);
  color: var(--sl-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}
.profile-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--sl-navy);
}
.profile-title {
  font-size: 12px;
  color: var(--sl-ink-secondary);
}
.edit-btn {
  margin-left: auto;
  padding: 6px;
}
.profile-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.profile-section.divider {
  border-top: 1px solid var(--sl-border);
  padding-top: 14px;
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.mini-chip {
  background: var(--sl-surface-muted);
  color: var(--sl-navy);
  font-size: 11px;
}
.mini-chip-muted {
  background: transparent;
  color: var(--sl-ink-secondary);
  font-size: 11px;
}
.aspiration-chip {
  background: #f1edfb;
  color: #6947b8;
  font-size: 11px;
}
.badge-chip {
  background: #fff4e5;
  color: #a06400;
  font-size: 11px;
}
.points-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--sl-blue);
}
.points-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--sl-navy);
}
.points-label {
  font-size: 12px;
  color: var(--sl-ink-secondary);
}
.empty-note {
  font-size: 12px;
  color: var(--sl-ink-secondary);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .side-col {
    position: static;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
