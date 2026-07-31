import { computed, ref } from 'vue'
import type { PostAuthor, ProfilePost } from '~/types/post'
import type { PostComposerContent } from '~/types/postComposer'
import type { PostShareAdapter } from '~/types/postShare'
import { createSharedPostReference, getPostUrl } from '~/utils/postShare'

const EMPTY_CONTENT: PostComposerContent = { json: null, html: '', text: '' }

export function usePostShare(
  post: () => ProfilePost,
  currentUser: () => PostAuthor,
  adapter: PostShareAdapter,
) {
  const open = ref(false)
  const submitting = ref(false)
  const message = ref('')
  const error = ref('')
  const canNativeShare = computed(() => (
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  ))

  async function createShare(
    content: PostComposerContent = EMPTY_CONTENT,
    tags: string[] = [],
  ) {
    if (submitting.value) return null
    submitting.value = true
    error.value = ''
    try {
      const shared = await adapter.createShare({
        originalPostId: post().id,
        author: currentUser(),
        content,
        tags,
        sharedPost: createSharedPostReference(post()),
      })
      open.value = false
      message.value = content.text.trim() ? '引用分享已發布。' : '已分享到你的動態。'
      return shared
    }
    catch (caught: unknown) {
      error.value = caught instanceof Error ? caught.message : '分享失敗，請稍後再試。'
      return null
    }
    finally {
      submitting.value = false
    }
  }

  async function copyLink(origin = window.location.origin) {
    const url = getPostUrl(post().id, origin)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      }
      else {
        const input = document.createElement('textarea')
        input.value = url
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.select()
        const copied = document.execCommand('copy')
        input.remove()
        if (!copied) throw new Error('copy failed')
      }
      message.value = '貼文連結已複製。'
      error.value = ''
      return true
    }
    catch {
      error.value = '無法複製連結，請手動複製網址。'
      return false
    }
  }

  async function nativeShare(origin = window.location.origin) {
    if (!canNativeShare.value) return false
    try {
      await navigator.share({
        title: `${post().author.displayName} 在 CodeGram 的貼文`,
        text: createSharedPostReference(post()).contentPreview,
        url: getPostUrl(post().id, origin),
      })
      return true
    }
    catch (caught: unknown) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return false
      error.value = '無法開啟系統分享。'
      return false
    }
  }

  return {
    open,
    submitting,
    message,
    error,
    canNativeShare,
    createShare,
    copyLink,
    nativeShare,
  }
}
