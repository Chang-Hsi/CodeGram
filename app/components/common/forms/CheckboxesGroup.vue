<script setup lang="ts">
import { computed, useId } from 'vue'

interface CheckboxGroupOption {
  label: string
  value: string
  description?: string
  icon?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    options: CheckboxGroupOption[]
    title?: string
    description?: string
    name?: string
    disabled?: boolean
    columns?: 1 | 2 | 3
  }>(),
  {
    title: '',
    description: '',
    name: 'checkbox-group',
    disabled: false,
    columns: 2,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const groupId = useId()

const selectedValues = computed(() => {
  return new Set(props.modelValue)
})

const gridClass = computed(() => {
  if (props.columns === 1) {
    return 'grid-cols-1'
  }

  if (props.columns === 3) {
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  }

  return 'grid-cols-1 sm:grid-cols-2'
})

const getOptionId = (
  value: string,
  index: number,
) => {
  const normalizedValue = value
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')

  return `${groupId}-${normalizedValue || index}`
}

const isOptionChecked = (value: string) => {
  return selectedValues.value.has(value)
}

const isOptionDisabled = (
  option: CheckboxGroupOption,
) => {
  return props.disabled || Boolean(option.disabled)
}

const handleChange = (
  option: CheckboxGroupOption,
  event: Event,
) => {
  if (isOptionDisabled(option)) {
    return
  }

  const inputElement = event.target as HTMLInputElement

  if (inputElement.checked) {
    emit(
      'update:modelValue',
      Array.from(
        new Set([
          ...props.modelValue,
          option.value,
        ]),
      ),
    )

    return
  }

  emit(
    'update:modelValue',
    props.modelValue.filter(
      value => value !== option.value,
    ),
  )
}
</script>

<template>
  <fieldset
    class="min-w-0"
    :disabled="disabled"
    :aria-describedby="
      description
        ? `${groupId}-description`
        : undefined
    "
  >
    <legend
      v-if="title"
      class="text-sm font-semibold text-slate-900"
    >
      {{ title }}
    </legend>

    <p
      v-if="description"
      :id="`${groupId}-description`"
      class="mt-1 text-sm leading-6 text-slate-500"
    >
      {{ description }}
    </p>

    <div
      class="grid gap-3"
      :class="[
        gridClass,
        title || description
          ? 'mt-4'
          : '',
      ]"
    >
      <label
        v-for="(option, index) in options"
        :key="option.value"
        :for="getOptionId(option.value, index)"
        class="group relative block min-w-0"
        :class="
          isOptionDisabled(option)
            ? 'cursor-not-allowed'
            : 'cursor-pointer'
        "
      >
        <input
          :id="getOptionId(option.value, index)"
          :name="`${name}[]`"
          :value="option.value"
          type="checkbox"
          class="sr-only"
          :checked="isOptionChecked(option.value)"
          :disabled="isOptionDisabled(option)"
          @change="handleChange(option, $event)"
        />

        <span
          class="flex min-h-[82px] items-start gap-3 rounded-xl border p-3.5 transition duration-200"
          :class="[
            'border-slate-200 bg-white',
            isOptionDisabled(option)
              ? 'opacity-45'
              : 'hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm',
          ]"
        >
          <span
            v-if="option.icon"
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-slate-200"
          >
            <Icon
              :name="option.icon"
              class="size-4.5"
            />
          </span>

          <span class="min-w-0 flex-1">
            <span
              class="block text-sm font-semibold text-slate-900 transition"
            >
              {{ option.label }}
            </span>

            <span
              v-if="option.description"
              class="mt-1 block line-clamp-2 text-xs leading-5"
              :class="
                isOptionDisabled(option)
                  ? 'text-slate-400'
                  : 'text-slate-500'
              "
            >
              {{ option.description }}
            </span>
          </span>

          <span
            class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition duration-200"
            :class="
              isOptionChecked(option.value)
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400'
            "
          >
            <Icon
              name="lucide:check"
              class="size-3.5"
            />
          </span>
        </span>
      </label>
    </div>
  </fieldset>
</template>
