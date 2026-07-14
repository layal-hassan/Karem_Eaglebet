import { defineStore } from 'pinia'
import { agentService } from '@/services/agentService'
import { authService } from '@/services/authService'
import { systemService } from '@/services/systemService'
import { transactionService } from '@/services/transactionService'
import {
  buildAgentSummaries,
  buildAlerts,
  buildDashboardTotals,
  buildDistributionData,
  buildReportRows,
  buildTrendData,
} from '@/utils/accounting'
import type { AgentRecord, NotificationItem, TransactionRecord, UserProfile } from '@/types'

interface AccountingState {
  initialized: boolean
  loading: boolean
  currentUser: UserProfile | null
  notifications: NotificationItem[]
  agents: AgentRecord[]
  transactions: TransactionRecord[]
}

export const useAccountingStore = defineStore('accounting', {
  state: (): AccountingState => ({
    initialized: false,
    loading: false,
    currentUser: null,
    notifications: [],
    agents: [],
    transactions: [],
  }),
  getters: {
    isAuthenticated: () => authService.isAuthenticated(),
    agentSummaries(state) {
      return buildAgentSummaries(state.agents, state.transactions)
    },
    dashboardTotals(state) {
      return buildDashboardTotals(state.agents, state.transactions)
    },
    trendData(state) {
      return buildTrendData(state.transactions)
    },
    agentTypeDistribution(state) {
      return buildDistributionData(state.agents)
    },
    recentTransactions(state) {
      return [...state.transactions].slice(0, 8)
    },
    topActiveAgents(state) {
      return buildAgentSummaries(state.agents, state.transactions)
        .sort((left, right) => right.metrics.totalPurchased - left.metrics.totalPurchased)
        .slice(0, 5)
    },
    alerts(state) {
      return buildAlerts(state.agents, state.transactions)
    },
    reportRows(state) {
      return buildReportRows(state.agents, state.transactions)
    },
  },
  actions: {
    async initialize(force = false) {
      if (this.initialized && !force) return

      this.loading = true
      try {
        const [agents, transactions, user, notifications] = await Promise.all([
          agentService.list(),
          transactionService.list(),
          systemService.currentUser(),
          systemService.notifications(),
        ])

        this.agents = agents
        this.transactions = transactions
        this.currentUser = user
        this.notifications = notifications
        this.initialized = true
      } finally {
        this.loading = false
      }
    },

    async login(username: string, password: string) {
      this.currentUser = await authService.login(username, password)
    },

    async logout() {
      await authService.logout()
      this.currentUser = null
    },

    async createAgent(payload: AgentRecord) {
      const created = await agentService.create(payload)
      this.agents.unshift(created)
      return created
    },

    async updateAgent(id: string, payload: AgentRecord) {
      const updated = await agentService.update(id, payload)
      const index = this.agents.findIndex((agent) => agent.id === id)
      if (index >= 0) this.agents[index] = updated
      return updated
    },

    async createTransaction(payload: TransactionRecord) {
      const created = await transactionService.create(payload)
      this.transactions.unshift(created)
      return created
    },
  },
})
