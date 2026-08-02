import type { AgentRecord, TransactionRecord } from '@/types'
import { seedAgents, seedTransactions } from './database'

const DATABASE_NAME = 'eaglebet-manual'
const STORE_NAME = 'collections'
const DATABASE_VERSION = 1

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const readCollection = async <T>(key: string, fallback: T[]): Promise<T[]> => {
  const database = await openDatabase()

  return new Promise<T[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).get(key)

    request.onsuccess = () => {
      const value: unknown = request.result
      resolve(Array.isArray(value) ? (value as T[]) : structuredClone(fallback))
    }
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => database.close()
  })
}

const writeCollection = async <T>(key: string, records: T[]): Promise<void> => {
  const database = await openDatabase()

  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(structuredClone(records), key)
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export const manualStorage = {
  loadAgents: () => readCollection<AgentRecord>('agents', seedAgents),
  saveAgents: (records: AgentRecord[]) => writeCollection('agents', records),
  loadTransactions: () => readCollection<TransactionRecord>('transactions', seedTransactions),
  saveTransactions: (records: TransactionRecord[]) => writeCollection('transactions', records),
}
