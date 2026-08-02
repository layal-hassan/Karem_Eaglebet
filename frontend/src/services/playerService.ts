import { apiClient } from '@/api/api'
import { API_ENDPOINTS } from '@/constants/api'
import { env } from '@/constants/env'
import type {
  ApiEnvelope,
  GetPlayersRequest,
  PaginatedResult,
  PlayerBalanceRequest,
  PlayerBalanceResult,
  PlayerRecord,
  PlayerWalletMutationRequest,
  PlayerWalletMutationResult,
  RegisterPlayerRequest,
  RegisterPlayerResult,
} from '@/models/api'
import { mockAgentApi } from '@/mocks/agentApi'
import { unwrapApiEnvelope } from '@/utils/error-handler'
import { delay, withServiceErrorHandling } from './base'

export const playerService = {
  async registerPlayer(payload: RegisterPlayerRequest) {
    return withServiceErrorHandling(async (): Promise<RegisterPlayerResult> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.registerPlayer(payload)
      }

      const { data } = await apiClient.post<ApiEnvelope<RegisterPlayerResult>>(API_ENDPOINTS.players.registerPlayer, payload, {
        skipErrorToast: true,
      })

      return unwrapApiEnvelope(data)
    })
  },

  async getPlayersForCurrentAgent(payload?: GetPlayersRequest) {
    return withServiceErrorHandling(async (): Promise<PaginatedResult<PlayerRecord>> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.getPlayersForCurrentAgent()
      }

      const { data } = await apiClient.post<ApiEnvelope<PaginatedResult<PlayerRecord>>>(
        API_ENDPOINTS.players.getPlayersForCurrentAgent,
        payload ?? {},
        {
          skipErrorToast: true,
        },
      )

      return unwrapApiEnvelope(data)
    })
  },

  async depositToPlayer(payload: PlayerWalletMutationRequest) {
    return withServiceErrorHandling(async (): Promise<PlayerWalletMutationResult> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.depositToPlayer(payload)
      }

      const { data } = await apiClient.post<ApiEnvelope<PlayerWalletMutationResult>>(
        API_ENDPOINTS.players.depositToPlayer,
        payload,
        {
          skipErrorToast: true,
        },
      )

      return unwrapApiEnvelope(data)
    })
  },

  async withdrawFromPlayer(payload: PlayerWalletMutationRequest) {
    return withServiceErrorHandling(async (): Promise<PlayerWalletMutationResult> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.withdrawFromPlayer(payload)
      }

      const { data } = await apiClient.post<ApiEnvelope<PlayerWalletMutationResult>>(
        API_ENDPOINTS.players.withdrawFromPlayer,
        payload,
        {
          skipErrorToast: true,
        },
      )

      return unwrapApiEnvelope(data)
    })
  },

  async getPlayerBalanceById(payload: PlayerBalanceRequest) {
    return withServiceErrorHandling(async (): Promise<PlayerBalanceResult> => {
      if (env.useMockApi) {
        await delay()
        return mockAgentApi.getPlayerBalanceById(payload)
      }

      const { data } = await apiClient.post<ApiEnvelope<PlayerBalanceResult>>(API_ENDPOINTS.players.getPlayerBalanceById, payload, {
        skipErrorToast: true,
      })

      return unwrapApiEnvelope(data)
    })
  },
}
