<script setup lang="ts">
import type {
  ProfileProject,
  ProjectTechnology,
} from '~/types/profile'

const props = withDefaults(
  defineProps<{
    project: ProfileProject
    speed?: number
    pauseOnHover?: boolean
    minimumItemsPerRow?: number
  }>(),
  {
    speed: 30,
    pauseOnHover: false,
    minimumItemsPerRow: 4,
  },
)

const activeProject = computed(() => {
  return props.project
})

/*
 * 右側圖片 Marquee 資料。
 */
const repeatImages = (
  imageList: string[],
) => {
  if (!imageList.length) {
    return []
  }

  const requiredCount = Math.max(
    props.minimumItemsPerRow,
    imageList.length,
  )

  return Array.from(
    {
      length: requiredCount,
    },
    (_, index) => {
      return imageList[
        index % imageList.length
      ]!
    },
  )
}

const firstRowImages = computed(() => {
  return repeatImages(
    props.project.images,
  )
})

const secondRowImages = computed(() => {
  return repeatImages(
    [...props.project.images].reverse(),
  )
})

/*
 * 左側技術 Logo Carousel。
 *
 * 固定顯示最多 4 格，
 * 每次只替換其中一個 Logo，
 * 避免整排同時跳動。
 */
interface TechnologyLogoSlot {
  slotIndex: number
  revision: number
  technology: ProjectTechnology
}

const logoColumnCount = 4
const logoSlots = ref<
  TechnologyLogoSlot[]
>([])

let logoCarouselTimer:
  | ReturnType<typeof setInterval>
  | null = null

let logoCursor = 0
let logoSwapIndex = 0
let reducedMotionMedia:
  | MediaQueryList
  | null = null

const stopLogoCarousel = () => {
  if (!logoCarouselTimer) {
    return
  }

  clearInterval(logoCarouselTimer)
  logoCarouselTimer = null
}

const resetLogoCarousel = () => {
  const technologies =
    activeProject.value?.technologyLogos ?? []

  if (!technologies.length) {
    logoSlots.value = []
    logoCursor = 0
    logoSwapIndex = 0

    return
  }

  const visibleCount = Math.min(
    logoColumnCount,
    technologies.length,
  )

  logoSlots.value = Array.from(
    {
      length: visibleCount,
    },
    (_, index) => {
      return {
        slotIndex: index,
        revision: 0,
        technology: technologies[index]!,
      }
    },
  )

  logoCursor =
    visibleCount % technologies.length

  logoSwapIndex = 0
}

const advanceLogoCarousel = () => {
  const technologies =
    activeProject.value?.technologyLogos ?? []

  if (
    technologies.length <= logoSlots.value.length
    || !logoSlots.value.length
  ) {
    return
  }

  const slotIndex =
    logoSwapIndex % logoSlots.value.length

  const currentSlot =
    logoSlots.value[slotIndex]

  if (!currentSlot) {
    return
  }

  let nextTechnology =
    technologies[
      logoCursor % technologies.length
    ]

  if (!nextTechnology) {
    return
  }

  /*
   * 避免同一格切換後仍是相同 Logo。
   */
  if (
    nextTechnology.name
      === currentSlot.technology.name
    && technologies.length > 1
  ) {
    logoCursor += 1

    nextTechnology =
      technologies[
        logoCursor % technologies.length
      ]

    if (!nextTechnology) {
      return
    }
  }

  logoSlots.value[slotIndex] = {
    slotIndex,
    revision:
      currentSlot.revision + 1,
    technology: nextTechnology,
  }

  logoCursor += 1
  logoSwapIndex += 1
}

const startLogoCarousel = () => {
  stopLogoCarousel()

  if (
    reducedMotionMedia?.matches
    || (
      activeProject.value
        ?.technologyLogos.length ?? 0
    ) <= logoSlots.value.length
  ) {
    return
  }

  logoCarouselTimer = setInterval(
    advanceLogoCarousel,
    1800,
  )
}

/*
 * 查看來源按鈕亂碼效果。
 */
const actionLabel = '查看來源'

const scrambleCharacters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

const displayedActionLabel = ref(
  actionLabel,
)

const isScrambling = ref(false)

let scrambleTimer:
  | ReturnType<typeof setInterval>
  | null = null

const stopScramble = () => {
  if (!scrambleTimer) {
    return
  }

  clearInterval(scrambleTimer)
  scrambleTimer = null
}

const scrambleActionLabel = () => {
  if (isScrambling.value) {
    return
  }

  stopScramble()

  isScrambling.value = true

  let iteration = 0

  scrambleTimer = setInterval(() => {
    displayedActionLabel.value =
      actionLabel
        .split('')
        .map((character, index) => {
          if (
            character === ' '
            || index < iteration
          ) {
            return actionLabel[index]
          }

          return scrambleCharacters[
            Math.floor(
              Math.random()
              * scrambleCharacters.length,
            )
          ]
        })
        .join('')

    iteration += 1 / 3

    if (
      iteration < actionLabel.length
    ) {
      return
    }

    stopScramble()

    displayedActionLabel.value =
      actionLabel

    isScrambling.value = false
  }, 30)
}

watch(
  () => props.project,
  async () => {
    stopLogoCarousel()
    stopScramble()

    displayedActionLabel.value =
      actionLabel

    isScrambling.value = false

    await nextTick()

    resetLogoCarousel()
    startLogoCarousel()
  },
  {
    deep: true,
  },
)

onMounted(() => {
  reducedMotionMedia =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

  resetLogoCarousel()
  startLogoCarousel()
})

onBeforeUnmount(() => {
  stopLogoCarousel()
  stopScramble()
})
</script>

<template>
  <section
    class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <div
      class="grid min-h-[540px] items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[minmax(300px,0.86fr)_minmax(0,1.14fr)] lg:gap-14 lg:px-16 lg:py-20"
    >
      <!-- 左側專案資料 -->
      <Transition
        mode="out-in"
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <div
          v-if="activeProject"
          :key="activeProject.id"
          class="relative z-10"
        >
          <!-- 專案名稱 -->
          <h1
            class="max-w-[500px] text-4xl font-bold leading-[1.16] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[54px]"
          >
            {{ activeProject.name }}
          </h1>

          <!-- 專案說明 -->
          <p
            class="mt-6 max-w-[480px] text-sm leading-7 text-slate-500 sm:text-base"
          >
            {{ activeProject.description }}
          </p>

          <!-- 技術棧 Logo Carousel -->
          <div class="mt-7">
            <p
              class="text-xs font-bold tracking-[0.18em] text-slate-400"
            >
              TECH STACK
            </p>

            <div
              v-if="logoSlots.length"
              class="mt-3 grid max-w-[360px] gap-3"
              :style="{
                gridTemplateColumns:
                  `repeat(${logoSlots.length}, minmax(0, 1fr))`,
              }"
              aria-label="專案使用技術"
            >
              <div
                v-for="slot in logoSlots"
                :key="slot.slotIndex"
                class="relative flex h-16 min-w-0 items-center justify-center overflow-hidden "
                :title="slot.technology.name"
              >
                <Transition
                  name="logo-swap"
                  mode="out-in"
                >
                  <div
                    :key="
                      `${activeProject.id}-${slot.slotIndex}-${slot.revision}-${slot.technology.name}`
                    "
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <Icon
                      :name="slot.technology.icon"
                      class="size-8"
                    />

                    <span class="sr-only">
                      {{ slot.technology.name }}
                    </span>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- 查看來源 -->
          <a
            :href="activeProject.url"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-7 inline-flex min-w-[148px] items-center justify-center gap-2 rounded-full bg-slate-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            @mouseenter="scrambleActionLabel"
            @focus="scrambleActionLabel"
          >
            <span class="whitespace-nowrap">
              {{ displayedActionLabel }}
            </span>

            <Icon
              name="lucide:arrow-up-right"
              class="size-4"
            />
          </a>
        </div>
      </Transition>

      <!-- 右側雙排專案圖片 Marquee -->
      <div
        v-if="project.images.length"
        class="min-w-0 space-y-4 overflow-hidden"
      >
        <!-- 第一排：反向 -->
        <div
          class="marquee-row"
          :class="{
            'pause-on-hover': pauseOnHover,
          }"
        >
          <div
            class="marquee-track marquee-reverse"
            :style="{
              '--marquee-duration': `${speed}s`,
            }"
          >
            <div
              v-for="copyIndex in 2"
              :key="`first-copy-${copyIndex}`"
              class="marquee-sequence"
              :aria-hidden="
                copyIndex === 2
                  ? 'true'
                  : undefined
              "
            >
              <a
                v-for="(imageUrl, index) in firstRowImages"
                :key="`first-${copyIndex}-${imageUrl}-${index}`"
                :href="project.url"
                target="_blank"
                rel="noopener noreferrer"
                :tabindex="
                  copyIndex === 2
                    ? -1
                    : 0
                "
                :title="`查看 ${project.name} 專案`"
                :aria-label="`查看 ${project.name} 專案圖片 ${index + 1}`"
                class="project-tile group relative size-40 shrink-0 overflow-hidden rounded-2xl bg-slate-100 text-left outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 sm:size-44 lg:size-48"
              >
                <img
                  :src="imageUrl"
                  :alt="`${project.name} 專案畫面 ${index + 1}`"
                  class="size-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                >

                <div
                  class="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent px-4 pb-3 pt-10 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                >
                  <p
                    class="truncate text-sm font-semibold text-white"
                  >
                    {{ project.name }}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- 第二排：正向 -->
        <div
          class="marquee-row"
          :class="{
            'pause-on-hover': pauseOnHover,
          }"
        >
          <div
            class="marquee-track"
            :style="{
              '--marquee-duration': `${speed}s`,
            }"
          >
            <div
              v-for="copyIndex in 2"
              :key="`second-copy-${copyIndex}`"
              class="marquee-sequence"
              :aria-hidden="
                copyIndex === 2
                  ? 'true'
                  : undefined
              "
            >
              <a
                v-for="(imageUrl, index) in secondRowImages"
                :key="`second-${copyIndex}-${imageUrl}-${index}`"
                :href="project.url"
                target="_blank"
                rel="noopener noreferrer"
                :tabindex="
                  copyIndex === 2
                    ? -1
                    : 0
                "
                :title="`查看 ${project.name} 專案`"
                :aria-label="`查看 ${project.name} 專案圖片 ${index + 1}`"
                class="project-tile group relative size-40 shrink-0 overflow-hidden rounded-2xl bg-slate-100 text-left outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 sm:size-44 lg:size-48"
              >
                <img
                  :src="imageUrl"
                  :alt="`${project.name} 專案畫面 ${index + 1}`"
                  class="size-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                >

                <div
                  class="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent px-4 pb-3 pt-10 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                >
                  <p
                    class="truncate text-sm font-semibold text-white"
                  >
                    {{ project.name }}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee-row {
  display: flex;
  overflow: hidden;
  gap: 1rem;
}

.marquee-track {
  display: flex;
  width: max-content;
  flex-shrink: 0;
  animation:
    cta-marquee
    var(--marquee-duration)
    linear
    infinite;
  will-change: transform;
}

.marquee-reverse {
  animation-direction: reverse;
}

.marquee-sequence {
  display: flex;
  min-width: max-content;
  flex-shrink: 0;
  align-items: center;
  gap: 1rem;
  padding-right: 1rem;
}

.pause-on-hover:hover .marquee-track {
  animation-play-state: paused;
}

.project-tile {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.logo-swap-enter-active,
.logo-swap-leave-active {
  transition:
    opacity 320ms ease,
    transform 320ms ease;
}

.logo-swap-enter-from {
  opacity: 0;
  transform:
    translateY(14px)
    scale(0.86);
}

.logo-swap-leave-to {
  opacity: 0;
  transform:
    translateY(-14px)
    scale(0.86);
}

@keyframes cta-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation-play-state: paused;
  }

  .project-tile img,
  .logo-swap-enter-active,
  .logo-swap-leave-active {
    transition: none;
  }
}
</style>
