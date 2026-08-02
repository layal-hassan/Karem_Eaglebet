import { env } from '@/constants/env'
import { pushErrorToast } from '@/utils/error-handler'

export const delay = async (ms = env.mockApiLatencyMs) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const clone = <T>(value: T): T => structuredClone(value)

export const withServiceErrorHandling = async <T>(action: () => Promise<T>) => {
  try {
    return await action()
  } catch (error) {
    pushErrorToast(error)
    throw error
  }
}
