<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

interface AutoCompleteSkillOption {
  value: string
  label: string
  description?: string
  icon?: string
}

interface AutoCompleteOccupationOption {
  value: string
  label: string
  description?: string
  icon?: string
  skills: AutoCompleteSkillOption[]
}

type SelectionStep =
  | 'occupation'
  | 'skills'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    id: string
    label: string
    options: AutoCompleteOccupationOption[]
    placeholder?: string
    skillPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    required?: boolean
    clearable?: boolean
    maxSkills?: number
    separator?: string
    skillSeparator?: string
  }>(),
  {
    modelValue: '',
    placeholder: '搜尋並選擇職業',
    skillPlaceholder: '搜尋並選擇技能',
    emptyText: '找不到符合的項目',
    disabled: false,
    required: false,
    clearable: true,
    maxSkills: 6,
    separator: '・',
    skillSeparator: ' / ',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [
    payload: {
      occupation: string
      skills: string[]
      formattedValue: string
    },
  ]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const rootRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()

const isOpen = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)
const currentStep = ref<SelectionStep>('occupation')

const selectedOccupationValue = ref('')
const selectedSkillValues = ref<string[]>([])

const listboxId = computed(() => {
  return `${props.id}-options`
})

const selectedOccupation = computed(() => {
  return props.options.find(
    option => option.value === selectedOccupationValue.value,
  )
})

const selectedSkills = computed(() => {
  if (!selectedOccupation.value) {
    return []
  }

  return selectedSkillValues.value
    .map((skillValue) => {
      return selectedOccupation.value?.skills.find(
        skill => skill.value === skillValue,
      )
    })
    .filter(
      (
        skill,
      ): skill is AutoCompleteSkillOption => {
        return Boolean(skill)
      },
    )
})

const formattedValue = computed(() => {
  if (!selectedOccupation.value) {
    return ''
  }

  const occupationLabel = selectedOccupation.value.label

  if (!selectedSkills.value.length) {
    return occupationLabel
  }

  const skillsText = selectedSkills.value
    .map(skill => skill.label)
    .join(props.skillSeparator)

  return `${occupationLabel}${props.separator}${skillsText}`
})

const normalizeText = (value: string) => {
  return value
    .trim()
    .toLocaleLowerCase()
}

const normalizedSearchQuery = computed(() => {
  return normalizeText(searchQuery.value)
})

const filteredOccupationOptions = computed(() => {
  if (!normalizedSearchQuery.value) {
    return props.options
  }

  return props.options.filter((option) => {
    const searchableText = [
      option.label,
      option.description || '',
    ]
      .join(' ')
      .toLocaleLowerCase()

    return searchableText.includes(
      normalizedSearchQuery.value,
    )
  })
})

const filteredSkillOptions = computed(() => {
  if (!selectedOccupation.value) {
    return []
  }

  if (!normalizedSearchQuery.value) {
    return selectedOccupation.value.skills
  }

  return selectedOccupation.value.skills.filter((skill) => {
    const searchableText = [
      skill.label,
      skill.description || '',
    ]
      .join(' ')
      .toLocaleLowerCase()

    return searchableText.includes(
      normalizedSearchQuery.value,
    )
  })
})

const currentResultCount = computed(() => {
  return currentStep.value === 'occupation'
    ? filteredOccupationOptions.value.length
    : filteredSkillOptions.value.length
})

const activeOptionId = computed(() => {
  const options = currentStep.value === 'occupation'
    ? filteredOccupationOptions.value
    : filteredSkillOptions.value

  const option = options[activeIndex.value]

  if (!option) {
    return undefined
  }

  return getOptionId(option.value)
})

const inputPlaceholder = computed(() => {
  return currentStep.value === 'occupation'
    ? props.placeholder
    : props.skillPlaceholder
})

const isSkillLimitReached = computed(() => {
  if (props.maxSkills <= 0) {
    return false
  }

  return selectedSkillValues.value.length >= props.maxSkills
})

const inputDisplayValue = computed(() => {
  return isOpen.value
    ? searchQuery.value
    : props.modelValue
})

const getOptionId = (value: string) => {
  const normalizedValue = value
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')

  return `${props.id}-option-${normalizedValue}`
}

const isSkillSelected = (value: string) => {
  return selectedSkillValues.value.includes(value)
}

const isSkillDisabled = (value: string) => {
  return (
    isSkillLimitReached.value
    && !isSkillSelected(value)
  )
}

const emitFormattedValue = () => {
  const value = formattedValue.value

  emit('update:modelValue', value)

  emit('change', {
    occupation: selectedOccupation.value?.label || '',
    skills: selectedSkills.value.map(
      skill => skill.label,
    ),
    formattedValue: value,
  })
}

const parseModelValue = () => {
  const value = props.modelValue.trim()

  if (!value) {
    selectedOccupationValue.value = ''
    selectedSkillValues.value = []
    currentStep.value = 'occupation'

    return
  }

  const separatorIndex = value.indexOf(
    props.separator,
  )

  const occupationText = separatorIndex >= 0
    ? value.slice(0, separatorIndex).trim()
    : value

  const skillsText = separatorIndex >= 0
    ? value
        .slice(separatorIndex + props.separator.length)
        .trim()
    : ''

  const occupation = props.options.find((option) => {
    return (
      normalizeText(option.label)
        === normalizeText(occupationText)
      || normalizeText(option.value)
        === normalizeText(occupationText)
    )
  })

  if (!occupation) {
    selectedOccupationValue.value = ''
    selectedSkillValues.value = []
    currentStep.value = 'occupation'

    return
  }

  selectedOccupationValue.value = occupation.value
  currentStep.value = 'skills'

  if (!skillsText) {
    selectedSkillValues.value = []

    return
  }

  const parsedSkillTexts = skillsText
    .split(props.skillSeparator)
    .map(skill => skill.trim())
    .filter(Boolean)

  selectedSkillValues.value = parsedSkillTexts
    .map((skillText) => {
      return occupation.skills.find((skill) => {
        return (
          normalizeText(skill.label)
            === normalizeText(skillText)
          || normalizeText(skill.value)
            === normalizeText(skillText)
        )
      })?.value
    })
    .filter(
      (value): value is string => {
        return Boolean(value)
      },
    )
}

const focusInput = async () => {
  await nextTick()
  inputRef.value?.focus()
}

const openMenu = (
  event?: FocusEvent,
) => {
  if (props.disabled) {
    return
  }

  isOpen.value = true
  searchQuery.value = ''
  activeIndex.value = 0

  currentStep.value = selectedOccupation.value
    ? 'skills'
    : 'occupation'

  if (event) {
    emit('focus', event)
  }
}

const closeMenu = () => {
  isOpen.value = false
  searchQuery.value = ''
  activeIndex.value = 0
}

const goToOccupationStep = async () => {
  currentStep.value = 'occupation'
  searchQuery.value = ''
  activeIndex.value = 0

  await focusInput()
}

const selectOccupation = async (
  option: AutoCompleteOccupationOption,
) => {
  const isDifferentOccupation
    = selectedOccupationValue.value !== option.value

  selectedOccupationValue.value = option.value

  if (isDifferentOccupation) {
    selectedSkillValues.value = []
  }

  currentStep.value = 'skills'
  searchQuery.value = ''
  activeIndex.value = 0

  emitFormattedValue()

  await focusInput()
}

const toggleSkill = (
  skill: AutoCompleteSkillOption,
) => {
  const isSelected = isSkillSelected(skill.value)

  if (isSelected) {
    selectedSkillValues.value
      = selectedSkillValues.value.filter(
        value => value !== skill.value,
      )

    emitFormattedValue()

    return
  }

  if (isSkillLimitReached.value) {
    return
  }

  selectedSkillValues.value = [
    ...selectedSkillValues.value,
    skill.value,
  ]

  emitFormattedValue()
}

const handleInput = (event: Event) => {
  const inputElement = event.target as HTMLInputElement

  searchQuery.value = inputElement.value
  isOpen.value = true
  activeIndex.value = 0
}

const handleClear = async () => {
  selectedOccupationValue.value = ''
  selectedSkillValues.value = []
  currentStep.value = 'occupation'
  searchQuery.value = ''
  activeIndex.value = 0
  isOpen.value = true

  emit('update:modelValue', '')
  emit('clear')

  await focusInput()
}

const handleKeydown = (
  event: KeyboardEvent,
) => {
  if (event.key === 'Escape') {
    closeMenu()

    return
  }

  if (
    event.key === 'Backspace'
    && !searchQuery.value
    && currentStep.value === 'skills'
  ) {
    event.preventDefault()
    goToOccupationStep()

    return
  }

  if (!currentResultCount.value) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()

    activeIndex.value
      = (
        activeIndex.value + 1
      ) % currentResultCount.value

    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    activeIndex.value
      = (
        activeIndex.value
        - 1
        + currentResultCount.value
      ) % currentResultCount.value

    return
  }

  if (event.key !== 'Enter') {
    return
  }

  event.preventDefault()

  if (currentStep.value === 'occupation') {
    const option
      = filteredOccupationOptions.value[
        activeIndex.value
      ]

    if (option) {
      selectOccupation(option)
    }

    return
  }

  const skill
    = filteredSkillOptions.value[
      activeIndex.value
    ]

  if (
    skill
    && !isSkillDisabled(skill.value)
  ) {
    toggleSkill(skill)
  }
}

const handleDocumentPointerDown = (
  event: PointerEvent,
) => {
  const target = event.target

  if (!(target instanceof Node)) {
    return
  }

  if (!rootRef.value?.contains(target)) {
    closeMenu()
  }
}

watch(
  [
    () => props.modelValue,
    () => props.options,
  ],
  () => {
    parseModelValue()
  },
  {
    immediate: true,
    deep: true,
  },
)

watch(
  [
    currentStep,
    normalizedSearchQuery,
  ],
  () => {
    activeIndex.value = 0
  },
)

onMounted(() => {
  document.addEventListener(
    'pointerdown',
    handleDocumentPointerDown,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'pointerdown',
    handleDocumentPointerDown,
  )
})

defineExpose({
  focus: focusInput,
  clear: handleClear,
})
</script>

<template>
  <div class="w-full">
    <label
      :for="id"
      class="mb-2 block text-sm font-semibold text-slate-800"
    >
      {{ label }}

      <span
        v-if="required"
        class="ml-0.5 text-red-500"
        aria-hidden="true"
      >
        *
      </span>
    </label>

    <div
      ref="rootRef"
      class="relative"
    >
      <div
        class="flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
        :class="{
          'cursor-not-allowed bg-slate-100 opacity-60':
            disabled,
        }"
      >
        <Icon
          name="lucide:search"
          class="size-4 shrink-0 text-slate-400"
        />

        <input
          :id="id"
          ref="inputRef"
          :value="inputDisplayValue"
          type="text"
          role="combobox"
          autocomplete="off"
          :placeholder="inputPlaceholder"
          :disabled="disabled"
          :required="required"
          :aria-expanded="isOpen"
          :aria-controls="listboxId"
          :aria-activedescendant="activeOptionId"
          class="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          @focus="openMenu"
          @blur="emit('blur', $event)"
          @input="handleInput"
          @keydown="handleKeydown"
        />

        <button
          v-if="
            clearable
            && modelValue
            && !disabled
          "
          type="button"
          aria-label="清除職業與技能"
          class="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          @mousedown.prevent
          @click="handleClear"
        >
          <Icon
            name="lucide:x"
            class="size-4"
          />
        </button>

        <Icon
          name="lucide:chevrons-up-down"
          class="size-4 shrink-0 text-slate-400"
        />
      </div>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="-translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-1 opacity-0"
      >
        <div
          v-if="isOpen"
          :id="listboxId"
          role="listbox"
          :aria-multiselectable="
            currentStep === 'skills'
              ? 'true'
              : undefined
          "
          class="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
        >
          <!-- 職業選擇標題 -->
          <div
            v-if="currentStep === 'occupation'"
            class="flex items-center justify-between border-b border-slate-100 px-3 py-2.5"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">
                選擇職業
              </p>

              <p class="mt-0.5 text-xs text-slate-400">
                每次只能選擇一個職業
              </p>
            </div>

            <span
              class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500"
            >
              {{ filteredOccupationOptions.length }} 項
            </span>
          </div>

          <!-- 技能選擇標題 -->
          <div
            v-else
            class="flex items-center gap-2 border-b border-slate-100 px-2 py-2"
          >
            <button
              type="button"
              aria-label="重新選擇職業"
              class="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              @mousedown.prevent
              @click="goToOccupationStep"
            >
              <Icon
                name="lucide:arrow-left"
                class="size-4"
              />
            </button>

            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-semibold text-slate-900"
              >
                {{ selectedOccupation?.label }}
              </p>

              <p class="mt-0.5 text-xs text-slate-400">
                技能可複選，最多 {{ maxSkills }} 項
              </p>
            </div>

            <span
              class="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600"
            >
              {{ selectedSkillValues.length }}
              /
              {{ maxSkills }}
            </span>
          </div>

          <div class="max-h-72 overflow-y-auto p-1.5">
            <!-- 職業結果 -->
            <template v-if="currentStep === 'occupation'">
              <button
                v-for="(option, index) in filteredOccupationOptions"
                :id="getOptionId(option.value)"
                :key="option.value"
                type="button"
                role="option"
                :aria-selected="
                  selectedOccupationValue === option.value
                "
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition"
                :class="[
                  activeIndex === index
                    ? 'bg-slate-100'
                    : 'hover:bg-slate-50',
                  selectedOccupationValue === option.value
                    ? 'text-blue-700'
                    : 'text-slate-900',
                ]"
                @mousedown.prevent
                @mouseenter="activeIndex = index"
                @click="selectOccupation(option)"
              >
                <span
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                >
                  <Icon
                    :name="
                      option.icon
                      || 'lucide:briefcase-business'
                    "
                    class="size-4"
                  />
                </span>

                <span class="min-w-0 flex-1">
                  <span
                    class="block truncate text-sm font-semibold"
                  >
                    {{ option.label }}
                  </span>

                  <span
                    v-if="option.description"
                    class="mt-0.5 block truncate text-xs text-slate-500"
                  >
                    {{ option.description }}
                  </span>
                </span>

                <Icon
                  name="lucide:chevron-right"
                  class="size-4 shrink-0 text-slate-400"
                />
              </button>
            </template>

            <!-- 技能結果 -->
            <template v-else>
              <button
                v-for="(skill, index) in filteredSkillOptions"
                :id="getOptionId(skill.value)"
                :key="skill.value"
                type="button"
                role="option"
                :aria-selected="isSkillSelected(skill.value)"
                :disabled="isSkillDisabled(skill.value)"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40"
                :class="[
                  activeIndex === index
                    ? 'bg-slate-100'
                    : 'hover:bg-slate-50',
                  isSkillSelected(skill.value)
                    ? 'text-blue-700'
                    : 'text-slate-900',
                ]"
                @mousedown.prevent
                @mouseenter="activeIndex = index"
                @click="toggleSkill(skill)"
              >
                <span
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                >
                  <Icon
                    :name="
                      skill.icon
                      || 'lucide:code-2'
                    "
                    class="size-4"
                  />
                </span>

                <span class="min-w-0 flex-1">
                  <span
                    class="block truncate text-sm font-semibold"
                  >
                    {{ skill.label }}
                  </span>

                  <span
                    v-if="skill.description"
                    class="mt-0.5 block truncate text-xs text-slate-500"
                  >
                    {{ skill.description }}
                  </span>
                </span>

                <span
                  class="flex size-5 shrink-0 items-center justify-center rounded-md border transition"
                  :class="
                    isSkillSelected(skill.value)
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  "
                >
                  <Icon
                    name="lucide:check"
                    class="size-3.5"
                  />
                </span>
              </button>
            </template>

            <div
              v-if="!currentResultCount"
              class="flex min-h-28 flex-col items-center justify-center px-4 text-center"
            >
              <Icon
                name="lucide:search-x"
                class="size-6 text-slate-300"
              />

              <p class="mt-2 text-sm text-slate-500">
                {{ emptyText }}
              </p>
            </div>
          </div>

          <div
            class="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400"
          >
            <span>
              ↑↓ 移動
            </span>

            <span>
              Enter 選擇
            </span>

            <span>
              Esc 關閉
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <div
      v-if="modelValue"
      class="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2"
    >
      <Icon
        name="lucide:badge-check"
        class="mt-0.5 size-4 shrink-0 text-blue-600"
      />

      <p class="min-w-0 break-words text-xs leading-5 text-slate-600">
        {{ modelValue }}
      </p>
    </div>
  </div>
</template>
