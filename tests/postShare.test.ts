import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProfilePost } from '~/types/post'
import type { PostShareAdapter } from '~/types/postShare'
import { usePostShare } from '~/composables/usePostShare'
import { createSharedPostReference, getPostUrl } from '~/utils/postShare'

const author = { id: 'user-1', username: 'user', displayName: 'User' }
const original: ProfilePost = {
  id: 'post/1',
  author,
  content: 'Original content',
  createdAt: '剛剛',
  tags: ['Nuxt'],
}

function harness(adapter: PostShareAdapter, post = original) {
  let share: ReturnType<typeof usePostShare>
  const wrapper = mount(defineComponent({
    setup() {
      share = usePostShare(() => post, () => author, adapter)
      return () => null
    },
  }))
  return {
    wrapper,
    get share() {
      return share
    },
  }
}

describe('post sharing', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {})
  })

  it('creates a stable encoded URL and flattens re-shares to the original', () => {
    expect(getPostUrl(original.id, 'https://codegram.test'))
      .toBe('https://codegram.test/posts/post%2F1')

    const reshared: ProfilePost = {
      ...original,
      id: 'share-1',
      type: 'share',
      content: 'my quote',
      sharedPost: createSharedPostReference(original),
    }
    expect(createSharedPostReference(reshared).postId).toBe(original.id)
    expect(createSharedPostReference(reshared).contentPreview).toBe('Original content')
  })

  it('closes only after a successful direct share and blocks duplicate submits', async () => {
    let release: ((post: ProfilePost) => void) | undefined
    const createShare = vi.fn(() => new Promise<ProfilePost>(resolve => {
      release = resolve
    }))
    const test = harness({ createShare })
    test.share.open.value = true

    const first = test.share.createShare()
    expect(await test.share.createShare()).toBeNull()
    expect(test.share.open.value).toBe(true)
    release?.({ ...original, id: 'shared' })
    expect((await first)?.id).toBe('shared')
    expect(test.share.open.value).toBe(false)
    expect(createShare).toHaveBeenCalledTimes(1)
    test.wrapper.unmount()
  })

  it('keeps the dialog open and exposes an adapter failure', async () => {
    const test = harness({
      createShare: vi.fn(async () => {
        throw new Error('發布失敗')
      }),
    })
    test.share.open.value = true
    expect(await test.share.createShare()).toBeNull()
    expect(test.share.open.value).toBe(true)
    expect(test.share.error.value).toBe('發布失敗')
    test.wrapper.unmount()
  })

  it('copies the post URL and treats native-share cancellation as non-error', async () => {
    const writeText = vi.fn(async () => undefined)
    const nativeShare = vi.fn(async () => {
      throw new DOMException('cancelled', 'AbortError')
    })
    vi.stubGlobal('navigator', {
      clipboard: { writeText },
      share: nativeShare,
    })
    const test = harness({ createShare: vi.fn() })

    expect(await test.share.copyLink('https://codegram.test')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('https://codegram.test/posts/post%2F1')
    expect(await test.share.nativeShare('https://codegram.test')).toBe(false)
    expect(test.share.error.value).toBe('')
    test.wrapper.unmount()
  })
})
