import type {
  CommentPageResult,
  CreateCommentInput,
  PostComment,
  PostCommentAdapter,
} from '~/types/comment'
import type { PostComposerContent } from '~/types/postComposer'
import { sortComments } from '~/utils/comment'

const commentsByPost = new Map<string, PostComment[]>()

const wait = () => new Promise(resolve => setTimeout(resolve, 40))

function cloneComment(comment: PostComment): PostComment {
  return {
    ...comment,
    author: { ...comment.author },
    replyTo: comment.replyTo ? { ...comment.replyTo } : undefined,
    content: {
      ...comment.content,
      json: comment.content.json
        ? cloneComposerJson(comment.content.json)
        : null,
    },
    images: comment.images.map(image => ({ ...image })),
    replies: comment.replies?.map(cloneComment),
  }
}

function cloneComposerJson(
  node: NonNullable<PostComposerContent['json']>,
): NonNullable<PostComposerContent['json']> {
  return {
    ...node,
    attrs: node.attrs ? { ...node.attrs } : undefined,
    marks: node.marks?.map(mark => ({
      ...mark,
      attrs: mark.attrs ? { ...mark.attrs } : undefined,
    })),
    content: node.content?.map(cloneComposerJson),
  }
}

function textContent(text: string): PostComposerContent {
  return {
    json: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text }],
      }],
    },
    html: '',
    text,
  }
}

function ensureSeed(postId: string): PostComment[] {
  const existing = commentsByPost.get(postId)
  if (existing) return existing

  const roots: PostComment[] = []
  commentsByPost.set(postId, roots)
  return roots
}

function flatten(postId: string) {
  const roots = ensureSeed(postId)
  return roots.flatMap(root => [root, ...(root.replies ?? [])])
}

function find(postId: string, id: string) {
  return flatten(postId).find(comment => comment.id === id)
}

function page<T>(items: T[], cursor: string | null | undefined, limit: number) {
  const offset = Number(cursor ?? 0)
  return {
    items: items.slice(offset, offset + limit),
    nextCursor: offset + limit < items.length ? String(offset + limit) : null,
  }
}

export const mockPostCommentAdapter: PostCommentAdapter = {
  async fetchComments(input): Promise<CommentPageResult> {
    await wait()
    const roots = sortComments(ensureSeed(input.postId), input.sort)
    const result = page(roots, input.cursor, input.limit)
    return {
      comments: result.items.map(comment => cloneComment({
        ...comment,
        replies: [],
      })),
      nextCursor: result.nextCursor,
      total: flatten(input.postId).length,
    }
  },

  async fetchReplies(input): Promise<CommentPageResult> {
    await wait()
    const root = ensureSeed(input.postId).find(item => item.id === input.rootId)
    const replies = root?.replies ?? []
    const result = page(replies, input.cursor, input.limit)
    return {
      comments: result.items.map(cloneComment),
      nextCursor: result.nextCursor,
      total: replies.length,
    }
  },

  async createComment(input: CreateCommentInput): Promise<PostComment> {
    await wait()
    const comment: PostComment = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: '剛剛',
      createdAtTimestamp: Date.now(),
      liked: false,
      likeCount: 0,
      replyCount: 0,
      images: input.images.map(image => ({ ...image })),
      canEdit: true,
      canDelete: true,
      replies: [],
    }
    const roots = ensureSeed(input.postId)
    if (!input.rootId) {
      roots.push(comment)
    }
    else {
      const root = roots.find(item => item.id === input.rootId)
      if (!root) throw new Error('找不到要回覆的留言。')
      root.replies = [...(root.replies ?? []), comment]
      root.replyCount += 1
    }
    return cloneComment(comment)
  },

  async updateComment(input) {
    await wait()
    const comment = find(input.postId, input.commentId)
    if (!comment) throw new Error('留言不存在。')
    comment.content = input.content
    comment.images = input.images.map(image => ({ ...image }))
    comment.isEdited = true
    return cloneComment(comment)
  },

  async deleteComment(input) {
    await wait()
    const roots = ensureSeed(input.postId)
    const rootIndex = roots.findIndex(item => item.id === input.commentId)
    if (rootIndex >= 0) {
      const root = roots[rootIndex]!
      if (root.replyCount > 0) {
        root.isDeleted = true
        root.content = textContent('此留言已刪除')
        root.images = []
        return { tombstoned: true }
      }
      roots.splice(rootIndex, 1)
      return { tombstoned: false }
    }
    for (const root of roots) {
      const replyIndex = root.replies?.findIndex(item => item.id === input.commentId) ?? -1
      if (replyIndex >= 0) {
        root.replies?.splice(replyIndex, 1)
        root.replyCount = Math.max(0, root.replyCount - 1)
        return { tombstoned: false }
      }
    }
    throw new Error('留言不存在。')
  },

  async toggleCommentLike(input) {
    await wait()
    const comment = find(input.postId, input.commentId)
    if (!comment) throw new Error('留言不存在。')
    if (comment.liked !== input.liked) {
      comment.liked = input.liked
      comment.likeCount = Math.max(0, comment.likeCount + (input.liked ? 1 : -1))
    }
    return { liked: comment.liked, likeCount: comment.likeCount }
  },
}
