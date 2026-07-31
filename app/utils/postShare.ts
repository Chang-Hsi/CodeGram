import type { ProfilePost } from '~/types/post'
import type { SharedPostReference } from '~/types/postShare'

export function contentText(post: ProfilePost): string {
  return typeof post.content === 'string' ? post.content : post.content.text
}

export function createSharedPostReference(post: ProfilePost): SharedPostReference {
  return {
    postId: post.sharedPost?.postId ?? post.id,
    author: post.sharedPost?.author ?? post.author,
    contentPreview: (post.sharedPost?.contentPreview ?? contentText(post)).slice(0, 280),
    images: [...(post.sharedPost?.images ?? post.images ?? [])].slice(0, 4),
    tags: [...(post.sharedPost?.tags ?? post.tags ?? [])],
    createdAt: post.sharedPost?.createdAt ?? post.createdAt,
    unavailable: post.sharedPost?.unavailable,
  }
}

export function getPostUrl(postId: string, origin: string): string {
  return new URL(`/posts/${encodeURIComponent(postId)}`, origin).toString()
}
