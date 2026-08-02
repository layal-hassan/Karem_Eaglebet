import { apiClient } from '@/api/api'
import { API_ENDPOINTS } from '@/constants/api'
import { env } from '@/constants/env'
import type { ApiEnvelope, AgentWallet, AgentWalletMutationRequest, AgentWalletMutationResult } from '@/models/api'
import { mockAgentApi } from '@/mocks/agentApi'
import { unwrapApiEnvelope } from '@/utils/error-handler'
import { delay, withServiceErrorHandling } from './base'

export const walletService = {
  async getAgentAllWallets() {
    return withServiceErrorHandling(async (): Promise<AgentWallet[]> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.getAgentAllWallets()
      }

      const { data } = await apiClient.post<ApiEnvelope<AgentWallet[]>>(
        API_ENDPOINTS.wallets.getAgentAllWallets,
        {},
        {
          skipErrorToast: true,
        },
      )

      return unwrapApiEnvelope(data)
    })
  },

  async depositToAgent(payload: AgentWalletMutationRequest) {
    return withServiceErrorHandling(async (): Promise<AgentWalletMutationResult> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.depositToAgent(payload)
      }

      const { data } = await apiClient.post<ApiEnvelope<AgentWalletMutationResult>>(
        API_ENDPOINTS.wallets.depositToAgent,
        payload,
        {
          skipErrorToast: true,
        },
      )

      return unwrapApiEnvelope(data)
    })
  },

  async withdrawFromAgent(payload: AgentWalletMutationRequest) {
    return withServiceErrorHandling(async (): Promise<AgentWalletMutationResult> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.withdrawFromAgent(payload)
      }

      const { data } = await apiClient.post<ApiEnvelope<AgentWalletMutationResult>>(
        API_ENDPOINTS.wallets.withdrawFromAgent,
        payload,
        {
          skipErrorToast: true,
        },
      )

      return unwrapApiEnvelope(data)
    })
  },
}
