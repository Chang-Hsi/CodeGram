<script
  setup
  lang="ts"
  generic="T extends string"
>
import type {
  ComponentPublicInstance,
  CSSProperties,
} from 'vue'

defineOptions({
  inheritAttrs: false,
})

interface VercelTab<TValue extends string> {
  label: string
  value: TValue
  icon?: string
  disabled?: boolean
}

interface IndicatorPosition {
  left: number
  width: number
}

const props = withDefaults(
  defineProps<{
    modelValue: T
    tabs: readonly VercelTab<T>[]
    ariaLabel?: string
    iconOnly?: boolean
    iconSize?: number
    appearance?: 'default' | 'navigation'
  }>(),
  {
    ariaLabel: '內容分頁',
    iconOnly: false,
    iconSize: 20,
    appearance: 'default',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T]
}>()

const tabListRef = ref<HTMLElement>()
const tabButtonRefs = ref<Array<HTMLButtonElement | null>>([])

const hoveredTabIndex = ref<number | null>(null)

const selectedIndicator = ref<IndicatorPosition>({
  left: 0,
  width: 0,
})

const hoverIndicator = ref<IndicatorPosition>({
  left: 0,
  width: 0,
})

const tabGroupId = `vercel-tabs-${Math.random()
  .toString(36)
  .slice(2, 9)}`

let resizeObserver: ResizeObserver | undefined

const selectedTabIndex = computed(() => {
  return props.tabs.findIndex((tab) => {
    return tab.value === props.modelValue
  })
})

const selectedIndicatorStyle = computed<CSSProperties>(() => {
  return {
    width: `${selectedIndicator.value.width}px`,
    transform: `translate3d(${selectedIndicator.value.left}px, 0, 0)`,
    opacity: selectedTabIndex.value >= 0 ? 1 : 0,
  }
})

const hoverIndicatorStyle = computed<CSSProperties>(() => {
  return {
    width: `${hoverIndicator.value.width}px`,
    transform: `translate3d(${hoverIndicator.value.left}px, 0, 0)`,
    opacity: hoveredTabIndex.value === null ? 0 : 1,
  }
})

const getTabId = (index: number) => {
  return `${tabGroupId}-tab-${index}`
}

const setTabButtonRef = (
  element: Element | ComponentPublicInstance | null,
  index: number,
) => {
  tabButtonRefs.value[index] =
    element instanceof HTMLButtonElement
      ? element
      : null
}

const readButtonPosition = (
  button: HTMLButtonElement | null | undefined,
): IndicatorPosition | null => {
  if (!button) {
    return null
  }

  return {
    left: button.offsetLeft,
    width: button.offsetWidth,
  }
}

const updateSelectedIndicator = () => {
  const position = readButtonPosition(
    tabButtonRefs.value[selectedTabIndex.value],
  )

  if (!position) {
    selectedIndicator.value = {
      left: 0,
      width: 0,
    }

    return
  }

  selectedIndicator.value = position
}

const updateHoverIndicator = (index: number) => {
  const position = readButtonPosition(
    tabButtonRefs.value[index],
  )

  if (!position) {
    return
  }

  hoverIndicator.value = position
}

const selectTab = (index: number) => {
  const tab = props.tabs[index]

  if (!tab || tab.disabled) {
    return
  }

  if (tab.value !== props.modelValue) {
    emit('update:modelValue', tab.value)
    emit('change', tab.value)
  }
}

const handlePointerEnter = (index: number) => {
  if (props.tabs[index]?.disabled) {
    return
  }

  hoveredTabIndex.value = index
  updateHoverIndicator(index)
}

const handlePointerLeave = () => {
  hoveredTabIndex.value = null
}

const handleFocus = (index: number) => {
  if (props.tabs[index]?.disabled) {
    return
  }

  hoveredTabIndex.value = index
  updateHoverIndicator(index)
}

const handleBlur = (event: FocusEvent) => {
  const nextFocusedElement = event.relatedTarget

  if (
    nextFocusedElement instanceof Node
    && tabListRef.value?.contains(nextFocusedElement)
  ) {
    return
  }

  hoveredTabIndex.value = null
}

const findNextEnabledIndex = (
  currentIndex: number,
  direction: 1 | -1,
) => {
  if (!props.tabs.length) {
    return -1
  }

  let nextIndex = currentIndex

  for (
    let checkedCount = 0;
    checkedCount < props.tabs.length;
    checkedCount += 1
  ) {
    nextIndex =
      (nextIndex + direction + props.tabs.length)
      % props.tabs.length

    if (!props.tabs[nextIndex]?.disabled) {
      return nextIndex
    }
  }

  return -1
}

const findEdgeEnabledIndex = (
  direction: 1 | -1,
) => {
  const startIndex =
    direction === 1
      ? 0
      : props.tabs.length - 1

  const endIndex =
    direction === 1
      ? props.tabs.length
      : -1

  for (
    let index = startIndex;
    index !== endIndex;
    index += direction
  ) {
    if (!props.tabs[index]?.disabled) {
      return index
    }
  }

  return -1
}

const focusAndSelectTab = async (index: number) => {
  if (index < 0) {
    return
  }

  selectTab(index)

  await nextTick()

  tabButtonRefs.value[index]?.focus()
}

const handleKeydown = (
  event: KeyboardEvent,
  currentIndex: number,
) => {
  let nextIndex = -1

  switch (event.key) {
    case 'ArrowRight':
      nextIndex = findNextEnabledIndex(currentIndex, 1)
      break

    case 'ArrowLeft':
      nextIndex = findNextEnabledIndex(currentIndex, -1)
      break

    case 'Home':
      nextIndex = findEdgeEnabledIndex(1)
      break

    case 'End':
      nextIndex = findEdgeEnabledIndex(-1)
      break

    default:
      return
  }

  event.preventDefault()
  void focusAndSelectTab(nextIndex)
}

const updateIndicators = async () => {
  await nextTick()

  updateSelectedIndicator()

  if (hoveredTabIndex.value !== null) {
    updateHoverIndicator(hoveredTabIndex.value)
  }
}

watch(
  () => props.modelValue,
  () => {
    void updateIndicators()
  },
)

watch(
  () => props.tabs,
  () => {
    tabButtonRefs.value.length = props.tabs.length
    void updateIndicators()
  },
  {
    deep: true,
  },
)

onMounted(() => {
  void updateIndicators()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      void updateIndicators()
    })

    if (tabListRef.value) {
      resizeObserver.observe(tabListRef.value)
    }
  }

  window.addEventListener('resize', updateIndicators)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateIndicators)
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="vercel-tabs min-w-0"
  >
    <div class="vercel-tabs__scroller overflow-x-auto">
      <div
        ref="tabListRef"
        role="tablist"
        :aria-label="ariaLabel"
        class="relative flex min-w-max items-center border-b border-slate-200"
        @pointerleave="handlePointerLeave"
      >
        <!-- Hover 時滑動的淺色背景 -->
        <span
          aria-hidden="true"
          class="pointer-events-none absolute inset-y-1.5 left-0 rounded-md bg-slate-100 transition-[width,transform,opacity] duration-200 ease-out"
          :style="hoverIndicatorStyle"
        />

        <button
          v-for="(tab, index) in tabs"
          :id="getTabId(index)"
          :ref="(element) => setTabButtonRef(element, index)"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="modelValue === tab.value"
          :disabled="tab.disabled"
          :tabindex="modelValue === tab.value ? 0 : -1"
          :aria-label="
            iconOnly
              ? tab.label
              : undefined
          "
          class="relative z-10 flex shrink-0 items-center justify-center gap-2 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          :class="[
            appearance === 'navigation'
              ? 'h-14 min-w-[82px] flex-1 px-3 sm:min-w-[92px] lg:min-w-0'
              : 'h-12 px-4 sm:px-5',
            modelValue === tab.value
              ? appearance === 'navigation'
                ? 'text-blue-600'
                : 'text-slate-950'
              : 'text-slate-500 hover:text-slate-900',
          ]"
          @click="selectTab(index)"
          @pointerenter="handlePointerEnter(index)"
          @focus="handleFocus(index)"
          @blur="handleBlur"
          @keydown="handleKeydown($event, index)"
        >
          <Icon
            v-if="tab.icon"
            :name="tab.icon"
            class="shrink-0"
            :style="{
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              fontSize: `${iconSize}px`,
            }"
          />

          <span :class="iconOnly ? 'sr-only' : ''">
            {{ tab.label }}
          </span>
        </button>

        <!-- 目前選取分頁的滑動底線 -->
        <span
          aria-hidden="true"
          class="pointer-events-none absolute bottom-[-1px] left-0 z-20 transition-[width,transform,opacity] duration-300 ease-out"
          :class="
            appearance === 'navigation'
              ? 'h-[3px] rounded-full bg-blue-600'
              : 'h-0.5 bg-slate-950'
          "
          :style="selectedIndicatorStyle"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vercel-tabs__scroller {
  scrollbar-width: none;
  overscroll-behavior-inline: contain;
}

.vercel-tabs__scroller::-webkit-scrollbar {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .vercel-tabs * {
    transition-duration: 1ms !important;
  }
}
</style>
