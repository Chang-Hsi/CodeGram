export type PostComposerJson = {
  type?: string
  attrs?: Record<string, unknown>
  marks?: Array<{
    type: string
    attrs?: Record<string, unknown>
  }>
  text?: string
  content?: PostComposerJson[]
}

export interface PostComposerContent {
  json: PostComposerJson | null
  html: string
  text: string
}

export interface PostComposerImage {
  id: string
  url: string
  alt: string
  name: string
  mimeType: string
  size: number
  width?: number
  height?: number
}

export interface PostComposerCodeSnippet {
  id: string
  language: PostComposerCodeLanguage
  code: string
}

export interface PostComposerPayload {
  content: PostComposerContent
  images: PostComposerImage[]
  tags: string[]
  codeSnippets: PostComposerCodeSnippet[]
}

export interface PendingPostComposerImage {
  id: string
  file: File
  previewUrl: string
  loadFailed: boolean
}

export interface PostComposerDraft {
  version: 1
  content: PostComposerJson | null
  tags: string[]
  hadImages: boolean
  savedAt: string
}

export type PostComposerSubmitHandler = (
  payload: PostComposerPayload,
) => Promise<void> | void

export const POST_COMPOSER_CODE_LANGUAGES = [
  'vue',
  'typescript',
  'javascript',
  'html',
  'css',
  'json',
  'shell',
] as const

export type PostComposerCodeLanguage =
  (typeof POST_COMPOSER_CODE_LANGUAGES)[number]
