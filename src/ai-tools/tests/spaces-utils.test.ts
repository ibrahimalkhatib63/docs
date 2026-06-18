import { describe, it, expect } from 'vitest'
import { parseSpaceUrl, convertSpaceToPrompt } from '@/ai-tools/lib/spaces-utils'
import type { SpaceData } from '@/ai-tools/lib/spaces-utils'

describe('parseSpaceUrl', () => {
  it('should parse a valid Copilot Space URL', () => {
    const url = 'https://api.github.com/orgs/my-org/copilot-spaces/123'
    const result = parseSpaceUrl(url)
    expect(result).toEqual({ org: 'my-org', id: '123' })
  })

  it('should parse URL with numeric org name', () => {
    const url = 'https://api.github.com/orgs/org42/copilot-spaces/999'
    const result = parseSpaceUrl(url)
    expect(result).toEqual({ org: 'org42', id: '999' })
  })

  it('should parse URL with hyphens in org name', () => {
    const url = 'https://api.github.com/orgs/my-awesome-org/copilot-spaces/456'
    const result = parseSpaceUrl(url)
    expect(result).toEqual({ org: 'my-awesome-org', id: '456' })
  })

  it('should throw for an invalid URL format', () => {
    expect(() => parseSpaceUrl('https://example.com/invalid')).toThrow(
      'Invalid Copilot Space URL format',
    )
  })

  it('should throw for a URL missing the space ID', () => {
    expect(() => parseSpaceUrl('https://api.github.com/orgs/my-org/copilot-spaces/')).toThrow(
      'Invalid Copilot Space URL format',
    )
  })

  it('should throw for an empty string', () => {
    expect(() => parseSpaceUrl('')).toThrow('Invalid Copilot Space URL format')
  })
})

describe('convertSpaceToPrompt', () => {
  const baseSpace: SpaceData = {
    id: 1,
    number: 42,
    name: 'Test Space',
    description: 'A test space',
    general_instructions: 'Follow these instructions.',
    resources_attributes: [],
    html_url: 'https://github.com/orgs/my-org/copilot-spaces/42',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  }

  it('should include header comments with space metadata', () => {
    const result = convertSpaceToPrompt(baseSpace)
    expect(result).toContain('<!-- Generated from Copilot Space: Test Space -->')
    expect(result).toContain('<!-- Space ID: 42')
    expect(result).toContain(`<!-- Space URL: ${baseSpace.html_url} -->`)
  })

  it('should include general instructions', () => {
    const result = convertSpaceToPrompt(baseSpace)
    expect(result).toContain('Follow these instructions.')
  })

  it('should handle empty general instructions', () => {
    const space: SpaceData = { ...baseSpace, general_instructions: '' }
    const result = convertSpaceToPrompt(space)
    expect(result).not.toContain('Follow these instructions.')
  })

  it('should include free_text resources as context sections', () => {
    const space: SpaceData = {
      ...baseSpace,
      resources_attributes: [
        {
          id: 1,
          resource_type: 'free_text',
          copilot_chat_attachment_id: null,
          metadata: {
            name: 'Style Guide',
            text: 'Use active voice.',
          },
        },
      ],
    }
    const result = convertSpaceToPrompt(space)
    expect(result).toContain('# Context: Style Guide')
    expect(result).toContain('Use active voice.')
  })

  it('should skip non-free_text resources', () => {
    const space: SpaceData = {
      ...baseSpace,
      resources_attributes: [
        {
          id: 1,
          resource_type: 'repository',
          copilot_chat_attachment_id: null,
          metadata: {
            name: 'My Repo',
            text: 'Repo description',
          },
        },
      ],
    }
    const result = convertSpaceToPrompt(space)
    expect(result).not.toContain('# Context: My Repo')
  })

  it('should handle multiple free_text resources', () => {
    const space: SpaceData = {
      ...baseSpace,
      resources_attributes: [
        {
          id: 1,
          resource_type: 'free_text',
          copilot_chat_attachment_id: null,
          metadata: { name: 'Resource A', text: 'Content A' },
        },
        {
          id: 2,
          resource_type: 'free_text',
          copilot_chat_attachment_id: null,
          metadata: { name: 'Resource B', text: 'Content B' },
        },
      ],
    }
    const result = convertSpaceToPrompt(space)
    expect(result).toContain('# Context: Resource A')
    expect(result).toContain('Content A')
    expect(result).toContain('# Context: Resource B')
    expect(result).toContain('Content B')
  })

  it('should handle empty resources_attributes', () => {
    const result = convertSpaceToPrompt(baseSpace)
    expect(result).not.toContain('# Context:')
  })
})
