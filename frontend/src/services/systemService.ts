import { apiClient } from '@/api/api'
import { API_ENDPOINTS } from '@/constants/api'
import { notificationsSeed } from '@/mocks/database'
import type { ApiEnvelope } from '@/models/api'
import type { UserProfile } from '@/types'
import { unwrapApiEnvelope } from '@/utils/error-handler'
import { clone, delay } from './base'

export const systemService = {
  async currentUser() {
    const { data } = await apiClient.get<ApiEnvelope<UserProfile>>(API_ENDPOINTS.auth.currentUser)
    return unwrapApiEnvelope(data)
  },

  async notifications() {
    await delay(100)
    return clone(notificationsSeed)
  },
}
