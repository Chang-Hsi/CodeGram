import type { PostAuthor } from '~/types/post'
import type { PostComposerContent, PostComposerImage } from '~/types/postComposer'

export type CommentSort = 'relevant' | 'newest' | 'oldest'

export interface PostCommentComposerPayload {
  content: PostComposerContent
  images: PostComposerImage[]
}

export interface PostComment extends PostCommentPermissions {
  id: string
  postId: string
  parentId: string | null
  rootId: string | null
  replyTo?: PostAuthor
  author: PostAuthor
  content: PostComposerContent
  images: PostComposerImage[]
  createdAt: string
  createdAtTimestamp: number
  liked: boolean
  likeCount: number
  replyCount: number
  isEdited?: boolean
  isDeleted?: boolean
  replies?: PostComment[]
}

export interface PostCommentPermissions {
  canEdit?: boolean
  canDelete?: boolean
}

export interface CommentPageResult {
  comments: PostComment[]
  nextCursor: string | null
  total: number
}

export interface FetchCommentsInput {
  postId: string
  cursor?: string | null
  limit: number
  sort: CommentSort
}

export interface FetchRepliesInput {
  postId: string
  rootId: string
  cursor?: string | null
  limit: number
}

export interface CreateCommentInput {
  postId: string
  parentId: string | null
  rootId: string | null
  replyTo?: PostAuthor
  author: PostAuthor
  content: PostComposerContent
  images: PostComposerImage[]
}

export interface UpdateCommentInput {
  postId: string
  commentId: string
  content: PostComposerContent
  images: PostComposerImage[]
}

export interface DeleteCommentInput {
  postId: string
  commentId: string
}

export interface ToggleCommentLikeInput {
  postId: string
  commentId: string
  liked: boolean
}

export interface CommentLikeResult {
  liked: boolean
  likeCount: number
}

export interface PostCommentAdapter {
  fetchComments(input: FetchCommentsInput): Promise<CommentPageResult>
  fetchReplies(input: FetchRepliesInput): Promise<CommentPageResult>
  createComment(input: CreateCommentInput): Promise<PostComment>
  updateComment(input: UpdateCommentInput): Promise<PostComment>
  deleteComment(input: DeleteCommentInput): Promise<{ tombstoned: boolean }>
  toggleCommentLike(input: ToggleCommentLikeInput): Promise<CommentLikeResult>
}
