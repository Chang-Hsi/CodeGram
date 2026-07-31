import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PostComposerPayload } from '~/types/postComposer'
import { usePostComposer } from '~/composables/usePostComposer'

function createHarness(
  submitPost?: (payload: PostComposerPayload) => Promise<void> | void,
) {
  let composer: ReturnType<typeof usePostComposer>
  const wrapper = mount(defineComponent({
    setup() {
      composer = usePostComposer(() => 'composer-test-draft', submitPost)
      return () => null
    },
  }))
  return {
    wrapper,
    get composer() {
      return composer
    },
  }
}

describe('usePostComposer', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('crypto', { randomUUID: () => 'image-id' })
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:preview'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('publishes text once and clears after success', async () => {
    const handler = vi.fn()
    const harness = createHarness(handler)
    harness.composer.updateContent({
      json: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Keep me' }],
          },
        ],
      },
      html: '<p>Hello</p>',
      text: 'Hello',
    })

    const payload = await harness.composer.submit()
    expect(handler).toHaveBeenCalledTimes(1)
    expect(payload?.content.text).toBe('Hello')
    expect(harness.composer.content.value.text).toBe('')
    expect(localStorage.getItem('composer-test-draft')).toBeNull()
    harness.wrapper.unmount()
  })

  it('keeps content and draft after a failed publish', async () => {
    const harness = createHarness(async () => {
      throw new Error('模擬發布失敗')
    })
    harness.composer.updateContent({
      json: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Keep me' }],
          },
        ],
      },
      html: '<p>Keep me</p>',
      text: 'Keep me',
    })

    expect(await harness.composer.submit()).toBeNull()
    expect(harness.composer.content.value.text).toBe('Keep me')
    expect(harness.composer.errorMessage.value).toBe('模擬發布失敗')
    expect(localStorage.getItem('composer-test-draft')).toContain('Keep me')
    harness.wrapper.unmount()
  })

  it('blocks duplicate submissions while publishing', async () => {
    let release: (() => void) | undefined
    const handler = vi.fn(() => new Promise<void>((resolve) => {
      release = resolve
    }))
    const harness = createHarness(handler)
    harness.composer.updateContent({
      json: null,
      html: '',
      text: 'Only once',
    })

    const first = harness.composer.submit()
    const second = await harness.composer.submit()
    expect(second).toBeNull()
    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1))
    release?.()
    await first
    harness.wrapper.unmount()
  })

  it('removes one image and revokes its object URL', async () => {
    const harness = createHarness()
    const image = new File(['image'], 'photo.png', { type: 'image/png' })
    harness.composer.addImages([image])
    await nextTick()

    expect(harness.composer.images.value).toHaveLength(1)
    harness.composer.removeImage('image-id')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
    expect(harness.composer.images.value).toHaveLength(0)
    harness.wrapper.unmount()
  })

  it('restores text and tags while warning that image files cannot persist', async () => {
    localStorage.setItem('composer-test-draft', JSON.stringify({
      version: 1,
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Draft' }] }],
      },
      tags: ['Nuxt'],
      hadImages: true,
      savedAt: new Date().toISOString(),
    }))

    const harness = createHarness()
    await nextTick()
    expect(harness.composer.initialContent.value).not.toBeNull()
    expect(harness.composer.tags.value).toEqual(['Nuxt'])
    expect(harness.composer.draftNotice.value).toContain('圖片需要重新選擇')
    harness.wrapper.unmount()
  })
})
