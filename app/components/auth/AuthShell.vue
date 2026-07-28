<template>
  <section class="grid min-h-dvh bg-white lg:grid-cols-2">
    <div class="relative hidden min-h-dvh border-r border-slate-200 lg:block">
      <AuthOrbitBackground />
    </div>

    <div
      class="relative flex min-h-dvh items-center justify-center overflow-hidden bg-white px-5 py-12 sm:px-8"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.09),transparent_40%)]"
      />

      <NuxtLink
        to="/"
        class="absolute left-5 top-5 z-20 text-xl font-bold tracking-tight text-slate-900 lg:hidden"
      >
        Code<span class="text-blue-600">Gram</span>
      </NuxtLink>

      <div class="relative z-10 w-full max-w-[440px]">
        <slot />
      </div>
    </div>
  </section>
</template>