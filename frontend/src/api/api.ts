import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_ENDPOINTS } from '@/constants/api'
import { env } from '@/constants/env'
import type { ApiEnvelope, AuthTokenPair } from '@/models/api'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'
import { pushErrorToast, unwrapApiEnvelope } from '@/utils/error-handler'

const sharedConfig = {
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
}

const appStore = () => useAppStore(pinia)
const authStore = () => useAuthStore(pinia)

const rawApiClient = axios.create(sharedConfig)
export const apiClient = axios.create(sharedConfig)

let refreshPromise: Promise<AuthTokenPair> | null = null

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const currentRefreshToken = authStore().refreshToken

    if (!currentRefreshToken) {
      throw new Error('Missing refresh token')
    }

    refreshPromise = rawApiClient
      .post<ApiEnvelope<AuthTokenPair>>(
        API_ENDPOINTS.auth.refreshToken,
        {
          refreshToken: currentRefreshToken,
        },
        {
          skipAuth: true,
          skipErrorToast: true,
          skipLoading: true,
          skipRefresh: true,
        },
      )
      .then(({ data }) => {
        const tokens = unwrapApiEnvelope(data)
        authStore().setSession(tokens)
        return tokens
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.skipLoading) {
    appStore().beginRequest()
  }

  if (!config.skipAuth) {
    const token = authStore().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (!response.config.skipLoading) {
      appStore().endRequest()
    }

    return response
  },
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config

    if (originalRequest && !originalRequest.skipLoading) {
      appStore().endRequest()
    }

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest.skipRefresh &&
      !originalRequest._retry &&
      authStore().refreshToken
    ) {
      originalRequest._retry = true

      try {
        const tokens = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        authStore().clearSession()
        appStore().enqueueToast({
          severity: 'warn',
          summary: 'Session expired',
          detail: 'Please sign in again.',
          life: 5000,
        })

        if (window.location.pathname !== '/login') {
          window.location.assign('/login')
        }

        if (!originalRequest.skipErrorToast) {
          pushErrorToast(refreshError)
        }

        return Promise.reject(refreshError)
      }
    }

    if (!originalRequest?.skipErrorToast) {
      pushErrorToast(error)
    }

    return Promise.reject(error)
  },
)
