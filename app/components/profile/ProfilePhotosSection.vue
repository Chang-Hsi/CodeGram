<script setup lang="ts">
import ImageGallery from '~/components/common/image/ImageGallery.vue'
import VercelTabs from '~/components/common/tabs/VercelTabs.vue'

interface ImageGalleryEditPayload {
  image: {
    id: string
    src: string
    alt: string
  }
  index: number
}

withDefaults(
  defineProps<{
    isOwnProfile?: boolean
  }>(),
  {
    isOwnProfile: false,
  },
)

const emit = defineEmits<{
  addPhoto: []
  more: []
  editPhoto: [
    payload: {
      src: string
      index: number
    },
  ]
  viewAll: []
}>()

const activeFilter = ref('tagged')

const filters = [
  {
    label: '有你在內的相片',
    value: 'tagged',
  },
  {
    label: '你的相片',
    value: 'photos',
  },
  {
    label: '相簿',
    value: 'albums',
  },
]

const photos = [
  {
    id: 'photo-1',
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=82',
    alt: '朋友們在戶外聚會',
    aspectRatio: '4 / 3',
  },
  {
    id: 'photo-2',
    src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=82',
    alt: '朋友們一起合照',
    aspectRatio: '3 / 4',
  },
  {
    id: 'photo-3',
    src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=82',
    alt: '活動聚會現場',
    aspectRatio: '1',
  },
  {
    id: 'photo-4',
    src: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=82',
    alt: '戶外旅行紀錄',
    aspectRatio: '4 / 5',
  },
  {
    id: 'photo-5',
    src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=82',
    alt: '朋友相聚的日常照片',
    aspectRatio: '4 / 3',
  },
  {
    id: 'photo-6',
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=82&sat=-20',
    alt: '朋友們的團體照片',
    aspectRatio: '3 / 4',
  },
  {
    id: 'photo-7',
    src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=82',
    alt: '戶外活動合照',
    aspectRatio: '16 / 10',
  },
  {
    id: 'photo-8',
    src: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=800&q=82',
    alt: '朋友們一起歡笑',
    aspectRatio: '1',
  },
]

const handleEditPhoto = (
  payload: ImageGalleryEditPayload,
) => {
  emit('editPhoto', {
    src: payload.image.src,
    index: payload.index,
  })
}
</script>

<template>
  <section
    class="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)] sm:p-5"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <h2 class="text-xl font-bold text-slate-950">
        相片
      </h2>

      <div class="flex items-center gap-2">
        <button
          v-if="isOwnProfile"
          type="button"
          class="rounded-lg px-2 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          @click="emit('addPhoto')"
        >
          新增相片／影片
        </button>

        <button
          type="button"
          aria-label="更多相片選項"
          class="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
          @click="emit('more')"
        >
          <Icon
            name="lucide:ellipsis"
            class="size-5"
          />
        </button>
      </div>
    </div>

    <VercelTabs
      :model-value="activeFilter"
      :tabs="filters"
      aria-label="相片篩選"
      class="mt-4"
      @update:model-value="
        activeFilter = $event
      "
    />

    <ImageGallery
      :images="photos"
      :columns="4"
      :gap="8"
      :editable="isOwnProfile"
      previewable
      class="mt-4"
      @edit="handleEditPhoto"
    />

    <button
      type="button"
      class="mt-3 flex h-10 w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-800 transition hover:bg-slate-200"
      @click="emit('viewAll')"
    >
      查看全部
    </button>
  </section>
</template>