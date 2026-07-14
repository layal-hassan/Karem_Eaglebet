export const delay = async (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const clone = <T>(value: T): T => structuredClone(value)
