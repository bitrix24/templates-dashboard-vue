import { describe, it, expect } from 'vitest'
import { randomInt, randomFrom, sleepAction } from './index'

describe('randomInt', () => {
  it('stays within the inclusive [min, max] range', () => {
    for (let i = 0; i < 1000; i++) {
      const n = randomInt(3, 7)
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(7)
      expect(Number.isInteger(n)).toBe(true)
    }
  })

  it('returns the only possible value when min === max', () => {
    expect(randomInt(5, 5)).toBe(5)
  })
})

describe('randomFrom', () => {
  it('returns an element of the source array', () => {
    const arr = ['a', 'b', 'c']
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(randomFrom(arr))
    }
  })

  it('returns the single element for a one-item array', () => {
    expect(randomFrom([42])).toBe(42)
  })
})

describe('sleepAction', () => {
  it('resolves to undefined after the timeout', async () => {
    await expect(sleepAction(1)).resolves.toBeUndefined()
  })
})
