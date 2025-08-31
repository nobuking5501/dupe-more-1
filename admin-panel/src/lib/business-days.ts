// Business day calculation utility
import { ALL_HOLIDAYS } from '../../config/businessDays'

export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay()
  const dateString = date.toISOString().split('T')[0]
  
  // Check if it's weekend (0 = Sunday, 6 = Saturday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }
  
  // Check if it's a holiday
  if (ALL_HOLIDAYS.includes(dateString)) {
    return false
  }
  
  return true
}

// export function getPreviousBusinessDay(date: Date): Date {
//   const previousDay = new Date(date)
//   previousDay.setDate(previousDay.getDate() - 1)
//   
//   while (!isBusinessDay(previousDay)) {
//     previousDay.setDate(previousDay.getDate() - 1)
//   }
//   
//   return previousDay
// }

export function getNextBusinessDay(date: Date): Date {
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  
  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1)
  }
  
  return nextDay
}

// export function formatDateString(date: Date): string {
//   return date.toISOString().split('T')[0]
// }

export function getHolidays(): string[] {
  return [...ALL_HOLIDAYS]
}