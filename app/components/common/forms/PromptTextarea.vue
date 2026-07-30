<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

type DraftState =
  | 'idle'
  | 'saved'
  | 'error'

const props = withDefaults(
  defineProps<{
    modelValue: string
    storageKey: string
    placeholder?: string
    rows?: number
    maxlength?: number
    disabled?: boolean
    autoLoadDraft?: boolean
  }>(),
  {
    placeholder: '',
    rows: 7,
    maxlength: 300,
    disabled: false,
    autoLoadDraft: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  draftSaved: [value: string]
  draftLoaded: [value: string]
  draftCleared: []
  draftError: [error: Error]
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const draftState = ref<DraftState>('idle')
const savedDraftValue = ref<string | null>(null)

const actionLabel = computed(() => {
  if (draftState.value === 'saved') {
    return '草稿已暫存於此裝置'
  }

  if (draftState.value === 'error') {
    return '草稿暫存失敗'
  }

  return '箭頭僅暫存草稿'
})

const buttonLabel = computed(() => {
  if (draftState.value === 'saved') {
    return '草稿已暫存'
  }

  if (draftState.value === 'error') {
    return '重新暫存草稿'
  }

  return '暫存草稿'
})

const normalizeError = (error: unknown) => {
  return error instanceof Error
    ? error
    : new Error('無法存取本機草稿')
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement

  emit('update:modelValue', target.value)
}

const loadDraft = () => {
  if (
    !import.meta.client
    || !props.storageKey
  ) {
    return null
  }

  try {
    const storedDraft = localStorage.getItem(
      props.storageKey,
    )

    if (storedDraft === null) {
      return null
    }

    savedDraftValue.value = storedDraft
    draftState.value = 'saved'

    emit('update:modelValue', storedDraft)
    emit('draftLoaded', storedDraft)

    return storedDraft
  } catch (error) {
    const normalizedError = normalizeError(error)

    draftState.value = 'error'
    emit('draftError', normalizedError)

    return null
  }
}

const saveDraft = () => {
  if (
    !import.meta.client
    || !props.storageKey
    || props.disabled
  ) {
    return false
  }

  try {
    localStorage.setItem(
      props.storageKey,
      props.modelValue,
    )

    savedDraftValue.value = props.modelValue
    draftState.value = 'saved'

    emit('draftSaved', props.modelValue)

    return true
  } catch (error) {
    const normalizedError = normalizeError(error)

    draftState.value = 'error'
    emit('draftError', normalizedError)

    return false
  }
}

const clearDraft = () => {
  if (
    !import.meta.client
    || !props.storageKey
  ) {
    return false
  }

  try {
    localStorage.removeItem(props.storageKey)

    savedDraftValue.value = null
    draftState.value = 'idle'

    emit('draftCleared')

    return true
  } catch (error) {
    const normalizedError = normalizeError(error)

    draftState.value = 'error'
    emit('draftError', normalizedError)

    return false
  }
}

const focus = () => {
  textareaRef.value?.focus()
}

watch(
  () => props.modelValue,
  (value) => {
    if (
      savedDraftValue.value !== null
      && value === savedDraftValue.value
    ) {
      return
    }

    draftState.value = 'idle'
  },
)

onMounted(() => {
  if (props.autoLoadDraft) {
    loadDraft()
  }
})

defineExpose({
  focus,
  loadDraft,
  saveDraft,
  clearDraft,
})
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
  >
    <textarea
      ref="textareaRef"
      v-bind="$attrs"
      :value="modelValue"
      :rows="rows"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :disabled="disabled"
      class="block w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
      @input="handleInput"
    />

    <div class="flex items-center justify-between gap-3 px-1 pt-2">
      <span
        class="min-w-0 truncate text-xs transition-colors"
        :class="{
          'text-slate-400': draftState === 'idle',
          'text-emerald-600': draftState === 'saved',
          'text-red-600': draftState === 'error',
        }"
      >
        {{ actionLabel }}
      </span>

      <!--
        這顆箭頭是 type="button"，
        只暫存 localStorage，不會送出表單或正式儲存
      -->
      <button
        type="button"
        :disabled="disabled"
        :aria-label="buttonLabel"
        :title="buttonLabel"
        class="flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        :class="
          draftState === 'saved'
            ? 'bg-emerald-600 hover:bg-emerald-500'
            : draftState === 'error'
              ? 'bg-red-600 hover:bg-red-500'
              : 'bg-slate-950 hover:bg-slate-800'
        "
        @click.stop="saveDraft"
      >
        <Icon
          :name="
            draftState === 'saved'
              ? 'lucide:check'
              : draftState === 'error'
                ? 'lucide:rotate-cw'
                : 'lucide:arrow-up'
          "
          class="size-4"
        />
      </button>
    </div>
  </div>
</template>