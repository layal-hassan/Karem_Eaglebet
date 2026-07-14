import type { CurrencyCode, CurrencyTotals, TransactionStatus } from '@/types'

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const sypFormatter = new Intl.NumberFormat('ar-SY', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export const formatCurrency = (amount: number, currency: CurrencyCode) =>
  currency === 'USD' ? usdFormatter.format(amount) : `${sypFormatter.format(amount)} ل.س`

export const formatDate = (value?: string) => {
  if (!value) return 'غير متوفر'

  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export const formatDateTime = (value?: string) => {
  if (!value) return 'غير متوفر'

  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const formatTotalsPair = (totals: CurrencyTotals) => ({
  USD: formatCurrency(totals.USD, 'USD'),
  SYP: formatCurrency(totals.SYP, 'SYP'),
})

export const statusSeverity = (status: TransactionStatus | string) => {
  if (status === 'مؤكدة' || status === 'فعال') return 'success'
  if (status === 'قيد المراجعة') return 'warn'
  return 'danger'
}

export const shortNumber = (value: number) =>
  new Intl.NumberFormat('ar', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
