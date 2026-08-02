import { isAxiosError } from 'axios'
import type { ApiEnvelope, ApiNotification } from '@/models/api'
import { useAppStore } from '@/stores/app'
import { pinia } from '@/stores/pinia'

export interface NormalizedAppError {
  title: string
  message: string
  statusCode?: number
  notifications: ApiNotification[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const extractNotifications = (payload: unknown): ApiNotification[] => {
  if (!isRecord(payload)) return []
  const notification = payload.notification
  if (!Array.isArray(notification)) return []

  return notification
    .filter(isRecord)
    .map((item) => ({
      code: typeof item.code === 'number' ? item.code : 0,
      title: typeof item.title === 'string' ? item.title : 'Request failed',
      content: typeof item.content === 'string' ? item.content : 'Unexpected error',
      autoHideAfter: typeof item.autoHideAfter === 'number' ? item.autoHideAfter : 5000,
      status: typeof item.status === 'string' ? item.status : 'error',
      list: typeof item.list === 'boolean' ? item.list : undefined,
    }))
}

const extractEnvelopeMessage = (payload: unknown) => {
  const notifications = extractNotifications(payload)
  if (notifications.length > 0) {
    const [first] = notifications
    return {
      title: first.title,
      message: first.content,
      notifications,
    }
  }

  return {
    title: 'Request failed',
    message: 'Unexpected API error',
    notifications,
  }
}

export const normalizeAppError = (error: unknown): NormalizedAppError => {
  if (isAxiosError<ApiEnvelope<unknown>>(error)) {
    if (!error.response) {
      return {
        title: 'تعذر الاتصال بالخادم',
        message: 'تأكد أن Backend يعمل على المنفذ 8000 ثم حاول مجددًا.',
        notifications: [],
      }
    }

    const payload = error.response?.data
    const extracted = extractEnvelopeMessage(payload)

    return {
      title: extracted.title,
      message: extracted.message,
      notifications: extracted.notifications,
      statusCode: error.response?.status,
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Request failed',
      message: error.message,
      notifications: [],
    }
  }

  return {
    title: 'Request failed',
    message: 'Unexpected error',
    notifications: [],
  }
}

export const pushErrorToast = (error: unknown, fallbackTitle = 'Request failed') => {
  const appStore = useAppStore(pinia)
  const normalized = normalizeAppError(error)

  appStore.enqueueToast({
    severity: 'error',
    summary: normalized.title || fallbackTitle,
    detail: normalized.message,
    life: 5000,
  })

  return normalized
}

export const unwrapApiEnvelope = <T>(payload: ApiEnvelope<T>) => {
  if (!payload.status) {
    const extracted = extractEnvelopeMessage(payload)
    throw new Error(extracted.message)
  }

  return payload.result
}
