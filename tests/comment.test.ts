import { describe, expect, it } from 'vitest'
import type { PostComment } from '~/types/comment'
import { countVisibleComments, dedupeComments, findComment, sortComments } from '~/utils/comment'

function comment(
  id: string,
  timestamp: number,
  likeCount = 0,
  replyCount = 0,
): PostComment {
  return {
    id,
    postId: 'post-1',
    parentId: null,
    rootId: null,
    author: { id: `author-${id}`, username: id, displayName: id },
    content: { json: null, html: '', text: id },
    images: [],
    createdAt: '剛剛',
    createdAtTimestamp: timestamp,
    liked: false,
    likeCount,
    replyCount,
    replies: [],
  }
}

describe('comment utilities', () => {
  it('sorts newest, oldest and relevant without mutating the source', () => {
    const low = comment('low', 30, 0, 0)
    const liked = comment('liked', 10, 5, 0)
    const discussed = comment('discussed', 20, 0, 4)
    const source = [low, liked, discussed]

    expect(sortComments(source, 'newest').map(item => item.id))
      .toEqual(['low', 'discussed', 'liked'])
    expect(sortComments(source, 'oldest').map(item => item.id))
      .toEqual(['liked', 'discussed', 'low'])
    expect(sortComments(source, 'relevant').map(item => item.id))
      .toEqual(['discussed', 'liked', 'low'])
    expect(source.map(item => item.id)).toEqual(['low', 'liked', 'discussed'])
  })

  it('deduplicates by stable id and finds one-level rendered replies', () => {
    const root = comment('root', 1)
    const reply = {
      ...comment('reply', 2),
      parentId: root.id,
      rootId: root.id,
    }
    root.replies = [reply]
    root.replyCount = 1

    expect(dedupeComments([root, root])).toEqual([root])
    expect(findComment([root], 'reply')).toBe(reply)
    expect(countVisibleComments([root])).toBe(2)
  })
})
