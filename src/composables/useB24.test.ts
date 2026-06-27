import { describe, it, expect } from 'vitest'
import { useB24 } from './useB24'

describe('useB24 / getFrame()', () => {
  it('throws when the B24 frame is not initialized', () => {
    const { getFrame } = useB24()
    expect(() => getFrame()).toThrow()
  })

  it('throws an error carrying the B24_NOT_INITIALIZED code', () => {
    const { getFrame } = useB24()
    try {
      getFrame()
      expect.unreachable('getFrame() must throw when no frame is set')
    } catch (error) {
      const code = (error as { code?: string }).code
      expect(code).toBe('B24_NOT_INITIALIZED')
    }
  })
})
