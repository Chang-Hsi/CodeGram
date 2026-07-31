import { isReactive, reactive } from 'vue'
import { describe, expect, it } from 'vitest'
import { mockPostCommentAdapter } from '~/adapters/mockPostCommentAdapter'

describe('mockPostCommentAdapter', () => {
  it('starts a new post without injecting fake comments', async () => {
    const postId = `empty-${crypto.randomUUID()}`
    const result = await mockPostCommentAdapter.fetchComments({
      postId,
      cursor: null,
      limit: 3,
      sort: 'relevant',
    })

    expect(result.comments).toEqual([])
    expect(result.total).toBe(0)
    expect(result.nextCursor).toBeNull()
  })

  it('accepts reactive Vue input without structuredClone errors', async () => {
    const postId = `reactive-${crypto.randomUUID()}`
    const author = reactive({
      id: 'current-user',
      username: 'current',
      displayName: 'Current User',
    })
    const content = reactive({
      json: {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: 'Reactive comment' }],
        }],
      },
      html: '<p>Reactive comment</p>',
      text: 'Reactive comment',
    })
    const images = reactive([{
      id: 'image-1',
      url: 'data:image/png;base64,aW1hZ2U=',
      alt: 'comment.png',
      name: 'comment.png',
      mimeType: 'image/png',
      size: 5,
    }])

    const created = await mockPostCommentAdapter.createComment({
      postId,
      parentId: null,
      rootId: null,
      author,
      content,
      images,
    })

    expect(created.content.text).toBe('Reactive comment')
    expect(created.author.id).toBe('current-user')
    expect(created.images).toEqual(images)
    expect(isReactive(created)).toBe(false)
    expect(isReactive(created.content)).toBe(false)
    expect(isReactive(created.images)).toBe(false)
  })
})
