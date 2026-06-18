import { describe, it, expect } from 'vitest'
import {
  isGhesReleaseDeprecated,
  isFeatureDeprecated,
  isAllVersions,
  isInAllGhes,
} from '@/ghes-releases/scripts/version-utils'
import type { FrontmatterVersions } from '@/types'

describe('isGhesReleaseDeprecated', () => {
  it('should return true when lowest supported version is greater than semver range', () => {
    expect(isGhesReleaseDeprecated('3.10', '<=3.9')).toBe(true)
  })

  it('should return false when lowest supported version is within semver range', () => {
    expect(isGhesReleaseDeprecated('3.8', '>=3.5')).toBe(false)
  })

  it('should return false when lowest supported version equals upper bound', () => {
    expect(isGhesReleaseDeprecated('3.9', '<=3.9')).toBe(false)
  })

  it('should return false for wildcard ranges', () => {
    expect(isGhesReleaseDeprecated('3.10', '*')).toBe(false)
  })

  it('should return false for invalid version strings', () => {
    expect(isGhesReleaseDeprecated('invalid', '>=3.5')).toBe(false)
  })
})

describe('isInAllGhes', () => {
  it('should return true for wildcard', () => {
    expect(isInAllGhes('*')).toBe(true)
  })

  it('should return false for ranges with upper bounds', () => {
    expect(isInAllGhes('>=3.5 <=3.9')).toBe(false)
  })

  it('should return false for ranges with only less-than operators', () => {
    expect(isInAllGhes('<3.9')).toBe(false)
  })

  it('should return false for exact version without operator', () => {
    expect(isInAllGhes('3.9')).toBe(false)
  })
})

describe('isFeatureDeprecated', () => {
  it('should return true when feature has only deprecated GHES releases', () => {
    const versions: FrontmatterVersions = {
      ghes: '<=2.0',
    }
    expect(isFeatureDeprecated(versions)).toBe(true)
  })

  it('should return false when feature includes fpt', () => {
    const versions: FrontmatterVersions = {
      fpt: '*',
      ghes: '<=2.0',
    }
    expect(isFeatureDeprecated(versions)).toBe(false)
  })

  it('should return false when feature includes ghec', () => {
    const versions: FrontmatterVersions = {
      ghec: '*',
      ghes: '<=2.0',
    }
    expect(isFeatureDeprecated(versions)).toBe(false)
  })

  it('should return false when ghes is not set', () => {
    const versions: FrontmatterVersions = {
      fpt: '*',
    }
    expect(isFeatureDeprecated(versions)).toBe(false)
  })
})

describe('isAllVersions', () => {
  it('should return false when fpt is missing', () => {
    const versions: FrontmatterVersions = {
      ghec: '*',
      ghes: '*',
    }
    expect(isAllVersions(versions)).toBe(false)
  })

  it('should return false when ghec is missing', () => {
    const versions: FrontmatterVersions = {
      fpt: '*',
      ghes: '*',
    }
    expect(isAllVersions(versions)).toBe(false)
  })

  it('should return false when ghes is missing', () => {
    const versions: FrontmatterVersions = {
      fpt: '*',
      ghec: '*',
    }
    expect(isAllVersions(versions)).toBe(false)
  })

  it('should return false when ghec is not wildcard', () => {
    const versions: FrontmatterVersions = {
      fpt: '*',
      ghec: '>=3.5',
      ghes: '*',
    }
    expect(isAllVersions(versions)).toBe(false)
  })

  it('should return false for empty versions', () => {
    const versions: FrontmatterVersions = {}
    expect(isAllVersions(versions)).toBe(false)
  })
})
