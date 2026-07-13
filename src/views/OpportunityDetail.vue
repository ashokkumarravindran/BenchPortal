<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useMarketplaceStore } from "../stores/marketplace";
import StatusPill from "../components/shared/StatusPill.vue";
import Icon from "../components/shared/Icon.vue";

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const market = useMarketplaceStore();

const opp = computed(() => market.opportunityById(props.id));
const demandSourceLabel = computed(() => {
  const ds = market.demandSources.find((d) => d.id === opp.value?.demandSource);
  return ds ? ds.label : opp.value?.demandSource;
});

const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function skillAlignment(skill) {
  if (market.profile.skills.some((s) => s.name === skill)) return "core";
  if (market.profile.aspirations.some((a) => a.name === skill)) return "learning";
  return "neutral";
}

const trainingList = computed(() => opp.value?.requiredTraining || []);
const trainingComplete = computed(() => trainingList.value.every((t) => t.completed));

const overCapacity = computed(() => opp.value && opp.value.estimatedHours > market.remainingCapacity);

// Capacity is enforced when claiming (see store.claimOpportunity), surfaced as
// claimError below — the button itself only gates on training so checking the
// last box always reveals it rather than needing capacity to line up too.
const canClaim = computed(() => opp.value?.status === "published" && trainingComplete.value);

const message = ref("");
const claimError = ref("");

function postMessage() {
  if (!message.value.trim()) return;
  market.addQaMessage(opp.value.id, market.profile.name, message.value.trim());
  message.value = "";
}

function claim() {
  claimError.value = "";
  try {
    market.claimOpportunity(opp.value.id);
  } catch (e) {
    claimError.value = e.message;
  }
}

function toggleTraining(index) {
  market.toggleTraining(opp.value.id, index);
}

function goBack() {
  router.back();
}
</script>

<template>
  <div v-if="opp" class="detail">
    <button class="btn-ghost back-btn" @click="goBack">
      <Icon name="chevronRight" :size="14" style="transform: rotate(180deg)" /> Back
    </button>

    <div class="detail-layout">
      <div class="main-col">
        <div class="card detail-card">
          <div class="pill-row">
            <StatusPill :status="opp.status" />
            <span class="pill" style="background: var(--sl-surface-muted); color: var(--sl-ink-secondary)">
              {{ demandSourceLabel }}
            </span>
          </div>
          <h2>{{ opp.title }}</h2>
          <div class="effort-row">
            <Icon name="clock" :size="14" />
            <span class="effort-value">{{ opp.estimatedHours }} hrs effort</span>
            <span v-if="opp.status === 'published'" class="capacity-note" :class="{ warn: overCapacity }">
              · {{ market.remainingCapacity }} hrs of bench capacity left
            </span>
          </div>

          <p class="description">{{ opp.description }}</p>

          <div class="req-panel">
            <div class="req-row">
              <div class="req-icon"><Icon name="checkCircle" :size="15" /></div>
              <div class="req-body">
                <div class="req-label">Success criteria</div>
                <p class="req-text">{{ opp.successCriteria }}</p>
              </div>
            </div>

            <div class="req-row">
              <div class="req-icon"><Icon name="target" :size="15" /></div>
              <div class="req-body">
                <div class="req-label">Skills &amp; tools</div>
                <div class="chip-row">
                  <span
                    v-for="s in opp.skillsRequired"
                    :key="s"
                    class="pill skill-chip"
                    :class="{
                      'skill-core': skillAlignment(s) === 'core',
                      'skill-learning': skillAlignment(s) === 'learning',
                    }"
                  >
                    {{ s }}
                    <em v-if="skillAlignment(s) === 'core'">core skill</em>
                    <em v-else-if="skillAlignment(s) === 'learning'">learning goal</em>
                  </span>
                  <span v-for="t in opp.tools" :key="t" class="pill tool-chip">{{ t }}</span>
                </div>
              </div>
            </div>

            <div class="req-row">
              <div class="req-icon"><Icon name="book" :size="15" /></div>
              <div class="req-body">
                <div class="req-label">Training</div>
                <div v-if="trainingList.length === 0" class="training-none">
                  <Icon name="checkCircle" :size="13" /> No additional training required — matches your current skills.
                </div>
                <div v-else class="training-list">
                  <div v-for="(t, i) in trainingList" :key="t.title" class="training-row">
                    <button class="training-check" :class="{ done: t.completed }" @click="toggleTraining(i)">
                      <Icon v-if="t.completed" name="checkCircle" :size="13" />
                    </button>
                    <div class="training-info">
                      <a :href="t.url" class="training-title" @click.prevent>{{ t.title }}</a>
                      <span class="training-provider">{{ t.provider }} · via learning portal</span>
                    </div>
                    <span class="pill" :class="t.completed ? 'training-done-pill' : 'training-pending-pill'">
                      {{ t.completed ? "Completed" : "Not started" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="opp.status === 'abandoned'" class="abandoned-note">
            <strong>Stalled:</strong> {{ opp.abandonedReason }}
          </div>

          <div class="actions-row">
            <button v-if="canClaim" class="btn btn-primary" @click="claim">
              <Icon name="checkCircle" :size="16" /> Claim this opportunity
            </button>
            <div v-else-if="opp.status === 'published' && !trainingComplete" class="hint-block">
              Complete required training above to unlock claiming.
            </div>
            <span v-if="claimError" class="error-text">{{ claimError }}</span>
          </div>
        </div>
      </div>

      <div class="side-col">
        <div class="card contact-card">
          <div class="section-label">Point of contact</div>
          <div class="contact-row">
            <div class="avatar">{{ initials(opp.requester) }}</div>
            <div>
              <div class="contact-name">{{ opp.requester }}</div>
              <div class="contact-title">{{ opp.requesterTitle || "Requester" }}</div>
            </div>
          </div>
          <div class="response-hint">
            <Icon name="clock" :size="14" />
            {{ opp.requesterResponseHint || "Response time varies" }}
          </div>
        </div>

        <div class="card qa-card">
          <div class="qa-header">
            <Icon name="chat" :size="16" />
            <h3>Ask {{ opp.requester.split(" ")[0] }} a question</h3>
          </div>
          <p class="qa-hint">Clarify scope, timeline, or tools before you claim — this thread stays with the opportunity.</p>
          <div class="qa-thread scroll-hidden">
            <div v-if="opp.qaThread.length === 0" class="empty-note">No messages yet. Say hello.</div>
            <div v-for="m in opp.qaThread" :key="m.id" class="qa-message">
              <div class="qa-author">{{ m.author }}</div>
              <div class="qa-text">{{ m.text }}</div>
              <div class="qa-time">{{ new Date(m.at).toLocaleString() }}</div>
            </div>
          </div>
          <div class="qa-input-row">
            <input
              v-model="message"
              class="input"
              placeholder="Type a message…"
              @keyup.enter="postMessage"
            />
            <button class="btn btn-primary btn-sm icon-btn" @click="postMessage">
              <Icon name="send" :size="15" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="card empty-note" style="padding: 24px">Opportunity not found.</div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.back-btn {
  align-self: flex-start;
  padding: 4px 10px 4px 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.detail-layout {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
  align-items: start;
}
.detail-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pill-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.effort-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--sl-navy);
  font-size: 13px;
  margin-top: 4px;
}
.effort-value {
  font-weight: 700;
}
.capacity-note {
  color: var(--sl-ink-secondary);
  font-weight: 400;
}
.capacity-note.warn {
  color: var(--sl-coral);
  font-weight: 600;
}
.description {
  color: var(--sl-ink);
  font-size: 14px;
  line-height: 1.5;
}

.req-panel {
  display: flex;
  flex-direction: column;
  background: var(--sl-surface-muted);
  border-radius: var(--sl-radius-md);
  overflow: hidden;
}
.req-row {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--sl-border);
}
.req-row:last-child {
  border-bottom: none;
}
.req-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--sl-white);
  color: var(--sl-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.req-body {
  flex: 1;
  min-width: 0;
}
.req-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--sl-ink-secondary);
  margin-bottom: 4px;
}
.req-text {
  font-size: 13px;
  line-height: 1.45;
  color: var(--sl-ink);
}

.chip-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.skill-chip {
  background: var(--sl-white);
  color: var(--sl-navy);
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  padding: 5px 10px;
  border: 1px solid var(--sl-border);
}
.skill-chip em {
  font-style: normal;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.75;
}
.skill-core {
  background: var(--sl-blue-tint);
  color: var(--sl-blue);
  border-color: transparent;
}
.skill-learning {
  background: #f1edfb;
  color: #6947b8;
  border-color: transparent;
}
.tool-chip {
  background: var(--sl-white);
  color: var(--sl-ink-secondary);
  border: 1px solid var(--sl-border);
  font-size: 12px;
}
.abandoned-note {
  background: #fdeeec;
  color: #b3392a;
  padding: 10px 14px;
  border-radius: var(--sl-radius-sm);
  font-size: 13px;
}

.training-none {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #2f8a3f;
}
.training-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.training-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.training-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--sl-border);
  background: var(--sl-white);
  color: var(--sl-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}
.training-check.done {
  background: #2f8a3f;
  border-color: #2f8a3f;
}
.training-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.training-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--sl-blue);
}
.training-provider {
  font-size: 11px;
  color: var(--sl-ink-secondary);
}
.training-done-pill {
  background: #eaf7ec;
  color: #2f8a3f;
  font-size: 11px;
}
.training-pending-pill {
  background: #fff4e5;
  color: #a06400;
  font-size: 11px;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.actions-row .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.hint-block {
  font-size: 13px;
  color: var(--sl-ink-secondary);
}
.error-text {
  color: var(--sl-coral);
  font-size: 13px;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.contact-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
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
.contact-name {
  font-weight: 600;
  color: var(--sl-navy);
  font-size: 14px;
}
.contact-title {
  font-size: 12px;
  color: var(--sl-ink-secondary);
}
.response-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sl-ink-secondary);
  border-top: 1px solid var(--sl-border);
  padding-top: 12px;
}

.qa-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.qa-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--sl-navy);
}
.qa-header h3 {
  margin: 0;
}
.qa-hint {
  font-size: 12px;
  color: var(--sl-ink-secondary);
  margin-top: -8px;
}
.qa-thread {
  max-height: 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.qa-message {
  border-bottom: 1px solid var(--sl-border);
  padding-bottom: 10px;
}
.qa-author {
  font-weight: 600;
  font-size: 13px;
  color: var(--sl-navy);
}
.qa-text {
  font-size: 14px;
  margin: 2px 0;
}
.qa-time {
  font-size: 11px;
  color: var(--sl-ink-secondary);
}
.qa-input-row {
  display: flex;
  gap: 8px;
}
.icon-btn {
  padding: 8px 12px;
}
.empty-note {
  color: var(--sl-ink-secondary);
  font-size: 13px;
}

@media (max-width: 860px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
