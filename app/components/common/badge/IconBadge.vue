<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    label: string
    icon?: string
    iconClass?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    icon: '',
    iconClass: 'text-slate-600',
    size: 'md',
  },
)

const badgeSizeClass = computed(() => {
  const sizeClasses = {
    sm: 'h-7 gap-1.5 px-2.5 text-xs',
    md: 'h-8 gap-2 px-3 text-sm',
    lg: 'h-9 gap-2.5 px-3.5 text-sm',
  }

  return sizeClasses[props.size]
})

const iconSizeClass = computed(() => {
  const sizeClasses = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-[18px]',
  }

  return sizeClasses[props.size]
})
</script>

<template>
  <span
    v-bind="$attrs"
    class="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    :class="badgeSizeClass"
  >
    <slot name="icon">
      <Icon
        v-if="icon"
        :name="icon"
        class="shrink-0"
        :class="[
          iconSizeClass,
          iconClass,
        ]"
      />
    </slot>

    <span class="whitespace-nowrap">
      <slot>
        {{ label }}
      </slot>
    </span>
  </span>
</template>