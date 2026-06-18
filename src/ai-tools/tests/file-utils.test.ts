import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { findMarkdownFiles } from '@/ai-tools/lib/file-utils'

describe('findMarkdownFiles', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync('/tmp/file-utils-test-')
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should find markdown files in a directory', () => {
    fs.writeFileSync(path.join(tmpDir, 'index.md'), '# Hello')
    fs.writeFileSync(path.join(tmpDir, 'guide.md'), '# Guide')
    const result = findMarkdownFiles(tmpDir, tmpDir)
    expect(result).toHaveLength(2)
    expect(result.some((f) => f.endsWith('index.md'))).toBe(true)
    expect(result.some((f) => f.endsWith('guide.md'))).toBe(true)
  })

  it('should find markdown files recursively', () => {
    const subDir = path.join(tmpDir, 'sub')
    fs.mkdirSync(subDir)
    fs.writeFileSync(path.join(tmpDir, 'top.md'), '# Top')
    fs.writeFileSync(path.join(subDir, 'nested.md'), '# Nested')
    const result = findMarkdownFiles(tmpDir, tmpDir)
    expect(result).toHaveLength(2)
    expect(result.some((f) => f.endsWith('top.md'))).toBe(true)
    expect(result.some((f) => f.endsWith('nested.md'))).toBe(true)
  })

  it('should ignore non-markdown files', () => {
    fs.writeFileSync(path.join(tmpDir, 'readme.md'), '# Readme')
    fs.writeFileSync(path.join(tmpDir, 'data.json'), '{}')
    fs.writeFileSync(path.join(tmpDir, 'script.ts'), 'export {}')
    const result = findMarkdownFiles(tmpDir, tmpDir)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatch(/readme\.md$/)
  })

  it('should return empty array for empty directory', () => {
    const result = findMarkdownFiles(tmpDir, tmpDir)
    expect(result).toEqual([])
  })

  it('should return empty array for non-existent directory', () => {
    const result = findMarkdownFiles('/nonexistent/dir', '/nonexistent')
    expect(result).toEqual([])
  })

  it('should respect max depth', () => {
    const deep = path.join(tmpDir, 'a', 'b', 'c')
    fs.mkdirSync(deep, { recursive: true })
    fs.writeFileSync(path.join(tmpDir, 'top.md'), '# Top')
    fs.writeFileSync(path.join(deep, 'deep.md'), '# Deep')
    const result = findMarkdownFiles(tmpDir, tmpDir, 0, 1)
    expect(result.some((f) => f.endsWith('top.md'))).toBe(true)
    expect(result.some((f) => f.endsWith('deep.md'))).toBe(false)
  })

  it('should prevent escaping root directory', () => {
    const subDir = path.join(tmpDir, 'sub')
    fs.mkdirSync(subDir)
    fs.writeFileSync(path.join(tmpDir, 'secret.md'), '# Secret')
    const result = findMarkdownFiles(subDir, subDir)
    expect(result.every((f) => f.startsWith(subDir))).toBe(true)
  })

  it('should handle symlink loops gracefully', () => {
    const subDir = path.join(tmpDir, 'sub')
    fs.mkdirSync(subDir)
    fs.writeFileSync(path.join(subDir, 'file.md'), '# File')
    fs.symlinkSync(tmpDir, path.join(subDir, 'loop'))
    const result = findMarkdownFiles(tmpDir, tmpDir)
    expect(result.some((f) => f.endsWith('file.md'))).toBe(true)
  })
})
