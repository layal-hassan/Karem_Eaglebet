import { endOfDay, format, isAfter, isBefore, parseISO, startOfDay, subDays } from 'date-fns'
import type {
  AgentMetrics,
  AgentRecord,
  AgentSummary,
  AlertItem,
  CurrencyCode,
  CurrencyTotals,
  DashboardTotals,
  DistributionPoint,
  ReportRow,
  StatementPreview,
  StatementSummary,
  TransactionFilters,
  TransactionRecord,
  TrendPoint,
} from '@/types'

const zeroTotals = (): CurrencyTotals => ({ USD: 0, SYP: 0 })

const addToCurrencyTotals = (totals: CurrencyTotals, currency: 'USD' | 'SYP', value: number) => {
  totals[currency] += value
  return totals
}

const confirmedTransactions = (transactions: TransactionRecord[]) =>
  transactions.filter((transaction) => transaction.status === 'مؤكدة')

export const calculateAgentMetrics = (agent: AgentRecord, transactions: TransactionRecord[]): AgentMetrics => {
  const related = confirmedTransactions(transactions).filter((transaction) => transaction.agentId === agent.id)

  return related.reduce<AgentMetrics>(
    (metrics, transaction) => {
      if (transaction.type === 'شراء') {
        metrics.totalPurchased += transaction.receivedBalance ?? 0
        metrics.currentBalance += transaction.receivedBalance ?? 0
        metrics.agentProfit += transaction.agentShare ?? 0
        metrics.companyProfit += transaction.companyShare ?? 0
      }

      if (transaction.type === 'دفعة واردة') {
        metrics.totalPayments += transaction.amount
        metrics.currentBalance -= transaction.amount
        metrics.lastPayment = transaction.amount
      }

      if (transaction.type === 'سحب') {
        metrics.totalWithdrawals += transaction.amount
        metrics.currentBalance -= transaction.returnedBalance ?? transaction.amount
        metrics.companyProfit += transaction.profitLoss ?? 0
      }

      return metrics
    },
    {
      totalPurchased: 0,
      totalPayments: 0,
      totalWithdrawals: 0,
      currentBalance: 0,
      agentProfit: 0,
      companyProfit: 0,
      lastPayment: 0,
    },
  )
}

export const buildAgentSummaries = (agents: AgentRecord[], transactions: TransactionRecord[]): AgentSummary[] =>
  agents.map((agent) => {
    const metrics = calculateAgentMetrics(agent, transactions)
    const lastTransaction = transactions
      .filter((transaction) => transaction.agentId === agent.id)
      .sort((left, right) => parseISO(right.createdAt).getTime() - parseISO(left.createdAt).getTime())[0]

    return {
      ...agent,
      metrics,
      lastTransactionAt: lastTransaction?.createdAt,
    }
  })

export const buildDashboardTotals = (agents: AgentRecord[], transactions: TransactionRecord[]): DashboardTotals => {
  const summaries = buildAgentSummaries(agents, transactions)
  const totals: DashboardTotals = {
    totalAgents: agents.length,
    purchased: zeroTotals(),
    incomingPayments: zeroTotals(),
    withdrawals: zeroTotals(),
    companyDue: zeroTotals(),
    agentsDue: zeroTotals(),
  }

  for (const summary of summaries) {
    addToCurrencyTotals(totals.purchased, summary.currency, summary.metrics.totalPurchased)
    addToCurrencyTotals(totals.incomingPayments, summary.currency, summary.metrics.totalPayments)
    addToCurrencyTotals(totals.withdrawals, summary.currency, summary.metrics.totalWithdrawals)
    addToCurrencyTotals(totals.agentsDue, summary.currency, Math.max(summary.metrics.currentBalance, 0))
    addToCurrencyTotals(totals.companyDue, summary.currency, Math.max(summary.metrics.companyProfit, 0))
  }

  return totals
}

export const buildTrendData = (
  transactions: TransactionRecord[],
  days = 30,
  currency?: CurrencyCode,
): TrendPoint[] => {
  const confirmed = confirmedTransactions(transactions).filter((transaction) =>
    currency ? transaction.currency === currency : true,
  )

  return Array.from({ length: days }, (_, index) => {
    const date = subDays(new Date('2026-07-14T12:00:00'), days - index - 1)
    const key = format(date, 'yyyy-MM-dd')
    const sameDay = confirmed.filter((transaction) => format(parseISO(transaction.createdAt), 'yyyy-MM-dd') === key)

    return {
      date: key,
      purchases: sameDay
        .filter((transaction) => transaction.type === 'شراء')
        .reduce((sum, transaction) => sum + (transaction.receivedBalance ?? 0), 0),
      payments: sameDay
        .filter((transaction) => transaction.type === 'دفعة واردة')
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    }
  })
}

export const buildDistributionData = (agents: AgentRecord[]): DistributionPoint[] => {
  const counts = agents.reduce<Record<string, number>>((accumulator, agent) => {
    accumulator[agent.typeLabel] = (accumulator[agent.typeLabel] ?? 0) + 1
    return accumulator
  }, {})

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export const buildAlerts = (agents: AgentRecord[], transactions: TransactionRecord[]): AlertItem[] => {
  const summaries = buildAgentSummaries(agents, transactions)

  return summaries
    .filter((summary) => summary.metrics.currentBalance > (summary.currency === 'USD' ? 2200 : 9000000) || summary.status === 'موقوف')
    .slice(0, 4)
    .map((summary, index) => ({
      id: `alert-${summary.id}`,
      title: index % 2 === 0 ? 'تنبيه رصيد متراكم' : 'مراجعة حالة الوكيل',
      description:
        summary.status === 'موقوف'
          ? `الوكيل ${summary.name} موقوف وما زال لديه حركة مالية تحتاج مراجعة.`
          : `الوكيل ${summary.name} تجاوز الحد المقترح للرصيد الحالي.`,
      severity: summary.status === 'موقوف' ? 'danger' : 'warn',
    }))
}

export const filterTransactions = (transactions: TransactionRecord[], filters: TransactionFilters) =>
  transactions.filter((transaction) => {
    if (filters.agentId && transaction.agentId !== filters.agentId) return false
    if (filters.type !== 'الكل' && transaction.type !== filters.type) return false
    if (filters.status !== 'الكل' && transaction.status !== filters.status) return false
    if (filters.currency !== 'الكل' && transaction.currency !== filters.currency) return false
    if (filters.minAmount && transaction.amount < filters.minAmount) return false
    if (filters.maxAmount && transaction.amount > filters.maxAmount) return false

    if (filters.from) {
      const from = startOfDay(parseISO(filters.from))
      if (isBefore(parseISO(transaction.createdAt), from)) return false
    }

    if (filters.to) {
      const to = endOfDay(parseISO(filters.to))
      if (isAfter(parseISO(transaction.createdAt), to)) return false
    }

    return true
  })

export const buildReportRows = (agents: AgentRecord[], transactions: TransactionRecord[]): ReportRow[] =>
  buildAgentSummaries(agents, transactions).map((summary) => ({
    id: summary.id,
    label: summary.name,
    purchases: addToCurrencyTotals(zeroTotals(), summary.currency, summary.metrics.totalPurchased),
    payments: addToCurrencyTotals(zeroTotals(), summary.currency, summary.metrics.totalPayments),
    withdrawals: addToCurrencyTotals(zeroTotals(), summary.currency, summary.metrics.totalWithdrawals),
    profit: addToCurrencyTotals(zeroTotals(), summary.currency, summary.metrics.companyProfit),
  }))

export const buildStatementPreview = (
  agent: AgentSummary,
  transactions: TransactionRecord[],
  from: string,
  to: string,
): StatementPreview => {
  const fromDate = startOfDay(parseISO(from))
  const toDate = endOfDay(parseISO(to))
  const agentTransactions = transactions
    .filter((transaction) => transaction.agentId === agent.id)
    .filter((transaction) => {
      const transactionDate = parseISO(transaction.createdAt)
      return !isBefore(transactionDate, fromDate) && !isAfter(transactionDate, toDate)
    })
    .sort((left, right) => parseISO(left.createdAt).getTime() - parseISO(right.createdAt).getTime())

  const summary = agentTransactions.reduce<StatementSummary>(
    (accumulator, transaction) => {
      if (transaction.type === 'شراء') {
        accumulator.totalPurchases += transaction.receivedBalance ?? 0
        accumulator.agentProfit += transaction.agentShare ?? 0
        accumulator.companyShare += transaction.companyShare ?? 0
        accumulator.closingBalance += transaction.receivedBalance ?? 0
      }

      if (transaction.type === 'دفعة واردة') {
        accumulator.totalPayments += transaction.amount
        accumulator.closingBalance -= transaction.amount
      }

      if (transaction.type === 'سحب') {
        accumulator.totalWithdrawals += transaction.amount
        accumulator.closingBalance -= transaction.returnedBalance ?? transaction.amount
      }

      return accumulator
    },
    {
      openingBalance: Math.max(agent.metrics.currentBalance - 1200, 0),
      totalPurchases: 0,
      totalPayments: 0,
      totalWithdrawals: 0,
      agentProfit: 0,
      companyShare: 0,
      closingBalance: Math.max(agent.metrics.currentBalance - 1200, 0),
    },
  )

  return {
    agent,
    from,
    to,
    entries: agentTransactions,
    summary,
  }
}
