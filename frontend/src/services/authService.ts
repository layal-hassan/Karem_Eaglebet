import { apiClient } from '@/api/api'
import { API_ENDPOINTS } from '@/constants/api'
import type { ApiEnvelope, AuthTokenPair, RefreshTokenRequest, SignInRequest } from '@/models/api'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'
import { unwrapApiEnvelope } from '@/utils/error-handler'
import { withServiceErrorHandling } from './base'

const authStore = () => useAuthStore(pinia)

export const authService = {
  async login(username: string, password: string) {
    return withServiceErrorHandling(async () => {
      const payload: SignInRequest = { username, password }
      const { data } = await apiClient.post<ApiEnvelope<AuthTokenPair>>(API_ENDPOINTS.auth.signIn, payload, {
        skipAuth: true,
        skipRefresh: true,
        skipErrorToast: true,
      })
      const tokens = unwrapApiEnvelope(data)

      authStore().setSession(tokens, username)
      return tokens
    })
  },

  async refreshToken(payload: RefreshTokenRequest) {
    return withServiceErrorHandling(async () => {
      const { data } = await apiClient.post<ApiEnvelope<AuthTokenPair>>(API_ENDPOINTS.auth.refreshToken, payload, {
        skipAuth: true,
        skipRefresh: true,
        skipErrorToast: true,
      })
      const tokens = unwrapApiEnvelope(data)

      authStore().setSession(tokens)
      return tokens
    })
  },

  async logout() {
    const refreshToken = authStore().refreshToken
    try {
      if (refreshToken) {
        await apiClient.post(API_ENDPOINTS.auth.logout, { refreshToken }, { skipErrorToast: true, skipRefresh: true })
      }
    } finally {
      authStore().clearSession()
    }
  },

  isAuthenticated() {
    return authStore().isAuthenticated
  },
}
