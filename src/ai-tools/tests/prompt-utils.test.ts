import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { getAvailableEditorTypes, getRefinementDescriptions } from '@/ai-tools/lib/prompt-utils'

describe('getAvailableEditorTypes', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync('/tmp/prompt-utils-test-')
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should return markdown file names without extension', () => {
    fs.writeFileSync(path.join(tmpDir, 'intro.md'), '# Intro prompt')
    fs.writeFileSync(path.join(tmpDir, 'summary.md'), '# Summary prompt')
    const result = getAvailableEditorTypes(tmpDir)
    expect(result).toContain('intro')
    expect(result).toContain('summary')
  })

  it('should ignore non-markdown files', () => {
    fs.writeFileSync(path.join(tmpDir, 'template.yml'), 'model: gpt-4o')
    fs.writeFileSync(path.join(tmpDir, 'intro.md'), '# Intro')
    const result = getAvailableEditorTypes(tmpDir)
    expect(result).toEqual(['intro'])
  })

  it('should return empty array for empty directory', () => {
    const result = getAvailableEditorTypes(tmpDir)
    expect(result).toEqual([])
  })

  it('should return empty array for non-existent directory', () => {
    const result = getAvailableEditorTypes('/nonexistent/path')
    expect(result).toEqual([])
  })
})

describe('getRefinementDescriptions', () => {
  it('should join editor types with commas', () => {
    const result = getRefinementDescriptions(['intro', 'summary', 'full'])
    expect(result).toBe('intro, summary, full')
  })

  it('should return single type as-is', () => {
    const result = getRefinementDescriptions(['intro'])
    expect(result).toBe('intro')
  })

  it('should return empty string for empty array', () => {
    const result = getRefinementDescriptions([])
    expect(result).toBe('')
  })
})
