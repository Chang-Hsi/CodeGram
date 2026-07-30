<script setup lang="ts">
import type { CSSProperties } from 'vue'

export interface AnimatedTestimonialItem {
  id: string | number
  name: string
  imageUrl: string
  subtitle?: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    items: AnimatedTestimonialItem[]
    autoplay?: boolean
    autoplayInterval?: number
  }>(),
  {
    autoplay: false,
    autoplayInterval: 5000,
  },
)

const emit = defineEmits<{
  change: [
    item: AnimatedTestimonialItem,
    index: number,
  ]
}>()

const activeIndex = ref(0)
const direction = ref<'next' | 'previous'>('next')

let autoplayTimer: ReturnType<typeof setInterval> | null =
  null

const activeItem = computed(() => {
  return props.items[activeIndex.value] ?? null
})

const canNavigate = computed(() => {
  return props.items.length > 1
})

/*
 * 使用固定角度而不是 Math.random()，
 * 避免 Nuxt SSR 與瀏覽器 hydration 時產生不同結果。
 */
const imageRotations = [
  -8,
  6,
  -5,
  9,
  -7,
  4,
  -3,
  8,
]

const getRotation = (index: number) => {
  return imageRotations[
    index % imageRotations.length
  ] ?? 0
}

const getRelativePosition = (index: number) => {
  if (!props.items.length) {
    return 0
  }

  return (
    index -
    activeIndex.value +
    props.items.length
  ) % props.items.length
}

const getImageStyle = (
  index: number,
): CSSProperties => {
  const relativePosition =
    getRelativePosition(index)

  if (relativePosition === 0) {
    return {
      zIndex: props.items.length + 10,
      opacity: 1,
      filter: 'blur(0px)',
      transform:
        'translate3d(0, 0, 0) rotate(0deg) scale(1)',
    }
  }

  const visibleDepth = Math.min(
    relativePosition,
    3,
  )

  const isVisible = relativePosition <= 3

  return {
    zIndex:
      props.items.length - visibleDepth,
    opacity: isVisible
      ? Math.max(
          0.28,
          0.72 - visibleDepth * 0.12,
        )
      : 0,
    filter:
      visibleDepth >= 3
        ? 'blur(1px)'
        : 'blur(0px)',
    transform: `
      translate3d(
        ${visibleDepth * 5}px,
        ${visibleDepth * 8}px,
        ${visibleDepth * -45}px
      )
      rotate(${getRotation(index)}deg)
      scale(${1 - visibleDepth * 0.035})
    `,
  }
}

const splitAnimatedText = (text: string) => {
  /*
   * 中文以字元拆分。
   * 英文則保留空白並以單字拆分。
   */
  const containsChinese =
    /[\u3400-\u9fff]/u.test(text)

  if (containsChinese) {
    return Array.from(text)
  }

  return text
    .split(/(\s+)/)
    .filter(segment => segment.length > 0)
}

const setActiveIndex = (
  nextIndex: number,
  nextDirection: 'next' | 'previous',
) => {
  if (!props.items.length) {
    return
  }

  direction.value = nextDirection
  activeIndex.value =
    (nextIndex + props.items.length) %
    props.items.length

  const item = props.items[activeIndex.value]

  if (item) {
    emit(
      'change',
      item,
      activeIndex.value,
    )
  }
}

const stopAutoplay = () => {
  if (!autoplayTimer) {
    return
  }

  clearInterval(autoplayTimer)
  autoplayTimer = null
}

const startAutoplay = () => {
  stopAutoplay()

  if (
    !props.autoplay ||
    props.items.length <= 1
  ) {
    return
  }

  autoplayTimer = setInterval(() => {
    setActiveIndex(
      activeIndex.value + 1,
      'next',
    )
  }, props.autoplayInterval)
}

const restartAutoplay = () => {
  startAutoplay()
}

const handlePrevious = () => {
  setActiveIndex(
    activeIndex.value - 1,
    'previous',
  )

  restartAutoplay()
}

const handleNext = () => {
  setActiveIndex(
    activeIndex.value + 1,
    'next',
  )

  restartAutoplay()
}

const handleKeydown = (
  event: KeyboardEvent,
) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    handlePrevious()
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    handleNext()
  }
}

watch(
  () => props.items.length,
  itemCount => {
    if (!itemCount) {
      activeIndex.value = 0
      stopAutoplay()
      return
    }

    if (activeIndex.value >= itemCount) {
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
    v-if="activeItem"
    class="animated-testimonials"
    tabindex="0"
    aria-roledescription="carousel"
    :aria-label="`${activeItem.name}的資料`"
    @keydown="handleKeydown"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div
      class="grid min-w-0 grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
    >
      <!-- 左側：重疊照片 -->
      <div class="min-w-0">
        <div
          class="relative mx-auto h-[300px] w-full max-w-[360px] [perspective:1000px] sm:h-[340px] md:mx-0"
        >
          <div
            v-for="(item, index) in items"
            :key="item.id"
            class="animated-testimonials__image absolute inset-0 origin-bottom"
            :class="{
              'animated-testimonials__image--active':
                index === activeIndex,
            }"
            :style="getImageStyle(index)"
            :aria-hidden="
              index !== activeIndex
            "
          >
            <img
              :src="item.imageUrl"
              :alt="item.name"
              :draggable="false"
              class="h-full w-full select-none rounded-[28px] object-cover object-center shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
            >
          </div>
        </div>
      </div>

      <!-- 右側：邀請內容 -->
      <div
        class="flex min-h-[260px] min-w-0 flex-col justify-between py-1"
      >
        <Transition
          :name="
            direction === 'next'
              ? 'testimonial-next'
              : 'testimonial-previous'
          "
          mode="out-in"
        >
          <div
            :key="activeItem.id"
            aria-live="polite"
          >
            <h3
              class="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              {{ activeItem.name }}
            </h3>

            <p
              v-if="activeItem.subtitle"
              class="mt-1 text-sm font-medium text-slate-500"
            >
              {{ activeItem.subtitle }}
            </p>

            <p
              v-if="activeItem.description"
              class="mt-6 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8"
            >
              <span
                v-for="(
                  segment,
                  segmentIndex
                ) in splitAnimatedText(
                  activeItem.description,
                )"
                :key="`${activeItem.id}-${segmentIndex}`"
                class="animated-testimonials__word inline-block whitespace-pre"
                :style="{
                  animationDelay: `${
                    segmentIndex * 18
                  }ms`,
                }"
              >
                {{ segment }}
              </span>
            </p>

            <div class="mt-7">
              <slot
                name="actions"
                :item="activeItem"
                :index="activeIndex"
              />
            </div>
          </div>
        </Transition>

        <div
          v-if="canNavigate"
          class="mt-8 flex items-center gap-3"
        >
          <button
            type="button"
            aria-label="上一個"
            class="group flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            @click="handlePrevious"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              class="size-5 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-rotate-6"
            >
              <path
                d="M19 12H5M11 18L5 12L11 6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            aria-label="下一個"
            class="group flex size-10 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            @click="handleNext"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              class="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-6"
            >
              <path
                d="M5 12H19M13 6L19 12L13 18"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <span
            class="ml-1 text-sm tabular-nums text-slate-400"
          >
            {{ activeIndex + 1 }}
            /
            {{ items.length }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animated-testimonials {
  outline: none;
}

.animated-testimonials__image {
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition:
    transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 360ms ease,
    filter 360ms ease;
}

.animated-testimonials__image--active {
  animation:
    animated-testimonials-image-pop
    560ms
    cubic-bezier(0.22, 1, 0.36, 1)
    both;
}

.animated-testimonials__word {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(5px);
  animation:
    animated-testimonials-word-reveal
    280ms
    ease-out
    forwards;
}

.testimonial-next-enter-active,
.testimonial-next-leave-active,
.testimonial-previous-enter-active,
.testimonial-previous-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.testimonial-next-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

.testimonial-next-leave-to {
  opacity: 0;
  transform: translateY(-18px);
}

.testimonial-previous-enter-from {
  opacity: 0;
  transform: translateY(-18px);
}

.testimonial-previous-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

@keyframes animated-testimonials-image-pop {
  0% {
    opacity: 0.72;
    transform:
      translate3d(0, 8px, -45px)
      rotate(-5deg)
      scale(0.96);
  }

  48% {
    opacity: 1;
    transform:
      translate3d(0, -26px, 0)
      rotate(0deg)
      scale(1);
  }

  100% {
    opacity: 1;
    transform:
      translate3d(0, 0, 0)
      rotate(0deg)
      scale(1);
  }
}

@keyframes animated-testimonials-word-reveal {
  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-testimonials__image,
  .testimonial-next-enter-active,
  .testimonial-next-leave-active,
  .testimonial-previous-enter-active,
  .testimonial-previous-leave-active {
    transition: none;
  }

  .animated-testimonials__image--active,
  .animated-testimonials__word {
    animation: none;
    opacity: 1;
    filter: none;
    transform: none;
  }
}
</style>