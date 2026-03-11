import type { DataRecord, Period, Range, Sale, Stat } from '../../types'
import { randomFrom, randomInt } from '../../utils'
import { formatCurrency } from './formatters'
import ContactIcon from '@bitrix24/b24icons-vue/outline/ContactIcon'
import GraphsDiagramIcon from '@bitrix24/b24icons-vue/outline/GraphsDiagramIcon'
import WalletIcon from '@bitrix24/b24icons-vue/outline/WalletIcon'
import ShoppingCartIcon from '@bitrix24/b24icons-vue/outline/ShoppingCartIcon'
import {getDatesByPeriod} from "./helpers.ts";

/**
 * Generates mock data for statistics cards.
 *
 * @param locale - Locale for currency formatting
 * @param currency - Default currency
 * @returns Array of Stat objects to display in cards
 */
export function generateMockStats(locale: string, currency: string): Stat[] {
  const baseStats = [
    {
      title: 'Customers',
      icon: ContactIcon,
      minValue: 400,
      maxValue: 1000,
      minVariation: -15,
      maxVariation: 25,
    },
    {
      title: 'Conversions',
      icon: GraphsDiagramIcon,
      minValue: 1000,
      maxValue: 2000,
      minVariation: -10,
      maxVariation: 20,
    },
    {
      title: 'Revenue',
      icon: WalletIcon,
      minValue: 200000,
      maxValue: 500000,
      minVariation: -20,
      maxVariation: 30,
      formatter: (val: number) => formatCurrency(val, currency, locale),
    },
    {
      title: 'Orders',
      icon: ShoppingCartIcon,
      minValue: 100,
      maxValue: 300,
      minVariation: -5,
      maxVariation: 15,
    },
  ]

  return baseStats.map((stat, index) => {
    const value = randomInt(stat.minValue, stat.maxValue)
    const variation = randomInt(stat.minVariation, stat.maxVariation)

    return {
      title: stat.title,
      icon: stat.icon,
      value: value,
      formatValue: stat.formatter ? stat.formatter(value) : `${value}`,
      // The first element (Customers) has variation = null
      variation: index === 0 ? null : variation,
    }
  })
}

/**
 * Generates mock data for the chart.
 *
 * @param period - Aggregation period ('daily' | 'weekly' | 'monthly')
 * @param range - Date range
 * @param currency - Currency for amounts
 * @returns Array of data points for the chart
 */
export function generateMockChart(
  period: Period,
  range: Range,
  currency: string
): DataRecord[] {
  const dates = getDatesByPeriod(range, period)

  const min = 1_000
  const max = 10_000

  return dates.map((date) => ({
    date,
    amount: {
      [currency]: Math.floor(Math.random() * (max - min + 1)) + min,
    }
  }))
}

/**
 * Generates a mock list of recent deals.
 *
 * @returns Array of Sale objects, sorted by start date (newest on top)
 */
export function generateMockSales(currency: string): Sale[] {
  const sales: Sale[] = []
  const currentDate = new Date()

  const sampleTitles = [
    'Hoodie Pants Deal',
    'Hoodie Vest Deal',
    'Vest Pants Deal',
    'T-shirt Vest Deal',
    'Belt Pants Deal'
  ]

  for (let i = 0; i < 5; i++) {
    const hoursAgo = randomInt(2, 48)
    const date = new Date(currentDate.getTime() - hoursAgo * 3600000)
    const dateClose = new Date(currentDate.getTime() - (hoursAgo - 1) * 3600000)
    const stageSemanticId = randomFrom<'P' | 'S' | 'F'>(['P', 'S', 'F'])

    sales.push({
      id: 4600 - i,
      begindate: date.toISOString(),
      closedate: stageSemanticId === 'P' ? null : dateClose.toISOString(),
      stageSemanticId: stageSemanticId,
      status: stageSemanticId === 'P' ? 'processing' : stageSemanticId === 'S' ? 'success' : 'failed',
      title: randomFrom(sampleTitles),
      amount: randomInt(100, 1000),
      currencyId: currency
    })
  }

  // Sort by start date (newest to oldest)
  return sales.sort((a, b) => new Date(b.begindate).getTime() - new Date(a.begindate).getTime())
}
