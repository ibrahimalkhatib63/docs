import { describe, it, expect } from 'vitest'
import { allTools } from '@/tools/lib/all-tools'
import type { ToolsMapping } from '@/tools/lib/all-tools'

describe('allTools', () => {
  it('should be a non-empty object', () => {
    expect(Object.keys(allTools).length).toBeGreaterThan(0)
  })

  it('should have string values for all keys', () => {
    for (const [, value] of Object.entries(allTools)) {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('should contain expected core tools', () => {
    expect(allTools).toHaveProperty('cli')
    expect(allTools).toHaveProperty('webui')
    expect(allTools).toHaveProperty('desktop')
    expect(allTools).toHaveProperty('curl')
    expect(allTools).toHaveProperty('api')
  })

  it('should contain expected IDE tools', () => {
    expect(allTools).toHaveProperty('vscode')
    expect(allTools).toHaveProperty('jetbrains')
    expect(allTools).toHaveProperty('visualstudio')
    expect(allTools).toHaveProperty('eclipse')
    expect(allTools).toHaveProperty('xcode')
  })

  it('should have unique display names', () => {
    const values = Object.values(allTools)
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })

  it('should have lowercase keys', () => {
    for (const key of Object.keys(allTools)) {
      expect(key).toBe(key.toLowerCase())
    }
  })

  it('should satisfy ToolsMapping type with string keys and string values', () => {
    const mapping: ToolsMapping = allTools
    expect(typeof mapping).toBe('object')
  })
})
