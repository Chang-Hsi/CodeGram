import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addNormalizedTag,
  extractCodeSnippets,
  getClipboardImageFiles,
  isComposerContentEmpty,
  isComposerSubmitShortcut,
  normalizeTag,
  parseDraft,
  POST_COMPOSER_LIMITS,
  serializeDraft,
  validateImageFiles,
} from '~/utils/postComposer'

describe('post composer utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('prevents blank posts but allows image-only posts', () => {
    expect(isComposerContentEmpty('  \n', 0)).toBe(true)
    expect(isComposerContentEmpty('hello', 0)).toBe(false)
    expect(isComposerContentEmpty('', 1)).toBe(false)
  })

  it('submits on Ctrl/Cmd + Enter but not during IME or with Shift', () => {
    const event = {
      key: 'Enter',
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      isComposing: false,
    }
    expect(isComposerSubmitShortcut(event)).toBe(true)
    expect(isComposerSubmitShortcut({ ...event, ctrlKey: false, metaKey: true })).toBe(true)
    expect(isComposerSubmitShortcut({ ...event, shiftKey: true })).toBe(false)
    expect(isComposerSubmitShortcut({ ...event, isComposing: true })).toBe(false)
    expect(isComposerSubmitShortcut(event, true)).toBe(false)
  })

  it('normalizes, deduplicates and limits tags', () => {
    expect(normalizeTag('  ##Vue 3!! ')).toBe('Vue-3')
    expect(addNormalizedTag(['Nuxt'], 'nuxt')).toEqual(['Nuxt'])

    const full = ['one', 'two', 'three', 'four', 'five']
    expect(addNormalizedTag(full, 'six')).toBe(full)
    expect(full).toHaveLength(POST_COMPOSER_LIMITS.maxTags)
  })

  it('rejects unsupported and oversized images', () => {
    const text = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    const oversized = new File(
      [new Uint8Array(POST_COMPOSER_LIMITS.maxImageBytes + 1)],
      'large.png',
      { type: 'image/png' },
    )
    const valid = new File(['image'], 'photo.png', { type: 'image/png' })
    const result = validateImageFiles([text, oversized, valid])

    expect(result.valid).toEqual([valid])
    expect(result.errors).toHaveLength(2)
  })

  it('accepts any number of valid images', () => {
    const files = Array.from({ length: 12 }, (_, index) => (
      new File(['image'], `${index}.png`, { type: 'image/png' })
    ))
    const result = validateImageFiles(files)

    expect(result.valid).toHaveLength(12)
    expect(result.errors).toEqual([])
  })

  it('deduplicates a copied image exposed through items and files', () => {
    const copied = new File(['image'], 'copied.png', { type: 'image/png' })
    const duplicate = new File(['image'], 'different-name.png', {
      type: 'image/png',
      lastModified: copied.lastModified + 1,
    })
    const text = new File(['text'], 'note.txt', { type: 'text/plain' })

    expect(getClipboardImageFiles({
      items: [
        { kind: 'file', type: copied.type, getAsFile: () => copied },
        { kind: 'string', type: 'text/plain', getAsFile: () => text },
      ],
      files: [duplicate, text],
    })).toEqual([copied])
  })

  it('uses clipboard files when the browser does not expose image items', () => {
    const fallback = new File(['image'], 'fallback.webp', { type: 'image/webp' })

    expect(getClipboardImageFiles({
      items: [],
      files: [fallback],
    })).toEqual([fallback])
  })

  it('extracts structured code blocks without altering code', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'typescript' },
          content: [{ type: 'text', text: 'const html = "<div>";' }],
        },
      ],
    }

    expect(extractCodeSnippets(json)).toEqual([
      {
        id: 'code-1',
        language: 'typescript',
        code: 'const html = "<div>";',
      },
    ])
  })

  it('serializes and safely restores draft content', () => {
    vi.setSystemTime(new Date('2026-07-31T00:00:00.000Z'))
    const draft = serializeDraft(
      { type: 'doc', content: [{ type: 'paragraph' }] },
      ['Nuxt'],
      true,
    )

    expect(parseDraft(JSON.stringify(draft))).toEqual(draft)
    expect(parseDraft('{bad json')).toBeNull()
    expect(parseDraft(JSON.stringify({ version: 2, tags: [] }))).toBeNull()
  })
})
