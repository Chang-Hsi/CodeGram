import { computed, onBeforeUnmount, ref } from 'vue'
import type {
  CommentSort,
  CreateCommentInput,
  PostComment,
  PostCommentAdapter,
} from '~/types/comment'
import { dedupeComments, findComment, sortComments } from '~/utils/comment'

export function usePostComments(
  postId: string,
  adapter: PostCommentAdapter,
  initialTotal = 0,
) {
  const comments = ref<PostComment[]>([])
  const sort = ref<CommentSort>('relevant')
  const total = ref(initialTotal)
  const nextCursor = ref<string | null>(null)
  const loaded = ref(false)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref('')
  const pendingLikes = ref(new Set<string>())
  const loadingReplies = ref(new Set<string>())
  const replyErrors = ref(new Map<string, string>())
  let requestId = 0
  let disposed = false

  const sortedComments = computed(() => sortComments(comments.value, sort.value))

  async function load(reset = false) {
    if (loading.value || (!reset && loaded.value)) return
    const currentRequest = ++requestId
    loading.value = true
    error.value = ''
    try {
      const result = await adapter.fetchComments({
        postId,
        cursor: null,
        limit: 3,
        sort: sort.value,
      })
      if (disposed || currentRequest !== requestId) return
      comments.value = dedupeComments(result.comments)
      nextCursor.value = result.nextCursor
      total.value = result.total
      loaded.value = true
    }
    catch (caught: unknown) {
      if (!disposed) {
        error.value = caught instanceof Error ? caught.message : '留言載入失敗。'
      }
    }
    finally {
      if (!disposed && currentRequest === requestId) loading.value = false
    }
  }

  async function loadMore() {
    if (!nextCursor.value || loadingMore.value) return
    loadingMore.value = true
    try {
      const result = await adapter.fetchComments({
        postId,
        cursor: nextCursor.value,
        limit: 3,
        sort: sort.value,
      })
      if (disposed) return
      comments.value = dedupeComments([...comments.value, ...result.comments])
      nextCursor.value = result.nextCursor
      total.value = result.total
    }
    catch (caught: unknown) {
      error.value = caught instanceof Error ? caught.message : '無法載入更多留言。'
    }
    finally {
      if (!disposed) loadingMore.value = false
    }
  }

  async function changeSort(nextSort: CommentSort) {
    sort.value = nextSort
    loaded.value = false
    await load(true)
  }

  async function loadReplies(rootId: string) {
    if (loadingReplies.value.has(rootId)) return
    const root = findComment(comments.value, rootId)
    if (!root) return
    loadingReplies.value.add(rootId)
    replyErrors.value.delete(rootId)
    try {
      const cursor = root.replies?.length ? String(root.replies.length) : null
      const result = await adapter.fetchReplies({ postId, rootId, cursor, limit: 2 })
      if (disposed) return
      root.replies = dedupeComments([...(root.replies ?? []), ...result.comments])
      root.replyCount = Math.max(root.replyCount, result.total)
    }
    catch (caught: unknown) {
      replyErrors.value.set(
        rootId,
        caught instanceof Error ? caught.message : '無法載入回覆。',
      )
    }
    finally {
      if (!disposed) loadingReplies.value.delete(rootId)
    }
  }

  async function create(input: Omit<CreateCommentInput, 'postId'>) {
    const comment = await adapter.createComment({ ...input, postId })
    if (!comment.rootId) {
      comments.value = sortComments(
        dedupeComments([...comments.value, comment]),
        sort.value,
      )
    }
    else {
      const root = findComment(comments.value, comment.rootId)
      if (root) {
        root.replies = dedupeComments([...(root.replies ?? []), comment])
        root.replyCount = Math.max(root.replyCount + 1, root.replies.length)
      }
    }
    total.value += 1
    return comment
  }

  async function update(
    commentId: string,
    content: PostComment['content'],
    images: PostComment['images'],
  ) {
    const updated = await adapter.updateComment({
      postId,
      commentId,
      content,
      images,
    })
    const current = findComment(comments.value, commentId)
    if (current) Object.assign(current, updated)
    return updated
  }

  async function remove(commentId: string) {
    const current = findComment(comments.value, commentId)
    if (!current) return
    const result = await adapter.deleteComment({ postId, commentId })
    if (result.tombstoned) {
      current.isDeleted = true
      current.content = { json: null, html: '', text: '此留言已刪除' }
      current.images = []
    }
    else if (!current.rootId) {
      comments.value = comments.value.filter(item => item.id !== commentId)
    }
    else {
      const root = findComment(comments.value, current.rootId)
      if (root) {
        root.replies = root.replies?.filter(item => item.id !== commentId)
        root.replyCount = Math.max(0, root.replyCount - 1)
      }
    }
    total.value = Math.max(0, total.value - 1)
  }

  async function toggleLike(commentId: string) {
    if (pendingLikes.value.has(commentId)) return
    const comment = findComment(comments.value, commentId)
    if (!comment) return
    const previous = { liked: comment.liked, likeCount: comment.likeCount }
    const desired = !comment.liked
    comment.liked = desired
    comment.likeCount = Math.max(0, comment.likeCount + (desired ? 1 : -1))
    pendingLikes.value.add(commentId)
    try {
      const result = await adapter.toggleCommentLike({
        postId,
        commentId,
        liked: desired,
      })
      comment.liked = result.liked
      comment.likeCount = Math.max(0, result.likeCount)
    }
    catch (error) {
      Object.assign(comment, previous)
      throw error
    }
    finally {
      pendingLikes.value.delete(commentId)
    }
  }

  onBeforeUnmount(() => {
    disposed = true
    requestId += 1
  })

  return {
    comments,
    sortedComments,
    sort,
    total,
    nextCursor,
    loaded,
    loading,
    loadingMore,
    error,
    pendingLikes,
    loadingReplies,
    replyErrors,
    load,
    loadMore,
    loadReplies,
    changeSort,
    create,
    update,
    remove,
    toggleLike,
  }
}
