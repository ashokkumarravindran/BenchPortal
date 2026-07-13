import { createRouter, createWebHistory } from "vue-router";
import { useAppStore } from "../stores/app";

const routes = [
  {
    path: "/",
    redirect: () => {
      const app = useAppStore();
      return app.currentPersona === "megan" ? "/megan" : "/jordan";
    },
  },
  {
    path: "/jordan",
    component: () => import("../views/jordan/JordanDashboard.vue"),
  },
  {
    path: "/megan",
    component: () => import("../views/megan/MeganDashboard.vue"),
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
