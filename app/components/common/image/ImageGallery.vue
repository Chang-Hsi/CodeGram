<script setup lang="ts">
import type {
  ComponentPublicInstance,
} from 'vue'

interface ImageGalleryItem {
  id?: number | string
  src: string
  alt?: string
  caption?: string
  fallback?: string

  /*
   * 可傳：
   * 1
   * 4 / 3
   * 3 / 4
   * 16 / 9
   */
  aspectRatio?: number | string
}

interface NormalizedImageGalleryItem {
  id: string
  src: string
  alt: string
  caption: string
  fallback: string
  aspectRatio?: number | string
}

interface ImageGalleryEventPayload {
  image: NormalizedImageGalleryItem
  index: number
}

const props = withDefaults(
  defineProps<{
    images: Array<
      string | ImageGalleryItem
    >
    columns?: 2 | 3 | 4 | 5 | 6
    gap?: number
    editable?: boolean
    previewable?: boolean
    defaultAspectRatio?: string
    emptyText?: string
    rootMargin?: string
  }>(),
  {
    columns: 4,
    gap: 8,
    editable: false,
    previewable: true,
    defaultAspectRatio: '4 / 3',
    emptyText: '目前沒有相片。',
    rootMargin: '120px 0px',
  },
)

const emit = defineEmits<{
  select: [
    payload: ImageGalleryEventPayload,
  ]
  edit: [
    payload: ImageGalleryEventPayload,
  ]
  error: [
    payload: ImageGalleryEventPayload,
  ]
}>()

const itemElements = new Map<
  string,
  HTMLElement
>()

const visibleImageIds = reactive(
  new Set<string>(),
)

const loadedImages = reactive<
  Record<string, boolean>
>({})

const failedImages = reactive<
  Record<string, boolean>
>({})

const currentSources = reactive<
  Record<string, string>
>({})

const previewIndex = ref<number | null>(
  null,
)

let intersectionObserver:
  | IntersectionObserver
  | null = null

let previousBodyOverflow = ''

const normalizedImages = computed<
  NormalizedImageGalleryItem[]
>(() => {
  return props.images.map(
    (
      image,
      index,
    ) => {
      if (typeof image === 'string') {
        return {
          id: `gallery-image-${index}`,
          src: image,
          alt: `第 ${index + 1} 張相片`,
          caption: '',
          fallback: '',
        }
      }

      return {
        id: String(
          image.id
          ?? `gallery-image-${index}`,
        ),
        src: image.src,
        alt:
          image.alt
          || `第 ${index + 1} 張相片`,
        caption: image.caption || '',
        fallback: image.fallback || '',
        aspectRatio: image.aspectRatio,
      }
    },
  )
})

const columnClass = computed(() => {
  const columnClassMap = {
    2: 'columns-1 sm:columns-2',
    3: 'columns-2 sm:columns-3',
    4: 'columns-2 sm:columns-3 lg:columns-4',
    5: 'columns-2 sm:columns-3 lg:columns-5',
    6: 'columns-2 sm:columns-4 lg:columns-6',
  }

  return columnClassMap[props.columns]
})

const activePreviewImage = computed(() => {
  if (previewIndex.value === null) {
    return null
  }

  return (
    normalizedImages.value[
      previewIndex.value
    ] || null
  )
})

const hasMultipleImages = computed(() => {
  return normalizedImages.value.length > 1
})

const getImageIndex = (
  image: NormalizedImageGalleryItem,
) => {
  return normalizedImages.value.findIndex(
    item => item.id === image.id,
  )
}

const getImageSource = (
  image: NormalizedImageGalleryItem,
) => {
  return (
    currentSources[image.id]
    || image.src
  )
}

const getAspectRatio = (
  image: NormalizedImageGalleryItem,
) => {
  if (image.aspectRatio) {
    return String(image.aspectRatio)
  }

  return props.defaultAspectRatio
}

const isImageVisible = (
  image: NormalizedImageGalleryItem,
) => {
  return visibleImageIds.has(
    image.id,
  )
}

const isImageLoaded = (
  image: NormalizedImageGalleryItem,
) => {
  return Boolean(
    loadedImages[image.id],
  )
}

const isImageFailed = (
  image: NormalizedImageGalleryItem,
) => {
  return Boolean(
    failedImages[image.id],
  )
}

const markImageVisible = (
  id: string,
) => {
  visibleImageIds.add(id)
}

const setItemRef = (
  id: string,
  element:
    | Element
    | ComponentPublicInstance
    | null,
) => {
  const previousElement
    = itemElements.get(id)

  if (
    previousElement
    && previousElement !== element
  ) {
    intersectionObserver?.unobserve(
      previousElement,
    )
  }

  if (element instanceof HTMLElement) {
    itemElements.set(id, element)

    intersectionObserver?.observe(
      element,
    )

    return
  }

  itemElements.delete(id)
}

const createIntersectionObserver = () => {
  intersectionObserver?.disconnect()

  if (
    !import.meta.client
    || typeof IntersectionObserver
      === 'undefined'
  ) {
    normalizedImages.value.forEach(
      image => {
        markImageVisible(image.id)
      },
    )

    return
  }

  const prefersReducedMotion
    = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

  if (prefersReducedMotion) {
    normalizedImages.value.forEach(
      image => {
        markImageVisible(image.id)
      },
    )

    return
  }

  intersectionObserver
    = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return
          }

          const imageId
            = (
              entry.target as HTMLElement
            ).dataset.galleryImageId

          if (!imageId) {
            return
          }

          markImageVisible(imageId)

          intersectionObserver?.unobserve(
            entry.target,
          )
        })
      },
      {
        root: null,
        rootMargin: props.rootMargin,
        threshold: 0.08,
      },
    )

  itemElements.forEach(element => {
    intersectionObserver?.observe(
      element,
    )
  })
}

const handleImageLoad = (
  image: NormalizedImageGalleryItem,
) => {
  loadedImages[image.id] = true
  failedImages[image.id] = false
}

const handleImageError = (
  image: NormalizedImageGalleryItem,
) => {
  const currentSource
    = getImageSource(image)

  /*
   * 原圖失敗時先切換至 fallback。
   */
  if (
    image.fallback
    && currentSource
      !== image.fallback
  ) {
    currentSources[image.id]
      = image.fallback

    loadedImages[image.id] = false
    failedImages[image.id] = false

    return
  }

  loadedImages[image.id] = false
  failedImages[image.id] = true

  const index = getImageIndex(image)

  emit('error', {
    image,
    index,
  })
}

const openPreview = (
  image: NormalizedImageGalleryItem,
) => {
  const index = getImageIndex(image)

  if (index < 0) {
    return
  }

  emit('select', {
    image,
    index,
  })

  if (!props.previewable) {
    return
  }

  previewIndex.value = index
}

const closePreview = () => {
  previewIndex.value = null
}

const showPreviousImage = () => {
  if (
    previewIndex.value === null
    || !normalizedImages.value.length
  ) {
    return
  }

  previewIndex.value = (
    previewIndex.value
    - 1
    + normalizedImages.value.length
  ) % normalizedImages.value.length
}

const showNextImage = () => {
  if (
    previewIndex.value === null
    || !normalizedImages.value.length
  ) {
    return
  }

  previewIndex.value = (
    previewIndex.value + 1
  ) % normalizedImages.value.length
}

const handleEdit = (
  image: NormalizedImageGalleryItem,
) => {
  const index = getImageIndex(image)

  emit('edit', {
    image,
    index,
  })
}

const handleKeydown = (
  event: KeyboardEvent,
) => {
  if (previewIndex.value === null) {
    return
  }

  if (event.key === 'Escape') {
    closePreview()

    return
  }

  if (event.key === 'ArrowLeft') {
    showPreviousImage()

    return
  }

  if (event.key === 'ArrowRight') {
    showNextImage()
  }
}

watch(
  () => props.images,
  async () => {
    await nextTick()

    createIntersectionObserver()
  },
  {
    deep: true,
  },
)

watch(
  previewIndex,
  value => {
    if (!import.meta.client) {
      return
    }

    if (value !== null) {
      previousBodyOverflow
        = document.body.style.overflow

      document.body.style.overflow
        = 'hidden'

      return
    }

    document.body.style.overflow
      = previousBodyOverflow
  },
)

onMounted(async () => {
  await nextTick()

  createIntersectionObserver()

  window.addEventListener(
    'keydown',
    handleKeydown,
  )
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()

  if (import.meta.client) {
    window.removeEventListener(
      'keydown',
      handleKeydown,
    )

    document.body.style.overflow
      = previousBodyOverflow
  }
})
</script>

<template>
  <div class="w-full">
    <div
      v-if="normalizedImages.length"
      :class="columnClass"
      :style="{
        columnGap: `${gap}px`,
      }"
    >
      <figure
        v-for="image in normalizedImages"
        :key="image.id"
        :ref="
          element => setItemRef(
            image.id,
            element,
          )
        "
        :data-gallery-image-id="image.id"
        class="group relative inline-block w-full break-inside-avoid"
        :style="{
          marginBottom: `${gap}px`,
        }"
      >
        <button
          type="button"
          class="relative block w-full overflow-hidden rounded-xl bg-slate-100 text-left outline-none transition focus-visible:ring-4 focus-visible:ring-blue-500/20"
          :style="{
            aspectRatio:
              getAspectRatio(image),
          }"
          :aria-label="`查看${image.alt}`"
          @click="openPreview(image)"
        >
          <!-- 載入中骨架 -->
          <span
            v-if="
              !isImageLoaded(image)
              && !isImageFailed(image)
            "
            class="absolute inset-0 animate-pulse bg-slate-200"
            aria-hidden="true"
          >
            <span
              class="absolute inset-0 -translate-x-full animate-[gallery-shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/55 to-transparent"
            />
          </span>

          <!-- 相片 -->
          <img
            v-show="
              !isImageFailed(image)
            "
            :src="getImageSource(image)"
            :alt="image.alt"
            loading="lazy"
            decoding="async"
            class="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-out"
            :class="
              isImageLoaded(image)
              && isImageVisible(image)
                ? 'scale-100 opacity-100'
                : 'scale-[1.025] opacity-0'
            "
            @load="handleImageLoad(image)"
            @error="handleImageError(image)"
          >

          <!-- 載入失敗 -->
          <span
            v-if="isImageFailed(image)"
            class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 px-4 text-center"
          >
            <Icon
              name="lucide:image-off"
              class="size-7 text-slate-300"
            />

            <span
              class="mt-2 text-xs font-medium text-slate-400"
            >
              相片載入失敗
            </span>
          </span>

          <!-- Hover 遮罩 -->
          <span
            class="pointer-events-none absolute inset-0 bg-slate-950/0 transition duration-300 group-hover:bg-slate-950/10 group-focus-within:bg-slate-950/10"
            aria-hidden="true"
          />

          <span
            class="pointer-events-none absolute bottom-3 left-3 flex size-8 translate-y-2 items-center justify-center rounded-full bg-slate-950/65 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
            aria-hidden="true"
          >
            <Icon
              name="lucide:maximize-2"
              class="size-4"
            />
          </span>
        </button>

        <!-- 編輯按鈕 -->
        <button
          v-if="editable"
          type="button"
          class="absolute right-2 top-2 z-10 flex size-8 scale-90 items-center justify-center rounded-full bg-slate-950/65 text-white opacity-0 shadow-sm backdrop-blur-sm transition duration-200 hover:bg-slate-950/80 focus:scale-100 focus:opacity-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 group-hover:scale-100 group-hover:opacity-100"
          :aria-label="`編輯${image.alt}`"
          @click.stop="handleEdit(image)"
        >
          <Icon
            name="lucide:pencil"
            class="size-3.5"
          />
        </button>

        <figcaption
          v-if="image.caption"
          class="mt-2 px-1 text-sm leading-5 text-slate-500"
        >
          {{ image.caption }}
        </figcaption>
      </figure>
    </div>

    <div
      v-else
      class="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 text-center"
    >
      <Icon
        name="lucide:images"
        class="size-8 text-slate-300"
      />

      <p class="mt-3 text-sm text-slate-500">
        {{ emptyText }}
      </p>
    </div>

    <!-- 全螢幕預覽 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="
            previewable
            && activePreviewImage
          "
          class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          :aria-label="
            activePreviewImage.alt
          "
          @click.self="closePreview"
        >
          <button
            type="button"
            aria-label="關閉相片預覽"
            class="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            @click="closePreview"
          >
            <Icon
              name="lucide:x"
              class="size-5"
            />
          </button>

          <button
            v-if="hasMultipleImages"
            type="button"
            aria-label="上一張相片"
            class="absolute left-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:left-6"
            @click="showPreviousImage"
          >
            <Icon
              name="lucide:chevron-left"
              class="size-6"
            />
          </button>

          <div
            class="flex max-h-full max-w-[min(1100px,calc(100vw-32px))] flex-col items-center"
          >
            <img
              :src="
                getImageSource(
                  activePreviewImage,
                )
              "
              :alt="activePreviewImage.alt"
              class="max-h-[calc(100vh-120px)] max-w-full rounded-xl object-contain shadow-2xl"
            >

            <p
              v-if="
                activePreviewImage.caption
              "
              class="mt-4 max-w-2xl text-center text-sm leading-6 text-white/75"
            >
              {{
                activePreviewImage.caption
              }}
            </p>

            <p
              class="mt-3 text-xs font-medium text-white/50"
            >
              {{
                Number(previewIndex) + 1
              }}
              /
              {{ normalizedImages.length }}
            </p>
          </div>

          <button
            v-if="hasMultipleImages"
            type="button"
            aria-label="下一張相片"
            class="absolute right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:right-6"
            @click="showNextImage"
          >
            <Icon
              name="lucide:chevron-right"
              class="size-6"
            />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes gallery-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>