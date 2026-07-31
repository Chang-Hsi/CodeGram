import type {
  PendingPostComposerImage,
  PostComposerCodeLanguage,
  PostComposerCodeSnippet,
  PostComposerDraft,
  PostComposerImage,
  PostComposerJson,
} from '~/types/postComposer'

export const POST_COMPOSER_LIMITS = {
  maxImageBytes: 8 * 1024 * 1024,
  maxTags: 5,
  maxTagLength: 24,
} as const

export const POST_COMPOSER_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export interface ImageValidationResult {
  valid: File[]
  errors: string[]
}

export interface ComposerShortcutEvent {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  isComposing: boolean
}

export interface ClipboardImageSource {
  items: ArrayLike<{
    kind: string
    type: string
    getAsFile: () => File | null
  }>
  files: ArrayLike<File>
}

export function getClipboardImageFiles(
  clipboard: ClipboardImageSource,
): File[] {
  const itemFiles = Array.from(clipboard.items)
    .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter((file): file is File => Boolean(file))
  const fileFallback = Array.from(clipboard.files)
    .filter(file => file.type.startsWith('image/'))

  const candidates = itemFiles.length ? itemFiles : fileFallback

  return [...new Map(
    candidates.map(file => [
      `${file.type}:${file.size}`,
      file,
    ]),
  ).values()]
}

export function isComposerSubmitShortcut(
  event: ComposerShortcutEvent,
  compositionActive = false,
): boolean {
  return event.key === 'Enter'
    && (event.ctrlKey || event.metaKey)
    && !event.shiftKey
    && !event.isComposing
    && !compositionActive
}

export function normalizeTag(rawTag: string): string {
  return rawTag
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .slice(0, POST_COMPOSER_LIMITS.maxTagLength)
}

export function addNormalizedTag(tags: string[], rawTag: string): string[] {
  const tag = normalizeTag(rawTag)

  if (
    !tag
    || tags.length >= POST_COMPOSER_LIMITS.maxTags
    || tags.some(existing => existing.toLocaleLowerCase() === tag.toLocaleLowerCase())
  ) {
    return tags
  }

  return [...tags, tag]
}

export function validateImageFiles(
  files: File[],
): ImageValidationResult {
  const errors: string[] = []
  const valid: File[] = []

  for (const file of files) {
    if (!POST_COMPOSER_IMAGE_TYPES.includes(
      file.type as (typeof POST_COMPOSER_IMAGE_TYPES)[number],
    )) {
      errors.push(`${file.name} 不是支援的圖片格式。`)
      continue
    }

    if (file.size > POST_COMPOSER_LIMITS.maxImageBytes) {
      errors.push(`${file.name} 超過 8 MB 上限。`)
      continue
    }

    valid.push(file)
  }

  return { valid, errors: [...new Set(errors)] }
}

export function isComposerContentEmpty(
  text: string,
  imageCount: number,
): boolean {
  return text.trim().length === 0 && imageCount === 0
}

export function extractCodeSnippets(
  json: PostComposerJson | null,
): PostComposerCodeSnippet[] {
  const snippets: PostComposerCodeSnippet[] = []

  const visit = (node: PostComposerJson | undefined) => {
    if (!node) {
      return
    }

    if (node.type === 'codeBlock') {
      const code = (node.content ?? []).map(child => child.text ?? '').join('')
      const language = typeof node.attrs?.language === 'string'
        ? node.attrs.language as PostComposerCodeLanguage
        : 'typescript'

      snippets.push({
        id: `code-${snippets.length + 1}`,
        language,
        code,
      })
    }

    node.content?.forEach(visit)
  }

  visit(json ?? undefined)
  return snippets
}

export function serializeDraft(
  json: PostComposerJson | null,
  tags: string[],
  hadImages: boolean,
): PostComposerDraft {
  return {
    version: 1,
    content: json,
    tags,
    hadImages,
    savedAt: new Date().toISOString(),
  }
}

export function parseDraft(raw: string | null): PostComposerDraft | null {
  if (!raw) {
    return null
  }

  try {
    const draft: unknown = JSON.parse(raw)
    if (
      typeof draft !== 'object'
      || draft === null
      || !('version' in draft)
      || draft.version !== 1
      || !('tags' in draft)
      || !Array.isArray(draft.tags)
    ) {
      return null
    }
    return draft as PostComposerDraft
  }
  catch {
    return null
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`無法讀取圖片：${file.name}`))
    reader.readAsDataURL(file)
  })
}

/**
 * 前端展示用上傳 adapter。未來接 Supabase Storage 時只需替換此函式，
 * UI 與發布 payload 不需要知道儲存實作。
 */
export async function uploadPostImages(
  pendingImages: PendingPostComposerImage[],
): Promise<PostComposerImage[]> {
  return Promise.all(pendingImages.map(async (image) => {
    const url = await readFileAsDataUrl(image.file)
    return {
      id: image.id,
      url,
      alt: image.file.name,
      name: image.file.name,
      mimeType: image.file.type,
      size: image.file.size,
    }
  }))
}
