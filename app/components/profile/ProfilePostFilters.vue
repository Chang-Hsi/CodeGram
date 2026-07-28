<script setup lang="ts">
type PostFilter = 'all' | 'original'

defineProps<{
  modelValue: PostFilter
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PostFilter]
}>()

const viewMode = ref<'list' | 'grid'>('list')
</script>

<template>
  <section
    class="rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-xl font-bold text-slate-950">
        貼文
      </h2>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex h-9 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          @click="
            emit(
              'update:modelValue',
              modelValue === 'all' ? 'original' : 'all',
            )
          "
        >
          <Icon
            name="lucide:list-filter"
            class="size-4"
          />

          {{ modelValue === 'all' ? '篩選' : '原創貼文' }}
        </button>

        <button
          type="button"
          aria-label="管理貼文"
          class="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
        >
          <Icon
            name="lucide:settings-2"
            class="size-4"
          />
        </button>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-2 border-t border-slate-200 pt-1">
      <button
        type="button"
        class="relative flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition"
        :class="
          viewMode === 'list'
            ? 'text-blue-600'
            : 'text-slate-500 hover:bg-slate-50'
        "
        @click="viewMode = 'list'"
      >
        <Icon
          name="lucide:menu"
          class="size-4"
        />

        清單檢視

        <span
          v-if="viewMode === 'list'"
          class="absolute inset-x-0 -bottom-1 h-[3px] rounded-t-full bg-blue-600"
        />
      </button>

      <button
        type="button"
        class="relative flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition"
        :class="
          viewMode === 'grid'
            ? 'text-blue-600'
            : 'text-slate-500 hover:bg-slate-50'
        "
        @click="viewMode = 'grid'"
      >
        <Icon
          name="lucide:grid-2x2"
          class="size-4"
        />

        網格檢視

        <span
          v-if="viewMode === 'grid'"
          class="absolute inset-x-0 -bottom-1 h-[3px] rounded-t-full bg-blue-600"
        />
      </button>
    </div>
  </section>
</template>