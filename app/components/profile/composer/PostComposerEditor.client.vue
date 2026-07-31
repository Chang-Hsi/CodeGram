<script setup lang="ts">
import type { Editor as CoreEditor } from '@tiptap/core'
import { Editor, EditorContent } from '@tiptap/vue-3'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import StarterKit from '@tiptap/starter-kit'
import { createLowlight } from 'lowlight'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import shell from 'highlight.js/lib/languages/shell'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import type {
  PostComposerCodeLanguage,
  PostComposerContent,
  PostComposerJson,
} from '~/types/postComposer'
import {
  getClipboardImageFiles,
  isComposerSubmitShortcut,
} from '~/utils/postComposer'

const props = defineProps<{
  initialContent: PostComposerJson | null
  placeholder: string
}>()

const emit = defineEmits<{
  update: [content: PostComposerContent]
  imagesPasted: [files: File[]]
  submitShortcut: []
  focus: []
}>()

const lowlight = createLowlight()
lowlight.register({
  css,
  html: xml,
  javascript,
  json,
  shell,
  typescript,
  vue: xml,
})

const editor = shallowRef<Editor>()
const isComposing = ref(false)

const emptyDocument: PostComposerJson = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

function emitContent(instance: CoreEditor) {
  emit('update', {
    json: instance.getJSON() as PostComposerJson,
    html: instance.getHTML(),
    text: instance.getText({ blockSeparator: '\n' }),
  })
}

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'typescript',
        enableTabIndentation: true,
        tabSize: 2,
        HTMLAttributes: {
          class: 'post-composer-code',
        },
      }),
    ],
    content: props.initialContent ?? emptyDocument,
    editorProps: {
      attributes: {
        class: 'post-composer-editor',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': props.placeholder,
      },
      handlePaste(_view, event) {
        const clipboard = event.clipboardData
        if (!clipboard) return false
        const images = getClipboardImageFiles(clipboard)
        if (!images.length) return false
        emit('imagesPasted', images)
        return !clipboard.getData('text/plain')
      },
    },
    onUpdate: ({ editor: instance }) => emitContent(instance),
    onFocus: () => emit('focus'),
  })

  emitContent(editor.value)
})

watch(
  () => props.initialContent,
  (nextContent) => {
    if (!editor.value) {
      return
    }
    const current = JSON.stringify(editor.value.getJSON())
    const next = JSON.stringify(nextContent ?? emptyDocument)
    if (current !== next) {
      editor.value.commands.setContent(nextContent ?? emptyDocument)
    }
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function handleKeydown(event: KeyboardEvent) {
  if (isComposerSubmitShortcut(event, isComposing.value)) {
    event.preventDefault()
    emit('submitShortcut')
  }
}

function insertEmoji(emoji: string) {
  editor.value?.chain().focus().insertContent(emoji).run()
}

function toggleInlineCode() {
  editor.value?.chain().focus().toggleCode().run()
}

function undo() {
  editor.value?.chain().focus().undo().run()
}

function redo() {
  editor.value?.chain().focus().redo().run()
}

function insertCodeBlock(language: PostComposerCodeLanguage, code: string) {
  if (!editor.value) {
    return
  }

  editor.value
    .chain()
    .focus()
    .insertContent({
      type: 'codeBlock',
      attrs: { language },
      content: code ? [{ type: 'text', text: code }] : undefined,
    })
    .insertContent({ type: 'paragraph' })
    .run()
}

function clear() {
  editor.value?.commands.setContent(emptyDocument)
}

function focus() {
  editor.value?.commands.focus()
}

defineExpose({
  insertEmoji,
  toggleInlineCode,
  insertCodeBlock,
  undo,
  redo,
  clear,
  focus,
})
</script>

<template>
  <div
    class="relative min-h-24 max-h-80 overflow-y-auto px-4 py-3"
    @keydown="handleKeydown"
    @compositionstart="isComposing = true"
    @compositionend="isComposing = false"
  >
    <EditorContent
      v-if="editor"
      :editor="editor"
    />

    <p
      v-if="editor?.isEmpty"
      class="pointer-events-none absolute left-4 top-3 text-sm text-slate-400"
    >
      {{ placeholder }}
    </p>
  </div>
</template>

<style>
.post-composer-editor {
  min-height: 4.5rem;
  outline: none;
  color: rgb(15 23 42);
  font-size: 0.9375rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.post-composer-editor p {
  margin: 0;
}

.post-composer-editor p + p {
  margin-top: 0.5rem;
}

.post-composer-editor code:not(pre code) {
  border-radius: 0.25rem;
  background: rgb(226 232 240);
  padding: 0.1rem 0.3rem;
  color: rgb(190 24 93);
  font-size: 0.875em;
}

.post-composer-editor pre {
  margin: 0.75rem 0;
  overflow-x: auto;
  border-radius: 0.75rem;
  background: rgb(15 23 42);
  padding: 0.875rem 1rem;
  color: rgb(226 232 240);
  font-size: 0.8125rem;
  line-height: 1.55;
  white-space: pre;
}
</style>
