<script setup lang="ts">
import type { PostComposerJson } from '~/types/postComposer'

defineOptions({
  name: 'PostRichContentNode',
})

const props = defineProps<{
  node: PostComposerJson
}>()

const markTypes = computed(() => new Set(props.node.marks?.map(mark => mark.type)))
const language = computed(() => (
  typeof props.node.attrs?.language === 'string'
    ? props.node.attrs.language
    : 'text'
))
</script>

<template>
  <template v-if="node.type === 'doc'">
    <PostRichContentNode
      v-for="(child, index) in node.content"
      :key="index"
      :node="child"
    />
  </template>

  <p
    v-else-if="node.type === 'paragraph'"
    class="min-h-3 whitespace-pre-wrap"
  >
    <PostRichContentNode
      v-for="(child, index) in node.content"
      :key="index"
      :node="child"
    />
  </p>

  <pre
    v-else-if="node.type === 'codeBlock'"
    class="my-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100"
  ><span class="mb-2 block select-none text-[11px] font-semibold uppercase tracking-wide text-slate-400">{{ language }}</span><code><PostRichContentNode
    v-for="(child, index) in node.content"
    :key="index"
    :node="child"
  /></code></pre>

  <br v-else-if="node.type === 'hardBreak'">

  <code
    v-else-if="node.type === 'text' && markTypes.has('code')"
    class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-pink-700"
  >{{ node.text }}</code>
  <strong v-else-if="node.type === 'text' && markTypes.has('bold')">{{ node.text }}</strong>
  <em v-else-if="node.type === 'text' && markTypes.has('italic')">{{ node.text }}</em>
  <template v-else-if="node.type === 'text'">{{ node.text }}</template>
</template>
