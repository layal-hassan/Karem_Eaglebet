export type CurrencyCode = 'USD' | 'SYP'
export type AgentStatus = 'فعال' | 'موقوف'
export type AccountingType = 'نسبة من الربح' | 'Bonus' | 'بدون نسبة'
export type TransactionType = 'شراء' | 'دفعة واردة' | 'سحب' | 'تعديل رصيد'
export type TransactionStatus = 'مؤكدة' | 'قيد المراجعة' | 'مرفوضة' | 'ملغاة'
export type PaymentMethod = 'حوالة' | 'تحويل بنكي' | 'نقدي' | 'USDT'
export type WithdrawalType = 'سحب مباشر' | 'تسوية رصيد' | 'استرداد جزئي'
export type DatePreset = 'اليوم' | 'الأسبوع' | 'الشهر' | 'فترة مخصصة'

export interface CurrencyTotals {
  USD: number
  SYP: number
}

export interface UserProfile {
  id: string
  name: string
  role: string
  avatar: string
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  createdAt: string
  unread: boolean
}

export interface AgentRecord {
  id: string
  code: string
  name: string
  phone: string
  username?: string
  region: string
  currency: CurrencyCode
  accountingType: AccountingType
  agentRate?: number
  companyRate?: number
  bonusMode?: 'قيمة ثابتة' | 'نسبة مئوية'
  bonusValue?: number
  notes: string
  status: AgentStatus
  createdAt: string
  updatedAt: string
  typeLabel: 'وكيل رئيسي' | 'وكيل فرعي' | 'وكيل ذهبي'
}

export interface TransactionRecord {
  id: string
  code: string
  agentId: string
  type: TransactionType
  amount: number
  currency: CurrencyCode
  status: TransactionStatus
  createdAt: string
  createdBy: string
  reference: string
  note: string
  paidAmount?: number
  receivedBalance?: number
  exchangeRate?: number
  agentShare?: number
  companyShare?: number
  netAmount?: number
  paymentMethod?: PaymentMethod
  attachmentName?: string
  transferReference?: string
  withdrawalType?: WithdrawalType
  siteBalanceRequested?: number
  previousPaidAmount?: number
  returnedBalance?: number
  refundAmount?: number
  profitLoss?: number
}

export interface AgentMetrics {
  totalPurchased: number
  totalPayments: number
  totalWithdrawals: number
  currentBalance: number
  agentProfit: number
  companyProfit: number
  lastPayment: number
}

export interface AgentSummary extends AgentRecord {
  lastTransactionAt?: string
  metrics: AgentMetrics
}

export interface DashboardTotals {
  totalAgents: number
  purchased: CurrencyTotals
  incomingPayments: CurrencyTotals
  withdrawals: CurrencyTotals
  companyDue: CurrencyTotals
  agentsDue: CurrencyTotals
}

export interface TrendPoint {
  date: string
  purchases: number
  payments: number
}

export interface DistributionPoint {
  name: string
  value: number
}

export interface AlertItem {
  id: string
  title: string
  description: string
  severity: 'success' | 'warn' | 'danger'
}

export interface ReportRow {
  id: string
  label: string
  purchases: CurrencyTotals
  payments: CurrencyTotals
  withdrawals: CurrencyTotals
  profit: CurrencyTotals
}

export interface StatementSummary {
  openingBalance: number
  totalPurchases: number
  totalPayments: number
  totalWithdrawals: number
  agentProfit: number
  companyShare: number
  closingBalance: number
}

export interface StatementPreview {
  agent: AgentSummary
  from: string
  to: string
  entries: TransactionRecord[]
  summary: StatementSummary
}

export interface AgentFilters {
  search: string
  status: AgentStatus | 'الكل'
  accountingType: AccountingType | 'الكل'
  sortBy: 'name' | 'balance' | 'recent'
}

export interface TransactionFilters {
  agentId: string
  type: TransactionType | 'الكل'
  status: TransactionStatus | 'الكل'
  currency: CurrencyCode | 'الكل'
  minAmount?: number
  maxAmount?: number
  from?: string
  to?: string
}
