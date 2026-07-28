<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="w-full">
    <header>
      <p class="text-sm font-semibold tracking-[0.16em] text-blue-600">
        CODEGRAM
      </p>

      <h1 class="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {{ title }}
      </h1>

      <p class="mt-2 text-sm leading-6 text-slate-500">
        {{ description }}
      </p>
    </header>

    <div class="mt-8">
      <slot />
    </div>

    <footer
      v-if="$slots.footer"
      class="mt-7 border-t border-slate-200 pt-6"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>