import { apiClient } from '@/api/api'
import { API_ENDPOINTS } from '@/constants/api'
import type { ApiEnvelope } from '@/models/api'
import type { TransactionRecord } from '@/types'
import { unwrapApiEnvelope } from '@/utils/error-handler'

export const transactionService = {
  async list() {
    const { data } = await apiClient.get<ApiEnvelope<TransactionRecord[]>>(API_ENDPOINTS.accounting.transactions)
    return unwrapApiEnvelope(data)
  },

  async create(payload: TransactionRecord) {
    const { data } = await apiClient.post<ApiEnvelope<TransactionRecord>>(API_ENDPOINTS.accounting.transactions, payload)
    return unwrapApiEnvelope(data)
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiEnvelope<TransactionRecord>>(`${API_ENDPOINTS.accounting.transactions}${id}/`)
    return unwrapApiEnvelope(data)
  },
}
