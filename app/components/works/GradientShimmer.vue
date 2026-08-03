<script setup lang="ts">
import type { CSSProperties } from 'vue'

export interface GradientStop {
  position: number
  color: string
}

export type GradientPresetName =
  | 'sunrise'
  | 'bubble'
  | 'peach'
  | 'tonic'
  | 'mint'
  | 'spring'
  | 'twilight'
  | 'bay'

export type GradientInput =
  | GradientStop[]
  | GradientPresetName

export type EasingPreset =
  | 'smooth'
  | 'gentle'
  | 'snappy'

const props = withDefaults(
  defineProps<{
    as?: string

    gradient?: GradientInput

    /**
     * 一次 shimmer 從左掃到右需要幾秒。
     *
     * 原版是 1.45 秒。
     * 這裡刻意放慢成 2.4 秒。
     */
    duration?: number

    /**
     * shimmer 彩色區域寬度。
     */
    spread?: number

    /**
     * gradient 角度。
     */
    angle?: number

    /**
     * 一次 shimmer 完成後，
     * 保持普通文字多久才進行下一次。
     *
     * 單位 ms。
     */
    pauseBetween?: number

    /**
     * 平常文字顏色。
     *
     * currentColor 代表會繼承：
     * text-slate-950
     * text-black
     * 等 Tailwind class。
     */
    baseColor?: string

    easing?: EasingPreset

    pauseOnScroll?: boolean

    pauseWhenOffscreen?: boolean

    respectReducedMotion?: boolean
  }>(),
  {
    as: 'span',

    gradient: 'sunrise',

    // 修改：原版 1.45，依你的需求放慢
    duration: 2.4,

    spread: 3,

    angle: 105,

    // 修改：shimmer 完成後，黑色停 3 秒
    pauseBetween: 3000,

    baseColor: 'currentColor',

    easing: 'smooth',

    pauseOnScroll: true,

    pauseWhenOffscreen: true,

    respectReducedMotion: true,
  },
)

/* -------------------------------------------------------------------------- */
/* Gradient presets                                                            */
/* -------------------------------------------------------------------------- */

const gradientPresets: Record<
  GradientPresetName,
  GradientStop[]
> = {
  sunrise: [
    {
      color: '#B6D3EF',
      position: 0,
    },
    {
      color: '#CAD1D7',
      position: 0.153,
    },
    {
      color: '#D7CFC8',
      position: 0.252,
    },
    {
      color: '#E1CDB9',
      position: 0.341,
    },
    {
      color: '#EAC6A5',
      position: 0.424,
    },
    {
      color: '#EDB185',
      position: 0.505,
    },
    {
      color: '#EF9B62',
      position: 0.586,
    },
    {
      color: '#F18F60',
      position: 0.669,
    },
    {
      color: '#F48D7A',
      position: 0.758,
    },
    {
      color: '#F78A94',
      position: 0.857,
    },
    {
      color: '#F888A0',
      position: 1,
    },
  ],

  bubble: [
    {
      color: '#F5EBD9',
      position: 0,
    },
    {
      color: '#F2D4DB',
      position: 0.31,
    },
    {
      color: '#EBBDDE',
      position: 0.5,
    },
    {
      color: '#CCBAE3',
      position: 0.65,
    },
    {
      color: '#8CBFF0',
      position: 0.82,
    },
    {
      color: '#78B0FF',
      position: 1,
    },
  ],

  peach: [
    {
      color: '#D9F5FA',
      position: 0,
    },
    {
      color: '#FCD9D6',
      position: 0.31,
    },
    {
      color: '#FCBAC9',
      position: 0.61,
    },
    {
      color: '#F0B3F5',
      position: 1,
    },
  ],

  tonic: [
    {
      color: '#E3EDF0',
      position: 0,
    },
    {
      color: '#E8EBB8',
      position: 0.27,
    },
    {
      color: '#F0DEA3',
      position: 0.43,
    },
    {
      color: '#E8B078',
      position: 0.75,
    },
    {
      color: '#F29682',
      position: 1,
    },
  ],

  mint: [
    {
      color: '#DECEE8',
      position: 0,
    },
    {
      color: '#CBBAEE',
      position: 0.21,
    },
    {
      color: '#7DC0FB',
      position: 0.46,
    },
    {
      color: '#00C7A6',
      position: 1,
    },
  ],

  spring: [
    {
      color: '#F7D5C5',
      position: 0.07,
    },
    {
      color: '#46A8C0',
      position: 0.58,
    },
    {
      color: '#43AE7D',
      position: 1,
    },
  ],

  twilight: [
    {
      color: '#E3CCE6',
      position: 0,
    },
    {
      color: '#4E8CD5',
      position: 0.35,
    },
    {
      color: '#6068C2',
      position: 0.64,
    },
    {
      color: '#38364E',
      position: 1,
    },
  ],

  bay: [
    {
      color: '#DBE3D0',
      position: 0,
    },
    {
      color: '#8DB8A7',
      position: 0.23,
    },
    {
      color: '#2D8E9A',
      position: 0.42,
    },
    {
      color: '#076492',
      position: 0.59,
    },
    {
      color: '#154288',
      position: 0.79,
    },
    {
      color: '#262C81',
      position: 1,
    },
  ],
}

/* -------------------------------------------------------------------------- */
/* Easing                                                                      */
/* -------------------------------------------------------------------------- */

const easingPresets: Record<
  EasingPreset,
  string
> = {
  /**
   * 原版 smooth。
   *
   * 兩側速度較慢，中間正常，
   * 比較像 shimmer 掃過。
   */
  smooth:
    'cubic-bezier(0.45, 0, 0.55, 1)',

  /**
   * 更柔和。
   */
  gentle:
    'cubic-bezier(0.76, 0, 0.24, 1)',

  /**
   * 比較快速。
   */
  snappy:
    'cubic-bezier(0.3, 0, 0.2, 1)',
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const BAND_CORE_RATIO = 0.44

const SPREAD_MID_RATIO = 0.72

const FALLBACK_TEXT_WIDTH_PX = 96

const MAX_SPREAD_PX = 48

const BASE_FONT_PX = 14

const VIEWPORT_ROOT_MARGIN = '160px'

const SCROLL_IDLE_MS = 120

/* -------------------------------------------------------------------------- */
/* State                                                                       */
/* -------------------------------------------------------------------------- */

const shimmerRef =
  ref<HTMLElement | null>(null)

const layerWidth = ref('100%')

const gradientPosition = ref(
  '-9999px center',
)

let animation: Animation | null = null

let pauseTimer:
  | ReturnType<typeof setTimeout>
  | undefined

let scrollTimer:
  | ReturnType<typeof setTimeout>
  | undefined

let intersectionObserver:
  | IntersectionObserver
  | null = null

let mutationObserver:
  | MutationObserver
  | null = null

let isActive = true

let isCancelled = false

/* -------------------------------------------------------------------------- */
/* Computed                                                                    */
/* -------------------------------------------------------------------------- */

const resolvedStops = computed(() => {
  if (
    typeof props.gradient ===
    'string'
  ) {
    return (
      gradientPresets[
        props.gradient
      ] ??
      gradientPresets.sunrise
    )
  }

  return props.gradient
})

const easingValue = computed(() => {
  return (
    easingPresets[
      props.easing
    ] ??
    easingPresets.smooth
  )
})

const safeDuration = computed(() => {
  if (
    !Number.isFinite(
      props.duration,
    )
  ) {
    return 2.4
  }

  return Math.max(
    0.001,
    props.duration,
  )
})

const safeSpread = computed(() => {
  if (
    !Number.isFinite(
      props.spread,
    )
  ) {
    return 3
  }

  return Math.max(
    0,
    props.spread,
  )
})

const safeAngle = computed(() => {
  if (
    !Number.isFinite(
      props.angle,
    )
  ) {
    return 105
  }

  return props.angle
})

/* -------------------------------------------------------------------------- */
/* Gradient builder                                                            */
/* -------------------------------------------------------------------------- */

const buildBandGradient = (
  stops: GradientStop[],
  angle: number,
) => {
  const sortedStops = [
    ...stops,
  ].sort(
    (a, b) =>
      a.position -
      b.position,
  )

  const firstColor =
    sortedStops[0]?.color ??
    'white'

  const lastColor =
    sortedStops[
      sortedStops.length - 1
    ]?.color ?? 'white'

  const core = sortedStops
    .map(stop => {
      const factor =
        (stop.position - 0.5) *
        2 *
        BAND_CORE_RATIO

      return `
        ${stop.color}
        calc(
          50% +
          var(--gs-spread-mid) *
          ${factor.toFixed(4)}
        )
      `
    })
    .join(', ')

  return `
    linear-gradient(
      ${angle}deg,

      var(--gs-base)
      calc(
        50% -
        var(--gs-spread)
      ),

      color-mix(
        in oklab,
        var(--gs-base) 42%,
        ${firstColor}
      )
      calc(
        50% -
        var(--gs-spread-mid)
      ),

      ${core},

      color-mix(
        in oklab,
        var(--gs-base) 42%,
        ${lastColor}
      )
      calc(
        50% +
        var(--gs-spread-mid)
      ),

      var(--gs-base)
      calc(
        50% +
        var(--gs-spread)
      )
    )
  `
}

const backgroundImage = computed(
  () => {
    return buildBandGradient(
      resolvedStops.value,
      safeAngle.value,
    )
  },
)

/* -------------------------------------------------------------------------- */
/* Style                                                                       */
/* -------------------------------------------------------------------------- */

const shimmerStyle =
  computed<CSSProperties>(() => {
    return {
      position: 'relative',

      display: 'inline-block',

      /*
       * 修改重點：
       *
       * 彩色 shimmer 是 background-image。
       */
      backgroundImage:
        backgroundImage.value,

      backgroundRepeat:
        'no-repeat',

      backgroundSize:
        layerWidth.value,

      backgroundPosition:
        gradientPosition.value,

      /*
       * 修改重點：
       *
       * 這個不能少。
       *
       * shimmer gradient 移出文字後，
       * 下面還有 baseColor，
       * 所以文字仍然維持黑色。
       */
      backgroundColor:
        'var(--gs-base)',

      WebkitBackgroundClip:
        'text',

      backgroundClip:
        'text',

      /*
       * 文字本身透明，
       * 讓 background 顯示在文字裡。
       *
       * 但因為上面有 backgroundColor，
       * 所以不會因此消失。
       */
      WebkitTextFillColor:
        'transparent',

      '--gs-base':
        props.baseColor,

      '--gs-spread':
        '24px',

      '--gs-spread-mid':
        `${
          24 *
          SPREAD_MID_RATIO
        }px`,
    } as CSSProperties
  })

/* -------------------------------------------------------------------------- */
/* Capability                                                                  */
/* -------------------------------------------------------------------------- */

const supportsBackgroundClipText =
  () => {
    if (!import.meta.client) {
      return true
    }

    if (
      typeof window.CSS
        ?.supports !==
      'function'
    ) {
      return false
    }

    return (
      window.CSS.supports(
        'background-clip',
        'text',
      ) ||
      window.CSS.supports(
        '-webkit-background-clip',
        'text',
      )
    )
  }

const prefersReducedMotion =
  () => {
    if (!import.meta.client) {
      return false
    }

    return window
      .matchMedia(
        '(prefers-reduced-motion: reduce)',
      )
      .matches
  }

/* -------------------------------------------------------------------------- */
/* Measure                                                                     */
/* -------------------------------------------------------------------------- */

const measure = () => {
  const element =
    shimmerRef.value

  if (!element) {
    return {
      start: 0,
      end: 0,
      durationMs:
        safeDuration.value *
        1000,
    }
  }

  const text =
    element.textContent ?? ''

  const textLength = Math.max(
    Array.from(text).length,
    1,
  )

  const textWidth =
    element.getBoundingClientRect()
      .width ||
    FALLBACK_TEXT_WIDTH_PX

  const fontSize =
    Number.parseFloat(
      window.getComputedStyle(
        element,
      ).fontSize,
    ) || BASE_FONT_PX

  const fontScale =
    fontSize /
    BASE_FONT_PX

  /*
   * 原版：
   *
   * 字越長，
   * shimmer band 可以稍微變寬。
   */
  const spreadPx = Math.min(
    textLength *
      safeSpread.value *
      fontScale,

    MAX_SPREAD_PX *
      fontScale,
  )

  /*
   * gradient layer 只比文字稍微寬一些。
   *
   * 不是上一版的 250%。
   */
  const layerWidthPx =
    Math.max(
      1,

      textWidth +
        spreadPx * 2,
    )

  /*
   * shimmer 的起點：
   *
   * 彩色 band 完全位於文字左邊。
   */
  const start =
    -spreadPx -
    layerWidthPx / 2

  /*
   * shimmer 的終點：
   *
   * 彩色 band 完全離開文字右邊。
   */
  const end =
    textWidth +
    spreadPx -
    layerWidthPx / 2

  const durationMs =
    safeDuration.value *
    1000

  element.style.setProperty(
    '--gs-spread',
    `${spreadPx}px`,
  )

  element.style.setProperty(
    '--gs-spread-mid',
    `${
      spreadPx *
      SPREAD_MID_RATIO
    }px`,
  )

  layerWidth.value =
    `${layerWidthPx}px 100%`

  return {
    start,
    end,
    durationMs,
  }
}

/* -------------------------------------------------------------------------- */
/* Animation                                                                   */
/* -------------------------------------------------------------------------- */

const clearPauseTimer = () => {
  if (!pauseTimer) {
    return
  }

  clearTimeout(pauseTimer)

  pauseTimer = undefined
}

const runSweep = () => {
  if (isCancelled) {
    return
  }

  const element =
    shimmerRef.value

  if (!element) {
    return
  }

  if (
    typeof element.animate !==
    'function'
  ) {
    return
  }

  const {
    start,
    end,
    durationMs,
  } = measure()

  /*
   * 修改重點：
   *
   * 不再使用：
   *
   * 200% → -200%
   *
   * 而是跟原版一樣，
   * 使用實際 px 座標。
   */
  const nextAnimation =
    element.animate(
      [
        {
          backgroundPosition:
            `${start}px center`,
        },
        {
          backgroundPosition:
            `${end}px center`,
        },
      ],
      {
        duration:
          durationMs,

        easing:
          easingValue.value,

        fill: 'forwards',
      },
    )

  if (!isActive) {
    nextAnimation.pause()
  }

  /*
   * 新動畫已經接管 backgroundPosition
   * 之後才取消上一個。
   */
  animation?.cancel()

  animation =
    nextAnimation

  nextAnimation.onfinish =
    () => {
      /*
       * shimmer 已經完全移出右側。
       *
       * 此時看到的是：
       *
       * backgroundColor:
       * var(--gs-base)
       *
       * 所以文字會回到黑色，
       * 不會消失。
       */

      clearPauseTimer()

      pauseTimer =
        setTimeout(
          () => {
            runSweep()
          },
          Math.max(
            0,
            props.pauseBetween,
          ),
        )
    }
}

/* -------------------------------------------------------------------------- */
/* Active state                                                                */
/* -------------------------------------------------------------------------- */

const setActive = (
  active: boolean,
) => {
  isActive = active

  if (!animation) {
    return
  }

  if (active) {
    animation.play()
    return
  }

  animation.pause()
}

/* -------------------------------------------------------------------------- */
/* Visibility                                                                  */
/* -------------------------------------------------------------------------- */

const setupVisibilityObserver =
  () => {
    const element =
      shimmerRef.value

    if (!element) {
      return
    }

    let inViewport =
      !props.pauseWhenOffscreen

    let pageVisible =
      !document.hidden

    let notScrolling =
      true

    const updateActive =
      () => {
        setActive(
          inViewport &&
            pageVisible &&
            notScrolling,
        )
      }

    if (
      props.pauseWhenOffscreen &&
      'IntersectionObserver' in
        window
    ) {
      intersectionObserver =
        new IntersectionObserver(
          entries => {
            const entry =
              entries[
                entries.length -
                  1
              ]

            if (!entry) {
              return
            }

            inViewport =
              entry.isIntersecting

            updateActive()
          },
          {
            rootMargin:
              VIEWPORT_ROOT_MARGIN,
          },
        )

      intersectionObserver.observe(
        element,
      )
    } else {
      inViewport = true
    }

    const handleVisibility =
      () => {
        pageVisible =
          !document.hidden

        updateActive()
      }

    document.addEventListener(
      'visibilitychange',
      handleVisibility,
    )

    const handleScroll = () => {
      if (
        !props.pauseOnScroll
      ) {
        return
      }

      notScrolling = false

      updateActive()

      if (scrollTimer) {
        clearTimeout(
          scrollTimer,
        )
      }

      scrollTimer =
        setTimeout(() => {
          notScrolling = true

          updateActive()
        }, SCROLL_IDLE_MS)
    }

    if (props.pauseOnScroll) {
      window.addEventListener(
        'scroll',
        handleScroll,
        {
          passive: true,
          capture: true,
        },
      )
    }

    updateActive()

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibility,
      )

      window.removeEventListener(
        'scroll',
        handleScroll,
        true,
      )
    }
  }

/* -------------------------------------------------------------------------- */
/* Restart                                                                     */
/* -------------------------------------------------------------------------- */

let cleanupVisibility:
  | (() => void)
  | undefined

const restartAnimation =
  async () => {
    await nextTick()

    animation?.cancel()

    animation = null

    clearPauseTimer()

    if (
      props.respectReducedMotion &&
      prefersReducedMotion()
    ) {
      return
    }

    runSweep()
  }

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                   */
/* -------------------------------------------------------------------------- */

onMounted(async () => {
  await nextTick()

  const element =
    shimmerRef.value

  if (!element) {
    return
  }

  /*
   * 不支援 background-clip:text
   * 就直接顯示普通文字。
   */
  if (
    !supportsBackgroundClipText()
  ) {
    element.style.removeProperty(
      'background-image',
    )

    element.style.removeProperty(
      'background-color',
    )

    element.style.removeProperty(
      '-webkit-text-fill-color',
    )

    return
  }

  measure()

  cleanupVisibility =
    setupVisibilityObserver()

  /*
   * slot 文字如果改變，
   * 重新量尺寸。
   */
  if (
    'MutationObserver' in window
  ) {
    mutationObserver =
      new MutationObserver(
        () => {
          void restartAnimation()
        },
      )

    mutationObserver.observe(
      element,
      {
        childList: true,
        characterData: true,
        subtree: true,
      },
    )
  }

  if (
    props.respectReducedMotion &&
    prefersReducedMotion()
  ) {
    return
  }

  runSweep()
})

watch(
  () => [
    props.duration,
    props.spread,
    props.angle,
    props.pauseBetween,
    props.baseColor,
    props.easing,
    props.gradient,
  ],
  () => {
    void restartAnimation()
  },
  {
    deep: true,
  },
)

onBeforeUnmount(() => {
  isCancelled = true

  animation?.cancel()

  animation = null

  clearPauseTimer()

  if (scrollTimer) {
    clearTimeout(
      scrollTimer,
    )
  }

  intersectionObserver?.disconnect()

  mutationObserver?.disconnect()

  cleanupVisibility?.()
})
</script>

<template>
  <component
    :is="as"
    ref="shimmerRef"
    :style="shimmerStyle"
  >
    <slot />
  </component>
</template>