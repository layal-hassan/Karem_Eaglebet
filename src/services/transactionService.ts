import { clone, delay } from './base'
import { seedTransactions } from '@/mocks/database'
import type { TransactionRecord } from '@/types'

const dbTransactions = [...seedTransactions].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())

export const transactionService = {
  async list() {
    await delay()
    return clone(dbTransactions)
  },

  async create(payload: TransactionRecord) {
    await delay()
    dbTransactions.unshift(payload)
    return clone(payload)
  },

  async getById(id: string) {
    await delay(120)
    return clone(dbTransactions.find((transaction) => transaction.id === id) ?? null)
  },
}
