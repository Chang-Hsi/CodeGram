import type {
  PostComposerCodeSnippet,
  PostComposerContent,
  PostComposerImage,
} from '~/types/postComposer'
import type { SharedPostReference } from '~/types/postShare'

export interface PostAuthor {
  id: string
  displayName: string
  username: string
  avatarUrl?: string
}

export interface ProfilePost {
  id: string
  type?: 'original' | 'share'
  kind?: 'original' | 'reply'
  author: PostAuthor
  content: string | PostComposerContent
  createdAt: string
  createdAtTimestamp?: number
  visibility?: 'public' | 'followers'
  tags?: string[]
  images?: Array<string | PostComposerImage>
  codeSnippets?: PostComposerCodeSnippet[]
  likeCount?: number
  commentCount?: number
  shareCount?: number
  liked?: boolean
  sharedPost?: SharedPostReference
}
