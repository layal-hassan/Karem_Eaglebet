import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
    skipErrorToast?: boolean
    skipLoading?: boolean
    skipRefresh?: boolean
    _retry?: boolean
  }

  interface InternalAxiosRequestConfig {
    skipAuth?: boolean
    skipErrorToast?: boolean
    skipLoading?: boolean
    skipRefresh?: boolean
    _retry?: boolean
  }
}
