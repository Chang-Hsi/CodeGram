<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

interface FileTreeNode {
  id: string
  label: string
  type: 'folder' | 'item'
  icon?: string
  iconClass?: string
  children?: FileTreeNode[]
}

interface VisibleTreeNode {
  node: FileTreeNode
  depth: number
  hasChildren: boolean
}

const props = withDefaults(
  defineProps<{
    nodes: FileTreeNode[]
    ariaLabel?: string
    defaultOpen?: boolean
    defaultExpandedIds?: string[]
  }>(),
  {
    ariaLabel: '樹狀資料',
    defaultOpen: true,
    defaultExpandedIds: () => [],
  },
)

defineSlots<{
  item: (props: {
    node: FileTreeNode
    depth: number
  }) => unknown
}>()

const emit = defineEmits<{
  toggle: [
    payload: {
      node: FileTreeNode
      open: boolean
    },
  ]
}>()

const openNodeIds = ref<Set<string>>(new Set())

const collectFolderIds = (
  nodes: FileTreeNode[],
  result = new Set<string>(),
) => {
  nodes.forEach((node) => {
    if (node.type !== 'folder') {
      return
    }

    result.add(node.id)

    if (node.children?.length) {
      collectFolderIds(node.children, result)
    }
  })

  return result
}

const syncOpenNodes = () => {
  const availableFolderIds = collectFolderIds(props.nodes)

  const nextOpenNodeIds = new Set(
    Array.from(openNodeIds.value).filter((nodeId) => {
      return availableFolderIds.has(nodeId)
    }),
  )

  props.defaultExpandedIds.forEach((nodeId) => {
    if (availableFolderIds.has(nodeId)) {
      nextOpenNodeIds.add(nodeId)
    }
  })

  if (props.defaultOpen) {
    availableFolderIds.forEach((nodeId) => {
      nextOpenNodeIds.add(nodeId)
    })
  }

  openNodeIds.value = nextOpenNodeIds
}

const isNodeOpen = (nodeId: string) => {
  return openNodeIds.value.has(nodeId)
}

const visibleNodes = computed<VisibleTreeNode[]>(() => {
  const result: VisibleTreeNode[] = []

  const visitNodes = (
    nodes: FileTreeNode[],
    depth: number,
  ) => {
    nodes.forEach((node) => {
      const hasChildren =
        node.type === 'folder'
        && Boolean(node.children?.length)

      result.push({
        node,
        depth,
        hasChildren,
      })

      if (
        hasChildren
        && isNodeOpen(node.id)
        && node.children
      ) {
        visitNodes(node.children, depth + 1)
      }
    })
  }

  visitNodes(props.nodes, 0)

  return result
})

const toggleNode = (node: FileTreeNode) => {
  if (
    node.type !== 'folder'
    || !node.children?.length
  ) {
    return
  }

  const nextOpenNodeIds = new Set(openNodeIds.value)
  const nextOpenState = !nextOpenNodeIds.has(node.id)

  if (nextOpenState) {
    nextOpenNodeIds.add(node.id)
  } else {
    nextOpenNodeIds.delete(node.id)
  }

  openNodeIds.value = nextOpenNodeIds

  emit('toggle', {
    node,
    open: nextOpenState,
  })
}

const getRowStyle = (depth: number) => {
  return {
    paddingLeft: `${8 + depth * 24}px`,
  }
}

watch(
  () => [
    props.nodes,
    props.defaultOpen,
    props.defaultExpandedIds,
  ],
  syncOpenNodes,
  {
    immediate: true,
    deep: true,
  },
)
</script>

<template>
  <nav
    v-bind="$attrs"
    :aria-label="ariaLabel"
    class="file-tree rounded-xl border border-slate-200 bg-white p-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
  >
    <TransitionGroup
      name="file-tree-row"
      tag="ul"
      role="tree"
      class="relative space-y-0.5"
    >
      <li
        v-for="row in visibleNodes"
        :key="row.node.id"
        role="treeitem"
        :aria-level="row.depth + 1"
        :aria-expanded="
          row.node.type === 'folder'
            ? isNodeOpen(row.node.id)
            : undefined
        "
      >
        <!-- 資料夾節點 -->
        <button
          v-if="row.node.type === 'folder'"
          type="button"
          class="group flex min-h-9 w-full items-center gap-2 rounded-lg pr-2 text-left outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          :class="
            row.depth === 0
              ? 'font-semibold text-slate-900'
              : 'font-medium text-slate-700'
          "
          :style="getRowStyle(row.depth)"
          :aria-label="
            row.hasChildren
              ? `${isNodeOpen(row.node.id) ? '收合' : '展開'}${row.node.label}`
              : row.node.label
          "
          @click="toggleNode(row.node)"
        >
          <Icon
            name="lucide:chevron-right"
            class="size-3.5 shrink-0 text-slate-400 transition-transform duration-200"
            :class="{
              'rotate-90':
                row.hasChildren
                && isNodeOpen(row.node.id),
              'invisible': !row.hasChildren,
            }"
          />

          <Icon
            :name="
              row.hasChildren
              && isNodeOpen(row.node.id)
                ? 'lucide:folder-open'
                : 'lucide:folder'
            "
            class="size-[17px] shrink-0 text-amber-500"
          />

          <span class="min-w-0 flex-1 truncate text-sm">
            {{ row.node.label }}
          </span>
        </button>

        <!-- 技術節點 -->
        <div
          v-else
          class="flex min-h-9 items-center py-0.5 pr-2"
          :style="getRowStyle(row.depth)"
        >
          <slot
            name="item"
            :node="row.node"
            :depth="row.depth"
          >
            <span class="inline-flex items-center gap-2 text-sm text-slate-700">
              <Icon
                :name="row.node.icon || 'lucide:file'"
                class="size-4 shrink-0"
                :class="row.node.iconClass"
              />

              {{ row.node.label }}
            </span>
          </slot>
        </div>
      </li>
    </TransitionGroup>
  </nav>
</template>

<style scoped>
.file-tree-row-enter-active,
.file-tree-row-leave-active,
.file-tree-row-move {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.file-tree-row-enter-from,
.file-tree-row-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .file-tree * {
    transition-duration: 1ms !important;
  }
}
</style>