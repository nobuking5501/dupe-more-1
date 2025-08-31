// Business day configuration for Dupe&more salon
// This file defines holidays and non-business days

export const HOLIDAYS_2025 = [
  // New Year holidays
  '2025-01-01', // New Year's Day
  '2025-01-02', // New Year holiday
  '2025-01-03', // New Year holiday
  
  // National holidays
  '2025-01-13', // Coming of Age Day
  '2025-02-11', // Foundation Day
  '2025-02-23', // Emperor's Birthday
  '2025-04-29', // Showa Day
  '2025-05-03', // Constitution Memorial Day
  '2025-05-04', // Greenery Day
  '2025-05-05', // Children's Day
  '2025-07-21', // Marine Day
  '2025-08-11', // Mountain Day
  '2025-09-15', // Respect for the Aged Day
  '2025-09-22', // Autumnal Equinox Day
  '2025-10-13', // Sports Day
  '2025-11-03', // Culture Day
  '2025-11-23', // Labor Thanksgiving Day
]

export const SALON_SPECIFIC_HOLIDAYS: string[] = [
  // Add salon-specific holidays here
  // Example: '2025-06-15', // Salon maintenance day
]

export const ALL_HOLIDAYS = [
  ...HOLIDAYS_2025,
  ...SALON_SPECIFIC_HOLIDAYS
]

// Function to add custom holidays
export function addCustomHoliday(date: string) {
  if (!SALON_SPECIFIC_HOLIDAYS.includes(date)) {
    SALON_SPECIFIC_HOLIDAYS.push(date)
  }
}

// Function to remove custom holidays
export function removeCustomHoliday(date: string) {
  const index = SALON_SPECIFIC_HOLIDAYS.indexOf(date)
  if (index > -1) {
    SALON_SPECIFIC_HOLIDAYS.splice(index, 1)
  }
}

// Function to check if a date is a holiday
export function isHoliday(date: string): boolean {
  return ALL_HOLIDAYS.includes(date)
}