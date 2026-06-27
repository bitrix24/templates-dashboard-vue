import { describe, it, expect } from 'vitest'
import type { Sale } from '../../types'
import {
  getDatesByPeriod,
  calculateVariation,
  groupSalesByDate,
  buildChartData,
  getLatestSales
} from './helpers'

function makeSale(overrides: Partial<Sale> = {}): Sale {
  return {
    id: 1,
    begindate: '2025-03-01',
    closedate: '2025-03-15',
    status: 'success',
    title: 'Deal',
    amount: 100,
    currencyId: 'USD',
    stageSemanticId: 'S',
    ...overrides
  }
}

describe('getDatesByPeriod', () => {
  const range = { start: new Date('2025-03-01T00:00:00'), end: new Date('2025-03-31T00:00:00') }

  it('returns one date per day for the daily period', () => {
    expect(getDatesByPeriod(range, 'daily')).toHaveLength(31)
  })

  it('returns fewer points for the monthly period', () => {
    expect(getDatesByPeriod(range, 'monthly').length).toBeLessThan(31)
  })
})

describe('calculateVariation', () => {
  it('computes positive growth', () => {
    expect(calculateVariation(120, 100)).toBe(20)
  })

  it('computes negative change', () => {
    expect(calculateVariation(80, 100)).toBe(-20)
  })

  it('returns null when previous is 0 (avoids division by zero)', () => {
    expect(calculateVariation(100, 0)).toBeNull()
  })

  it('rounds to the nearest integer', () => {
    expect(calculateVariation(101, 99)).toBe(2)
  })
})

describe('groupSalesByDate', () => {
  it('assigns each sale to the largest timestamp <= its close date', () => {
    const t1 = new Date('2025-03-01').getTime()
    const t2 = new Date('2025-03-08').getTime()
    const timestamps = [t1, t2]
    const sales = [
      makeSale({ id: 1, closedate: '2025-03-03' }), // -> t1
      makeSale({ id: 2, closedate: '2025-03-09' }) // -> t2
    ]
    const groups = groupSalesByDate(sales, timestamps)
    expect(groups[t1]!.map(s => s.id)).toEqual([1])
    expect(groups[t2]!.map(s => s.id)).toEqual([2])
  })

  it('skips sales without a close date', () => {
    const t1 = new Date('2025-03-01').getTime()
    const groups = groupSalesByDate([makeSale({ closedate: null })], [t1])
    expect(groups[t1]).toEqual([])
  })

  it('initializes an empty array for every timestamp', () => {
    const t1 = new Date('2025-03-01').getTime()
    expect(groupSalesByDate([], [t1])).toEqual({ [t1]: [] })
  })
})

describe('buildChartData', () => {
  it('keeps only successful sales and sums amounts by currency', () => {
    const dates = [new Date('2025-03-01')]
    const sales = [
      makeSale({ id: 1, closedate: '2025-03-05', amount: 100, currencyId: 'USD', stageSemanticId: 'S' }),
      makeSale({ id: 2, closedate: '2025-03-06', amount: 50, currencyId: 'USD', stageSemanticId: 'S' }),
      makeSale({ id: 3, closedate: '2025-03-07', amount: 999, currencyId: 'USD', stageSemanticId: 'F' })
    ]
    const data = buildChartData(sales, dates)
    expect(data).toHaveLength(1)
    expect(data[0]!.amount.USD).toBe(150)
  })

  it('returns points sorted ascending by date', () => {
    const dates = [new Date('2025-03-08'), new Date('2025-03-01')]
    const data = buildChartData([], dates)
    expect(data[0]!.date.getTime()).toBeLessThan(data[1]!.date.getTime())
  })
})

describe('getLatestSales', () => {
  const sales = [
    makeSale({ id: 1, closedate: '2025-03-01' }),
    makeSale({ id: 2, closedate: '2025-03-10' }),
    makeSale({ id: 3, closedate: '2025-03-05' })
  ]

  it('returns the most recent sales first', () => {
    expect(getLatestSales(sales, 2).map(s => s.id)).toEqual([2, 3])
  })

  it('does not mutate the input array', () => {
    const copy = [...sales]
    getLatestSales(sales, 2)
    expect(sales).toEqual(copy)
  })

  it('defaults to 5 items', () => {
    expect(getLatestSales(sales)).toHaveLength(3)
  })
})
