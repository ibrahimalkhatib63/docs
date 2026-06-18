import { describe, it, expect } from 'vitest'
import { allPlatforms } from '@/tools/lib/all-platforms'
import type { Platform } from '@/tools/lib/all-platforms'

describe('allPlatforms', () => {
  it('should contain exactly three platforms', () => {
    expect(allPlatforms).toHaveLength(3)
  })

  it('should include mac, windows, and linux', () => {
    expect(allPlatforms).toContain('mac')
    expect(allPlatforms).toContain('windows')
    expect(allPlatforms).toContain('linux')
  })

  it('should have no duplicate entries', () => {
    const unique = new Set(allPlatforms)
    expect(unique.size).toBe(allPlatforms.length)
  })

  it('should have all entries as valid Platform type values', () => {
    const validPlatforms: Platform[] = ['mac', 'windows', 'linux']
    for (const platform of allPlatforms) {
      expect(validPlatforms).toContain(platform)
    }
  })
})
