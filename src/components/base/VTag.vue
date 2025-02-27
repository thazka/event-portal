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
  id?: string
  label?: string | number
  color?: VTagColor
  size?: VTagSize
  rounded?: boolean
  curved?: boolean
  outlined?: boolean
  elevated?: boolean
  remove?: boolean
  hasDropdown?: boolean
  options?: Array<{ id: string, name: string }> | string[]
  searchPlaceholder?: string
  disabledOptions?: Record<string, number>
  currentUserId?: number
}

const props = withDefaults(defineProps<VTagProps>(), {
  id: '',
  label: undefined,
  color: undefined,
  size: undefined,
  hasDropdown: false,
  options: () => [],
  searchPlaceholder: 'Search',
  disabledOptions: () => ({}),
  currentUserId: undefined
})

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const activeTag = inject('activeTag', ref<string | null>(null))

const filteredOptions = computed(() => {
  if (!props.options.length) return []
  
  const isObjectArray = typeof props.options[0] === 'object'
  
  return props.options.filter((option: any) => {
    if (isObjectArray) {
      const isMatch = option.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      if (props.disabledOptions && typeof option === 'object') {
        const isAssigned = props.disabledOptions[option.id] !== undefined
        const isAssignedToCurrentUser = props.disabledOptions[option.id] === props.currentUserId
        
        return isMatch && (!isAssigned || isAssignedToCurrentUser)
      }
      
      return isMatch
    } else {
      const isMatch = String(option).toLowerCase().includes(searchQuery.value.toLowerCase())
      
      if (props.disabledOptions) {
        const isAssigned = props.disabledOptions[option] !== undefined
        const isAssignedToCurrentUser = props.disabledOptions[option] === props.currentUserId
        
        return isMatch && (!isAssigned || isAssignedToCurrentUser)
      }
      
      return isMatch
    }
  })
})

const toggleDropdown = () => {
  if (isOpen.value) {
    isOpen.value = false
    return
  }
  
  activeTag.value = props.id
  isOpen.value = true
}

const selectOption = (option: any) => {
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

// Function to close the dropdown
const close = () => {
  isOpen.value = false
  searchQuery.value = ''
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(activeTag, (newVal) => {
  if (newVal !== props.id && isOpen.value) {
    close()
  }
})
</script>

<template>
  <div :id="props.id" class="tag-dropdown" :class="{ 'is-active': isOpen }">
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
        <div v-for="(option, index) in filteredOptions" 
          :key="index"
          class="option-item"
          :class="props.disabledOptions && typeof option === 'object' && props.disabledOptions[option.id] === props.currentUserId && 'is-current-user'"
          @click="selectOption(option)"
        >
          {{ typeof option === 'object' ? option.name : option }}
          <span v-if="props.disabledOptions && typeof option === 'object' && props.disabledOptions[option.id] === props.currentUserId" class="current-user-indicator">
            (Current)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.is-current-user {
  background-color: rgba(0, 128, 0, 0.1);
}

.current-user-indicator {
  margin-left: 5px;
  font-size: 0.8em;
  color: green;
}

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
  z-index: 100; /* High z-index to ensure it appears on top */
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 200px; /* or whatever width you prefer */
  max-height: 300px;
  overflow-y: auto;
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
