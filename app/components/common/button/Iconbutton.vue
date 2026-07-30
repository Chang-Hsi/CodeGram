<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    to?: string
    icon?: string
    type?: 'button' | 'submit' | 'reset'
    size?: 'default' | 'compact'
    variant?: 'primary' | 'ghost' | 'danger-ghost'
    iconOnly?: boolean
    iconClass?: string
    animateIcon?: boolean
    disabled?: boolean
  }>(),
  {
    to: '',
    icon: 'lucide:phone-call',
    type: 'button',
    size: 'default',
    variant: 'primary',
    iconOnly: false,
    iconClass: '',
    animateIcon: true,
    disabled: false,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const nuxtLinkComponent = resolveComponent('NuxtLink')

const componentType = computed(() => {
  return props.to ? nuxtLinkComponent : 'button'
})

const componentBindings = computed(() => {
  if (props.to) {
    return {
      to: props.to,
      'aria-disabled': props.disabled || undefined,
      tabindex: props.disabled ? -1 : undefined,
    }
  }

  return {
    type: props.type,
    disabled: props.disabled,
  }
})

const sizeClasses = computed(() => {
  if (props.iconOnly) {
    return props.size === 'compact'
      ? 'size-9 rounded-full p-0'
      : 'size-11 rounded-full p-0'
  }

  if (props.size === 'compact') {
    return 'h-10 rounded-lg px-4 text-sm'
  }

  return 'rounded-xl px-6 py-3 text-lg'
})

const iconSizeClasses = computed(() => {
  return props.size === 'compact'
    ? 'size-4'
    : 'size-5'
})

const variantClasses = computed(() => {
  if (props.variant === 'ghost') {
    return 'border-transparent bg-transparent text-slate-500 shadow-none hover:bg-transparent hover:text-blue-600 hover:shadow-none focus-visible:ring-blue-500/20'
  }

  if (props.variant === 'danger-ghost') {
    return 'border-transparent bg-transparent text-slate-500 shadow-none hover:bg-transparent hover:text-red-600 hover:shadow-none focus-visible:ring-red-500/20'
  }

  return 'border-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus-visible:ring-blue-500/30'
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  emit('click', event)
}
</script>

<template>
  <component
    :is="componentType"
    v-bind="{
      ...componentBindings,
      ...$attrs,
    }"
    class="icon-button group relative inline-flex items-center justify-center overflow-hidden border font-semibold transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    :class="[
      sizeClasses,
      variantClasses,
    ]"
    @click="handleClick"
  >
    <span
      class="relative z-10 flex items-center justify-center"
      :class="size === 'compact' ? 'gap-2' : 'gap-3'"
    >
      <!-- 圖示上下交換區域 -->
      <span
        aria-hidden="true"
        class="relative block overflow-hidden"
        :class="iconSizeClasses"
      >
        <Icon
          :name="icon"
          class="absolute inset-0"
          :class="[
            iconSizeClasses,
            iconClass,
            animateIcon
              ? 'icon-button__icon icon-button__icon--primary'
              : '',
          ]"
        />

        <Icon
          v-if="animateIcon"
          :name="icon"
          class="icon-button__icon icon-button__icon--secondary absolute inset-0"
          :class="[
            iconSizeClasses,
            iconClass,
          ]"
        />
      </span>

      <!-- 按鈕文字 -->
      <span
        v-if="!iconOnly"
        class="whitespace-nowrap transition-transform duration-300 ease-out group-hover:translate-x-1"
      >
        <slot />
      </span>
    </span>

    <!-- Hover 掃光效果 -->
    <span
      v-if="variant === 'primary'"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    >
      <span
        class="icon-button__shine absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </span>
  </component>
</template>

<style scoped>
.icon-button__icon {
  transition:
    transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 300ms ease;
}

.icon-button__icon--primary {
  transform: translateY(0);
  opacity: 1;
}

.icon-button__icon--secondary {
  transform: translateY(100%);
  opacity: 0;
}

.icon-button:hover .icon-button__icon--primary,
.icon-button:focus-visible .icon-button__icon--primary {
  transform: translateY(-100%);
  opacity: 0;
}

.icon-button:hover .icon-button__icon--secondary,
.icon-button:focus-visible .icon-button__icon--secondary {
  transform: translateY(0);
  opacity: 1;
}

.icon-button__shine {
  transform: translateX(-120%) skewX(-12deg);
  transition: transform 1000ms ease-out;
}

.icon-button:hover .icon-button__shine,
.icon-button:focus-visible .icon-button__shine {
  transform: translateX(120%) skewX(-12deg);
}

@media (prefers-reduced-motion: reduce) {
  .icon-button,
  .icon-button__icon,
  .icon-button__shine {
    transition-duration: 1ms;
  }
}
</style>
