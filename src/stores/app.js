import { defineStore } from "pinia";

// Drives the profile-icon persona switcher. Prototype-only stand-in for what
// would be real SSO-based identity in production.
export const useAppStore = defineStore("app", {
  state: () => ({
    currentPersona: "jordan", // 'jordan' | 'megan'
  }),
  actions: {
    setPersona(persona) {
      this.currentPersona = persona;
    },
  },
});
