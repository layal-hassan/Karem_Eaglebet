import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => (useAuthStore(pinia).isAuthenticated ? '/dashboard' : '/login'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: {
        title: 'تسجيل الدخول',
      },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          meta: { title: 'الرئيسية' },
        },
        {
          path: 'agents',
          name: 'agents',
          component: () => import('@/views/agents/AgentsListView.vue'),
          meta: { title: 'الوكلاء' },
        },
        {
          path: 'agents/create',
          name: 'agents-create',
          component: () => import('@/views/agents/AgentFormView.vue'),
          meta: { title: 'إضافة وكيل' },
        },
        {
          path: 'agents/:id/edit',
          name: 'agents-edit',
          component: () => import('@/views/agents/AgentFormView.vue'),
          meta: { title: 'تعديل وكيل' },
        },
        {
          path: 'agents/:id',
          name: 'agents-details',
          component: () => import('@/views/agents/AgentDetailsView.vue'),
          meta: { title: 'تفاصيل الوكيل' },
        },
        {
          path: 'transactions/purchase',
          name: 'transactions-purchase',
          component: () => import('@/views/transactions/PurchaseView.vue'),
          meta: { title: 'تسجيل شراء رصيد' },
        },
        {
          path: 'transactions/payment',
          name: 'transactions-payment',
          component: () => import('@/views/transactions/IncomingPaymentView.vue'),
          meta: { title: 'تسجيل دفعة واردة' },
        },
        {
          path: 'transactions/withdrawal',
          name: 'transactions-withdrawal',
          component: () => import('@/views/transactions/WithdrawalView.vue'),
          meta: { title: 'تسجيل سحب' },
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/views/transactions/TransactionsView.vue'),
          meta: { title: 'سجل العمليات' },
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/reports/ReportsView.vue'),
          meta: { title: 'التقارير' },
        },
        {
          path: 'statements',
          name: 'statements',
          component: () => import('@/views/statements/StatementsView.vue'),
          meta: { title: 'الفاتورة وكشف الحساب' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/reports/SettingsView.vue'),
          meta: { title: 'الإعدادات' },
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const isAuthenticated = useAuthStore(pinia).isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: '/login' }
  }

  if (to.path === '/login' && isAuthenticated) {
    return { path: '/dashboard' }
  }

  return true
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'EAGLEBET'} | EAGLEBET`
})

export default router
