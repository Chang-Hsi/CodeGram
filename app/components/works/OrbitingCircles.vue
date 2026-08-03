<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface OrbitItem {
  id?: string | number
  name: string

  /**
   * @nuxt/icon 使用的 icon name。
   *
   * 例如：
   * simple-icons:vuedotjs
   * simple-icons:nuxt
   */
  icon?: string

  /**
   * 如果不使用 Icon，
   * 也可以直接給圖片。
   */
  imageUrl?: string

  imageAlt?: string

  /**
   * icon 顏色。
   */
  color?: string

  /**
   * icon 外層圓形背景。
   */
  backgroundColor?: string
}

interface OrbitGroup {
  /**
   * 軌道半徑。
   *
   * 以 designSize 為基準。
   */
  radius: number

  /**
   * 一圈需要幾秒。
   */
  duration: number

  /**
   * true = 反方向。
   */
  reverse?: boolean

  /**
   * 整個橢圓在畫面上的旋轉角度。
   */
  tilt?: number

  /**
   * 橢圓壓縮比例。
   *
   * 1 = 正圓
   * 0.4 = 比較扁
   */
  squash?: number

  /**
   * icon 大小。
   */
  itemSize?: number

  /**
   * 動畫額外 delay。
   */
  delay?: number

  items: OrbitItem[]
}

const props = withDefaults(
  defineProps<{
    groups?: OrbitGroup[]

    /**
     * 整個動畫的設計基準尺寸。
     */
    designSize?: number

    /**
     * 是否顯示 orbit path。
     */
    showPaths?: boolean

    /**
     * 滑鼠移上去是否暫停。
     */
    pauseOnHover?: boolean

    /**
     * 中央 Globe 是否顯示光暈。
     */
    showGlow?: boolean

    ariaLabel?: string
  }>(),
  {
    groups: () => [],
    designSize: 560,
    showPaths: true,
    pauseOnHover: true,
    showGlow: true,
    ariaLabel: 'Technology orbit',
  },
)

/* -------------------------------------------------------------------------- */
/* Default data                                                                */
/* -------------------------------------------------------------------------- */

/**
 * 預設資料刻意按照 ShadcnSpace
 * Orbiting Circles 02 Preview 的分組。
 *
 * 之後你也可以從父層傳 groups 完全取代。
 */
const defaultGroups: OrbitGroup[] = [
  {
    radius: 118,
    duration: 15,
    reverse: false,
    tilt: -8,
    squash: 0.42,
    itemSize: 46,

    items: [
      {
        id: 'supabase',
        name: 'Supabase',
        icon: 'simple-icons:supabase',
        color: '#3ECF8E',
      },
      {
        id: 'gemini',
        name: 'Gemini',
        icon: 'simple-icons:googlegemini',
        color: '#8E75B2',
      },
      {
        id: 'make',
        name: 'Make',
        icon: 'simple-icons:make',
        color: '#6D00CC',
      },
    ],
  },

  {
    radius: 182,
    duration: 22,
    reverse: true,
    tilt: 58,
    squash: 0.4,
    itemSize: 48,

    items: [
      {
        id: 'figma',
        name: 'Figma',
        icon: 'simple-icons:figma',
        color: '#F24E1E',
      },
      {
        id: 'slack',
        name: 'Slack',
        icon: 'simple-icons:slack',
        color: '#4A154B',
      },
    ],
  },

  {
    radius: 242,
    duration: 30,
    reverse: false,
    tilt: -52,
    squash: 0.38,
    itemSize: 50,

    items: [
      {
        id: 'anthropic',
        name: 'Claude',
        icon: 'simple-icons:anthropic',
        color: '#D97757',
      },
      {
        id: 'react',
        name: 'React',
        icon: 'simple-icons:react',
        color: '#61DAFB',
      },
      {
        id: 'python',
        name: 'Python',
        icon: 'simple-icons:python',
        color: '#3776AB',
      },
    ],
  },
]

const orbitGroups = computed(() => {
  if (
    props.groups &&
    props.groups.length
  ) {
    return props.groups
  }

  return defaultGroups
})

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const clamp = (
  value: number,
  min: number,
  max: number,
) => {
  return Math.min(
    Math.max(value, min),
    max,
  )
}

/**
 * 軌道 path 本身的 style。
 */
const getPathStyle = (
  group: OrbitGroup,
): CSSProperties => {
  const squash = clamp(
    group.squash ?? 0.42,
    0.2,
    1,
  )

  const diameterPercent =
    (
      (group.radius * 2) /
      props.designSize
    ) * 100

  return {
    '--orbit-size':
      `${diameterPercent}%`,

    '--orbit-tilt':
      `${group.tilt ?? 0}deg`,

    '--orbit-squash':
      String(squash),
  } as CSSProperties
}

/**
 * 每個 item 都有自己的一層 orbit。
 *
 * 使用負 animation-delay
 * 把它們平均分散在軌道上。
 */
const getOrbitStyle = (
  group: OrbitGroup,
  itemIndex: number,
): CSSProperties => {
  const itemCount = Math.max(
    group.items.length,
    1,
  )

  const duration = Math.max(
    group.duration,
    1,
  )

  const squash = clamp(
    group.squash ?? 0.42,
    0.2,
    1,
  )

  const diameterPercent =
    (
      (group.radius * 2) /
      props.designSize
    ) * 100

  const distributedDelay =
    -(
      duration /
      itemCount
    ) * itemIndex

  const delay =
    distributedDelay +
    (group.delay ?? 0)

  const staticAngle =
    (
      360 /
      itemCount
    ) * itemIndex

  return {
    '--orbit-size':
      `${diameterPercent}%`,

    '--orbit-duration':
      `${duration}s`,

    '--orbit-delay':
      `${delay}s`,

    '--orbit-direction':
      group.reverse
        ? 'reverse'
        : 'normal',

    '--orbit-tilt':
      `${group.tilt ?? 0}deg`,

    '--orbit-counter-tilt':
      `${-(group.tilt ?? 0)}deg`,

    '--orbit-squash':
      String(squash),

    '--orbit-unsquash':
      String(1 / squash),

    '--node-size':
      `${
        group.itemSize ?? 48
      }px`,

    '--orbit-static-angle':
      `${staticAngle}deg`,

    '--orbit-static-counter-angle':
      `${-staticAngle}deg`,
  } as CSSProperties
}

const getItemStyle = (
  item: OrbitItem,
): CSSProperties => {
  return {
    '--node-color':
      item.color ??
      '#0f172a',

    '--node-background':
      item.backgroundColor ??
      '#ffffff',
  } as CSSProperties
}
</script>

<template>
  <div
    class="orbiting-circles"
    :class="{
      'orbiting-circles--pause':
        pauseOnHover,
    }"
    role="img"
    :aria-label="ariaLabel"
  >
    <!-- 背景柔光 -->
    <div
      v-if="showGlow"
      class="orbiting-circles__glow"
      aria-hidden="true"
    />

    <!-- 軌道線 -->
    <template
      v-if="showPaths"
    >
      <div
        v-for="(
          group,
          groupIndex
        ) in orbitGroups"
        :key="`path-${groupIndex}`"
        class="orbit-path"
        :style="
          getPathStyle(group)
        "
        aria-hidden="true"
      />
    </template>

    <!--
      每個 icon 都有自己的 orbit layer。

      為什麼不是整圈一起轉？

      因為這樣可以針對每一個 icon
      分別控制 z-index，
      才能實現：

      icon → Globe 前面
      icon → Globe 後面
    -->
    <template
      v-for="(
        group,
        groupIndex
      ) in orbitGroups"
      :key="`group-${groupIndex}`"
    >
      <div
        v-for="(
          item,
          itemIndex
        ) in group.items"
        :key="
          item.id ??
            `${groupIndex}-${itemIndex}`
        "
        class="orbit-plane"
        :style="
          getOrbitStyle(
            group,
            itemIndex,
          )
        "
      >
        <!-- 真正旋轉的 layer -->
        <div
          class="orbit-rotator"
        >
          <!--
            固定在圓的右側。

            rotator 旋轉時，
            這個點就會繞圓。
          -->
          <div
            class="orbit-node-anchor"
          >
            <!--
              抵銷 rotator 本身旋轉，
              讓 logo 不會跟著翻轉。
            -->
            <div
              class="orbit-node-counter"
            >
              <!--
                orbit-plane 有 squash + tilt。

                這層反向處理，
                把 icon 恢復成正常圓形。
              -->
              <div
                class="orbit-node-unplane"
              >
                <div
                  class="orbit-node-center"
                >
                  <div
                    class="orbit-node-card"
                    :style="
                      getItemStyle(
                        item,
                      )
                    "
                    :title="
                      item.name
                    "
                  >
                    <slot
                      name="item"
                      :item="item"
                      :group-index="
                        groupIndex
                      "
                      :item-index="
                        itemIndex
                      "
                    >
                      <img
                        v-if="
                          item.imageUrl
                        "
                        :src="
                          item.imageUrl
                        "
                        :alt="
                          item.imageAlt ??
                            item.name
                        "
                        draggable="false"
                        class="orbit-node-image"
                      >

                      <Icon
                        v-else-if="
                          item.icon
                        "
                        :name="
                          item.icon
                        "
                        class="orbit-node-icon"
                      />

                      <span
                        v-else
                        class="orbit-node-fallback"
                      >
                        {{
                          item.name
                            .charAt(
                              0,
                            )
                        }}
                      </span>
                    </slot>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 中央 Globe -->
    <div
      class="orbit-center"
    >
      <slot name="center">
        <div
          class="globe"
          aria-hidden="true"
        >
          <!-- 球體 -->
          <div
            class="globe__sphere"
          >
            <div
              class="globe__latitude globe__latitude--top"
            />

            <div
              class="globe__latitude globe__latitude--middle"
            />

            <div
              class="globe__latitude globe__latitude--bottom"
            />

            <div
              class="globe__longitude globe__longitude--left"
            />

            <div
              class="globe__longitude globe__longitude--right"
            />

            <div
              class="globe__shine"
            />

            <Icon
              name="lucide:globe-2"
              class="globe__icon"
            />
          </div>

          <!-- 球體陰影 -->
          <div
            class="globe__shadow"
          />
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.orbiting-circles {
  position: relative;

  width: min(
    100%,
    560px
  );

  aspect-ratio: 1;

  margin-inline: auto;

  isolation: isolate;

  overflow: hidden;
}

/* -------------------------------------------------------------------------- */
/* Background glow                                                             */
/* -------------------------------------------------------------------------- */

.orbiting-circles__glow {
  position: absolute;

  left: 50%;
  top: 50%;

  width: 65%;
  height: 65%;

  transform:
    translate(
      -50%,
      -50%
    );

  border-radius: 9999px;

  background:
    radial-gradient(
      circle,
      rgba(
        99,
        102,
        241,
        0.1
      )
      0%,
      rgba(
        59,
        130,
        246,
        0.045
      )
      38%,
      transparent
      72%
    );

  filter: blur(18px);

  pointer-events: none;
}

/* -------------------------------------------------------------------------- */
/* Orbit path                                                                  */
/* -------------------------------------------------------------------------- */

.orbit-path {
  position: absolute;

  left: 50%;
  top: 50%;

  z-index: 5;

  width:
    var(
      --orbit-size
    );

  aspect-ratio: 1;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.38
    );

  border-radius: 9999px;

  transform:
    translate(
      -50%,
      -50%
    )
    rotate(
      var(
        --orbit-tilt
      )
    )
    scaleY(
      var(
        --orbit-squash
      )
    );

  pointer-events: none;
}

/* -------------------------------------------------------------------------- */
/* Orbit plane                                                                 */
/* -------------------------------------------------------------------------- */

.orbit-plane {
  position: absolute;

  left: 50%;
  top: 50%;

  width:
    var(
      --orbit-size
    );

  aspect-ratio: 1;

  transform:
    translate(
      -50%,
      -50%
    )
    rotate(
      var(
        --orbit-tilt
      )
    )
    scaleY(
      var(
        --orbit-squash
      )
    );

  transform-origin:
    center;

  /*
   * 這個 animation
   * 只負責前後景深。

   * 0 ~ 50%
   * icon 在 Globe 前面。

   * 50 ~ 100%
   * icon 在 Globe 後面。
   */
  animation:
    orbit-depth
    var(
      --orbit-duration
    )
    linear
    infinite;

  animation-delay:
    var(
      --orbit-delay
    );

  animation-direction:
    var(
      --orbit-direction
    );

  pointer-events: none;
}

/* -------------------------------------------------------------------------- */
/* Rotator                                                                     */
/* -------------------------------------------------------------------------- */

.orbit-rotator {
  position: absolute;

  inset: 0;

  transform-origin:
    center;

  animation:
    orbit-rotate
    var(
      --orbit-duration
    )
    linear
    infinite;

  animation-delay:
    var(
      --orbit-delay
    );

  animation-direction:
    var(
      --orbit-direction
    );
}

/* -------------------------------------------------------------------------- */
/* Node                                                                        */
/* -------------------------------------------------------------------------- */

.orbit-node-anchor {
  position: absolute;

  left: 100%;
  top: 50%;

  width: 0;
  height: 0;
}

/*
 * rotator：
 *
 * rotate(90deg)
 *
 * counter：
 *
 * rotate(-90deg)
 *
 * 所以 logo 永遠保持直立。
 */
.orbit-node-counter {
  animation:
    orbit-counter-rotate
    var(
      --orbit-duration
    )
    linear
    infinite;

  animation-delay:
    var(
      --orbit-delay
    );

  animation-direction:
    var(
      --orbit-direction
    );
}

/*
 * orbit-plane 做了：
 *
 * rotate(tilt)
 * scaleY(squash)
 *
 * 這裡做 inverse transform，
 * 所以 icon 本身不會變橢圓。
 */
.orbit-node-unplane {
  transform:
    scaleY(
      var(
        --orbit-unsquash
      )
    )
    rotate(
      var(
        --orbit-counter-tilt
      )
    );
}

.orbit-node-center {
  transform:
    translate(
      -50%,
      -50%
    );
}

.orbit-node-card {
  display: flex;

  width:
    var(
      --node-size
    );

  height:
    var(
      --node-size
    );

  align-items: center;
  justify-content: center;

  border:
    1px solid
    rgba(
      226,
      232,
      240,
      0.95
    );

  border-radius: 9999px;

  background:
    var(
      --node-background
    );

  color:
    var(
      --node-color
    );

  box-shadow:
    0 5px 18px
      rgba(
        15,
        23,
        42,
        0.08
      ),
    0 1px 4px
      rgba(
        15,
        23,
        42,
        0.06
      );

  pointer-events: auto;

  transition:
    transform
      220ms
      ease,
    box-shadow
      220ms
      ease;
}

.orbit-node-card:hover {
  transform:
    scale(1.1);

  box-shadow:
    0 10px 28px
      rgba(
        15,
        23,
        42,
        0.14
      );
}

.orbit-node-icon {
  width: 51%;
  height: 51%;
}

.orbit-node-image {
  width: 52%;
  height: 52%;

  object-fit: contain;

  user-select: none;
}

.orbit-node-fallback {
  font-size: 14px;
  font-weight: 700;
}

/* -------------------------------------------------------------------------- */
/* Center globe                                                                */
/* -------------------------------------------------------------------------- */

.orbit-center {
  position: absolute;

  left: 50%;
  top: 50%;

  z-index: 20;

  transform:
    translate(
      -50%,
      -50%
    );
}

.globe {
  position: relative;

  display: flex;

  width:
    clamp(
      92px,
      23vw,
      132px
    );

  aspect-ratio: 1;

  align-items: center;
  justify-content: center;
}

.globe__sphere {
  position: relative;

  z-index: 2;

  display: flex;

  width: 100%;
  height: 100%;

  align-items: center;
  justify-content: center;

  overflow: hidden;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.38
    );

  border-radius: 9999px;

  background:
    radial-gradient(
      circle at
        34% 28%,

      #ffffff 0%,

      #f8fafc 23%,

      #e9eef5 54%,

      #d7dee8 79%,

      #cbd5e1 100%
    );

  box-shadow:
    inset
      -14px
      -13px
      24px
      rgba(
        100,
        116,
        139,
        0.16
      ),
    inset
      9px
      7px
      15px
      rgba(
        255,
        255,
        255,
        0.9
      ),
    0
      12px
      32px
      rgba(
        15,
        23,
        42,
        0.15
      );
}

.globe__icon {
  position: relative;

  z-index: 3;

  width: 55%;
  height: 55%;

  color:
    rgba(
      71,
      85,
      105,
      0.86
    );
}

/* -------------------------------------------------------------------------- */
/* Globe latitude                                                              */
/* -------------------------------------------------------------------------- */

.globe__latitude {
  position: absolute;

  left: 8%;

  width: 84%;
  height: 28%;

  border:
    1px solid
    rgba(
      100,
      116,
      139,
      0.15
    );

  border-radius: 50%;
}

.globe__latitude--top {
  top: 20%;
}

.globe__latitude--middle {
  top: 36%;

  height: 30%;
}

.globe__latitude--bottom {
  bottom: 20%;
}

/* -------------------------------------------------------------------------- */
/* Globe longitude                                                             */
/* -------------------------------------------------------------------------- */

.globe__longitude {
  position: absolute;

  top: 5%;

  width: 43%;
  height: 90%;

  border:
    1px solid
    rgba(
      100,
      116,
      139,
      0.16
    );

  border-radius: 50%;
}

.globe__longitude--left {
  left: 18%;
}

.globe__longitude--right {
  right: 18%;
}

/* -------------------------------------------------------------------------- */
/* Globe light                                                                 */
/* -------------------------------------------------------------------------- */

.globe__shine {
  position: absolute;

  left: 16%;
  top: 11%;

  width: 34%;
  height: 25%;

  transform:
    rotate(-25deg);

  border-radius: 50%;

  background:
    rgba(
      255,
      255,
      255,
      0.58
    );

  filter:
    blur(7px);
}

.globe__shadow {
  position: absolute;

  left: 50%;
  bottom: -12%;

  width: 76%;
  height: 16%;

  transform:
    translateX(-50%);

  border-radius: 50%;

  background:
    rgba(
      15,
      23,
      42,
      0.16
    );

  filter:
    blur(11px);
}

/* -------------------------------------------------------------------------- */
/* Animations                                                                  */
/* -------------------------------------------------------------------------- */

@keyframes orbit-rotate {
  from {
    transform:
      rotate(0deg);
  }

  to {
    transform:
      rotate(360deg);
  }
}

@keyframes orbit-counter-rotate {
  from {
    transform:
      rotate(0deg);
  }

  to {
    transform:
      rotate(-360deg);
  }
}

/*
 * angle：
 *
 * 0°   = 右
 * 90°  = 下
 * 180° = 左
 * 270° = 上
 *
 * 下半圈：
 * Globe 前方
 *
 * 上半圈：
 * Globe 後方
 */
@keyframes orbit-depth {
  0% {
    z-index: 30;
    opacity: 1;
  }

  49.9% {
    z-index: 30;
    opacity: 1;
  }

  50% {
    z-index: 10;
    opacity: 0.72;
  }

  99.9% {
    z-index: 10;
    opacity: 0.72;
  }

  100% {
    z-index: 30;
    opacity: 1;
  }
}

/* -------------------------------------------------------------------------- */
/* Pause                                                                       */
/* -------------------------------------------------------------------------- */

.orbiting-circles--pause:hover
  .orbit-plane,
.orbiting-circles--pause:hover
  .orbit-rotator,
.orbiting-circles--pause:hover
  .orbit-node-counter {
  animation-play-state:
    paused;
}

/* -------------------------------------------------------------------------- */
/* Mobile                                                                      */
/* -------------------------------------------------------------------------- */

@media (
  max-width: 480px
) {
  .orbiting-circles {
    width: 100%;
  }

  .orbit-node-card {
    width:
      clamp(
        36px,
        11vw,
        var(
          --node-size
        )
      );

    height:
      clamp(
        36px,
        11vw,
        var(
          --node-size
        )
      );
  }

  .globe {
    width:
      clamp(
        82px,
        27vw,
        118px
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Reduced motion                                                              */
/* -------------------------------------------------------------------------- */

@media (
  prefers-reduced-motion:
    reduce
) {
  .orbit-plane {
    animation: none;

    z-index: 30;

    opacity: 1;
  }

  .orbit-rotator {
    animation: none;

    transform:
      rotate(
        var(
          --orbit-static-angle
        )
      );
  }

  .orbit-node-counter {
    animation: none;

    transform:
      rotate(
        var(
          --orbit-static-counter-angle
        )
      );
  }

  .orbit-node-card {
    transition: none;
  }
}
</style>
