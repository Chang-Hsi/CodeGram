<script setup lang="ts">
import type {
  EducationExperience,
} from '~/types/profile'
import Iconbutton from '~/components/common/button/Iconbutton.vue'
import RuixenDialog from '~/components/common/dialog/RuixenDialog.vue'
import LableInput from '~/components/common/forms/LableInput.vue'
import PromptTextarea from '~/components/common/forms/PromptTextarea.vue'
import Timeline from '~/components/common/tabs/Timeline.vue'

interface EducationExperienceDraft
  extends Omit<EducationExperience, 'endDate' | 'tags'> {
  endDate: string
  tagsText: string
}

const props = withDefaults(
  defineProps<{
    education: string
    emptyText: string
    educationExperiences?: EducationExperience[]
  }>(),
  {
    educationExperiences: () => [],
  },
)

const emit = defineEmits<{
  saveEducationExperiences: [
    experiences: EducationExperience[],
  ]
}>()

const isDialogOpen = ref(false)
const educationDrafts = ref<
  EducationExperienceDraft[]
>([])
const expandedEducationIds = ref(
  new Set<string>(),
)
let draftId = 0

const createDraftId = () => {
  draftId += 1

  return `education-${Date.now()}-${draftId}`
}

const createEmptyDraft = (
): EducationExperienceDraft => {
  return {
    id: createDraftId(),
    school: '',
    educationLevel: '',
    startDate: '',
    endDate: '',
    description: '',
    tagsText: '',
  }
}

const toDraft = (
  experience: EducationExperience,
): EducationExperienceDraft => {
  return {
    ...experience,
    endDate: experience.endDate || '',
    tagsText: experience.tags?.join('、') || '',
  }
}

const resetDrafts = () => {
  educationDrafts.value
    = props.educationExperiences.length
      ? props.educationExperiences.map(toDraft)
      : [createEmptyDraft()]

  expandedEducationIds.value = new Set()
}

const openEditor = () => {
  resetDrafts()
  isDialogOpen.value = true
}

const addEducationExperience = () => {
  educationDrafts.value.push(
    createEmptyDraft(),
  )
}

const removeEducationExperience = (
  index: number,
) => {
  const removedDraft
    = educationDrafts.value[index]

  educationDrafts.value.splice(index, 1)

  if (!removedDraft) {
    return
  }

  const nextExpandedIds = new Set(
    expandedEducationIds.value,
  )

  nextExpandedIds.delete(
    String(removedDraft.id),
  )

  expandedEducationIds.value
    = nextExpandedIds
}

const isEducationExpanded = (
  id: EducationExperienceDraft['id'],
) => {
  return expandedEducationIds.value.has(
    String(id),
  )
}

const toggleEducation = (
  id: EducationExperienceDraft['id'],
) => {
  const normalizedId = String(id)
  const nextExpandedIds = new Set(
    expandedEducationIds.value,
  )

  if (nextExpandedIds.has(normalizedId)) {
    nextExpandedIds.delete(normalizedId)
  } else {
    nextExpandedIds.add(normalizedId)
  }

  expandedEducationIds.value
    = nextExpandedIds
}

const hasInvalidDateRange = (
  draft: EducationExperienceDraft,
) => {
  return Boolean(
    draft.startDate
    && draft.endDate
    && draft.endDate < draft.startDate,
  )
}

const canSaveEducationExperiences = computed(() => {
  return educationDrafts.value.every((draft) => {
    return Boolean(
      draft.school.trim()
      && draft.educationLevel.trim()
      && draft.startDate
      && draft.description.trim()
      && !hasInvalidDateRange(draft),
    )
  })
})

const saveEducationExperiences = () => {
  if (!canSaveEducationExperiences.value) {
    return
  }

  const experiences = educationDrafts.value.map(
    (draft): EducationExperience => {
      const tags = draft.tagsText
        .split(/[、,，]/)
        .map(tag => tag.trim())
        .filter(Boolean)

      return {
        id: draft.id,
        school: draft.school.trim(),
        educationLevel:
          draft.educationLevel.trim(),
        startDate: draft.startDate,
        ...(draft.endDate
          ? { endDate: draft.endDate }
          : {}),
        description: draft.description.trim(),
        ...(tags.length ? { tags } : {}),
      }
    },
  )

  emit(
    'saveEducationExperiences',
    experiences,
  )
  isDialogOpen.value = false
}

const timelineItems = computed(() => {
  if (props.educationExperiences.length) {
    return [...props.educationExperiences]
      .sort((educationA, educationB) => {
        return educationA.startDate.localeCompare(
          educationB.startDate,
        )
      })
      .map((experience) => {
        const hasGraduated = Boolean(
          experience.endDate,
        )

        return {
          id: experience.id,
          title: experience.educationLevel,
          meta: experience.school,
          timestamp:
            `${experience.startDate} ~ ${
              experience.endDate || 'Present'
            }`,
          description: experience.description,
          tags: experience.tags,
          status: hasGraduated
            ? 'completed' as const
            : 'active' as const,
          icon: hasGraduated
            ? 'lucide:check'
            : 'lucide:graduation-cap',
        }
      })
  }

  if (props.education) {
    return [
      {
        id: 'current-education',
        title: '學歷',
        meta: props.education,
        description: '尚未補充詳細學歷',
        status: 'completed' as const,
        icon: 'lucide:graduation-cap',
      },
    ]
  }

  return []
})

defineExpose({
  openEditor,
})
</script>

<template>
  <div class="mt-6">
    <Timeline
      :items="timelineItems"
      :empty-text="emptyText"
    />

    <RuixenDialog
      v-model="isDialogOpen"
      title="編輯學歷"
      description="新增、調整或移除學歷；結束日期留白會顯示為 Present。"
      icon="lucide:graduation-cap"
      max-width="780px"
      :confirm-disabled="
        !canSaveEducationExperiences
      "
      @confirm="saveEducationExperiences"
    >
      <div class="space-y-5">
        <div class="flex justify-end">
          <Iconbutton
            icon="lucide:plus"
            size="compact"
            variant="ghost"
            icon-only
            aria-label="新增學歷"
            title="新增學歷"
            @click="addEducationExperience"
          />
        </div>

        <div
          v-if="!educationDrafts.length"
          class="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center"
        >
          <Icon
            name="lucide:graduation-cap"
            class="mx-auto size-7 text-slate-400"
          />

          <p class="mt-2 text-sm text-slate-500">
            尚未新增學歷
          </p>
        </div>

        <article
          v-for="(draft, index) in educationDrafts"
          :key="draft.id"
          class="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
        >
          <div class="mb-4 flex items-center justify-between gap-3">
            <h3 class="font-semibold text-slate-900">
              學歷 {{ index + 1 }}
            </h3>

            <div class="flex items-center gap-1">
              <Iconbutton
                icon="lucide:chevron-down"
                size="compact"
                variant="ghost"
                icon-only
                :animate-icon="false"
                :icon-class="
                  isEducationExpanded(draft.id)
                    ? 'rotate-180 transition-transform duration-300'
                    : 'rotate-0 transition-transform duration-300'
                "
                :aria-label="
                  isEducationExpanded(draft.id)
                    ? `收合學歷 ${index + 1}`
                    : `展開學歷 ${index + 1}`
                "
                :aria-expanded="
                  isEducationExpanded(draft.id)
                "
                :title="
                  isEducationExpanded(draft.id)
                    ? '收合'
                    : '展開'
                "
                @click="toggleEducation(draft.id)"
              />

              <Iconbutton
                icon="lucide:trash-2"
                size="compact"
                variant="danger-ghost"
                icon-only
                :aria-label="`移除學歷 ${index + 1}`"
                :title="`移除學歷 ${index + 1}`"
                @click="
                  removeEducationExperience(index)
                "
              />
            </div>
          </div>

          <div
            class="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
            :class="
              isEducationExpanded(draft.id)
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            "
          >
            <div class="min-h-0 overflow-hidden">
              <div class="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                <LableInput
                  :id="`education-school-${draft.id}`"
                  v-model="draft.school"
                  label="學校名稱"
                  placeholder="例如：國立臺北科技大學"
                  autocomplete="organization"
                  required
                />

                <LableInput
                  :id="`education-level-${draft.id}`"
                  v-model="draft.educationLevel"
                  label="教育階段"
                  placeholder="例如：大學、研究所"
                  required
                />

                <LableInput
                  :id="`education-start-date-${draft.id}`"
                  v-model="draft.startDate"
                  label="開始日期"
                  type="date"
                  required
                />

                <LableInput
                  :id="`education-end-date-${draft.id}`"
                  v-model="draft.endDate"
                  label="結束日期（就讀中請留白）"
                  type="date"
                  :min="draft.startDate || undefined"
                  :error="
                    hasInvalidDateRange(draft)
                      ? '結束日期不可早於開始日期'
                      : ''
                  "
                />

                <div class="sm:col-span-2">
                  <LableInput
                    :id="`education-tags-${draft.id}`"
                    v-model="draft.tagsText"
                    label="科系或相關領域（選填）"
                    placeholder="例如：資訊工程、互動設計"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label
                    :for="`education-description-${draft.id}`"
                    class="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    主要學習經歷或成就

                    <span class="ml-0.5 text-red-500">*</span>
                  </label>

                  <PromptTextarea
                    :id="`education-description-${draft.id}`"
                    v-model="draft.description"
                    :storage-key="`codegram:${draft.id}:description-draft`"
                    :auto-load-draft="false"
                    :rows="4"
                    :maxlength="500"
                    placeholder="描述學習內容、社團活動、研究方向或主要成就……"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </RuixenDialog>
  </div>
</template>
