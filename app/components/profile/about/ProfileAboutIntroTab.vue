<script setup lang="ts">
import CheckboxesGroup from '~/components/common/forms/CheckboxesGroup.vue'
import PromptTextarea from '~/components/common/forms/PromptTextarea.vue'

interface PinnedDetailDisplayItem {
  key: string
  icon: string
  text: string
  href?: string
}

interface CheckboxOption {
  value: string
  label: string
  description?: string
  icon?: string
  disabled?: boolean
}

defineProps<{
  savedBio: string
  displayedPinnedDetails: PinnedDetailDisplayItem[]
  isEditing: boolean
  bioDraft: string
  storageKey: string
  pinnedDetailsDraft: string[]
  pinnedDetailOptions: CheckboxOption[]
}>()

const emit = defineEmits<{
  'update:bioDraft': [value: string]
  'update:pinnedDetailsDraft': [value: string[]]
  cancel: []
  save: []
}>()

const promptTextareaRef = ref<
  InstanceType<typeof PromptTextarea>
>()

const focusEditor = () => {
  promptTextareaRef.value?.focus()
}

const clearDraft = () => {
  promptTextareaRef.value?.clearDraft()
}

defineExpose({
  focusEditor,
  clearDraft,
})
</script>

<template>
  <div class="mt-5">
    <template v-if="!isEditing">
      <div class="flex items-start gap-3">
        <div class="min-w-0">
          <p class="font-semibold text-slate-900">
            關於你
          </p>

          <p class="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
            {{ savedBio || '尚未新增個人簡介。' }}
          </p>
        </div>
      </div>

      <div class="mt-7">
        <h3 class="font-bold text-slate-950">
          置頂詳細資料
        </h3>

        <div
          v-if="displayedPinnedDetails.length"
          class="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-700"
        >
          <component
            :is="detail.href ? 'a' : 'span'"
            v-for="detail in displayedPinnedDetails"
            :key="detail.key"
            :href="detail.href"
            :target="detail.href ? '_blank' : undefined"
            :rel="detail.href ? 'noopener noreferrer' : undefined"
            class="inline-flex min-w-0 items-center gap-2"
            :class="detail.href ? 'font-medium text-blue-600 hover:underline' : ''"
          >
            <Icon
              :name="detail.icon"
              class="size-5 shrink-0 text-slate-500"
            />

            <span class="min-w-0 break-words">
              {{ detail.text }}
            </span>
          </component>
        </div>

        <p v-else class="mt-4 text-sm text-slate-500">
          尚未選擇要置頂的詳細資料。
        </p>
      </div>
    </template>

    <template v-else>
      <div>
        <div class="flex items-center justify-between gap-4">
          <label
            for="profile-about-bio"
            class="font-semibold text-slate-900"
          >
            關於你
          </label>

          <span
            class="text-xs"
            :class="
              bioDraft.length >= 280
                ? 'text-amber-600'
                : 'text-slate-400'
            "
          >
            {{ bioDraft.length }} / 300
          </span>
        </div>

        <PromptTextarea
          id="profile-about-bio"
          ref="promptTextareaRef"
          :model-value="bioDraft"
          :storage-key="storageKey"
          :maxlength="300"
          :rows="4"
          class="mt-3"
          placeholder="介紹你的專長、興趣或目前正在進行的專案……"
          @update:model-value="emit('update:bioDraft', $event)"
        />
      </div>

      <div class="mt-8">
        <h3 class="font-bold text-slate-950">
          置頂詳細資料
        </h3>

        <p class="mt-1 text-sm leading-6 text-slate-500">
          選擇要顯示在簡介下方的資料，沒有填寫內容的項目暫時無法選取。
        </p>

        <CheckboxesGroup
          :model-value="pinnedDetailsDraft"
          :options="pinnedDetailOptions"
          name="profile-pinned-details"
          :columns="2"
          class="mt-4"
          @update:model-value="emit('update:pinnedDetailsDraft', $event)"
        />
      </div>

      <div
        class="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"
      >
        <button
          type="button"
          class="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="emit('cancel')"
        >
          取消
        </button>

        <button
          type="button"
          class="h-10 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          @click="emit('save')"
        >
          儲存變更
        </button>
      </div>
    </template>
  </div>
</template>
