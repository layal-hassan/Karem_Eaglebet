import { apiClient } from '@/api/api'
import { API_ENDPOINTS } from '@/constants/api'
import { env } from '@/constants/env'
import type { ApiEnvelope, AgentChildRecord, GetChildrenRequest, PaginatedResult } from '@/models/api'
import { mockAgentApi } from '@/mocks/agentApi'
import type { AgentRecord } from '@/types'
import { unwrapApiEnvelope } from '@/utils/error-handler'
import { delay, withServiceErrorHandling } from './base'

export const agentService = {
  async list() {
    const { data } = await apiClient.get<ApiEnvelope<AgentRecord[]>>(API_ENDPOINTS.accounting.agents)
    return unwrapApiEnvelope(data)
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiEnvelope<AgentRecord>>(`${API_ENDPOINTS.accounting.agents}${id}/`)
    return unwrapApiEnvelope(data)
  },

  async create(payload: AgentRecord) {
    const { data } = await apiClient.post<ApiEnvelope<AgentRecord>>(API_ENDPOINTS.accounting.agents, payload)
    return unwrapApiEnvelope(data)
  },

  async update(id: string, payload: AgentRecord) {
    const { data } = await apiClient.put<ApiEnvelope<AgentRecord>>(`${API_ENDPOINTS.accounting.agents}${id}/`, payload)
    return unwrapApiEnvelope(data)
  },

  async getChildren(payload?: GetChildrenRequest) {
    return withServiceErrorHandling(async (): Promise<PaginatedResult<AgentChildRecord>> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.getChildren(payload)
      }

      const { data } = await apiClient.post<ApiEnvelope<PaginatedResult<AgentChildRecord>>>(
        API_ENDPOINTS.agents.getChildren,
        payload ?? {},
        {
          skipErrorToast: true,
        },
      )

      return unwrapApiEnvelope(data)
    })
  },
}
