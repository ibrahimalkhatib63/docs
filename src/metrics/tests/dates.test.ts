import { describe, it, expect, vi, afterEach } from 'vitest'
import { getDates } from '@/metrics/lib/dates'

describe('getDates', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return a DateRange with startDate, endDate, and friendlyRange', () => {
    const result = getDates()
    expect(result).toHaveProperty('startDate')
    expect(result).toHaveProperty('endDate')
    expect(result).toHaveProperty('friendlyRange')
  })

  it('should default to 30 days range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
    const result = getDates()
    const start = new Date(result.startDate)
    const end = new Date(result.endDate)
    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(30)
  })

  it('should accept a numeric string for the range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
    const result = getDates('7')
    const start = new Date(result.startDate)
    const end = new Date(result.endDate)
    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(7)
  })

  it('should accept a number for the range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
    const result = getDates(14)
    const start = new Date(result.startDate)
    const end = new Date(result.endDate)
    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(14)
  })

  it('should return valid ISO date strings', () => {
    const result = getDates()
    expect(() => new Date(result.startDate)).not.toThrow()
    expect(() => new Date(result.endDate)).not.toThrow()
    expect(new Date(result.startDate).toISOString()).toBe(result.startDate)
    expect(new Date(result.endDate).toISOString()).toBe(result.endDate)
  })

  it('should have endDate after startDate', () => {
    const result = getDates()
    expect(new Date(result.endDate).getTime()).toBeGreaterThan(new Date(result.startDate).getTime())
  })

  it('should include a human-readable friendly range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
    const result = getDates('30')
    expect(result.friendlyRange).toContain(' - ')
    expect(result.friendlyRange).toContain('2025')
  })

  it('should handle range of 0 (same day)', () => {
    const result = getDates('0')
    const start = new Date(result.startDate)
    const end = new Date(result.endDate)
    const diffMs = Math.abs(end.getTime() - start.getTime())
    expect(diffMs).toBeLessThan(1000)
  })
})
