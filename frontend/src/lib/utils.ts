import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata uma data ISO para exibição em pt-BR */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

/** Retorna quantos dias faltam para uma data */
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

/** Retorna o status do estoque com base na quantidade e mínimo */
export type StockStatus = 'ok' | 'warning' | 'critical'
export function getStockStatus(current: number, minimum: number): StockStatus {
  if (current <= 0) return 'critical'
  if (current <= minimum) return 'warning'
  return 'ok'
}

/** Retorna o status de validade com base nos dias restantes */
export function getExpiryStatus(daysLeft: number): StockStatus {
  if (daysLeft <= 0) return 'critical'
  if (daysLeft <= 30) return 'warning'
  return 'ok'
}
