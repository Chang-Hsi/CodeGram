<script setup lang="ts">
import type {
  EducationExperience,
  WorkExperience,
} from '~/types/profile'
import ScrollspySidebar from '~/components/common/tabs/ScrollspySidebar.vue'
import ProfileAboutDetailsTab from './about/ProfileAboutDetailsTab.vue'
import ProfileAboutEducationTab from './about/ProfileAboutEducationTab.vue'
import ProfileAboutExperienceTab from './about/ProfileAboutExperienceTab.vue'
import ProfileAboutIdentityTab from './about/ProfileAboutIdentityTab.vue'
import ProfileAboutIntroTab from './about/ProfileAboutIntroTab.vue'
import ProfileAboutLifestyleTab from './about/ProfileAboutLifestyleTab.vue'
import ProfileAboutLinksTab from './about/ProfileAboutLinksTab.vue'
import ProfileAboutRelatedTab from './about/ProfileAboutRelatedTab.vue'

type AboutSection =
  | 'intro'
  | 'details'
  | 'work'
  | 'education'
  | 'hobbies'
  | 'interests'
  | 'links'
  | 'contact'
  | 'name'
  | 'related'

type PinnedDetailKey =
  | 'location'
  | 'work'
  | 'education'
  | 'headline'
  | 'website'
  | 'github'
  | 'displayName'
  | 'username'
  | 'skills'

interface SaveIntroPayload {
  bio: string
  pinnedDetails: PinnedDetailKey[]
}

interface SaveDetailsPayload {
  displayName: string
  username: string
  headline: string
  location: string
}

interface SaveLifestylePayload {
  values: string[]
  customValue: string
}

interface PinnedDetailDisplayItem {
  key: PinnedDetailKey
  icon: string
  text: string
  href?: string
}

const props = withDefaults(
  defineProps<{
    displayName: string
    username: string
    bio?: string
    headline?: string
    work?: string
    workExperiences?: WorkExperience[]
    educationExperiences?: EducationExperience[]
    education?: string
    location?: string
    website?: string
    githubUrl?: string
    skills?: string[]
    hobbies?: string[]
    hobbyOther?: string
    interests?: string[]
    interestOther?: string
    pinnedDetails?: PinnedDetailKey[]
    bioDraftStorageKey?: string
    isOwnProfile?: boolean
  }>(),
  {
    bio: '',
    headline: '',
    work: '',
    workExperiences: () => [],
    educationExperiences: () => [],
    education: '',
    location: '',
    website: '',
    githubUrl: '',
    skills: () => [],
    hobbies: () => [],
    hobbyOther: '',
    interests: () => [],
    interestOther: '',
    bioDraftStorageKey: '',
    isOwnProfile: false,
  },
)

const emit = defineEmits<{
  saveIntro: [payload: SaveIntroPayload]
  saveDetails: [payload: SaveDetailsPayload]
  saveWorkExperiences: [experiences: WorkExperience[]]
  saveEducationExperiences: [
    experiences: EducationExperience[],
  ]
  saveHobbies: [payload: SaveLifestylePayload]
  saveInterests: [payload: SaveLifestylePayload]
}>()

const activeSection = ref<AboutSection>('intro')
const isEditingIntro = ref(false)
const isEditingDetails = ref(false)

const introTabRef = ref<
  InstanceType<typeof ProfileAboutIntroTab>
>()

const experienceTabRef = ref<
  InstanceType<typeof ProfileAboutExperienceTab>
>()

const educationTabRef = ref<
  InstanceType<typeof ProfileAboutEducationTab>
>()

const hobbiesTabRef = ref<
  InstanceType<typeof ProfileAboutLifestyleTab>
>()

const interestsTabRef = ref<
  InstanceType<typeof ProfileAboutLifestyleTab>
>()

const pinnedDetailKeys: PinnedDetailKey[] = [
  'location',
  'work',
  'education',
  'headline',
  'website',
  'github',
  'displayName',
  'username',
  'skills',
]

const navigationItems: Array<{
  label: string
  value: AboutSection
}> = [
  {
    label: '簡介',
    value: 'intro',
  },
  {
    label: '個人資料',
    value: 'details',
  },
  {
    label: '工作經歷',
    value: 'work',
  },
  {
    label: '學歷',
    value: 'education',
  },
  {
    label: '嗜好',
    value: 'hobbies',
  },
  {
    label: '興趣',
    value: 'interests',
  },
  {
    label: '連結',
    value: 'links',
  },
  {
    label: '聯絡資料',
    value: 'contact',
  },
  {
    label: '介紹自己',
    value: 'name',
  },
  {
    label: '技術棧',
    value: 'related',
  },
]

const getEmptyText = (
  sectionLabel: string,
) => {
  return props.isOwnProfile
    ? `你尚未新增${sectionLabel}，可以點右上角編輯補充資料。`
    : `${props.displayName} 尚未新增${sectionLabel}。`
}

const resolvedBioDraftStorageKey = computed(() => {
  if (props.bioDraftStorageKey) {
    return props.bioDraftStorageKey
  }

  return `codegram:profile-about:${props.username}:bio-draft`
})

const getDisplayUrl = (
  url: string,
) => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
}

const hasPinnedDetailValue = (
  key: PinnedDetailKey,
) => {
  switch (key) {
    case 'location':
      return Boolean(props.location.trim())

    case 'work':
      return Boolean(props.work.trim())

    case 'education':
      return Boolean(props.education.trim())

    case 'headline':
      return Boolean(props.headline.trim())

    case 'website':
      return Boolean(props.website.trim())

    case 'github':
      return Boolean(props.githubUrl.trim())

    case 'displayName':
      return Boolean(props.displayName.trim())

    case 'username':
      return Boolean(props.username.trim())

    case 'skills':
      return props.skills.length > 0

    default:
      return false
  }
}

const normalizePinnedDetails = (
  values: PinnedDetailKey[],
) => {
  const validKeySet = new Set(
    pinnedDetailKeys,
  )

  return Array.from(
    new Set(values),
  ).filter(
    value => validKeySet.has(value),
  )
}

const updatePinnedDetailsDraft = (
  values: string[],
) => {
  pinnedDetailsDraft.value = values.filter(
    (
      value,
    ): value is PinnedDetailKey => {
      return pinnedDetailKeys.includes(
        value as PinnedDetailKey,
      )
    },
  )
}

const getDefaultPinnedDetails = () => {
  const defaultDetails: PinnedDetailKey[] = [
    'location',
    'work',
    'education',
  ]

  return defaultDetails.filter(
    hasPinnedDetailValue,
  )
}

const savedBio = ref(props.bio)

const savedPinnedDetails = ref<
  PinnedDetailKey[]
>(
  props.pinnedDetails === undefined
    ? getDefaultPinnedDetails()
    : normalizePinnedDetails(
        props.pinnedDetails,
      ),
)

const bioDraft = ref(
  savedBio.value,
)

const pinnedDetailsDraft = ref<
  PinnedDetailKey[]
>([
  ...savedPinnedDetails.value,
])

const pinnedDetailOptions = computed(() => {
  return [
    {
      value: 'location',
      label: '所在地',
      description:
        props.location
        || '尚未填寫所在地',
      icon: 'lucide:map-pin',
      disabled:
        !hasPinnedDetailValue(
          'location',
        ),
    },
    {
      value: 'work',
      label: '任職公司',
      description:
        props.work
        || '尚未填寫任職公司',
      icon: 'lucide:briefcase-business',
      disabled:
        !hasPinnedDetailValue(
          'work',
        ),
    },
    {
      value: 'education',
      label: '學歷',
      description:
        props.education
        || '尚未填寫學歷',
      icon: 'lucide:graduation-cap',
      disabled:
        !hasPinnedDetailValue(
          'education',
        ),
    },
    {
      value: 'headline',
      label: '個人標題',
      description:
        props.headline
        || '尚未填寫個人標題',
      icon: 'lucide:badge-info',
      disabled:
        !hasPinnedDetailValue(
          'headline',
        ),
    },
    {
      value: 'website',
      label: '個人網站',
      description:
        props.website
          ? getDisplayUrl(
              props.website,
            )
          : '尚未填寫個人網站',
      icon: 'lucide:globe-2',
      disabled:
        !hasPinnedDetailValue(
          'website',
        ),
    },
    {
      value: 'github',
      label: 'GitHub',
      description:
        props.githubUrl
          ? getDisplayUrl(
              props.githubUrl,
            )
          : '尚未填寫 GitHub',
      icon: 'simple-icons:github',
      disabled:
        !hasPinnedDetailValue(
          'github',
        ),
    },
    {
      value: 'displayName',
      label: '顯示名稱',
      description:
        props.displayName
        || '尚未設定顯示名稱',
      icon: 'lucide:user-round',
      disabled:
        !hasPinnedDetailValue(
          'displayName',
        ),
    },
    {
      value: 'username',
      label: '使用者名稱',
      description:
        props.username
          ? `@${props.username}`
          : '尚未設定使用者名稱',
      icon: 'lucide:at-sign',
      disabled:
        !hasPinnedDetailValue(
          'username',
        ),
    },
    {
      value: 'skills',
      label: '專業技能',
      description:
        props.skills.length
          ? props.skills
              .slice(0, 4)
              .join('、')
          : '尚未新增專業技能',
      icon: 'lucide:code-2',
      disabled:
        !hasPinnedDetailValue(
          'skills',
        ),
    },
  ]
})

const createPinnedDetailDisplayItem = (
  key: PinnedDetailKey,
): PinnedDetailDisplayItem | null => {
  switch (key) {
    case 'location':
      if (!props.location) {
        return null
      }

      return {
        key,
        icon: 'lucide:map-pin',
        text: props.location,
      }

    case 'work':
      if (!props.work) {
        return null
      }

      return {
        key,
        icon:
          'lucide:briefcase-business',
        text: `任職於 ${props.work}`,
      }

    case 'education':
      if (!props.education) {
        return null
      }

      return {
        key,
        icon:
          'lucide:graduation-cap',
        text:
          `就讀過 ${props.education}`,
      }

    case 'headline':
      if (!props.headline) {
        return null
      }

      return {
        key,
        icon: 'lucide:badge-info',
        text: props.headline,
      }

    case 'website':
      if (!props.website) {
        return null
      }

      return {
        key,
        icon: 'lucide:globe-2',
        text: getDisplayUrl(
          props.website,
        ),
        href: props.website,
      }

    case 'github':
      if (!props.githubUrl) {
        return null
      }

      return {
        key,
        icon: 'simple-icons:github',
        text: getDisplayUrl(
          props.githubUrl,
        ),
        href: props.githubUrl,
      }

    case 'displayName':
      if (!props.displayName) {
        return null
      }

      return {
        key,
        icon: 'lucide:user-round',
        text: props.displayName,
      }

    case 'username':
      if (!props.username) {
        return null
      }

      return {
        key,
        icon: 'lucide:at-sign',
        text: `@${props.username}`,
      }

    case 'skills':
      if (!props.skills.length) {
        return null
      }

      return {
        key,
        icon: 'lucide:code-2',
        text:
          `擅長 ${
            props.skills
              .slice(0, 4)
              .join('、')
          }${
            props.skills.length > 4
              ? ` 等 ${props.skills.length} 項技能`
              : ''
          }`,
      }

    default:
      return null
  }
}

const displayedPinnedDetails = computed(() => {
  return savedPinnedDetails.value
    .map(
      createPinnedDetailDisplayItem,
    )
    .filter(
      (
        item,
      ): item is PinnedDetailDisplayItem => {
        return item !== null
      },
    )
})

const cancelIntroEdit = () => {
  bioDraft.value
    = savedBio.value

  pinnedDetailsDraft.value = [
    ...savedPinnedDetails.value,
  ]

  isEditingIntro.value = false
}

const startIntroEdit = async () => {
  /*
   * 同時間只允許編輯一個區段。
   */
  if (isEditingDetails.value) {
    cancelDetailsEdit()
  }

  bioDraft.value
    = savedBio.value

  pinnedDetailsDraft.value = [
    ...savedPinnedDetails.value,
  ]

  isEditingIntro.value = true

  await nextTick()

  introTabRef.value?.focusEditor()
}

const saveIntroEdit = () => {
  const normalizedBio
    = bioDraft.value.trim()

  const normalizedPinnedDetails
    = normalizePinnedDetails(
      pinnedDetailsDraft.value,
    ).filter(
      hasPinnedDetailValue,
    )

  savedBio.value
    = normalizedBio

  savedPinnedDetails.value = [
    ...normalizedPinnedDetails,
  ]

  emit('saveIntro', {
    bio: normalizedBio,
    pinnedDetails: [
      ...normalizedPinnedDetails,
    ],
  })

  introTabRef.value?.clearDraft()

  isEditingIntro.value = false
}

const displayNameDraft = ref(
  props.displayName,
)

const usernameDraft = ref(
  props.username,
)

const headlineDraft = ref(
  props.headline,
)

const locationDraft = ref(
  props.location,
)

const resetDetailsDraft = () => {
  displayNameDraft.value
    = props.displayName

  usernameDraft.value
    = props.username

  headlineDraft.value
    = props.headline

  locationDraft.value
    = props.location
}

const cancelDetailsEdit = () => {
  resetDetailsDraft()
  isEditingDetails.value = false
}

const startDetailsEdit = () => {
  /*
   * 同時間只允許編輯一個區段。
   */
  if (isEditingIntro.value) {
    cancelIntroEdit()
  }

  resetDetailsDraft()

  isEditingDetails.value = true
}

const saveDetailsEdit = () => {
  const payload = {
    displayName:
      displayNameDraft.value.trim(),

    username:
      usernameDraft.value
        .trim()
        .replace(/^@/, ''),

    headline:
      headlineDraft.value.trim(),

    location:
      locationDraft.value.trim(),
  }

  if (
    !payload.displayName
    || !payload.username
  ) {
    return
  }

  emit(
    'saveDetails',
    payload,
  )

  isEditingDetails.value = false
}

const canSaveDetails = computed(() => {
  return Boolean(
    displayNameDraft.value.trim()
    && usernameDraft.value
      .trim()
      .replace(/^@/, ''),
  )
})

watch(
  () => props.bio,
  (value) => {
    savedBio.value = value

    if (!isEditingIntro.value) {
      bioDraft.value = value
    }
  },
)

watch(
  () => props.pinnedDetails,
  (value) => {
    if (value === undefined) {
      return
    }

    const normalizedValue
      = normalizePinnedDetails(
        value,
      )

    savedPinnedDetails.value = [
      ...normalizedValue,
    ]

    if (!isEditingIntro.value) {
      pinnedDetailsDraft.value = [
        ...normalizedValue,
      ]
    }
  },
  {
    deep: true,
  },
)

watch(
  () => [
    props.displayName,
    props.username,
    props.headline,
    props.location,
  ],
  ([
    displayName,
    username,
    headline,
    location,
  ]) => {
    if (isEditingDetails.value) {
      return
    }

    displayNameDraft.value
      = displayName ?? ''

    usernameDraft.value
      = username ?? ''

    headlineDraft.value
      = headline ?? ''

    locationDraft.value
      = location ?? ''
  },
)
</script>

<template>
  <section
    class="max-h-[530px] overflow-visible rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
  >
    <div class="px-4 pt-4 sm:px-5 sm:pt-5">
      <h2 class="px-2 text-xl font-bold text-slate-950">
        關於
      </h2>
    </div>

    <div class="px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
      <ScrollspySidebar
        v-model="activeSection"
        :items="navigationItems"
        aria-label="關於資料分類"
        content-height="440px"
        sidebar-width="160px"
        :offset="20"
        display-mode="single"
      >
        <!--
          ScrollspySidebar 會將目前區段資料傳入。
          這裡集中處理每一頁右上角的編輯按鈕。
        -->
        <template #action="{ item }">
          <!-- 簡介 -->
          <button
            v-if="
              isOwnProfile
              && item.value === 'intro'
            "
            type="button"
            :aria-label="
              isEditingIntro
                ? '取消編輯關於資料'
                : '編輯關於資料'
            "
            class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            @click="
              isEditingIntro
                ? cancelIntroEdit()
                : startIntroEdit()
            "
          >
            <Icon
              :name="
                isEditingIntro
                  ? 'lucide:x'
                  : 'lucide:pencil'
              "
              class="size-5"
            />
          </button>

          <!-- 個人詳細資料 -->
          <button
            v-else-if="
              isOwnProfile
              && item.value === 'details'
            "
            type="button"
            :aria-label="
              isEditingDetails
                ? '取消編輯個人詳細資料'
                : '編輯個人詳細資料'
            "
            class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            @click="
              isEditingDetails
                ? cancelDetailsEdit()
                : startDetailsEdit()
            "
          >
            <Icon
              :name="
                isEditingDetails
                  ? 'lucide:x'
                  : 'lucide:pencil'
              "
              class="size-5"
            />
          </button>

          <!-- 工作經歷 -->
          <button
            v-else-if="
              isOwnProfile
              && item.value === 'work'
            "
            type="button"
            aria-label="編輯工作經歷"
            class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            @click="
              experienceTabRef?.openEditor()
            "
          >
            <Icon
              name="lucide:pencil"
              class="size-5"
            />
          </button>

          <!-- 學歷 -->
          <button
            v-else-if="
              isOwnProfile
              && item.value === 'education'
            "
            type="button"
            aria-label="編輯學歷"
            class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            @click="
              educationTabRef?.openEditor()
            "
          >
            <Icon
              name="lucide:pencil"
              class="size-5"
            />
          </button>

          <!-- 嗜好 -->
          <button
            v-else-if="
              isOwnProfile
              && item.value === 'hobbies'
            "
            type="button"
            aria-label="編輯嗜好"
            class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            @click="
              hobbiesTabRef?.openEditor()
            "
          >
            <Icon
              name="lucide:pencil"
              class="size-5"
            />
          </button>

          <!-- 興趣 -->
          <button
            v-else-if="
              isOwnProfile
              && item.value === 'interests'
            "
            type="button"
            aria-label="編輯興趣"
            class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            @click="
              interestsTabRef?.openEditor()
            "
          >
            <Icon
              name="lucide:pencil"
              class="size-5"
            />
          </button>

          <!-- 其他分類 -->
          <NuxtLink
            v-else-if="isOwnProfile"
            to="/settings/profile"
            :aria-label="
              `編輯${item.label}`
            "
            class="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
          >
            <Icon
              name="lucide:pencil"
              class="size-5"
            />
          </NuxtLink>
        </template>

        <!-- 簡介 -->
        <template #intro>
          <ProfileAboutIntroTab
            ref="introTabRef"
            :saved-bio="savedBio"
            :displayed-pinned-details="
              displayedPinnedDetails
            "
            :is-editing="isEditingIntro"
            :bio-draft="bioDraft"
            :storage-key="
              resolvedBioDraftStorageKey
            "
            :pinned-details-draft="
              pinnedDetailsDraft
            "
            :pinned-detail-options="
              pinnedDetailOptions
            "
            @update:bio-draft="
              bioDraft = $event
            "
            @update:pinned-details-draft="
              updatePinnedDetailsDraft
            "
            @cancel="cancelIntroEdit"
            @save="saveIntroEdit"
          />
        </template>

        <!-- 個人詳細資料 -->
        <template #details>
          <ProfileAboutDetailsTab
            :display-name="displayName"
            :username="username"
            :headline="headline"
            :location="location"
            :is-editing="
              isEditingDetails
            "
            :display-name-draft="
              displayNameDraft
            "
            :username-draft="
              usernameDraft
            "
            :headline-draft="
              headlineDraft
            "
            :location-draft="
              locationDraft
            "
            @update:display-name-draft="
              displayNameDraft = $event
            "
            @update:username-draft="
              usernameDraft = $event
            "
            @update:headline-draft="
              headlineDraft = $event
            "
            @update:location-draft="
              locationDraft = $event
            "
          />

          <div
            v-if="isEditingDetails"
            class="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5"
          >
            <button
              type="button"
              class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              @click="cancelDetailsEdit"
            >
              取消
            </button>

            <button
              type="button"
              :disabled="!canSaveDetails"
              class="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              @click="saveDetailsEdit"
            >
              儲存變更
            </button>
          </div>
        </template>

        <!-- 工作經歷 -->
        <template #work>
          <ProfileAboutExperienceTab
            ref="experienceTabRef"
            section="work"
            :work="work"
            :work-experiences="
              workExperiences
            "
            :education="education"
            :headline="headline"
            :empty-text="
              getEmptyText('工作經歷')
            "
            @save-work-experiences="
              emit(
                'saveWorkExperiences',
                $event,
              )
            "
          />
        </template>

        <!-- 學歷 -->
        <template #education>
          <ProfileAboutEducationTab
            ref="educationTabRef"
            :education="education"
            :education-experiences="
              educationExperiences
            "
            :empty-text="
              getEmptyText('學歷')
            "
            @save-education-experiences="
              emit(
                'saveEducationExperiences',
                $event,
              )
            "
          />
        </template>

        <!-- 嗜好 -->
        <template #hobbies>
          <ProfileAboutLifestyleTab
            ref="hobbiesTabRef"
            section="hobbies"
            :values="hobbies"
            :custom-value="hobbyOther"
            @save="
              emit('saveHobbies', $event)
            "
          />
        </template>

        <!-- 興趣 -->
        <template #interests>
          <ProfileAboutLifestyleTab
            ref="interestsTabRef"
            section="interests"
            :values="interests"
            :custom-value="interestOther"
            @save="
              emit('saveInterests', $event)
            "
          />
        </template>

        <!-- 連結 -->
        <template #links>
          <ProfileAboutLinksTab
            :website="website"
            :github-url="githubUrl"
            :empty-text="
              getEmptyText('連結')
            "
          />
        </template>

        <!-- 聯絡資料 -->
        <template #contact>
          <ProfileAboutIdentityTab
            section="contact"
            :display-name="displayName"
            :username="username"
          />
        </template>

        <!-- 名字 -->
        <template #name>
          <ProfileAboutIdentityTab
            section="name"
            :display-name="displayName"
            :username="username"
          />
        </template>

        <!-- 技術棧 -->
        <template #related>
          <ProfileAboutRelatedTab
            :skills="skills"
            :empty-text="
              getEmptyText('技術棧')
            "
          />
        </template>
      </ScrollspySidebar>
    </div>
  </section>
</template>
