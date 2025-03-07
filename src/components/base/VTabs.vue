<script setup lang="ts">
import type { RouteLocationAsString } from 'unplugin-vue-router'

export type VTabsType = 'boxed' | 'toggle' | 'rounded'
export type VTabsAlign = 'centered' | 'right'
export interface VTabsItem {
  label: string
  value: string
  icon?: string
  to?: RouteLocationAsString
}
export interface VTabsProps {
  tabs: VTabsItem[]
  selected?: string
  type?: VTabsType
  align?: VTabsAlign
  slider?: boolean
  slow?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (e: 'update:selected', value: any): void
}>()
const props = withDefaults(defineProps<VTabsProps>(), {
  selected: undefined,
  type: undefined,
  align: undefined,
})

const activeValue = ref(props.selected || props.tabs?.[0]?.value)
const sliderClass = computed(() => {
  if (!props.slider) {
    return ''
  }

  if (props.type === 'rounded') {
    if (props.tabs.length === 3) {
      return 'is-triple-slider'
    }
    if (props.tabs.length === 2) {
      return 'is-slider'
    }

    return ''
  }

  if (!props.type) {
    if (props.tabs.length === 3) {
      return 'is-squared is-triple-slider'
    }
    if (props.tabs.length === 2) {
      return 'is-squared is-slider'
    }
  }

  return ''
})

function toggle(value: string) {
  if (props.disabled) return
  activeValue.value = value
}

watch(
  () => props.selected,
  (value) => {
    activeValue.value = value ?? ''
  },
)

watch(activeValue, (value) => {
  emit('update:selected', value)
})
</script>

<template>
  <div
    class="tabs-wrapper"
    :class="[sliderClass]"
  >
    <div class="tabs-inner">
      <div
        class="tabs"
        :class="[
          props.align === 'centered' && 'is-centered',
          props.align === 'right' && 'is-right',
          props.type === 'rounded' && !props.slider && 'is-toggle is-toggle-rounded',
          props.type === 'toggle' && 'is-toggle',
          props.type === 'boxed' && 'is-boxed',
          props.disabled && 'is-disabled',
        ]"
      >
        <ul>
          <li
            v-for="(tab, key) in tabs"
            :key="key"
            :class="[activeValue === tab.value && 'is-active']"
          >
            <slot
              name="tab-link"
              v-bind="{
                activeValue,
                tab,
                key,
                toggle,
              }"
            >
              <a
                role="button"
                tabindex="0"
                @keydown.prevent.enter="() => toggle(tab.value)"
                @click.prevent="() => toggle(tab.value)"
              >
                <VIcon
                  v-if="tab.icon"
                  :icon="tab.icon"
                />
                <span>
                  <slot
                    name="tab-link-label"
                    v-bind="{
                      activeValue,
                      tab,
                      key,
                      toggle,
                    }"
                  >
                    {{ tab.label }}
                  </slot>
                </span>
              </a>
            </slot>
          </li>
          <li
            v-if="sliderClass"
            class="tab-naver"
          />
        </ul>
      </div>
    </div>

    <div v-if="'tab' in $slots" class="tab-content is-active">
      <Transition
        :name="props.slow ? 'fade-slow' : 'fade-fast'"
        mode="out-in"
      >
        <slot
          name="tab"
          v-bind="{
            activeValue,
          }"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*! _tabs.scss | Vuero | Css ninja 2020-2024 */

/*
    1. Tabs
    2. Tabs Dark mode
    3. Tab Content
    4. Sliding tabs 2X
    5. Sliding tabs 3X
    6. Sliding tabs Dark mode
*/

/* ==========================================================================
1. Tabs
========================================================================== */

.tabs {
  margin-bottom: 20px;

  &.is-toggle {
    li {
      &:first-child {
        a {
          border-inline-end: none;
        }
      }

      &:last-child {
        a {
          border-inline-start: none;
        }
      }

      &.is-active {
        a {
          background: var(--primary);
          border-color: var(--primary);

          &:hover,
          &:focus {
            color: var(--white);
          }
        }
      }

      a {
        transition: all 0.3s; // transition-all test

        &:hover {
          border-color: #dbdbdb;
        }
      }
    }
  }

  li {
    &.is-active {
      a {
        border-bottom-color: var(--primary);
        color: var(--primary);

        &:hover,
        &:focus {
          border-bottom-color: var(--primary);
          color: var(--primary);
        }
      }
    }

    a {
      font-family: var(--font);
      border-bottom-width: 2px;
      color: var(--placeholder);
      border-bottom-color: transparent;

      &:hover,
      &:focus {
        color: var(--light-text);
        border-bottom-color: transparent;
      }

      .iconify {
        height: 16px;
        width: 16px;
        margin-inline-end: 6px;
      }

      .fas,
      .fal,
      .far,
      .fad,
      .fab {
        margin-inline-end: 6px;
      }

      .lnil,
      .lnir {
        font-size: 20px;
        margin-inline-end: 6px;
      }

      small {
        margin-inline-start: 5px;
      }
    }
  }
}

/* ==========================================================================
2. Tabs Dark mode
========================================================================== */

.is-dark {
  .tabs {
    &.is-boxed {
      li {
        &.is-active {
          a,
          a:hover {
            background: color-mix(in oklab, var(--dark-sidebar), white 1%) !important;
          }
        }

        a {
          border-color: color-mix(in oklab, var(--dark-sidebar), white 16%) !important;

          &:hover,
          &:focus {
            background: color-mix(in oklab, var(--dark-sidebar), white 4%) !important;
          }
        }
      }
    }

    &.is-toggle {
      li {
        &.is-active {
          a,
          a:hover {
            background: var(--primary) !important;
            border-color: var(--primary);
            color: var(--white);
          }
        }

        a {
          border-color: color-mix(in oklab, var(--dark-sidebar), white 16%) !important;

          &:hover,
          &:focus {
            background: color-mix(in oklab, var(--dark-sidebar), white 4%) !important;
          }
        }
      }
    }

    ul {
      border-bottom-color: color-mix(in oklab, var(--dark-sidebar), white 16%);
    }

    li {
      &.is-active {
        a {
          border-bottom-color: var(--primary);
          color: var(--primary);
        }
      }
    }
  }
}

/* ==========================================================================
3. Tab Content
========================================================================== */

.tab-content {
  display: none;
  animation-name: fadeInLeft;
  animation-duration: 0.5s;

  &.is-active {
    display: block;

    &.is-spaced {
      margin-top: 10px !important;
    }
  }

  &.is-spaced {
    margin-top: 40px;
  }

  &.is-spaced-lg {
    margin-top: 40px !important;
  }
}

/* ==========================================================================
4. Sliding tabs 2X
========================================================================== */

.tabs-wrapper,
.tabs-wrapper-alt {
  &.is-slider {
    &.is-inverted {
      > .tabs-inner > .tabs {
        background: var(--white);
      }
    }

    &.is-squared {
      > .tabs-inner > .tabs,
      .tab-naver {
        border-radius: 8px;
      }
    }

    > .tabs-inner > .tabs {
      position: relative;
      background: color-mix(in oklab, var(--fade-grey), white 2%);
      border: 1px solid var(--fade-grey);
      // max-width: 185px;
      max-width: 300px;
      height: 35px;
      border-bottom: none;
      border-radius: 500px;

      ul {
        border-bottom: none;

        &.is-profile {
          li {
            a {
              color: var(--smoke-white) !important;
            }

            &.is-active a {
              color: var(--dark-text) !important;
            }
          }
        }
      }

      li {
        width: 50%;

        a {
          color: var(--light-text);
          font-family: var(--font);
          height: 40px;
          border-bottom: none;
          position: relative;
          z-index: 5;

          span {
            position: relative;
            top: -1px;
            display: block;
          }
        }

        &.is-active a {
          color: var(--white);
          font-weight: 400;
        }

        &:first-child {
          &.is-active ~ .tab-naver {
            margin-inline-start: 0;
          }
        }

        &:nth-child(2) {
          &.is-active ~ .tab-naver {
            margin-inline-start: 50% !important;
          }
        }
      }

      &.is-centered {
        margin-inline-start: auto;
        margin-inline-end: auto;
      }
    }

    .tab-naver {
      inset-inline-start: 0;
      background: var(--primary);
      position: absolute;
      top: 0.5px;
      display: block;
      height: 32px;
      transition: all 0.3s; // transition-all test
      z-index: 4;
      border-radius: 50px;

      &.is-profile {
        background: var(--smoke-white) !important;
      }

      &.is-active {
        margin-inline-start: 50%;
      }
    }
  }
}

/* ==========================================================================
5. Sliding tabs 3X
========================================================================== */

.tabs-wrapper,
.tabs-wrapper-alt {
  &.is-triple-slider {
    &.is-inverted {
      > .tabs-inner > .tabs {
        background: var(--white);
      }
    }

    &.is-squared {
      > .tabs-inner > .tabs,
      .tab-naver {
        border-radius: 8px;
      }
    }

    > .tabs-inner > .tabs {
      position: relative;
      background: color-mix(in oklab, var(--fade-grey), white 2%);
      border: 1px solid var(--fade-grey);
      max-width: 280px;
      height: 35px;
      border-bottom: none;
      border-radius: 500px;

      ul {
        border-bottom: none;

        &.is-profile {
          li {
            a {
              color: var(--smoke-white) !important;
            }

            &.is-active a {
              color: var(--dark-text) !important;
            }
          }
        }
      }

      li {
        width: 33.3%;

        a {
          color: var(--light-text);
          font-family: var(--font);
          font-weight: 400;
          height: 40px;
          border-bottom: none;
          position: relative;
          z-index: 5;

          span {
            position: relative;
            top: -1px;
            display: block;
          }
        }

        &.is-active a {
          color: var(--white);
          font-weight: 400;
        }

        &:first-child {
          &.is-active ~ .tab-naver {
            margin-inline-start: 0;
          }
        }

        &:nth-child(2) {
          &.is-active ~ .tab-naver {
            margin-inline-start: 33% !important;
          }
        }

        &:nth-child(3) {
          &.is-active ~ .tab-naver {
            margin-inline-start: 66.6%;
          }
        }
      }
    }

    .tab-naver {
      position: absolute;
      top: 0.5px;
      inset-inline-start: 0;
      display: block;
      width: 33.3% !important;
      background: var(--primary);
      height: 32px;
      transition: all 0.3s; // transition-all test
      z-index: 4;
      border-radius: 50px;

      &.is-profile {
        background: var(--smoke-white) !important;
      }

      &.is-active {
        margin-inline-start: 48%;
      }
    }
  }
}

/* ==========================================================================
6. Sliding tabs Dark mode
========================================================================== */

.is-dark {
  .tabs-wrapper {
    &.is-slider,
    &.is-triple-slider {
      &.is-inverted {
        > .tabs-inner > .tabs {
          border: 1px solid color-mix(in oklab, var(--dark-sidebar), white 16%) !important;
          background: color-mix(in oklab, var(--dark-sidebar), white 2%) !important;
        }
      }

      > .tabs-inner > .tabs {
        border: 1px solid color-mix(in oklab, var(--dark-sidebar), white 16%) !important;
        background: color-mix(in oklab, var(--dark-sidebar), white 2%) !important;

        .tab-naver {
          background: var(--primary) !important;
        }

        ul {
          border: none;
        }

        li {
          &.is-active {
            a {
              color: var(--white);
            }
          }
        }
      }
    }
  }
}

/* ==========================================================================
4. Vertical tabs
========================================================================== */

@media only screen and (width <= 767px) {
  .vertical-tabs-wrapper {
    .tabs {
      ul {
        li {
          &.is-active {
            a {
              color: var(--primary);
              border-bottom-color: var(--primary);
            }
          }

          a {
            color: var(--light-text);
          }
        }
      }
    }

    .content-wrap {
      .tab-content {
        padding-top: 12px;
        display: none;
        animation: fadeInLeft 0.5s;

        &.is-active {
          display: block;
        }
      }
    }
  }
}

@media only screen and (width >= 768px) {
  .vertical-tabs-wrapper {
    display: flex;

    .tabs {
      // min-width: 25%;
      // max-width: 25%;
      margin-inline-end: 30px;

      ul {
        display: block;
        text-align: inset-inline-start;
        border-bottom-color: transparent !important;

        li {
          display: block;

          &.is-active {
            a {
              color: var(--primary);
              border-inline-end-color: var(--primary);
            }
          }

          a {
            display: block;
            border-bottom-color: transparent !important;
            border-inline-end: 2px solid #dbdbdb;
            color: var(--light-text);
          }
        }
      }
    }

    .content-wrap {
      flex-grow: 2;

      .tab-content {
        display: none;
        animation: fadeInLeft 0.5s;

        &.is-active {
          display: block;
        }
      }
    }
  }
}
</style>
