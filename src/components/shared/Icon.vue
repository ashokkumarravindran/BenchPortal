<script setup>
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
});

// Hand-drawn, single-color line icons. currentColor so they inherit text color.
const paths = {
  bell: `<path d="M6 8a6 6 0 1 1 12 0c0 3 1 4.5 1.5 5.5H4.5C5 12.5 6 11 6 8Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/>`,
  search: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>`,
  chat: `<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z"/>`,
  award: `<circle cx="12" cy="9" r="5"/><path d="M9 13.5 8 21l4-2 4 2-1-7.5"/>`,
  briefcase: `<rect x="3.5" y="8" width="17" height="11" rx="1.5"/><path d="M8.5 8V6.5A2 2 0 0 1 10.5 4.5h3a2 2 0 0 1 2 2V8"/><path d="M3.5 13h17"/>`,
  chevronRight: `<path d="M9 6l6 6-6 6"/>`,
  chevronDown: `<path d="M6 9l6 6 6-6"/>`,
  checkCircle: `<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.4 2.4L16 9.5"/>`,
  clock: `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`,
  sparkle: `<path d="M12 3.5l1.8 4.9 4.9 1.8-4.9 1.8L12 17l-1.8-4.9-4.9-1.8 4.9-1.8L12 3.5Z"/>`,
  user: `<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>`,
  pencil: `<path d="M14.5 5.5l4 4L8 20l-4.5 1L4.5 16.5 14.5 5.5Z"/>`,
  x: `<path d="M6 6l12 12M18 6L6 18"/>`,
  plus: `<path d="M12 5.5v13M5.5 12h13"/>`,
  send: `<path d="M4 12l16-7.5-6 16-2.5-6.5L4 12Z"/>`,
  book: `<path d="M4 5.5c2.5-1 5-1 8 0v13c-3-1-5.5-1-8 0v-13Z"/><path d="M20 5.5c-2.5-1-5-1-8 0v13c3-1 5.5-1 8 0v-13Z"/>`,
  target: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".5" fill="currentColor"/>`,
  bulb: `<path d="M9 18h6M10 21h4"/><path d="M12 3.5a5.5 5.5 0 0 0-3 10.1c.6.4 1 1 1 1.7v.7h4v-.7c0-.7.4-1.3 1-1.7A5.5 5.5 0 0 0 12 3.5Z"/>`,
};
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="paths[name] || ''"
  />
</template>
