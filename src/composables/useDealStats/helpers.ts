import type { DataRecord, Period, Range, Sale } from '../../types'
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns'

/**
 * Returns an array of dates based on the aggregation period.
 *
 * @param range - Date range (start, end)
 * @param period - Period ('daily' | 'weekly' | 'monthly')
 * @returns Array of Date objects corresponding to the range and period
 *
 * @example
 * getDatesByPeriod({ start: new Date('2025-03-01'), end: new Date('2025-03-31') }, 'weekly')
 * // Returns an array of dates representing the start of each week in March
 */
export function getDatesByPeriod(range: Range, period: Period): Date[] {
  return ({
    daily: eachDayOfInterval,
    weekly: eachWeekOfInterval,
    monthly: eachMonthOfInterval,
  } as Record<Period, typeof eachDayOfInterval>)[period](range)
}

/**
 * Calculates the percentage change between two values.
 *
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (rounded to the nearest integer) or null if previous = 0
 *
 * @example
 * calculateVariation(120, 100) // 20
 * calculateVariation(80, 100) // -20
 * calculateVariation(100, 0) // null
 */
export function calculateVariation(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Groups successful deals by the closest date from a list of timestamps.
 * Uses binary search to find the most suitable date (less than or equal to the deal's close date).
 *
 * @param sales - Array of deals (assuming only successful ones are filtered, stageSemanticId = 'S')
 * @param timestamps - An array of timestamps from the range, sorted in ascending order.
 * @returns An object where the key is a timestamp and the value is an array of deals associated with this date.
 *
 * @example
 * const groups = groupSalesByDate(successfulSales, timestamps)
 * // groups[1709251200000] – deals closed on March 1, 2024
 */
export function groupSalesByDate(
  sales: Sale[],
  timestamps: number[]
): Record<number, Sale[]> {
  // Initialize groups for each timestamp
  const groups: Record<number, Sale[]> = {}
  timestamps.forEach((ts) => {
    groups[ts] = []
  })

  // For each transaction we find the closest date
  sales.forEach((sale) => {
    if (!sale.closedate) return // skip if there is no closing date

    const closeTs = new Date(sale.closedate).getTime()

    let left = 0
    let right = timestamps.length - 1
    let foundTs: number | null = null

    // Binary search: find the largest timestamp <= closeTs
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (timestamps[mid] <= closeTs) {
        foundTs = timestamps[mid]
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    if (foundTs !== null) {
      groups[foundTs].push(sale)
    }
  })

  return groups
}

/**
 * Builds chart data based on deals and dates.
 *
 * @param sales - Array of deals (expected to include all deals, including unsuccessful ones, but the chart typically requires successful ones)
 * @param dates - Array of dates corresponding to the period
 * @returns Array of data points for the chart, sorted by date
 *
 * @example
 * const chartData = buildChartData(successfulSales, dates)
 * // [{ date: Date, amount: { USD: 1000, EUR: 500 } }, ...]
 */
export function buildChartData(sales: Sale[], dates: Date[]): DataRecord[] {
  // Filter out only successful transactions (by semantics)
  const successfulSales = sales.filter((s) => s.stageSemanticId === 'S')

  // Get an array of date timestamps
  const timestamps = dates.map((d) => d.getTime())

  // Group transactions by dates
  const groups = groupSalesByDate(successfulSales, timestamps)

  // Convert groups to a DataRecord array
  const chartData = Object.entries(groups).map(([timestamp, dealsInRange]) => {
    // Summarize the amounts by currency
    const amount = dealsInRange.reduce((acc, sale) => {
      const currency = sale.currencyId
      const value = sale.amount || 0
      acc[currency] = (acc[currency] || 0) + value
      return acc
    }, {} as Record<string, number>)

    return {
      date: new Date(Number(timestamp)),
      amount
    }
  })

  // Sort by date
  return chartData.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Returns the last N deals, sorted by close date (newest to oldest).
 *
 * @param sales - Array of all deals
 * @param limit - Number of deals to return (default: 5)
 * @returns - Slice of the array with the latest deals
 *
 * @example
 * const latest = getLatestSales(allSales, 10)
 */
export function getLatestSales(sales: Sale[], limit: number = 5): Sale[] {
  return sales
    .sort((a, b) => new Date(b.closedate!).getTime() - new Date(a.closedate!).getTime())
    .slice(-1 * limit)
}
