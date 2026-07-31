import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
  PendingPostComposerImage,
  PostComposerContent,
  PostComposerDraft,
  PostComposerJson,
  PostComposerPayload,
  PostComposerSubmitHandler,
} from '~/types/postComposer'
import {
  addNormalizedTag,
  extractCodeSnippets,
  isComposerContentEmpty,
  parseDraft,
  serializeDraft,
  uploadPostImages,
  validateImageFiles,
} from '~/utils/postComposer'

const EMPTY_CONTENT: PostComposerContent = {
  json: null,
  html: '',
  text: '',
}

export function usePostComposer(
  draftKey: () => string,
  submitPost?: PostComposerSubmitHandler,
) {
  const content = ref<PostComposerContent>({ ...EMPTY_CONTENT })
  const initialContent = ref<PostComposerJson | null>(null)
  const images = ref<PendingPostComposerImage[]>([])
  const tags = ref<string[]>([])
  const isExpanded = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const draftNotice = ref('')
  let draftTimer: ReturnType<typeof setTimeout> | undefined

  const canSubmit = computed(() => (
    !isSubmitting.value
    && !isComposerContentEmpty(content.value.text, images.value.length)
  ))

  function saveDraftNow() {
    if (typeof window === 'undefined') {
      return
    }

    const hasDraft = content.value.text.trim()
      || tags.value.length
      || images.value.length

    if (!hasDraft) {
      localStorage.removeItem(draftKey())
      return
    }

    localStorage.setItem(
      draftKey(),
      JSON.stringify(
        serializeDraft(content.value.json, tags.value, images.value.length > 0),
      ),
    )
  }

  function scheduleDraftSave() {
    clearTimeout(draftTimer)
    draftTimer = setTimeout(saveDraftNow, 500)
  }

  function restoreDraft() {
    const draft: PostComposerDraft | null = parseDraft(
      localStorage.getItem(draftKey()),
    )
    if (!draft) {
      return
    }

    initialContent.value = draft.content
    tags.value = draft.tags
    isExpanded.value = true

    if (draft.hadImages) {
      draftNotice.value = '已恢復文字與標籤；基於瀏覽器安全限制，圖片需要重新選擇。'
    }
    else {
      draftNotice.value = '已恢復上次未發布的草稿。'
    }
  }

  function updateContent(nextContent: PostComposerContent) {
    content.value = nextContent
    errorMessage.value = ''
    scheduleDraftSave()
  }

  function addImages(files: File[]) {
    const result = validateImageFiles(files)
    const nextImages = result.valid.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      loadFailed: false,
    }))

    images.value.push(...nextImages)
    errorMessage.value = result.errors.join(' ')
    if (nextImages.length) {
      isExpanded.value = true
      scheduleDraftSave()
    }
  }

  function removeImage(id: string) {
    const image = images.value.find(item => item.id === id)
    if (image) {
      URL.revokeObjectURL(image.previewUrl)
    }
    images.value = images.value.filter(item => item.id !== id)
    scheduleDraftSave()
  }

  function markImageFailed(id: string) {
    const image = images.value.find(item => item.id === id)
    if (image) {
      image.loadFailed = true
    }
  }

  function addTag(rawTag: string) {
    const nextTags = addNormalizedTag(tags.value, rawTag)
    if (nextTags === tags.value) {
      return false
    }
    tags.value = nextTags
    scheduleDraftSave()
    return true
  }

  function removeTag(tag: string) {
    tags.value = tags.value.filter(item => item !== tag)
    scheduleDraftSave()
  }

  function revokeAllPreviews() {
    images.value.forEach(image => URL.revokeObjectURL(image.previewUrl))
  }

  function clear(clearDraft = true) {
    revokeAllPreviews()
    content.value = { ...EMPTY_CONTENT }
    initialContent.value = null
    images.value = []
    tags.value = []
    errorMessage.value = ''
    draftNotice.value = ''
    clearTimeout(draftTimer)
    if (clearDraft && typeof window !== 'undefined') {
      localStorage.removeItem(draftKey())
    }
  }

  async function submit(): Promise<PostComposerPayload | null> {
    if (!canSubmit.value) {
      return null
    }

    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const payload: PostComposerPayload = {
        content: content.value,
        images: await uploadPostImages(images.value),
        tags: [...tags.value],
        codeSnippets: extractCodeSnippets(content.value.json),
      }
      await submitPost?.(payload)
      clear()
      isExpanded.value = false
      return payload
    }
    catch (error: unknown) {
      errorMessage.value = error instanceof Error
        ? error.message
        : '發布失敗，草稿已保留，請稍後再試。'
      saveDraftNow()
      return null
    }
    finally {
      isSubmitting.value = false
    }
  }

  watch(tags, scheduleDraftSave, { deep: true })
  onMounted(restoreDraft)
  onBeforeUnmount(() => {
    clearTimeout(draftTimer)
    saveDraftNow()
    revokeAllPreviews()
  })

  return {
    content,
    initialContent,
    images,
    tags,
    isExpanded,
    isSubmitting,
    errorMessage,
    draftNotice,
    canSubmit,
    updateContent,
    addImages,
    removeImage,
    markImageFailed,
    addTag,
    removeTag,
    clear,
    submit,
  }
}
