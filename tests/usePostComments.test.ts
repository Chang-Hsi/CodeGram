import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { PostComment, PostCommentAdapter } from '~/types/comment'
import { usePostComments } from '~/composables/usePostComments'

function makeComment(id: string, patch: Partial<PostComment> = {}): PostComment {
  return {
    id,
    postId: 'post-1',
    parentId: null,
    rootId: null,
    author: { id: 'author-1', username: 'author', displayName: 'Author' },
    content: { json: null, html: '', text: id },
    images: [],
    createdAt: '剛剛',
    createdAtTimestamp: 1,
    liked: false,
    likeCount: 0,
    replyCount: 0,
    replies: [],
    ...patch,
  }
}

function adapter(overrides: Partial<PostCommentAdapter> = {}): PostCommentAdapter {
  return {
    fetchComments: vi.fn(async () => ({
      comments: [makeComment('root')],
      nextCursor: null,
      total: 1,
    })),
    fetchReplies: vi.fn(async () => ({ comments: [], nextCursor: null, total: 0 })),
    createComment: vi.fn(async input => makeComment('created', input)),
    updateComment: vi.fn(async input => makeComment(input.commentId, {
      content: input.content,
      images: input.images,
      isEdited: true,
    })),
    deleteComment: vi.fn(async () => ({ tombstoned: false })),
    toggleCommentLike: vi.fn(async input => ({
      liked: input.liked,
      likeCount: input.liked ? 1 : 0,
    })),
    ...overrides,
  }
}

function harness(mockAdapter: PostCommentAdapter, initialTotal = 0) {
  let comments: ReturnType<typeof usePostComments>
  const wrapper = mount(defineComponent({
    setup() {
      comments = usePostComments('post-1', mockAdapter, initialTotal)
      return () => null
    },
  }))
  return {
    wrapper,
    get comments() {
      return comments
    },
  }
}

describe('usePostComments', () => {
  it('stays lazy and caches the first successful load', async () => {
    const mockAdapter = adapter()
    const test = harness(mockAdapter, 8)
    expect(mockAdapter.fetchComments).not.toHaveBeenCalled()
    expect(test.comments.total.value).toBe(8)

    await test.comments.load()
    await test.comments.load()
    expect(mockAdapter.fetchComments).toHaveBeenCalledTimes(1)
    expect(test.comments.loaded.value).toBe(true)
    test.wrapper.unmount()
  })

  it('exposes a load failure and succeeds when retried', async () => {
    const fetchComments = vi.fn()
      .mockRejectedValueOnce(new Error('暫時無法載入'))
      .mockResolvedValueOnce({ comments: [makeComment('root')], nextCursor: null, total: 1 })
    const test = harness(adapter({ fetchComments }))

    await test.comments.load()
    expect(test.comments.error.value).toBe('暫時無法載入')
    expect(test.comments.loaded.value).toBe(false)
    await test.comments.load(true)
    expect(test.comments.loaded.value).toBe(true)
    expect(test.comments.error.value).toBe('')
    test.wrapper.unmount()
  })

  it('deduplicates pagination and inserts a reply in its actual root', async () => {
    const root = makeComment('root', { replyCount: 1 })
    const existingReply = makeComment('reply-1', {
      parentId: root.id,
      rootId: root.id,
    })
    const fetchComments = vi.fn(async () => ({
      comments: [root],
      nextCursor: '1',
      total: 2,
    }))
    const fetchReplies = vi.fn(async () => ({
      comments: [existingReply, existingReply],
      nextCursor: null,
      total: 1,
    }))
    const createComment = vi.fn(async input => makeComment('reply-2', input))
    const test = harness(adapter({ fetchComments, fetchReplies, createComment }))

    await test.comments.load()
    await test.comments.loadReplies(root.id)
    await test.comments.create({
      parentId: existingReply.id,
      rootId: root.id,
      replyTo: existingReply.author,
      author: existingReply.author,
      content: { json: null, html: '', text: 'nested reply' },
      images: [],
    })

    const loadedRoot = test.comments.comments.value[0]!
    expect(loadedRoot.replies?.map(item => item.id)).toEqual(['reply-1', 'reply-2'])
    expect(loadedRoot.replies?.[1]?.parentId).toBe('reply-1')
    expect(loadedRoot.replyCount).toBe(2)
    expect(test.comments.total.value).toBe(3)
    test.wrapper.unmount()
  })

  it('rolls an optimistic like back on failure and never goes below zero', async () => {
    const root = makeComment('root', { liked: true, likeCount: 0 })
    const toggleCommentLike = vi.fn(async () => {
      throw new Error('like failed')
    })
    const test = harness(adapter({
      fetchComments: vi.fn(async () => ({ comments: [root], nextCursor: null, total: 1 })),
      toggleCommentLike,
    }))
    await test.comments.load()

    await expect(test.comments.toggleLike(root.id)).rejects.toThrow('like failed')
    expect(test.comments.comments.value[0]?.liked).toBe(true)
    expect(test.comments.comments.value[0]?.likeCount).toBe(0)
    test.wrapper.unmount()
  })

  it('updates edits and preserves a parent as a tombstone when deleted', async () => {
    const image = {
      id: 'image-1',
      url: 'data:image/png;base64,aW1hZ2U=',
      alt: 'comment.png',
      name: 'comment.png',
      mimeType: 'image/png',
      size: 5,
    }
    const root = makeComment('root', { replyCount: 1, images: [image] })
    const updated = makeComment('root', {
      content: { json: null, html: '', text: 'edited' },
      images: [image],
      isEdited: true,
      replyCount: 1,
    })
    const test = harness(adapter({
      fetchComments: vi.fn(async () => ({ comments: [root], nextCursor: null, total: 2 })),
      updateComment: vi.fn(async () => updated),
      deleteComment: vi.fn(async () => ({ tombstoned: true })),
    }))
    await test.comments.load()
    await test.comments.update('root', updated.content, updated.images)
    expect(test.comments.comments.value[0]?.isEdited).toBe(true)
    expect(test.comments.comments.value[0]?.images).toEqual([image])

    await test.comments.remove('root')
    expect(test.comments.comments.value[0]?.isDeleted).toBe(true)
    expect(test.comments.comments.value[0]?.content.text).toBe('此留言已刪除')
    expect(test.comments.comments.value[0]?.images).toEqual([])
    expect(test.comments.total.value).toBe(1)
    test.wrapper.unmount()
  })
})
