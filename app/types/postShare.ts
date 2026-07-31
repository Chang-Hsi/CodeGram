import type { PostAuthor, ProfilePost } from '~/types/post'
import type { PostComposerContent, PostComposerImage } from '~/types/postComposer'

export interface SharedPostReference {
  postId: string
  author: PostAuthor
  contentPreview: string
  images: Array<string | PostComposerImage>
  tags: string[]
  createdAt: string
  unavailable?: boolean
}

export interface CreatePostShareInput {
  originalPostId: string
  author: PostAuthor
  content: PostComposerContent
  tags: string[]
  sharedPost: SharedPostReference
}

export interface PostShareAdapter {
  createShare(input: CreatePostShareInput): Promise<ProfilePost>
}
