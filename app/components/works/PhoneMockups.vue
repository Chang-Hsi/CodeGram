<script setup lang="ts">
interface PhoneMockupImage {
  src: string
  alt: string
}

const props = withDefaults(
  defineProps<{
    images: PhoneMockupImage[]
    autoplay?: boolean
    autoplayInterval?: number
  }>(),
  {
    autoplay: false,
    autoplayInterval: 4500,
  },
)

const emit = defineEmits<{
  change: [
    index: number,
    image: PhoneMockupImage,
  ]
}>()

const activeIndex = ref(0)

const isDragging = ref(false)

const dragStartX = ref(0)

const dragOffsetX = ref(0)

let autoplayTimer:
  | ReturnType<typeof setInterval>
  | null = null

const imageCount = computed(
  () => props.images.length,
)

const canNavigate = computed(
  () => imageCount.value > 1,
)

/**
 * 算出每張圖片相對於目前 activeIndex 的位置。
 *
 * 例如 4 張圖片：
 *
 * active = 0
 *
 * index 0 => 0
 * index 1 => 1
 * index 2 => 2
 * index 3 => -1
 *
 * 這樣最後一張就會自然出現在左側。
 */
const getRelativeIndex = (
  index: number,
) => {
  const total =
    imageCount.value

  if (!total) {
    return 0
  }

  let difference =
    index -
    activeIndex.value

  const half =
    total / 2

  if (difference > half) {
    difference -= total
  }

  if (difference < -half) {
    difference += total
  }

  return difference
}

const getPhoneStyle = (
  index: number,
) => {
  const relativeIndex =
    getRelativeIndex(index)

  const absoluteIndex =
    Math.abs(relativeIndex)

  /*
   * 最多只顯示 active 左右各兩台。
   */
  if (absoluteIndex > 2) {
    return {
      opacity: '0',
      pointerEvents: 'none' as const,
      zIndex: '0',
      transform: `
        translate3d(
          ${relativeIndex * 180}px,
          30px,
          0
        )
        scale(0.72)
      `,
    }
  }

  /*
   * 中央手機。
   */
  if (relativeIndex === 0) {
    return {
      opacity: '1',
      zIndex: '30',
      transform: `
        translate3d(
          ${dragOffsetX.value}px,
          0,
          0
        )
        rotate(0deg)
        scale(1)
      `,
    }
  }

  /*
   * 左右第一台。
   */
  if (absoluteIndex === 1) {
    const x =
      relativeIndex * 190 +
      dragOffsetX.value * 0.45

    const rotation =
      relativeIndex > 0
        ? 8
        : -8

    return {
      opacity: '0.82',
      zIndex: '20',
      transform: `
        translate3d(
          ${x}px,
          18px,
          0
        )
        rotate(${rotation}deg)
        scale(0.88)
      `,
    }
  }

  /*
   * 左右第二台。
   */
  const x =
    relativeIndex * 158 +
    dragOffsetX.value * 0.2

  const rotation =
    relativeIndex > 0
      ? 12
      : -12

  return {
    opacity: '0.34',
    zIndex: '10',
    transform: `
      translate3d(
        ${x}px,
        42px,
        0
      )
      rotate(${rotation}deg)
      scale(0.74)
    `,
  }
}

const changeIndex = (
  nextIndex: number,
) => {
  const total =
    imageCount.value

  if (!total) {
    return
  }

  activeIndex.value =
    (nextIndex + total) %
    total

  const activeImage =
    props.images[
      activeIndex.value
    ]

  if (activeImage) {
    emit(
      'change',
      activeIndex.value,
      activeImage,
    )
  }
}

const previous = () => {
  changeIndex(
    activeIndex.value - 1,
  )

  restartAutoplay()
}

const next = () => {
  changeIndex(
    activeIndex.value + 1,
  )

  restartAutoplay()
}

const selectImage = (
  index: number,
) => {
  if (
    index === activeIndex.value
  ) {
    return
  }

  changeIndex(index)

  restartAutoplay()
}

/* -------------------------------------------------------------------------- */
/* Drag / Swipe                                                                */
/* -------------------------------------------------------------------------- */

const handlePointerDown = (
  event: PointerEvent,
) => {
  if (!canNavigate.value) {
    return
  }

  isDragging.value = true

  dragStartX.value =
    event.clientX

  dragOffsetX.value = 0

  const target =
    event.currentTarget as HTMLElement

  target.setPointerCapture(
    event.pointerId,
  )

  stopAutoplay()
}

const handlePointerMove = (
  event: PointerEvent,
) => {
  if (!isDragging.value) {
    return
  }

  const difference =
    event.clientX -
    dragStartX.value

  /*
   * 限制拖曳距離，
   * 避免手機整個被拉離畫面。
   */
  dragOffsetX.value =
    Math.max(
      -110,
      Math.min(
        110,
        difference,
      ),
    )
}

const finishDrag = () => {
  if (!isDragging.value) {
    return
  }

  const threshold = 55

  if (
    dragOffsetX.value <
    -threshold
  ) {
    next()
  } else if (
    dragOffsetX.value >
    threshold
  ) {
    previous()
  }

  isDragging.value = false

  dragOffsetX.value = 0

  restartAutoplay()
}

const handlePointerUp = () => {
  finishDrag()
}

const handlePointerCancel =
  () => {
    isDragging.value = false

    dragOffsetX.value = 0

    restartAutoplay()
  }

/* -------------------------------------------------------------------------- */
/* Keyboard                                                                    */
/* -------------------------------------------------------------------------- */

const handleKeydown = (
  event: KeyboardEvent,
) => {
  if (
    event.key ===
    'ArrowLeft'
  ) {
    event.preventDefault()

    previous()
  }

  if (
    event.key ===
    'ArrowRight'
  ) {
    event.preventDefault()

    next()
  }
}

/* -------------------------------------------------------------------------- */
/* Autoplay                                                                    */
/* -------------------------------------------------------------------------- */

const stopAutoplay = () => {
  if (!autoplayTimer) {
    return
  }

  clearInterval(
    autoplayTimer,
  )

  autoplayTimer = null
}

const startAutoplay = () => {
  stopAutoplay()

  if (
    !props.autoplay ||
    imageCount.value <= 1
  ) {
    return
  }

  autoplayTimer =
    setInterval(() => {
      changeIndex(
        activeIndex.value + 1,
      )
    }, props.autoplayInterval)
}

const restartAutoplay = () => {
  startAutoplay()
}

watch(
  () => props.images.length,
  length => {
    if (!length) {
      activeIndex.value = 0

      stopAutoplay()

      return
    }

    if (
      activeIndex.value >=
      length
    ) {
      activeIndex.value = 0
    }

    restartAutoplay()
  },
)

watch(
  () => [
    props.autoplay,
    props.autoplayInterval,
  ],
  () => {
    restartAutoplay()
  },
)

onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>

<template>
  <section
    v-if="images.length"
    class="phone-mockups relative w-full overflow-hidden"
    role="region"
    aria-roledescription="carousel"
    aria-label="手機畫面展示"
    tabindex="0"
    @keydown="handleKeydown"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <!-- 手機展示區 -->
    <div
      class="relative mx-auto flex h-[570px] w-full max-w-[980px] touch-pan-y select-none items-center justify-center sm:h-[640px]"
      :class="{
        'cursor-grabbing':
          isDragging,
        'cursor-grab':
          !isDragging,
      }"
      @pointerdown="
        handlePointerDown
      "
      @pointermove="
        handlePointerMove
      "
      @pointerup="
        handlePointerUp
      "
      @pointercancel="
        handlePointerCancel
      "
    >
      <div
        v-for="(
          image,
          index
        ) in images"
        :key="`${image.src}-${index}`"
        class="phone-mockups__item absolute left-1/2 top-1/2"
        :class="{
          'phone-mockups__item--dragging':
            isDragging,
        }"
        :style="
          getPhoneStyle(index)
        "
        @click="
          selectImage(index)
        "
      >
        <!-- Phone body -->
        <div
          class="phone-mockups__device relative"
          :class="{
            'phone-mockups__device--active':
              index ===
              activeIndex,
          }"
        >
          <!-- 左側按鍵 -->
          <div
            class="absolute -left-[4px] top-[92px] h-[28px] w-[4px] rounded-l-[3px] bg-[#1b1b1d]"
          />

          <div
            class="absolute -left-[4px] top-[137px] h-[48px] w-[4px] rounded-l-[3px] bg-[#1b1b1d]"
          />

          <div
            class="absolute -left-[4px] top-[195px] h-[48px] w-[4px] rounded-l-[3px] bg-[#1b1b1d]"
          />

          <!-- 右側電源鍵 -->
          <div
            class="absolute -right-[4px] top-[145px] h-[72px] w-[4px] rounded-r-[3px] bg-[#1b1b1d]"
          />

          <!-- 螢幕 -->
          <div
            class="relative h-full w-full overflow-hidden rounded-[43px] bg-black"
          >
            <img
              :src="image.src"
              :alt="image.alt"
              draggable="false"
              class="pointer-events-none h-full w-full select-none object-cover"
            >

            <!-- Dynamic Island -->
            <div
              class="pointer-events-none absolute left-1/2 top-[10px] z-20 h-[25px] w-[79px] -translate-x-1/2 rounded-full bg-black"
            />

            <!-- 螢幕玻璃反光 -->
            <div
              class="phone-mockups__glass pointer-events-none absolute inset-0"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 下方控制區 -->
    <div
      v-if="canNavigate"
      class="relative z-40 -mt-3 flex items-center justify-center gap-4 pb-4"
    >
      <button
        type="button"
        aria-label="上一個畫面"
        class="group flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-300 hover:-translate-x-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        @click="previous"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          class="size-5 transition-transform duration-300 group-hover:-translate-x-0.5"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Indicators -->
      <div
        class="flex items-center gap-2"
      >
        <button
          v-for="(
            image,
            index
          ) in images"
          :key="`indicator-${image.src}-${index}`"
          type="button"
          :aria-label="`前往第 ${index + 1} 個畫面`"
          :aria-current="
            index === activeIndex
              ? 'true'
              : undefined
          "
          class="h-2 rounded-full transition-all duration-300"
          :class="
            index === activeIndex
              ? 'w-7 bg-slate-900'
              : 'w-2 bg-slate-300 hover:bg-slate-400'
          "
          @click="
            selectImage(index)
          "
        />
      </div>

      <button
        type="button"
        aria-label="下一個畫面"
        class="group flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-300 hover:translate-x-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        @click="next"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          class="size-5 transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <path
            d="M9 6L15 12L9 18"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.phone-mockups__item {
  width: 280px;
  height: 570px;

  margin-left: -140px;
  margin-top: -285px;

  transform-origin: center center;

  transition:
    transform 650ms
      cubic-bezier(
        0.22,
        1,
        0.36,
        1
      ),
    opacity 450ms ease;

  will-change:
    transform,
    opacity;
}

.phone-mockups__item--dragging {
  transition:
    opacity 250ms ease;
}

.phone-mockups__device {
  position: relative;

  width: 100%;
  height: 100%;

  padding: 7px;

  border-radius: 50px;

  background:
    linear-gradient(
      145deg,
      #3c3c3f 0%,
      #111113 30%,
      #27272a 62%,
      #080809 100%
    );

  border:
    1px solid
    rgba(
      255,
      255,
      255,
      0.16
    );

  box-shadow:
    0 30px 65px
      rgba(
        15,
        23,
        42,
        0.22
      ),
    inset 0 0 0 1px
      rgba(
        255,
        255,
        255,
        0.04
      );

  transition:
    box-shadow 450ms ease;
}

.phone-mockups__device--active {
  box-shadow:
    0 40px 90px
      rgba(
        15,
        23,
        42,
        0.28
      ),
    0 10px 30px
      rgba(
        15,
        23,
        42,
        0.12
      ),
    inset 0 0 0 1px
      rgba(
        255,
        255,
        255,
        0.06
      );
}

.phone-mockups__glass {
  border-radius: inherit;

  background:
    linear-gradient(
      110deg,
      rgba(
          255,
          255,
          255,
          0.06
        )
        0%,
      transparent 24%,
      transparent 72%,
      rgba(
          255,
          255,
          255,
          0.035
        )
        100%
    );

  box-shadow:
    inset 0 0 0 1px
      rgba(
        255,
        255,
        255,
        0.05
      );
}

@media (
  max-width: 639px
) {
  .phone-mockups__item {
    width: 225px;
    height: 458px;

    margin-left: -112.5px;
    margin-top: -229px;
  }

  .phone-mockups__device {
    border-radius: 42px;
    padding: 6px;
  }

  .phone-mockups__device
    > div:last-child {
    border-radius: 36px;
  }
}

@media (
  prefers-reduced-motion:
    reduce
) {
  .phone-mockups__item,
  .phone-mockups__device {
    transition: none;
  }
}
</style>