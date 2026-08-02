const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value == null || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

const parseNumber = (value: string | undefined, fallback: number) => {
  if (value == null || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'EAGLEBET',
  useMockApi: parseBoolean(import.meta.env.VITE_USE_MOCK_API, false),
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  apiTimeoutMs: parseNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
  mockApiLatencyMs: parseNumber(import.meta.env.VITE_MOCK_API_LATENCY_MS, 250),
} as const
