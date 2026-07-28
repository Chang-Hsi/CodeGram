<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface OrbitItem {
  name: string
  label: string
  radius: number
  size: number
  duration: number
  delay: number
  reverse?: boolean
}

const rippleSizes = [180, 320, 460, 600, 740]

const orbitItems: OrbitItem[] = [
  {
    name: 'logos:vue',
    label: 'Vue',
    radius: 100,
    size: 34,
    duration: 20,
    delay: 0,
  },
  {
    name: 'logos:nuxt-icon',
    label: 'Nuxt',
    radius: 100,
    size: 34,
    duration: 20,
    delay: 10,
  },
  {
    name: 'logos:typescript-icon',
    label: 'TypeScript',
    radius: 160,
    size: 42,
    duration: 24,
    delay: 4,
    reverse: true,
  },
  {
    name: 'logos:javascript',
    label: 'JavaScript',
    radius: 160,
    size: 42,
    duration: 24,
    delay: 16,
    reverse: true,
  },
  {
    name: 'logos:tailwindcss-icon',
    label: 'Tailwind CSS',
    radius: 220,
    size: 40,
    duration: 28,
    delay: 2,
  },
  {
    name: 'logos:html-5',
    label: 'HTML5',
    radius: 220,
    size: 40,
    duration: 28,
    delay: 16,
  },
  {
    name: 'logos:css-3',
    label: 'CSS3',
    radius: 280,
    size: 44,
    duration: 32,
    delay: 5,
    reverse: true,
  },
  {
    name: 'logos:git-icon',
    label: 'Git',
    radius: 280,
    size: 44,
    duration: 32,
    delay: 21,
    reverse: true,
  },
  {
    name: 'logos:github-icon',
    label: 'GitHub',
    radius: 340,
    size: 44,
    duration: 36,
    delay: 8,
  },
  {
    name: 'logos:figma',
    label: 'Figma',
    radius: 340,
    size: 44,
    duration: 36,
    delay: 26,
  },
]

const getRippleStyle = (size: number): CSSProperties => ({
  width: `${size}px`,
  height: `${size}px`,
})

const getOrbitStyle = (item: OrbitItem): CSSProperties => ({
  width: `${item.radius * 2}px`,
  height: `${item.radius * 2}px`,
  '--orbit-duration': `${item.duration}s`,
  '--orbit-delay': `-${item.delay}s`,
} as CSSProperties)

const getIconStyle = (item: OrbitItem): CSSProperties => ({
  width: `${item.size}px`,
  height: `${item.size}px`,
})
</script>

<template>
  <div
    class="relative h-full w-full overflow-hidden bg-[#f6f9ff]"
    aria-hidden="true"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_44%)]"
    />

    <div
      class="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(37,99,235,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.035)_1px,transparent_1px)] [background-size:32px_32px]"
    />

    <div
      v-for="size in rippleSizes"
      :key="size"
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10"
      :style="getRippleStyle(size)"
    />

    <div
      v-for="item in orbitItems"
      :key="`${item.name}-${item.radius}-${item.delay}`"
      class="orbit-track absolute left-1/2 top-1/2 rounded-full border border-blue-500/10"
      :class="{ 'orbit-track--reverse': item.reverse }"
      :style="getOrbitStyle(item)"
    >
      <div class="orbit-anchor absolute left-1/2 top-0">
        <div
          class="orbit-icon flex items-center justify-center rounded-2xl border border-blue-100 bg-white p-2 shadow-[0_12px_35px_rgba(37,99,235,0.14)]"
          :class="{ 'orbit-icon--reverse': item.reverse }"
        >
          <Icon
            :name="item.name"
            :style="getIconStyle(item)"
          />

          <span class="sr-only">
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>

    <div
      class="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[32px] border border-blue-100 bg-white/95 shadow-[0_20px_70px_rgba(37,99,235,0.22)] backdrop-blur"
    >
      <div class="text-center">
        <div class="text-3xl font-black tracking-[-0.08em] text-blue-600">
          &lt;/&gt;
        </div>

        <div class="mt-1 text-xs font-semibold tracking-[0.18em] text-slate-800">
          CODEGRAM
        </div>
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-10 z-20 px-10 text-center">
      <p class="text-lg font-semibold text-slate-900">
        Connect. Code. Create.
      </p>

      <p class="mt-2 text-sm text-slate-500">
        專為軟體工程師打造的技術社群
      </p>
    </div>
  </div>
</template>

<style scoped>
.orbit-track {
  animation: orbit-clockwise var(--orbit-duration) linear infinite;
  animation-delay: var(--orbit-delay);
}

.orbit-track--reverse {
  animation-name: orbit-counterclockwise;
}

.orbit-anchor {
  transform: translate(-50%, -50%);
}

.orbit-icon {
  animation: keep-upright-counterclockwise var(--orbit-duration) linear infinite;
  animation-delay: var(--orbit-delay);
}

.orbit-icon--reverse {
  animation-name: keep-upright-clockwise;
}

@keyframes orbit-clockwise {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes orbit-counterclockwise {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}

@keyframes keep-upright-counterclockwise {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(-360deg);
  }
}

@keyframes keep-upright-clockwise {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-track,
  .orbit-icon {
    animation-play-state: paused;
  }
}
</style>