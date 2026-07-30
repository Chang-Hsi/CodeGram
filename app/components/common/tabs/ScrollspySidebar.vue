<script setup lang="ts">
import type {
  ComponentPublicInstance,
} from 'vue'

interface ScrollspySidebarItem {
  label: string
  value: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    items: ScrollspySidebarItem[]
    ariaLabel?: string
    contentHeight?: string
    sidebarWidth?: string
    offset?: number
    smooth?: boolean
    displayMode?: 'scroll' | 'single'
  }>(),
  {
    modelValue: '',
    ariaLabel: '頁面區段導覽',
    contentHeight: '640px',
    sidebarWidth: '160px',
    offset: 20,
    smooth: true,
    displayMode: 'scroll',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const componentId = useId()

const contentRef = ref<HTMLElement>()

const sectionElements = new Map<
  string,
  HTMLElement
>()

const activeValue = ref(
  props.modelValue
  || props.items.find(item => !item.disabled)?.value
  || '',
)

const visibleEntries = new Map<
  string,
  IntersectionObserverEntry
>()

let observer: IntersectionObserver | null = null
let scrollFrameId: number | null = null

const enabledItems = computed(() => {
  return props.items.filter(
    item => !item.disabled,
  )
})

const activeIndex = computed(() => {
  const index = props.items.findIndex(
    item => item.value === activeValue.value,
  )

  return index >= 0
    ? index
    : 0
})

const activeItem = computed(() => {
  return props.items.find(
    item => item.value === activeValue.value,
  )
})

const navigationDirection = ref<
  'forward' | 'backward'
>('forward')

const updateNavigationDirection = (
  nextValue: string,
) => {
  const currentIndex = props.items.findIndex(
    item => item.value === activeValue.value,
  )

  const nextIndex = props.items.findIndex(
    item => item.value === nextValue,
  )

  if (currentIndex < 0 || nextIndex < 0) {
    return
  }

  navigationDirection.value
    = nextIndex >= currentIndex
      ? 'forward'
      : 'backward'
}

const indicatorStyle = computed(() => {
  return {
    transform: `translateY(${activeIndex.value * 40}px)`,
  }
})

const normalizeIdPart = (
  value: string,
) => {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const getSectionId = (
  value: string,
) => {
  const normalizedValue = normalizeIdPart(value)

  return `${componentId}-${normalizedValue || 'section'}`
}

const setSectionRef = (
  value: string,
  element:
    | Element
    | ComponentPublicInstance
    | null,
) => {
  if (element instanceof HTMLElement) {
    sectionElements.set(value, element)

    return
  }

  sectionElements.delete(value)
}

const updateActiveValue = (
  value: string,
) => {
  if (
    !value
    || activeValue.value === value
  ) {
    return
  }

  activeValue.value = value

  emit('update:modelValue', value)
  emit('change', value)
}

const getActiveSectionFromPosition = () => {
  const container = contentRef.value

  if (!container) {
    return null
  }

  const containerTop
    = container.getBoundingClientRect().top

  const activationTop
    = containerTop + props.offset

  let activeSection
    = enabledItems.value[0]?.value || null

  for (const item of enabledItems.value) {
    const section
      = sectionElements.get(item.value)

    if (!section) {
      continue
    }

    const sectionTop
      = section.getBoundingClientRect().top

    if (sectionTop <= activationTop + 1) {
      activeSection = item.value

      continue
    }

    break
  }

  /*
   * 捲動到底部時，最後一個區段可能因為內容高度不足，
   * 無法剛好碰到 activationTop。
   */
  const isAtBottom
    = Math.ceil(
      container.scrollTop
      + container.clientHeight,
    ) >= container.scrollHeight

  if (isAtBottom) {
    activeSection
      = enabledItems.value.at(-1)?.value
      || activeSection
  }

  return activeSection
}

const updateActiveByPosition = () => {
  const activeSection
    = getActiveSectionFromPosition()

  if (activeSection) {
    updateActiveValue(activeSection)
  }
}

const schedulePositionUpdate = () => {
  if (scrollFrameId !== null) {
    cancelAnimationFrame(scrollFrameId)
  }

  scrollFrameId = requestAnimationFrame(() => {
    updateActiveByPosition()
    scrollFrameId = null
  })
}

const handleContentScroll = () => {
  if (props.displayMode === 'scroll') {
    schedulePositionUpdate()
  }
}

const selectMostVisibleSection = () => {
  const container = contentRef.value

  if (!container || !visibleEntries.size) {
    return
  }

  const containerTop
    = container.getBoundingClientRect().top

  const activationTop
    = containerTop + props.offset

  const closestEntry = Array.from(
    visibleEntries.entries(),
  )
    .sort(([, firstEntry], [, secondEntry]) => {
      const firstDistance = Math.abs(
        firstEntry.boundingClientRect.top
        - activationTop,
      )

      const secondDistance = Math.abs(
        secondEntry.boundingClientRect.top
        - activationTop,
      )

      return firstDistance - secondDistance
    })
    .at(0)

  if (closestEntry) {
    updateActiveValue(closestEntry[0])
  }
}

const createObserver = () => {
  observer?.disconnect()
  visibleEntries.clear()

  if (
    props.displayMode === 'single'
    ||
    !import.meta.client
    || !contentRef.value
  ) {
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const sectionValue = (
          entry.target as HTMLElement
        ).dataset.scrollspySection

        if (!sectionValue) {
          continue
        }

        if (entry.isIntersecting) {
          visibleEntries.set(
            sectionValue,
            entry,
          )
        } else {
          visibleEntries.delete(
            sectionValue,
          )
        }
      }

      selectMostVisibleSection()
    },
    {
      root: contentRef.value,
      rootMargin:
        `-${props.offset}px 0px -60% 0px`,
      threshold: [
        0,
        0.01,
        0.25,
        0.5,
        0.75,
        1,
      ],
    },
  )

  for (const item of enabledItems.value) {
    const section
      = sectionElements.get(item.value)

    if (section) {
      observer.observe(section)
    }
  }
}

const scrollToSection = (
  item: ScrollspySidebarItem,
) => {
  if (item.disabled) {
    return
  }

  const container = contentRef.value

  if (props.displayMode === 'single') {
    updateNavigationDirection(item.value)
    updateActiveValue(item.value)

    container?.scrollTo({
      top: 0,
      behavior: 'auto',
    })

    return
  }

  const section = sectionElements.get(
    item.value,
  )

  if (!container || !section) {
    return
  }

  updateActiveValue(item.value)

  const containerRect
    = container.getBoundingClientRect()

  const sectionRect
    = section.getBoundingClientRect()

  const targetTop
    = container.scrollTop
    + sectionRect.top
    - containerRect.top
    - props.offset

  container.scrollTo({
    top: Math.max(0, targetTop),
    behavior: props.smooth
      ? 'smooth'
      : 'auto',
  })
}

watch(
  () => props.modelValue,
  (value) => {
    if (
      value
      && props.items.some(
        item => item.value === value,
      )
    ) {
      updateNavigationDirection(value)
      activeValue.value = value
    }
  },
)

watch(
  () => props.items,
  async () => {
    await nextTick()

    const activeItemExists
      = props.items.some(
        item => (
          item.value === activeValue.value
          && !item.disabled
        ),
      )

    if (!activeItemExists) {
      activeValue.value
        = enabledItems.value[0]?.value
        || ''
    }

    createObserver()

    if (props.displayMode === 'scroll') {
      updateActiveByPosition()
    }
  },
  {
    deep: true,
  },
)

onMounted(async () => {
  await nextTick()

  createObserver()

  if (props.displayMode === 'scroll') {
    updateActiveByPosition()
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()

  if (scrollFrameId !== null) {
    cancelAnimationFrame(scrollFrameId)
  }
})
</script>

<template>
  <div
    class="flex min-h-0 min-w-0 items-start gap-5 overflow-hidden sm:gap-7"
    :style="{
      height: contentHeight,
    }"
  >
    <!-- Sidebar -->
    <aside
      class="relative h-full shrink-0 overflow-y-auto overscroll-contain"
      :style="{
        width: sidebarWidth,
        scrollbarGutter: 'stable',
      }"
    >
      <nav
        :aria-label="ariaLabel"
        class="relative border-r border-slate-200"
      >
        <!--
          右側滑動指示線。
          每個 nav item 高度固定為 40px，
          所以可直接根據 activeIndex 移動。
        -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute right-[-1px] top-0 flex h-10 w-px items-center transition-transform duration-100 ease-out"
          :style="indicatorStyle"
        >
          <span
            class="block h-6 w-[2px] rounded-full bg-neutral-600"
          />
        </div>

        <button
          v-for="item in items"
          :key="item.value"
          type="button"
          :disabled="item.disabled"
          :aria-current="
            activeValue === item.value
              ? 'location'
              : undefined
          "
          class="block h-10 w-full truncate pr-4 text-left text-sm transition-colors ml-3"
          :class="[
            activeValue === item.value
              ? 'font-semibold text-neutral-600'
              : 'font-medium text-slate-500 hover:text-slate-950',
            item.disabled
              ? 'cursor-not-allowed opacity-40'
              : 'cursor-pointer',
          ]"
          @click="scrollToSection(item)"
        >
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <!-- 右側頁面 -->
    <div
      ref="contentRef"
      class="h-full min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pr-2"
      :style="{
        scrollbarGutter: 'stable',
      }"
      @scroll.passive="handleContentScroll"
    >
      <Transition
        v-if="displayMode === 'single'"
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        :enter-from-class="
          navigationDirection === 'forward'
            ? 'translate-y-5 opacity-0'
            : '-translate-y-5 opacity-0'
        "
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        :leave-to-class="
          navigationDirection === 'forward'
            ? '-translate-y-3 opacity-0'
            : 'translate-y-3 opacity-0'
        "
      >
        <section
          v-if="activeItem"
          :id="getSectionId(activeItem.value)"
          :key="activeItem.value"
          :aria-labelledby="
            `${getSectionId(activeItem.value)}-title`
          "
          class="min-h-full"
        >
          <div
            class="flex items-center justify-between gap-4"
          >
            <h2
              :id="
                `${getSectionId(activeItem.value)}-title`
              "
              class="text-xl font-bold text-slate-950"
            >
              {{ activeItem.label }}
            </h2>

            <slot
              name="action"
              :item="activeItem"
              :active="true"
            />
          </div>

          <slot
            :name="activeItem.value"
            :item="activeItem"
            :active="true"
          />
        </section>
      </Transition>

      <div
        v-else
        class="space-y-10"
      >
        <section
          v-for="item in items"
          :id="getSectionId(item.value)"
          :key="item.value"
          :ref="
            element => setSectionRef(
              item.value,
              element,
            )
          "
          :data-scrollspy-section="item.value"
          :aria-labelledby="
            `${getSectionId(item.value)}-title`
          "
          class="scroll-mt-5 border-b border-slate-100 pb-10 last:border-b-0 last:pb-0"
        >
          <div
            class="flex items-center justify-between gap-4"
          >
            <h2
              :id="
                `${getSectionId(item.value)}-title`
              "
              class="text-xl font-bold text-slate-950"
            >
              {{ item.label }}
            </h2>

            <!--
              所有區段共用的 action slot。
              父層可根據 item.value 決定編輯按鈕。
            -->
            <slot
              name="action"
              :item="item"
              :active="
                activeValue === item.value
              "
            />
          </div>

          <!--
            slot 名稱會對應 item.value：
            intro、details、work、education...
          -->
          <slot
            :name="item.value"
            :item="item"
            :active="
              activeValue === item.value
            "
          />
        </section>
      </div>
    </div>
  </div>
</template>
