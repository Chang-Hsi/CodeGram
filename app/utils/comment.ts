import type { CommentSort, PostComment } from '~/types/comment'

export function dedupeComments(comments: PostComment[]): PostComment[] {
  return [...new Map(comments.map(comment => [comment.id, comment])).values()]
}

export function sortComments(
  comments: PostComment[],
  sort: CommentSort,
): PostComment[] {
  const result = [...comments]
  if (sort === 'newest') {
    return result.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
  }
  if (sort === 'oldest') {
    return result.sort((a, b) => a.createdAtTimestamp - b.createdAtTimestamp)
  }
  return result.sort((a, b) => {
    const scoreA = a.likeCount * 2 + a.replyCount * 3
    const scoreB = b.likeCount * 2 + b.replyCount * 3
    return scoreB - scoreA || b.createdAtTimestamp - a.createdAtTimestamp
  })
}

export function findComment(
  comments: PostComment[],
  id: string,
): PostComment | undefined {
  for (const comment of comments) {
    if (comment.id === id) return comment
    const reply = comment.replies?.find(item => item.id === id)
    if (reply) return reply
  }
}

export function countVisibleComments(comments: PostComment[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length ?? 0),
    0,
  )
}
