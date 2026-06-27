import { describe, it, expect } from 'vitest'
import {
  stripTags,
  formatCurrency,
  formatDateByPeriod,
  formatDateRange,
  formatDateTimeShort
} from './formatters'

describe('stripTags', () => {
  it('removes HTML tags and decodes entities', () => {
    expect(stripTags('<b>566&nbsp;168.00</b> &euro;')).toBe('566 168.00 €')
  })

  it('returns an empty string for empty input', () => {
    expect(stripTags('')).toBe('')
  })

  it('replaces non-breaking spaces with regular spaces and trims', () => {
    expect(stripTags('&nbsp;hello&nbsp;')).toBe('hello')
  })
})

describe('formatCurrency', () => {
  it('formats with the currency symbol and no fraction digits', () => {
    const out = formatCurrency(12345.67, 'USD', 'en-US')
    expect(out).toContain('$')
    expect(out).toContain('12,346')
    expect(out).not.toContain('.67')
  })

  it('honours the requested locale', () => {
    const ru = formatCurrency(1000, 'RUB', 'ru-RU')
    expect(ru).toContain('₽')
  })

  it('formats zero', () => {
    expect(formatCurrency(0, 'USD', 'en-US')).toContain('0')
  })
})

describe('formatDateByPeriod', () => {
  const date = new Date('2025-03-15T00:00:00')

  it('uses day + month for the daily period', () => {
    const out = formatDateByPeriod(date, 'daily', 'en-US')
    expect(out).toMatch(/Mar/)
    expect(out).toMatch(/15/)
  })

  it('uses month + year for the monthly period', () => {
    const out = formatDateByPeriod(date, 'monthly', 'en-US')
    expect(out).toMatch(/Mar/)
    expect(out).toMatch(/2025/)
  })
})

describe('formatDateRange', () => {
  it('renders a short date for the given locale', () => {
    const out = formatDateRange(new Date('2025-03-15T00:00:00'), 'en-US')
    expect(out).toMatch(/\b3\/15\/(25|2025)\b/)
  })
})

describe('formatDateTimeShort', () => {
  it('includes day, month and 24h time', () => {
    const out = formatDateTimeShort(new Date('2025-03-15T14:30:00'), 'en-US')
    expect(out).toMatch(/Mar/)
    expect(out).toMatch(/14:30/)
  })
})
