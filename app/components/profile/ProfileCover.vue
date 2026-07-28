<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    coverUrl?: string
    isOwnProfile?: boolean
  }>(),
  {
    coverUrl: '',
    isOwnProfile: false,
  },
)

const emit = defineEmits<{
  coverSelected: [file: File]
}>()

const fileInputRef = ref<HTMLInputElement>()
const previewUrl = ref('')

const displayedCoverUrl = computed(() => {
  return previewUrl.value || props.coverUrl
})

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  emit('coverSelected', file)

  input.value = ''
}

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div
    class="relative h-[220px] overflow-hidden rounded-b-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 sm:h-[300px] lg:h-[360px]"
  >
    <img
      v-if="displayedCoverUrl"
      :src="displayedCoverUrl"
      alt="個人封面圖片"
      class="size-full object-cover"
    >

    <div
      v-else
      class="absolute inset-0 overflow-hidden"
    >
      <div
        class="absolute -left-20 top-8 size-56 rounded-full bg-white/10 blur-2xl"
      />

      <div
        class="absolute right-10 top-16 size-40 rounded-full bg-cyan-300/20 blur-2xl"
      />

      <div
        class="absolute bottom-[-80px] left-1/3 size-64 rounded-full bg-purple-300/20 blur-3xl"
      />

      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px]"
      />
    </div>

    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />

    <input
      ref="fileInputRef"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      class="hidden"
      @change="handleFileChange"
    >

    <button
      v-if="isOwnProfile"
      type="button"
      class="absolute bottom-4 right-4 flex h-10 items-center gap-2 rounded-lg bg-white/95 px-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/40"
      @click="openFilePicker"
    >
      <Icon
        name="lucide:camera"
        class="size-4"
      />

      <span class="hidden sm:inline">編輯封面相片</span>
    </button>
  </div>
</template>