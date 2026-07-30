<script setup lang="ts">
import type {
  ComponentPublicInstance,
} from 'vue'

interface AnimatedMasonryItem {
  id: number | string
  title: string
  imageUrl: string
  description?: string
  actionLabel?: string
  imageAlt?: string
  imagePosition?: string
}

const props = withDefaults(
  defineProps<{
    items: AnimatedMasonryItem[]
    ariaLabel?: string
    showDismiss?: boolean
  }>(),
  {
    ariaLabel: '動態卡片列表',
    showDismiss: true,
  },
)

const emit = defineEmits<{
  'primary-action': [
    item: AnimatedMasonryItem,
  ]
  dismiss: [
    item: AnimatedMasonryItem,
  ]
}>()

const cardElements = new Map<
  string,
  HTMLElement
>()

const revealedIds = reactive(
  new Set<string>(),
)

let observer: IntersectionObserver | null =
  null

const itemIds = computed(() => {
  return props.items
    .map(item => String(item.id))
    .join('|')
})

const getItemId = (
  itemId: number | string,
) => {
  return String(itemId)
}

const setCardElement = (
  itemId: number | string,
  element:
    | Element
    | ComponentPublicInstance
    | null,
) => {
  const normalizedId = getItemId(itemId)

  if (element instanceof HTMLElement) {
    cardElements.set(
      normalizedId,
      element,
    )
    return
  }

  cardElements.delete(normalizedId)
}

const getCardStyle = (
  index: number,
): Record<string, string> => {
  const rotations = [
    '-2.5deg',
    '2deg',
    '-1.5deg',
    '2.5deg',
    '-2deg',
    '1.5deg',
  ]

  return {
    '--masonry-delay': `${
      (index % 6) * 65
    }ms`,
    '--masonry-rotation':
      rotations[
        index % rotations.length
      ] ?? '0deg',
  }
}

const revealAllCards = () => {
  props.items.forEach(item => {
    revealedIds.add(
      getItemId(item.id),
    )
  })
}

const createObserver = async () => {
  await nextTick()

  observer?.disconnect()
  observer = null

  if (!import.meta.client) {
    return
  }

  if (
    !('IntersectionObserver' in window)
  ) {
    revealAllCards()
    return
  }

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return
        }

        const element =
          entry.target as HTMLElement

        const itemId =
          element.dataset.masonryId

        if (!itemId) {
          return
        }

        revealedIds.add(itemId)
        observer?.unobserve(element)
      })
    },
    {
      threshold: 0.14,
      rootMargin:
        '0px 0px -40px 0px',
    },
  )

  cardElements.forEach(
    (element, itemId) => {
      if (revealedIds.has(itemId)) {
        return
      }

      observer?.observe(element)
    },
  )
}

watch(
  itemIds,
  async () => {
    const currentIds = new Set(
      props.items.map(item =>
        getItemId(item.id),
      ),
    )

    Array.from(revealedIds).forEach(
      itemId => {
        if (!currentIds.has(itemId)) {
          revealedIds.delete(itemId)
        }
      },
    )

    await createObserver()
  },
  {
    flush: 'post',
  },
)

onMounted(() => {
  void createObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  cardElements.clear()
})
</script>

<template>
  <TransitionGroup
    tag="div"
    name="masonry-list"
    role="list"
    :aria-label="ariaLabel"
    class="animated-masonry relative grid grid-cols-2 gap-3 sm:grid-cols-3"
  >
    <article
      v-for="(item, index) in items"
      :key="item.id"
      :ref="
        element =>
          setCardElement(
            item.id,
            element,
          )
      "
      role="listitem"
      :data-masonry-id="
        getItemId(item.id)
      "
      :style="getCardStyle(index)"
      class="animated-masonry__card flex h-[356px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.07)]"
      :class="{
        'animated-masonry__card--revealed':
          revealedIds.has(
            getItemId(item.id),
          ),
      }"
    >
      <div
        class="group relative h-[238px] shrink-0 overflow-hidden bg-slate-100"
      >
        <img
          :src="item.imageUrl"
          :alt="
            item.imageAlt ??
              item.title
          "
          loading="lazy"
          decoding="async"
          draggable="false"
          class="h-full w-full select-none object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          :style="{
            objectPosition:
              item.imagePosition ??
              'center',
          }"
        >

        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/65 to-transparent"
        />

        <div
          class="absolute inset-x-0 bottom-0 p-3 text-white"
        >
          <h3
            class="truncate text-[15px] font-bold leading-5"
          >
            {{ item.title }}
          </h3>

          <p
            v-if="item.description"
            class="animated-masonry__description mt-1 text-xs leading-5 text-white/85"
          >
            {{ item.description }}
          </p>
        </div>
      </div>

      <div
        class="flex flex-1 flex-col justify-center gap-2 p-3"
      >
        <button
          v-if="item.actionLabel"
          type="button"
          class="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          @click="
            emit(
              'primary-action',
              item,
            )
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            class="size-4"
          >
            <path
              d="M15 19C15 16.7909 13.2091 15 11 15H7C4.79086 15 3 16.7909 3 19"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />

            <circle
              cx="9"
              cy="8"
              r="4"
              stroke="currentColor"
              stroke-width="1.8"
            />

            <path
              d="M18 8V14M15 11H21"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>

          {{ item.actionLabel }}
        </button>

        <button
          v-if="showDismiss"
          type="button"
          class="inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-200 px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.98]"
          :aria-label="`移除 ${item.title}`"
          @click="
            emit(
              'dismiss',
              item,
            )
          "
        >
          移除
        </button>
      </div>
    </article>
  </TransitionGroup>
</template>

<style scoped>
.animated-masonry__card {
  opacity: 0;
  transform:
    translate3d(0, 44px, 0)
    rotate(
      var(
        --masonry-rotation,
        0deg
      )
    )
    scale(0.96);
  transform-origin: center bottom;
  transition:
    opacity 560ms
      cubic-bezier(
        0.22,
        1,
        0.36,
        1
      ),
    transform 680ms
      cubic-bezier(
        0.22,
        1,
        0.36,
        1
      ),
    box-shadow 250ms ease,
    border-color 250ms ease;
  transition-delay:
    var(
      --masonry-delay,
      0ms
    );
  will-change:
    opacity,
    transform;
}

.animated-masonry__card--revealed {
  opacity: 1;
  transform:
    translate3d(0, 0, 0)
    rotate(0deg)
    scale(1);
}

.animated-masonry__card--revealed:hover {
  border-color:
    rgb(203 213 225);
  box-shadow:
    0 14px 32px
    rgba(15, 23, 42, 0.12);
  transform:
    translate3d(0, -4px, 0)
    rotate(0deg)
    scale(1.01);
}

.masonry-list-move {
  transition:
    transform 620ms
      cubic-bezier(
        0.22,
        1,
        0.36,
        1
      );
}

.masonry-list-leave-active {
  position: absolute;
  width:
    calc(
      (100% - 0.75rem) / 2
    );
  z-index: 10;
  pointer-events: none;
  transition:
    opacity 360ms ease,
    transform 460ms
      cubic-bezier(
        0.55,
        0,
        1,
        0.45
      ),
    filter 360ms ease;
}

@media (min-width: 640px) {
  .masonry-list-leave-active {
    width:
      calc(
        (100% - 1.5rem) / 3
      );
  }
}

.masonry-list-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform:
    translate3d(0, 24px, 0)
    rotate(5deg)
    scale(0.82);
}

.animated-masonry__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

@media (
  prefers-reduced-motion:
  reduce
) {
  .animated-masonry__card,
  .animated-masonry__card--revealed,
  .animated-masonry__card--revealed:hover,
  .masonry-list-move,
  .masonry-list-leave-active {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .animated-masonry__card img {
    transition: none;
  }
}
</style>
