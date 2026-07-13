import { createRouter, createWebHistory } from "vue-router";

// This POC is scoped to Jordan's experience. Megan's dashboard views remain
// in src/views/megan for a separate future POC and are intentionally left
// out of navigation for now.
const routes = [
  { path: "/", redirect: "/jordan" },
  {
    path: "/jordan",
    component: () => import("../views/jordan/JordanDashboard.vue"),
  },
  {
    path: "/opportunity/:id",
    component: () => import("../views/OpportunityDetail.vue"),
    props: true,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
