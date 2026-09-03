import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '训练计划' } },
  { path: '/flashcard', name: 'flashcard', component: () => import('../views/FlashcardView.vue'), meta: { title: '话术速查' } },
  { path: '/review', name: 'review', component: () => import('../views/ReviewView.vue'), meta: { title: '复习' } },
  { path: '/checkin', name: 'checkin', component: () => import('../views/CheckinView.vue'), meta: { title: '打卡' } },
  { path: '/practice', name: 'practice', component: () => import('../views/PracticeView.vue'), meta: { title: '语音练习' } },
  { path: '/coach', name: 'coach', component: () => import('../views/CoachView.vue'), meta: { title: 'AI 陪练' } },
  { path: '/reading', name: 'reading', component: () => import('../views/ReadingView.vue'), meta: { title: '朗读' } },
  { path: '/impromptu', name: 'impromptu', component: () => import('../views/ImpromptuView.vue'), meta: { title: '即兴挑战' } },
  { path: '/progress', name: 'progress', component: () => import('../views/ProgressView.vue'), meta: { title: '进度' } },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { title: '设置' } },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 口才训练营` : '口才训练营'
})
