<script setup lang="ts">
import type {
  LocationCityOption,
  LocationCountryOption,
} from '~/types/location'

type SelectionStep = 'country' | 'city'
type LocationOption = LocationCountryOption | LocationCityOption

const props = withDefaults(
  defineProps<{
    modelValue?: string
    id: string
    label?: string
    placeholder?: string
    cityPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    required?: boolean
    clearable?: boolean
  }>(),
  {
    modelValue: '',
    label: '所在地',
    placeholder: '搜尋國家或地區',
    cityPlaceholder: '搜尋城市',
    emptyText: '找不到符合的地區',
    disabled: false,
    required: false,
    clearable: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [
    payload: {
      countryCode: string
      country: string
      city: string
      formattedValue: string
    },
  ]
  clear: []
}>()

const rootRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const isOpen = ref(false)
const currentStep = ref<SelectionStep>('country')
const searchQuery = ref('')
const activeIndex = ref(0)
const selectedCityValue = ref('')

const {
  countries,
  cities,
  selectedCountryCode,
  selectedCountry,
  loadingCountries,
  loadingCities,
  loadError,
  initializeCountries,
  selectCountry: loadCitiesForCountry,
  resetLocation,
  clearLoadError,
} = useLocationOptions()

const selectedCity = computed(() => {
  return cities.value.find(
    city => city.value === selectedCityValue.value,
  )
})

const isLoading = computed(() => {
  return currentStep.value === 'country'
    ? loadingCountries.value
    : loadingCities.value
})

const normalizeText = (value: string) => {
  return value.trim().toLocaleLowerCase()
}

const matchesSearch = (
  query: string,
  values: Array<string | undefined>,
) => {
  if (!query) {
    return true
  }

  return values.some((value) => {
    return value
      ? normalizeText(value).includes(query)
      : false
  })
}

const filteredCountries = computed(() => {
  const query = normalizeText(searchQuery.value)

  return countries.value.filter((country) => {
    return matchesSearch(query, [
      country.code,
      country.label,
      country.englishName,
      ...(country.aliases || []),
    ])
  })
})

const filteredCities = computed(() => {
  const query = normalizeText(searchQuery.value)

  return cities.value.filter((city) => {
    return matchesSearch(query, [
      city.label,
      city.value,
      ...(city.aliases || []),
    ])
  })
})

const currentOptions = computed<LocationOption[]>(() => {
  return currentStep.value === 'country'
    ? filteredCountries.value
    : filteredCities.value
})

const formattedValue = computed(() => {
  if (!selectedCountry.value) {
    return ''
  }

  return selectedCity.value
    ? `${selectedCountry.value.label}${selectedCity.value.label}`
    : selectedCountry.value.label
})

const inputValue = computed(() => {
  return isOpen.value
    ? searchQuery.value
    : formattedValue.value
})

const inputPlaceholder = computed(() => {
  return currentStep.value === 'country'
    ? props.placeholder
    : props.cityPlaceholder
})

const listboxId = computed(() => `${props.id}-options`)

const getOptionId = (value: string) => {
  return `${props.id}-option-${value.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

const activeOptionId = computed(() => {
  const option = currentOptions.value[activeIndex.value]

  if (!option) {
    return undefined
  }

  return getOptionId(
    'code' in option ? option.code : option.value,
  )
})

const emitValue = () => {
  const country = selectedCountry.value
  const city = selectedCity.value
  const value = formattedValue.value

  emit('update:modelValue', value)
  emit('change', {
    countryCode: country?.code || '',
    country: country?.label || '',
    city: city?.label || '',
    formattedValue: value,
  })
}

const parseModelValue = async () => {
  const value = props.modelValue.trim()

  if (!value) {
    resetLocation()
    selectedCityValue.value = ''
    currentStep.value = 'country'
    return
  }

  await initializeCountries()

  const country = countries.value.find((item) => {
    const names = [
      item.label,
      item.englishName,
      ...(item.aliases || []),
    ]

    return names.some(name => (
      normalizeText(value).startsWith(normalizeText(name))
    ))
  })

  if (!country) {
    resetLocation()
    selectedCityValue.value = ''
    currentStep.value = 'country'
    return
  }

  if (
    selectedCountryCode.value !== country.code
    || !cities.value.length
  ) {
    await loadCitiesForCountry(country.code)
  }

  currentStep.value = 'city'

  const city = cities.value.find((item) => {
    const names = [item.label, ...(item.aliases || [])]

    return names.some(name => (
      normalizeText(value).includes(normalizeText(name))
    ))
  })

  selectedCityValue.value = city?.value || ''
}

const focusInput = async () => {
  await nextTick()
  inputRef.value?.focus()
}

const openMenu = async () => {
  if (props.disabled) {
    return
  }

  try {
    await initializeCountries()
  } catch {
    // 錯誤狀態會顯示在選單中，讓使用者可以重試。
  }

  isOpen.value = true
  searchQuery.value = ''
  activeIndex.value = 0
  currentStep.value = selectedCountry.value
    ? 'city'
    : 'country'
}

const closeMenu = () => {
  isOpen.value = false
  searchQuery.value = ''
  activeIndex.value = 0
}

const selectCountry = async (
  country: LocationCountryOption,
) => {
  const countryChanged
    = selectedCountryCode.value !== country.code

  if (countryChanged) {
    selectedCityValue.value = ''
  }

  currentStep.value = 'city'
  searchQuery.value = ''
  activeIndex.value = 0

  try {
    await loadCitiesForCountry(country.code)
    emitValue()
    await focusInput()
  } catch {
    // 錯誤狀態會顯示在選單中，讓使用者可以重試。
  }
}

const selectCity = (city: LocationCityOption) => {
  selectedCityValue.value = city.value
  emitValue()
  closeMenu()
}

const goToCountryStep = async () => {
  clearLoadError()
  currentStep.value = 'country'
  searchQuery.value = ''
  activeIndex.value = 0
  await focusInput()
}

const clearSelection = async () => {
  resetLocation()
  selectedCityValue.value = ''
  currentStep.value = 'country'
  searchQuery.value = ''
  activeIndex.value = 0
  isOpen.value = true
  emit('update:modelValue', '')
  emit('clear')
  await focusInput()
}

const retryLoading = async () => {
  try {
    if (currentStep.value === 'country') {
      await initializeCountries()
      return
    }

    if (selectedCountryCode.value) {
      await loadCitiesForCountry(
        selectedCountryCode.value,
      )
    }
  } catch {
    // composable 會保留錯誤，供畫面顯示。
  }
}

const handleInput = (event: Event) => {
  searchQuery.value = (
    event.target as HTMLInputElement
  ).value
  isOpen.value = true
  activeIndex.value = 0
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
    return
  }

  if (
    event.key === 'Backspace'
    && !searchQuery.value
    && currentStep.value === 'city'
  ) {
    event.preventDefault()
    goToCountryStep()
    return
  }

  if (!currentOptions.value.length) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value
      = (activeIndex.value + 1) % currentOptions.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (
      activeIndex.value - 1 + currentOptions.value.length
    ) % currentOptions.value.length
    return
  }

  if (event.key !== 'Enter') {
    return
  }

  event.preventDefault()
  const option = currentOptions.value[activeIndex.value]

  if (!option) {
    return
  }

  if (currentStep.value === 'country' && 'code' in option) {
    selectCountry(option)
  } else if (currentStep.value === 'city' && 'value' in option) {
    selectCity(option)
  }
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target

  if (
    target instanceof Node
    && !rootRef.value?.contains(target)
  ) {
    closeMenu()
  }
}

watch(
  () => props.modelValue,
  () => {
    void parseModelValue().catch(() => undefined)
  },
)

watch(
  [currentStep, searchQuery],
  () => {
    activeIndex.value = 0
  },
)

onMounted(async () => {
  document.addEventListener(
    'pointerdown',
    handleDocumentPointerDown,
  )

  try {
    await initializeCountries()
    await parseModelValue()
  } catch {
    // 錯誤狀態會顯示在選單中，讓使用者可以重試。
  }
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'pointerdown',
    handleDocumentPointerDown,
  )
})

defineExpose({
  focus: focusInput,
  clear: clearSelection,
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
          name="lucide:map-pin"
          class="size-4 shrink-0 text-slate-400"
        />

        <input
          :id="id"
          ref="inputRef"
          :value="inputValue"
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
          @input="handleInput"
          @keydown="handleKeydown"
        >

        <button
          v-if="clearable && modelValue && !disabled"
          type="button"
          aria-label="清除所在地"
          class="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          @mousedown.prevent
          @click="clearSelection"
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
          class="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
        >
          <div
            class="flex items-center gap-2 border-b border-slate-100 px-2 py-2"
          >
            <button
              v-if="currentStep === 'city'"
              type="button"
              aria-label="重新選擇國家或地區"
              class="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              @mousedown.prevent
              @click="goToCountryStep"
            >
              <Icon
                name="lucide:arrow-left"
                class="size-4"
              />
            </button>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-900">
                {{
                  currentStep === 'country'
                    ? '選擇國家或地區'
                    : selectedCountry?.label
                }}
              </p>

              <p class="mt-0.5 text-xs text-slate-400">
                {{
                  currentStep === 'country'
                    ? '請先選擇國家，再選擇城市'
                    : '搜尋並選擇城市'
                }}
              </p>
            </div>

            <span
              class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500"
            >
              {{ currentOptions.length }} 項
            </span>
          </div>

          <div class="max-h-72 overflow-y-auto p-1.5">
            <div
              v-if="isLoading"
              class="flex min-h-28 flex-col items-center justify-center px-4 text-center"
              aria-live="polite"
            >
              <Icon
                name="lucide:loader-circle"
                class="size-6 animate-spin text-blue-500"
              />

              <p class="mt-2 text-sm text-slate-500">
                {{
                  currentStep === 'country'
                    ? '正在載入國家資料'
                    : '正在載入城市資料'
                }}
              </p>
            </div>

            <div
              v-else-if="loadError"
              class="flex min-h-28 flex-col items-center justify-center px-4 text-center"
              role="alert"
            >
              <Icon
                name="lucide:cloud-off"
                class="size-6 text-rose-400"
              />

              <p class="mt-2 text-sm text-slate-600">
                地區資料載入失敗
              </p>

              <button
                type="button"
                class="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                @mousedown.prevent
                @click="retryLoading"
              >
                重新載入
              </button>
            </div>

            <template v-else>
              <button
                v-for="(option, index) in currentOptions"
              :id="
                getOptionId(
                  'code' in option
                    ? option.code
                    : option.value,
                )
              "
              :key="
                'code' in option
                  ? option.code
                  : option.value
              "
              type="button"
              role="option"
              :aria-selected="
                'code' in option
                  ? selectedCountryCode === option.code
                  : selectedCityValue === option.value
              "
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-900 transition"
              :class="
                activeIndex === index
                  ? 'bg-slate-100'
                  : 'hover:bg-slate-50'
              "
              @mousedown.prevent
              @mouseenter="activeIndex = index"
              @click="
                'code' in option
                  ? selectCountry(option)
                  : selectCity(option)
              "
              >
                <span
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100"
                >
                  <Icon
                    v-if="'code' in option"
                    :name="option.flagIcon"
                    mode="svg"
                    class="size-6"
                  />

                  <Icon
                    v-else
                    name="lucide:building-2"
                    class="size-4 text-slate-500"
                  />
                </span>

                <span
                  class="min-w-0 flex-1"
                >
                  <span class="block truncate text-sm font-semibold">
                    {{ option.label }}
                  </span>

                  <span
                    v-if="'code' in option"
                    class="mt-0.5 block truncate text-xs text-slate-500"
                  >
                    {{ option.englishName }}
                  </span>
                </span>

                <Icon
                  :name="
                    (
                      'code' in option
                        ? selectedCountryCode === option.code
                        : selectedCityValue === option.value
                    )
                      ? 'lucide:check'
                      : 'lucide:chevron-right'
                  "
                  class="size-4 shrink-0"
                  :class="
                    (
                      'code' in option
                        ? selectedCountryCode === option.code
                        : selectedCityValue === option.value
                    )
                      ? 'text-blue-600'
                      : 'text-slate-400'
                  "
                />
              </button>
            </template>

            <div
              v-if="
                !isLoading
                && !loadError
                && !currentOptions.length
              "
              class="flex min-h-28 flex-col items-center justify-center px-4 text-center"
            >
              <Icon
                name="lucide:map-pin-off"
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
            <span>↑↓ 移動</span>
            <span>Enter 選擇</span>
            <span>Esc 關閉</span>
          </div>
        </div>
      </Transition>
    </div>

    <div
      v-if="modelValue"
      class="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2"
    >
      <Icon
        name="lucide:map-pin-check"
        class="mt-0.5 size-4 shrink-0 text-blue-600"
      />

      <p class="min-w-0 break-words text-xs leading-5 text-slate-600">
        {{ modelValue }}
      </p>
    </div>
  </div>
</template>
