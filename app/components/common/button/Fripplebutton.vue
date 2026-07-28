<script setup lang="ts">
import type { CSSProperties } from 'vue'

defineOptions({
  inheritAttrs: false,
})

interface RippleItem {
  id: number
  x: number
  y: number
  size: number
}

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    rippleColor?: string
    duration?: number | string
  }>(),
  {
    type: 'button',
    disabled: false,
    rippleColor: 'rgba(255, 255, 255, 0.65)',
    duration: 600,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const rippleSurfaceRef = ref<HTMLSpanElement>()
const ripples = ref<RippleItem[]>([])

const rippleTimers = new Map<
  number,
  ReturnType<typeof setTimeout>
>()

let nextRippleId = 0

const normalizedDuration = computed(() => {
  if (typeof props.duration === 'number') {
    return `${props.duration}ms`
  }

  return props.duration
})

const durationMilliseconds = computed(() => {
  if (typeof props.duration === 'number') {
    return Math.max(props.duration, 0)
  }

  const duration = props.duration.trim()
  const parsedDuration = Number.parseFloat(duration)

  if (!Number.isFinite(parsedDuration)) {
    return 600
  }

  if (duration.endsWith('ms')) {
    return Math.max(parsedDuration, 0)
  }

  if (duration.endsWith('s')) {
    return Math.max(parsedDuration * 1000, 0)
  }

  return Math.max(parsedDuration, 0)
})

const removeRipple = (id: number) => {
  ripples.value = ripples.value.filter((ripple) => {
    return ripple.id !== id
  })

  const timer = rippleTimers.get(id)

  if (timer) {
    clearTimeout(timer)
    rippleTimers.delete(id)
  }
}

const getRippleStyle = (
  ripple: RippleItem,
): CSSProperties => {
  return {
    width: `${ripple.size}px`,
    height: `${ripple.size}px`,
    top: `${ripple.y}px`,
    left: `${ripple.x}px`,
    backgroundColor: props.rippleColor,
    '--fripple-duration': normalizedDuration.value,
  } as CSSProperties
}

const createRipple = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement
  const buttonRect = button.getBoundingClientRect()
  const surfaceRect =
    rippleSurfaceRef.value?.getBoundingClientRect()
      || buttonRect

  const size = Math.max(
    buttonRect.width,
    buttonRect.height,
  )

  // 使用鍵盤或程式觸發 click 時，從按鈕中心產生波紋。
  const clientX =
    event.detail === 0
      ? buttonRect.left + buttonRect.width / 2
      : event.clientX

  const clientY =
    event.detail === 0
      ? buttonRect.top + buttonRect.height / 2
      : event.clientY

  nextRippleId += 1

  const ripple: RippleItem = {
    id: nextRippleId,
    size,
    x: clientX - surfaceRect.left - size / 2,
    y: clientY - surfaceRect.top - size / 2,
  }

  ripples.value.push(ripple)

  const timer = setTimeout(() => {
    removeRipple(ripple.id)
  }, durationMilliseconds.value)

  rippleTimers.set(ripple.id, timer)
}

const handleClick = (event: MouseEvent) => {
  createRipple(event)
  emit('click', event)
}

onBeforeUnmount(() => {
  rippleTimers.forEach((timer) => {
    clearTimeout(timer)
  })

  rippleTimers.clear()
})
</script>

<template>
  <button
    v-bind="$attrs"
    :type="type"
    :disabled="disabled"
    class="inline-grid isolate cursor-pointer overflow-hidden disabled:cursor-not-allowed"
    @click="handleClick"
  >
    <!-- 波紋顯示區 -->
    <span
      ref="rippleSurfaceRef"
      aria-hidden="true"
      class="pointer-events-none relative col-start-1 row-start-1 min-h-0 min-w-0"
    >
      <span
        v-for="ripple in ripples"
        :key="ripple.id"
        class="fripple-ripple absolute rounded-full"
        :style="getRippleStyle(ripple)"
      />
    </span>

    <!-- 按鈕內容 -->
    <span
      class="relative z-10 col-start-1 row-start-1 flex min-w-0 items-center justify-center"
    >
      <slot />
    </span>
  </button>
</template>

<style scoped>
.fripple-ripple {
  animation:
    fripple-expand
    var(--fripple-duration, 600ms)
    ease-out
    forwards;
  will-change: transform, opacity;
}

@keyframes fripple-expand {
  0% {
    transform: scale(0);
    opacity: 0.55;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fripple-ripple {
    animation-duration: 1ms;
  }
}
</style>