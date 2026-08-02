export type ApiNotificationStatus = 'success' | 'info' | 'warn' | 'error' | string

export interface ApiNotification {
  code: number
  title: string
  content: string
  autoHideAfter: number
  status: ApiNotificationStatus
  list?: boolean
}

export interface ApiEnvelope<T> {
  status: boolean
  html?: string | null
  result: T
  notification: ApiNotification[]
}

export interface AuthTokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthSession extends AuthTokenPair {
  username?: string
  issuedAt: string
}

export interface SignInRequest {
  username: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AgentWallet {
  currencyName: string
  currencyCode: string
  availableWallet?: number
  creditLine: number
  credit: number
  availability: number
  balance: number
  bonus: number
  frozenBalance: number
  withdrawAmount?: number
}

export interface AgentWalletMutationRequest {
  affiliateId: string
  amount: number
  currencyCode: string
  moneyStatus: number
  comment?: string
}

export interface AgentWalletMutationResult {
  balance: number
  creditLine: number
  credit: number
  availability: number
  currencyCode: string
}

export interface ApiFilterValue {
  action: string
  value: string | number | boolean
  valueLabel?: string | number | boolean | null
}

export interface GetChildrenRequest {
  start?: number
  withoutTotalCount?: boolean
  isNextPage?: boolean
  filter?: Record<string, ApiFilterValue>
}

export interface AgentChildRecord {
  affiliateId: string
  username: string
  email?: string | null
  status?: string | number | null
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
}

export interface PaginatedResult<T> {
  records: T[]
  totalRecordsCount: number
  total?: number | null
}

export interface RegisterPlayerRequest {
  username: string
  password: string
  email: string
  parentId: string
}

export interface RegisterPlayerResult {
  playerId?: string
  username?: string
  parentId?: string
}

export interface GetPlayersRequest {
  start?: number
  withoutTotalCount?: boolean
  isNextPage?: boolean
  filter?: Record<string, ApiFilterValue>
}

export interface PlayerRecord {
  playerId: string
  affiliateId: string
  username: string
  registerDate: string
  firstName?: string | null
  lastName?: string | null
  currency?: string | null
  phoneNumber?: string | null
}

export interface PlayerWalletMutationRequest {
  playerId: string
  amount: number
  currencyCode: string
  moneyStatus: number
}

export interface PlayerWalletMutationResult {
  balance: number
  credit?: number
  currencyCode: string
}

export interface PlayerBalanceRequest {
  playerId: string
}

export interface PlayerBalanceResult {
  balance: number
  currencyCode: string
  main: boolean
}
