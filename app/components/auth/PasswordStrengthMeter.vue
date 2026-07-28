<script setup lang="ts">
type Props = {
  password: string
}

const props = defineProps<Props>()

const requirements = computed(() => {
  return [
    {
      label: '至少 8 個字元',
      passed: props.password.length >= 8,
    },
    {
      label: '包含英文大寫與小寫',
      passed:
        /[a-z]/.test(props.password)
        && /[A-Z]/.test(props.password),
    },
    {
      label: '包含至少一個數字',
      passed: /\d/.test(props.password),
    },
    {
      label: '包含至少一個特殊符號',
      passed: /[^A-Za-z0-9]/.test(props.password),
    },
  ]
})

const score = computed(() => {
  return requirements.value.filter(requirement => requirement.passed).length
})

const strength = computed(() => {
  if (!props.password) {
    return {
      label: '尚未輸入密碼',
      textClass: 'text-slate-400',
      barClass: 'bg-slate-200',
    }
  }

  if (score.value <= 1) {
    return {
      label: '密碼強度：弱',
      textClass: 'text-red-500',
      barClass: 'bg-red-500',
    }
  }

  if (score.value === 2) {
    return {
      label: '密碼強度：普通',
      textClass: 'text-amber-500',
      barClass: 'bg-amber-500',
    }
  }

  if (score.value === 3) {
    return {
      label: '密碼強度：良好',
      textClass: 'text-blue-500',
      barClass: 'bg-blue-500',
    }
  }

  return {
    label: '密碼強度：強',
    textClass: 'text-emerald-600',
    barClass: 'bg-emerald-500',
  }
})

const segments = [1, 2, 3, 4]
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <div
        role="progressbar"
        aria-label="密碼強度"
        aria-valuemin="0"
        aria-valuemax="4"
        :aria-valuenow="score"
        class="grid grid-cols-4 gap-2"
      >
        <div
          v-for="segment in segments"
          :key="segment"
          class="h-1.5 rounded-full transition-colors duration-300"
          :class="
            segment <= score
              ? strength.barClass
              : 'bg-slate-200'
          "
        />
      </div>

      <p
        class="text-xs font-medium transition-colors"
        :class="strength.textClass"
      >
        {{ strength.label }}
      </p>
    </div>

    <ul class="grid gap-2 sm:grid-cols-2">
      <li
        v-for="requirement in requirements"
        :key="requirement.label"
        class="flex items-center gap-2 text-xs transition-colors"
        :class="
          requirement.passed
            ? 'text-emerald-600'
            : 'text-slate-400'
        "
      >
        <span
          class="flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors"
          :class="
            requirement.passed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-slate-300'
          "
        >
          <Icon
            v-if="requirement.passed"
            name="lucide:check"
            class="size-3"
          />

          <Icon
            v-else
            name="lucide:minus"
            class="size-3"
          />
        </span>

        <span>{{ requirement.label }}</span>
      </li>
    </ul>

    <p class="text-xs leading-5 text-slate-400">
      只有「至少 8 個字元」是必要條件，其餘項目用來提升密碼安全性。
    </p>
  </div>
</template>