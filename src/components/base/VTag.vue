<script setup lang="ts">
export type VTagColor =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'orange'
  | 'blue'
  | 'green'
  | 'purple'
  | 'white'
  | 'light'
  | 'solid'

export type VTagSize = 'tiny'

export interface VTagProps {
  label?: string | number
  color?: VTagColor
  size?: VTagSize
  rounded?: boolean
  curved?: boolean
  outlined?: boolean
  elevated?: boolean
  remove?: boolean
  hasDropdown?: boolean
  options?: string[]
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<VTagProps>(), {
  label: undefined,
  color: undefined,
  size: undefined,
  hasDropdown: false,
  options: () => [],
  searchPlaceholder: 'Search'
})

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')

const filteredOptions = computed(() => {
  return props.options.filter(option => 
    option.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: string) => {
  emit('select', option)
  isOpen.value = false
  searchQuery.value = ''
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.tag-dropdown')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="tag-dropdown" :class="{ 'is-active': isOpen }">
    <small
      class="tag"
      :class="[
        props.color && 'is-' + props.color,
        props.size && 'is-' + props.size,
        props.rounded && 'is-rounded',
        props.curved && 'is-curved',
        props.outlined && 'is-outlined',
        props.elevated && 'is-elevated',
        props.remove && 'is-delete',
        props.hasDropdown && 'has-dropdown'
      ]"
      @click="toggleDropdown"
    >
      <slot>{{ props.label }}</slot>
      <span v-if="props.hasDropdown" class="dropdown-arrow">▼</span>
    </small>

    <div v-if="isOpen && props.hasDropdown" class="dropdown-content">
      <div class="search-wrapper">
        <input 
          v-model="searchQuery"
          type="text" 
          :placeholder="props.searchPlaceholder"
          class="search-input"
          @click.stop
        >
        <span class="search-icon">
          <i class="fas fa-search"></i>
        </span>
      </div>
      <div class="options-list">
        <div 
          v-for="option in filteredOptions" 
          :key="option"
          class="option-item"
          @click="selectOption(option)"
        >
          {{ option }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tag-dropdown {
  position: relative;
  display: inline-block;
}

.tag:not(body) {
  display: inline-flex;
  align-items: center;
  line-height: 2.3;
  height: 2.4em;
  font-size: 0.75rem;
  cursor: pointer;

  &.has-dropdown {
    padding-right: 1.5em;
    position: relative;
  }

  .dropdown-arrow {
    font-size: 0.7em;
    margin-left: 0.5em;
  }

  &.is-rounded {
    padding-inline-start: 1em;
    padding-inline-end: 1em;
  }

  &.is-curved {
    padding-inline-start: 0.85em;
    padding-inline-end: 0.85em;
    line-height: 2.5;
    height: 2.6em;
    border-radius: 8px;
  }

  &.is-tiny {
    line-height: 1.3;
    height: 1.6em;
    font-size: 0.7rem;

    &.is-curved {
      padding-inline-start: 0.55em;
      padding-inline-end: 0.55em;
      line-height: 1.3;
      height: 1.6em;
    }
  }

  &.is-elevated {
    box-shadow: var(--light-box-shadow);
  }

  &.is-solid {
    background: var(--white);
    border: 1px solid color-mix(in oklab, var(--fade-grey), black 3%);
    color: var(--light-text);
  }

  &.is-primary {
    &.is-elevated {
      box-shadow: var(--primary-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--primary);
      border: 1px solid var(--primary);
    }
  }

  &.is-success {
    &.is-elevated {
      box-shadow: var(--success-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--success);
      border: 1px solid var(--success);
    }
  }

  &.is-info {
    &.is-elevated {
      box-shadow: var(--info-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--info);
      border: 1px solid var(--info);
    }
  }

  &.is-warning {
    &.is-elevated {
      box-shadow: var(--warning-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--warning);
      border: 1px solid var(--warning);
    }
  }

  &.is-danger {
    &.is-elevated {
      box-shadow: var(--danger-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--danger);
      border: 1px solid var(--danger);
    }
  }

  &.is-secondary {
    background: var(--secondary);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--secondary-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--secondary);
      border: 1px solid var(--secondary);
    }
  }

  &.is-green {
    background: var(--green);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--green-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--green);
      border: 1px solid var(--green);
    }
  }

  &.is-blue {
    background: var(--blue);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--blue-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--blue);
      border: 1px solid var(--blue);
    }
  }

  &.is-purple {
    background: var(--purple);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--purple-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--purple);
      border: 1px solid var(--purple);
    }
  }

  &.is-orange {
    background: var(--orange);
    color: var(--white);

    &.is-elevated {
      box-shadow: var(--orange-box-shadow);
    }

    &.is-outlined {
      background: none !important;
      color: var(--orange);
      border: 1px solid var(--orange);
    }
  }

  &.is-search {
    min-width: 200px;
    padding: 0;
    position: relative;
    background: var(--white);
    border: 1px solid var(--fade-grey);

    .search-input {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      padding: 0 2rem 0 1rem;
      font-size: 0.9rem;
      
      &:focus {
        outline: none;
      }
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--light-text);
      pointer-events: none;
    }
  }

  &.is-curved.is-search {
    height: 2.6em;
    border-radius: 8px;
    
    .search-input {
      border-radius: 8px;
    }
  }
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--fade-grey);
  min-width: 200px;
  z-index: 20;
}

.search-wrapper {
  padding: 0.75rem;
  border-bottom: 1px solid var(--fade-grey);
  position: relative;

  .search-input {
    width: 100%;
    height: 2.4em;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid var(--fade-grey);
    border-radius: 6px;
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  .search-icon {
    position: absolute;
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--light-text);
    pointer-events: none;
  }
}

.options-list {
  max-height: 200px;
  overflow-y: auto;

  .option-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: var(--fade-grey-light-9);
    }

    &:not(:last-child) {
      border-bottom: 1px solid var(--fade-grey-light-9);
    }
  }
}

.is-dark {
  .tag {
    &:not(
        .is-primary,
        .is-secondary,
        .is-success,
        .is-info,
        .is-warning,
        .is-danger,
        .is-orange,
        .is-green,
        .is-blue,
        .is-purple
      ) {
      background: color-mix(in oklab, var(--dark-sidebar), white 10%);
      border-color: color-mix(in oklab, var(--dark-sidebar), white 10%);
      color: var(--dark-dark-text);
    }

    &.is-primary {
      background: var(--primary);

      &.is-outlined {
        border-color: var(--primary);
        color: var(--primary);
      }

      &.is-light {
        background: color-mix(in oklab, var(--primary), white 22%);
        color: var(--primary);
      }
    }

    &.is-search {
      background: color-mix(in oklab, var(--dark-sidebar), white 10%);
      border-color: color-mix(in oklab, var(--dark-sidebar), white 10%);

      .search-input {
        color: var(--dark-dark-text);
        &::placeholder {
          color: var(--dark-dark-text);
          opacity: 0.5;
        }
      }
    }
  }

  .dropdown-content {
    background: color-mix(in oklab, var(--dark-sidebar), white 10%);
    border-color: color-mix(in oklab, var(--dark-sidebar), white 10%);
  }

  .search-wrapper {
    border-color: color-mix(in oklab, var(--dark-sidebar), white 15%);

    .search-input {
      background: color-mix(in oklab, var(--dark-sidebar), white 10%);
      border-color: color-mix(in oklab, var(--dark-sidebar), white 15%);
      color: var(--dark-dark-text);

      &::placeholder {
        color: var(--dark-dark-text);
        opacity: 0.5;
      }
    }
  }

  .options-list .option-item {
    color: var(--dark-dark-text);
    
    &:hover {
      background: color-mix(in oklab, var(--dark-sidebar), white 15%);
    }

    &:not(:last-child) {
      border-color: color-mix(in oklab, var(--dark-sidebar), white 15%);
    }
  }
}
</style>
