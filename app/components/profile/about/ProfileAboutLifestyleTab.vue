<script setup lang="ts">
import CheckboxesGroup from '~/components/common/forms/CheckboxesGroup.vue'
import LableInput from '~/components/common/forms/LableInput.vue'

interface LifestyleOption {
  label: string
  value: string
  description: string
  icon: string
}

interface SaveLifestylePayload {
  values: string[]
  customValue: string
}

const props = withDefaults(
  defineProps<{
    section: 'hobbies' | 'interests'
    values?: string[]
    customValue?: string
  }>(),
  {
    values: () => [],
    customValue: '',
  },
)

const emit = defineEmits<{
  save: [payload: SaveLifestylePayload]
}>()

const hobbyOptions: LifestyleOption[] = [
  {
    label: '閱讀',
    value: 'reading',
    description: '小說、技術書籍與各類文章',
    icon: 'lucide:book-open',
  },
  {
    label: '運動健身',
    value: 'fitness',
    description: '跑步、重訓與戶外運動',
    icon: 'lucide:dumbbell',
  },
  {
    label: '音樂',
    value: 'music',
    description: '聽音樂、演奏或音樂創作',
    icon: 'lucide:music-2',
  },
  {
    label: '電影影集',
    value: 'movies',
    description: '電影、影集與動畫作品',
    icon: 'lucide:clapperboard',
  },
  {
    label: '遊戲',
    value: 'gaming',
    description: '電子遊戲、桌遊與電競',
    icon: 'lucide:gamepad-2',
  },
  {
    label: '攝影',
    value: 'photography',
    description: '生活紀錄、街拍與影像創作',
    icon: 'lucide:camera',
  },
]

const interestOptions: LifestyleOption[] = [
  {
    label: '前端開發',
    value: 'frontend',
    description: 'Web 技術、框架與使用者體驗',
    icon: 'lucide:code-2',
  },
  {
    label: '人工智慧',
    value: 'ai',
    description: '生成式 AI、機器學習與應用',
    icon: 'lucide:brain-circuit',
  },
  {
    label: 'UI / UX',
    value: 'ui-ux',
    description: '介面設計與使用者研究',
    icon: 'lucide:panels-top-left',
  },
  {
    label: '開源社群',
    value: 'open-source',
    description: '開源專案、技術分享與協作',
    icon: 'lucide:git-pull-request',
  },
  {
    label: '資訊安全',
    value: 'security',
    description: '網站安全、隱私與資安技術',
    icon: 'lucide:shield-check',
  },
  {
    label: '雲端技術',
    value: 'cloud',
    description: '雲端服務、部署與系統架構',
    icon: 'lucide:cloud',
  },
]

const otherOption: LifestyleOption[] = [
  {
    label: '其他',
    value: 'other',
    description: '自行填寫未列出的項目',
    icon: 'lucide:plus',
  },
]

const options = computed(() => {
  return props.section === 'hobbies'
    ? hobbyOptions
    : interestOptions
})

const sectionLabel = computed(() => {
  return props.section === 'hobbies'
    ? '嗜好'
    : '興趣'
})

const isEditing = ref(false)
const valuesDraft = ref<string[]>([])
const customValueDraft = ref('')

const displayedValues = computed(() => {
  return isEditing.value
    ? valuesDraft.value
    : props.values
})

const displayedCustomValue = computed(() => {
  return isEditing.value
    ? customValueDraft.value
    : props.customValue
})

const hasOtherSelected = computed(() => {
  return displayedValues.value.includes('other')
})

const canSave = computed(() => {
  return !valuesDraft.value.includes('other')
    || Boolean(customValueDraft.value.trim())
})

const resetDraft = () => {
  valuesDraft.value = [...props.values]
  customValueDraft.value = props.customValue
}

const openEditor = () => {
  resetDraft()
  isEditing.value = true
}

const cancelEditor = () => {
  resetDraft()
  isEditing.value = false
}

const updateValues = (
  values: string[],
) => {
  if (!isEditing.value) {
    return
  }

  valuesDraft.value = values

  if (!values.includes('other')) {
    customValueDraft.value = ''
  }
}

const saveEditor = () => {
  if (!canSave.value) {
    return
  }

  emit('save', {
    values: [...valuesDraft.value],
    customValue:
      valuesDraft.value.includes('other')
        ? customValueDraft.value.trim()
        : '',
  })

  isEditing.value = false
}

defineExpose({
  openEditor,
})
</script>

<template>
  <div class="mt-6">
    <CheckboxesGroup
      :model-value="displayedValues"
      :options="options"
      :name="`${section}-options`"
      :title="`選擇${sectionLabel}`"
      :description="
        isEditing
          ? `可複選符合你的${sectionLabel}`
          : `已儲存的${sectionLabel}`
      "
      :disabled="!isEditing"
      :columns="2"
      @update:model-value="updateValues"
    />

    <div class="mt-3 border-t border-slate-100 pt-3">
      <CheckboxesGroup
        :model-value="displayedValues"
        :options="otherOption"
        :name="`${section}-other`"
        :disabled="!isEditing"
        :columns="1"
        @update:model-value="updateValues"
      />
    </div>

    <div
      class="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
      :class="
        hasOtherSelected
          ? 'mt-4 grid-rows-[1fr] opacity-100'
          : 'mt-0 grid-rows-[0fr] opacity-0'
      "
    >
      <div class="min-h-0 overflow-hidden">
        <LableInput
          :id="`${section}-custom-value`"
          :model-value="displayedCustomValue"
          :label="`其他${sectionLabel}`"
          :placeholder="`請輸入你的其他${sectionLabel}`"
          :disabled="!isEditing"
          :required="isEditing"
          :error="
            isEditing
            && hasOtherSelected
            && !customValueDraft.trim()
              ? `請輸入其他${sectionLabel}`
              : ''
          "
          @update:model-value="
            customValueDraft = $event
          "
        />
      </div>
    </div>

    <div
      v-if="isEditing"
      class="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5"
    >
      <button
        type="button"
        class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        @click="cancelEditor"
      >
        取消
      </button>

      <button
        type="button"
        :disabled="!canSave"
        class="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        @click="saveEditor"
      >
        儲存變更
      </button>
    </div>
  </div>
</template>
