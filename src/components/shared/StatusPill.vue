<script setup>
const props = defineProps({ status: { type: String, required: true } });

const map = {
  published: { label: "Published", bg: "#eaf1ff", fg: "#0c62fb" },
  "in-progress": { label: "In progress", bg: "#fff4e5", fg: "#d98c00" },
  blocked: { label: "Blocked", bg: "#fdeeec", fg: "#e8543e" },
  completed: { label: "Completed", bg: "#eaf7ec", fg: "#2f8a3f" },
  abandoned: { label: "Needs attention", bg: "#fdeeec", fg: "#e8543e" },
  pending: { label: "Pending review", bg: "#f1edfb", fg: "#8b6fce" },
  approved: { label: "Approved", bg: "#eaf7ec", fg: "#2f8a3f" },
  rejected: { label: "Rejected", bg: "#fdeeec", fg: "#e8543e" },
};

const style = map[props.status] || { label: props.status, bg: "#f2f2f5", fg: "#6e6e76" };
</script>

<template>
  <span class="pill" :style="{ background: style.bg, color: style.fg }">{{ style.label }}</span>
</template>
