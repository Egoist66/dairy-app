import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'journal',
      component: () => import('../views/JournalView.vue'),
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/AnalyticsView.vue'),
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/TasksView.vue'),
    },
  ],
})

const titles: Record<string, string> = {
  journal: 'Journal',
  analytics: 'Analytics',
  tasks: 'Tasks',
}

router.afterEach((to) => {
  const name = to.name as string
  document.title = `Tech Journal — ${titles[name] || name}`
})

export default router
