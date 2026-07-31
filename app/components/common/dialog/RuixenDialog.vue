<script setup lang="ts">
import Fripplebutton from '~/components/common/button/Fripplebutton.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    icon?: string
    confirmText?: string
    cancelText?: string
    maxWidth?: string
    confirmDisabled?: boolean
    showFooter?: boolean
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
  }>(),
  {
    description: '',
    icon: 'lucide:user-round-pen',
    confirmText: '儲存變更',
    cancelText: '取消',
    maxWidth: '640px',
    confirmDisabled: false,
    showFooter: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const dialogRef = ref<HTMLElement>()
const titleId = useId()
const descriptionId = useId()

let previouslyFocusedElement: HTMLElement | null = null
let originalBodyOverflow = ''
let originalBodyPaddingRight = ''
let isBodyLocked = false

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const lockBodyScroll = () => {
  if (!import.meta.client || isBodyLocked) {
    return
  }

  originalBodyOverflow = document.body.style.overflow
  originalBodyPaddingRight = document.body.style.paddingRight

  const scrollbarWidth =
    window.innerWidth
    - document.documentElement.clientWidth

  document.body.style.overflow = 'hidden'

  if (scrollbarWidth > 0) {
    const currentPaddingRight = Number.parseFloat(
      window.getComputedStyle(document.body).paddingRight,
    ) || 0

    document.body.style.paddingRight =
      `${currentPaddingRight + scrollbarWidth}px`
  }

  isBodyLocked = true
}

const unlockBodyScroll = () => {
  if (!import.meta.client || !isBodyLocked) {
    return
  }

  document.body.style.overflow = originalBodyOverflow
  document.body.style.paddingRight =
    originalBodyPaddingRight

  isBodyLocked = false
}

const focusDialog = async () => {
  await nextTick()

  const firstFocusableElement =
    dialogRef.value?.querySelector<HTMLElement>(
      focusableSelector,
    )

  if (firstFocusableElement) {
    firstFocusableElement.focus()
  }
  else {
    dialogRef.value?.focus()
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const confirmDialog = () => {
  if (props.confirmDisabled) {
    return
  }

  emit('confirm')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    closeDialog()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (
    event.key === 'Escape'
    && props.closeOnEscape
  ) {
    event.preventDefault()
    closeDialog()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const dialog = dialogRef.value

  if (!dialog) {
    return
  }

  const focusableElements = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      focusableSelector,
    ),
  ).filter((element) => {
    return element.offsetParent !== null
  })

  if (!focusableElements.length) {
    event.preventDefault()
    dialog.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement =
    focusableElements[focusableElements.length - 1]

  if (
    event.shiftKey
    && document.activeElement === firstElement
  ) {
    event.preventDefault()
    lastElement?.focus()
    return
  }

  if (
    !event.shiftKey
    && document.activeElement === lastElement
  ) {
    event.preventDefault()
    firstElement?.focus()
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!import.meta.client) {
      return
    }

    if (isOpen) {
      previouslyFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      lockBodyScroll()
      await focusDialog()
      return
    }

    unlockBodyScroll()

    await nextTick()
    previouslyFocusedElement?.focus()
    previouslyFocusedElement = null
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  unlockBodyScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ruixen-dialog">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
        @mousedown.self="handleBackdropClick"
      >
        <section
          ref="dialogRef"
          v-bind="$attrs"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="
            description
              ? descriptionId
              : undefined
          "
          tabindex="-1"
          class="ruixen-dialog__panel relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] outline-none"
          :style="{
            maxWidth,
          }"
          @keydown="handleKeydown"
        >
          <!-- 漸層頂部 -->
          <div
            class="ruixen-dialog__header relative h-28 shrink-0"
          >
            <div
              class="absolute inset-0 bg-white/10"
            />

            <button
              type="button"
              aria-label="關閉彈窗"
              class="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-white/75 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              @click="closeDialog"
            >
              <Icon
                name="lucide:x"
                class="size-5"
              />
            </button>

            <!-- 中間浮動圖示 -->
            <div
              class="absolute bottom-0 left-1/2 z-10 flex size-16 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg"
            >
              <slot name="visual">
                <Icon
                  :name="icon"
                  class="size-7"
                />
              </slot>
            </div>
          </div>

          <!-- 可捲動內容 -->
          <div class="min-h-0 flex-1 overflow-y-auto">
            <div class="px-5 pb-6 pt-12 sm:px-7">
              <header class="text-center">
                <h2
                  :id="titleId"
                  class="text-xl font-bold text-slate-950"
                >
                  {{ title }}
                </h2>

                <p
                  v-if="description"
                  :id="descriptionId"
                  class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500"
                >
                  {{ description }}
                </p>
              </header>

              <div class="mt-6">
                <slot />
              </div>
            </div>
          </div>

          <!-- 底部操作區 -->
          <footer
            v-if="showFooter"
            class="shrink-0 border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-7"
          >
            <slot
              name="footer"
              :close="closeDialog"
              :confirm="confirmDialog"
            >
              <div
                class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
              >
                <Fripplebutton
                  type="button"
                  ripple-color="rgba(15, 23, 42, 0.12)"
                  class="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  @click="closeDialog"
                >
                  {{ cancelText }}
                </Fripplebutton>

                <Fripplebutton
                  type="button"
                  :disabled="confirmDisabled"
                  ripple-color="rgba(255, 255, 255, 0.35)"
                  class="h-10 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="confirmDialog"
                >
                  {{ confirmText }}
                </Fripplebutton>
              </div>
            </slot>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ruixen-dialog__header {
  background:
    radial-gradient(
      circle at 18% 20%,
      rgb(125 211 252 / 55%),
      transparent 34%
    ),
    radial-gradient(
      circle at 80% 10%,
      rgb(244 114 182 / 45%),
      transparent 36%
    ),
    linear-gradient(
      110deg,
      #93c5fd 0%,
      #c4b5fd 48%,
      #f0abfc 100%
    );
}

.ruixen-dialog__header::after {
  position: absolute;
  inset: 0;
  content: '';
  background-image:
    radial-gradient(
      rgb(255 255 255 / 32%) 1px,
      transparent 1px
    );
  background-size: 18px 18px;
  mask-image:
    linear-gradient(to bottom, black, transparent);
}

.ruixen-dialog-enter-active,
.ruixen-dialog-leave-active {
  transition: opacity 200ms ease;
}

.ruixen-dialog-enter-active .ruixen-dialog__panel,
.ruixen-dialog-leave-active .ruixen-dialog__panel {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.ruixen-dialog-enter-from,
.ruixen-dialog-leave-to {
  opacity: 0;
}

.ruixen-dialog-enter-from .ruixen-dialog__panel,
.ruixen-dialog-leave-to .ruixen-dialog__panel {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .ruixen-dialog-enter-active,
  .ruixen-dialog-leave-active,
  .ruixen-dialog-enter-active .ruixen-dialog__panel,
  .ruixen-dialog-leave-active .ruixen-dialog__panel {
    transition-duration: 1ms;
  }
}
</style>
