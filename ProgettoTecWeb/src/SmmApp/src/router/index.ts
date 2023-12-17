import { createRouter, createWebHistory } from 'vue-router';
//import DashboardViewVue from '@/views/DashboardView.vue';
//import VipRequestsViewVue from '@/views/VipRequestsView.vue';
//import ShopViewVue from '@/views/ShopView.vue';
//import MessagesViewVue from '@/views/MessagesView.vue';
const startingPath = '/smm-dashboard';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: `${startingPath}`,
      name: 'home',
      redirect: `${startingPath}/home`
    },
    {
      path: `${startingPath}/home`,
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: `${startingPath}/vip-requests`,
      name: 'vip-requests',
      component: () => import('@/views/VipRequestsView.vue')
    },
    {
      path: `${startingPath}/shop`,
      name: 'shop',
      component: () => import('@/views/ShopView.vue')
    },
    {
      path: `${startingPath}/messages`,
      name: 'messages',
      component: () => import('@/views/MessagesView.vue')
    }
  ]
});

export default router;
