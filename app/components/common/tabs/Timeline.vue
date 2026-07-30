<script setup lang="ts">
type TimelineStatus =
  | 'completed'
  | 'active'
  | 'pending'

interface TimelineItem {
  id: number | string
  title: string
  description?: string
  timestamp?: string | Date
  status?: TimelineStatus
  icon?: string
  href?: string
  meta?: string
  tags?: string[]
}

const props = withDefaults(
  defineProps<{
    items: TimelineItem[]
    emptyText?: string
    locale?: string
    showStatusLabel?: boolean
  }>(),
  {
    emptyText: '目前沒有時間軸資料。',
    locale: 'zh-TW',
    showStatusLabel: false,
  },
)

const statusLabelMap: Record<
  TimelineStatus,
  string
> = {
  completed: '已完成',
  active: '進行中',
  pending: '尚未開始',
}

const getStatus = (
  item: TimelineItem,
): TimelineStatus => {
  return item.status || 'pending'
}

const getNodeClass = (
  item: TimelineItem,
) => {
  const status = getStatus(item)

  if (status === 'completed') {
    return [
      'border-emerald-500',
      'bg-emerald-500',
      'text-white',
    ]
  }

  if (status === 'active') {
    return [
      'border-blue-600',
      'bg-white',
      'text-blue-600',
      'ring-4',
      'ring-blue-500/10',
    ]
  }

  return [
    'border-slate-300',
    'bg-white',
    'text-slate-400',
  ]
}

const getLineClass = (
  item: TimelineItem,
) => {
  const status = getStatus(item)

  if (status === 'completed') {
    return 'bg-emerald-200'
  }

  if (status === 'active') {
    return 'bg-blue-200'
  }

  return 'bg-slate-200'
}

const getStatusTextClass = (
  item: TimelineItem,
) => {
  const status = getStatus(item)

  if (status === 'completed') {
    return 'text-emerald-600'
  }

  if (status === 'active') {
    return 'text-blue-600'
  }

  return 'text-slate-400'
}

const getDefaultIcon = (
  item: TimelineItem,
) => {
  if (item.icon) {
    return item.icon
  }

  const status = getStatus(item)

  if (status === 'completed') {
    return 'lucide:check'
  }

  if (status === 'active') {
    return 'lucide:circle-dot'
  }

  return 'lucide:circle'
}

const formatTimestamp = (
  timestamp?: string | Date,
) => {
  if (!timestamp) {
    return ''
  }

  if (typeof timestamp === 'string') {
    return timestamp
  }

  if (
    Number.isNaN(
      timestamp.getTime(),
    )
  ) {
    return ''
  }

  return new Intl.DateTimeFormat(
    props.locale,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  ).format(timestamp)
}
</script>

<template>
  <div class="w-full">
    <ol
      v-if="items.length"
      class="relative"
    >
      <li
        v-for="(item, index) in items"
        :key="item.id"
        class="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3 pb-7 last:pb-0"
      >
        <!-- 左側時間軸 -->
        <div
          class="relative flex justify-center"
          aria-hidden="true"
        >
          <!-- 節點之間的連接線 -->
          <span
            v-if="index < items.length - 1"
            class="absolute bottom-[-4px] top-8 w-px"
            :class="getLineClass(item)"
          />

          <!-- 時間軸節點 -->
          <span
            class="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition"
            :class="getNodeClass(item)"
          >
            <Icon
              :name="getDefaultIcon(item)"
              class="size-4"
            />
          </span>
        </div>

        <!-- 右側內容 -->
        <slot
          name="item"
          :item="item"
          :index="index"
          :status="getStatus(item)"
        >
          <component
            :is="item.href ? 'a' : 'div'"
            :href="item.href"
            :target="item.href ? '_blank' : undefined"
            :rel="
              item.href
                ? 'noopener noreferrer'
                : undefined
            "
            class="group min-w-0 pb-1"
            :class="
              item.href
                ? 'block rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-blue-500/10'
                : ''
            "
          >
            <div
              class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div class="min-w-0">
                <div class="flex min-w-0 items-center gap-2">
                  <h3
                    class="min-w-0 truncate font-semibold text-slate-950 transition"
                    :class="
                      item.href
                        ? 'group-hover:text-blue-600'
                        : ''
                    "
                  >
                    {{ item.title }}
                  </h3>

                  <Icon
                    v-if="item.href"
                    name="lucide:external-link"
                    class="size-3.5 shrink-0 text-slate-400"
                  />
                </div>

                <p
                  v-if="item.meta"
                  class="mt-0.5 text-xs font-medium text-slate-400"
                >
                  {{ item.meta }}
                </p>
              </div>

              <div
                v-if="
                  item.timestamp
                  || showStatusLabel
                "
                class="flex shrink-0 items-center gap-2"
              >
                <time
                  v-if="item.timestamp"
                  class="text-xs font-medium text-slate-400"
                >
                  {{ formatTimestamp(item.timestamp) }}
                </time>

                <span
                  v-if="showStatusLabel"
                  class="text-xs font-semibold"
                  :class="getStatusTextClass(item)"
                >
                  {{ statusLabelMap[getStatus(item)] }}
                </span>
              </div>
            </div>

            <p
              v-if="item.description"
              class="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-600"
            >
              {{ item.description }}
            </p>

            <div
              v-if="item.tags?.length"
              class="mt-3 flex flex-wrap gap-1.5"
            >
              <span
                v-for="tag in item.tags"
                :key="tag"
                class="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
              >
                {{ tag }}
              </span>
            </div>
          </component>
        </slot>
      </li>
    </ol>

    <div
      v-else
      class="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 text-center"
    >
      <Icon
        name="lucide:history"
        class="size-7 text-slate-300"
      />

      <p class="mt-3 text-sm text-slate-500">
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>