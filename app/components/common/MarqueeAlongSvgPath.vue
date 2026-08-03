<script setup lang="ts">
import type {
  ComponentPublicInstance,
} from 'vue'

export interface MarqueePathItem {
  id: string | number
  label: string
  icon?: string
}

interface RepeatedMarqueePathItem
  extends MarqueePathItem {
  renderKey: string
  isDuplicate: boolean
}

const props = withDefaults(
  defineProps<{
    items: MarqueePathItem[]
    path?: string
    viewBox?: string
    speed?: number
    direction?: 'normal' | 'reverse'
    showPath?: boolean
    pauseOnHover?: boolean
    slowDownFactor?: number
    minimumItemCount?: number
    ariaLabel?: string
  }>(),
  {
    /*
     * 橫向 8 字形路徑。
     * 左右兩側保留空間，避免 Badge 超出容器。
     */
    path: `
      M 70 140
      C 70 45 235 40 360 140
      C 485 240 650 235 650 140
      C 650 45 485 40 360 140
      C 235 240 70 235 70 140
      Z
    `,
    viewBox: '0 0 720 280',
    speed: 4.5,
    direction: 'normal',
    showPath: true,
    pauseOnHover: true,
    slowDownFactor: 0.18,
    minimumItemCount: 9,
    ariaLabel: '技術能力循環展示',
  },
)

const rootRef = ref<HTMLElement>()
const pathRef = ref<SVGPathElement>()

const itemElements = new Map<
  number,
  HTMLElement
>()

const baseOffset = ref(0)

let animationFrameId: number | null = null
let previousTimestamp = 0
let currentSpeed = props.speed
let targetSpeedMultiplier = 1
let reducedMotionMedia: MediaQueryList | null = null

const parsedViewBox = computed(() => {
  const values = props.viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number)

  const [
    minX = 0,
    minY = 0,
    width = 720,
    height = 280,
  ] = values

  return {
    minX,
    minY,
    width: width || 720,
    height: height || 280,
  }
})

const aspectRatio = computed(() => {
  return (
    parsedViewBox.value.width
    / parsedViewBox.value.height
  )
})

const repeatedItems = computed<
  RepeatedMarqueePathItem[]
>(() => {
  if (!props.items.length) {
    return []
  }

  const requiredCount = Math.max(
    props.minimumItemCount,
    props.items.length,
  )

  return Array.from(
    {
      length: requiredCount,
    },
    (_, index) => {
      const originalItem
        = props.items[
          index % props.items.length
        ]!

      return {
        ...originalItem,
        renderKey: `${originalItem.id}-${index}`,
        isDuplicate:
          index >= props.items.length,
      }
    },
  )
})

const normalizeProgress = (
  value: number,
) => {
  return (
    (value % 100) + 100
  ) % 100
}

const setItemRef = (
  index: number,
  element:
    | Element
    | ComponentPublicInstance
    | null,
) => {
  if (element instanceof HTMLElement) {
    itemElements.set(index, element)

    return
  }

  itemElements.delete(index)
}

const updateItemPositions = () => {
  const svgPath = pathRef.value
  const itemCount = repeatedItems.value.length

  if (!svgPath || !itemCount) {
    return
  }

  const pathLength = svgPath.getTotalLength()

  const {
    minX,
    minY,
    width,
    height,
  } = parsedViewBox.value

  repeatedItems.value.forEach(
    (_, index) => {
      const element = itemElements.get(index)

      if (!element) {
        return
      }

      /*
       * 將所有項目平均分布在 0～100% 的路徑上。
       */
      const distributedPosition
        = (index * 100) / itemCount

      const progress = normalizeProgress(
        baseOffset.value
        + distributedPosition,
      )

      const point = svgPath.getPointAtLength(
        pathLength * (progress / 100),
      )

      const left
        = ((point.x - minX) / width) * 100

      const top
        = ((point.y - minY) / height) * 100

      /*
       * 路徑越靠下代表越靠近觀看者：
       * Badge 稍微放大、提高透明度與 z-index。
       */
      const depth = Math.min(
        1,
        Math.max(
          0,
          (point.y - minY) / height,
        ),
      )

      const scale
        = 0.82 + depth * 0.2

      const opacity
        = 0.58 + depth * 0.42

      const zIndex
        = 10 + Math.round(depth * 30)

      element.style.left = `${left}%`
      element.style.top = `${top}%`
      element.style.opacity = String(opacity)
      element.style.zIndex = String(zIndex)

      element.style.transform = [
        'translate(-50%, -50%)',
        `scale(${scale})`,
      ].join(' ')
    },
  )
}

const animate = (
  timestamp: number,
) => {
  if (!previousTimestamp) {
    previousTimestamp = timestamp
  }

  const elapsedSeconds = Math.min(
    (timestamp - previousTimestamp) / 1000,
    0.05,
  )

  previousTimestamp = timestamp

  const desiredSpeed
    = props.speed
    * targetSpeedMultiplier

  /*
   * 逐漸接近目標速度，
   * 避免滑鼠進出時突然變速。
   */
  const easingStrength = Math.min(
    1,
    elapsedSeconds * 7,
  )

  currentSpeed += (
    desiredSpeed - currentSpeed
  ) * easingStrength

  const directionMultiplier
    = props.direction === 'reverse'
      ? -1
      : 1

  baseOffset.value = normalizeProgress(
    baseOffset.value
    + currentSpeed
      * directionMultiplier
      * elapsedSeconds,
  )

  updateItemPositions()

  animationFrameId = requestAnimationFrame(
    animate,
  )
}

const stopAnimation = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(
      animationFrameId,
    )

    animationFrameId = null
  }
}

const startAnimation = () => {
  stopAnimation()

  previousTimestamp = 0

  if (reducedMotionMedia?.matches) {
    updateItemPositions()

    return
  }

  animationFrameId = requestAnimationFrame(
    animate,
  )
}

const handlePointerEnter = () => {
  if (!props.pauseOnHover) {
    return
  }

  targetSpeedMultiplier
    = props.slowDownFactor
}

const handlePointerLeave = () => {
  targetSpeedMultiplier = 1
}

const handleReducedMotionChange = () => {
  startAnimation()
}

watch(
  () => [
    props.path,
    props.viewBox,
    props.speed,
    props.direction,
  ],
  async () => {
    currentSpeed = props.speed

    await nextTick()

    updateItemPositions()
  },
)

watch(
  repeatedItems,
  async () => {
    itemElements.clear()

    await nextTick()

    updateItemPositions()
  },
)

onMounted(async () => {
  await nextTick()

  reducedMotionMedia = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  )

  reducedMotionMedia.addEventListener(
    'change',
    handleReducedMotionChange,
  )

  updateItemPositions()
  startAnimation()
})

onBeforeUnmount(() => {
  stopAnimation()

  reducedMotionMedia?.removeEventListener(
    'change',
    handleReducedMotionChange,
  )
})
</script>

<template>
  <div
    ref="rootRef"
    class="relative w-full overflow-hidden"
    :style="{
      aspectRatio,
    }"
    role="region"
    :aria-label="ariaLabel"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
  >
    <!-- SVG 路徑 -->
    <svg
      class="pointer-events-none absolute inset-0 size-full overflow-visible"
      :viewBox="viewBox"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref="pathRef"
        :d="path"
        fill="none"
        :stroke="
          showPath
            ? 'currentColor'
            : 'transparent'
        "
        stroke-width="1.2"
        stroke-dasharray="5 7"
        stroke-linecap="round"
        class="text-slate-200"
      />
    </svg>

    <!-- 沿著路徑移動的項目 -->
    <div
      v-for="(item, index) in repeatedItems"
      :key="item.renderKey"
      :ref="
        element => setItemRef(
          index,
          element,
        )
      "
      class="absolute left-0 top-0 will-change-[left,top,transform,opacity]"
      :aria-hidden="
        item.isDuplicate
          ? 'true'
          : undefined
      "
    >
      <slot
        :item="item"
        :index="index"
        :is-duplicate="item.isDuplicate"
      >
        <span
          v-if="item.icon"
          class="inline-flex size-12 items-center justify-center rounded-2xl border border-white/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/70 backdrop-blur transition-transform duration-200 hover:scale-110 sm:size-14"
          :title="item.label"
        >
          <Icon
            :name="item.icon"
            class="size-7 sm:size-8"
            aria-hidden="true"
          />
          <span class="sr-only">{{ item.label }}</span>
        </span>

        <span
          v-else
          class="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm"
        >
          {{ item.label }}
        </span>
      </slot>
    </div>
  </div>
</template>
