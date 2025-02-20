<script setup lang="ts">
import type { SideblockItem } from '/@src/components/layouts/sideblock/sideblock.types'

const links = ref<SideblockItem[]>([
  {
    type: 'link',
    label: 'Import Data',
    icon: 'lucide:import',
    to: '/app',
  },
  {
    type: 'link',
    label: 'Dorprize',
    icon: 'material-symbols:featured-seasonal-and-gifts',
    to: '/app/dorprize',
  },
  {
    type: 'link',
    label: 'Seating',
    icon: 'fluent:seat-16-filled',
    to: '/app/seating',
  }
])
</script>

<template>
  <SideblockLayout :links open-on-mounted size="large">
    <slot />

    <template #logo>
      <h3 class="is-hidden-mobile ml-2">
        Event Portal
      </h3>
    </template>

    <template #toolbar>
      <div class="toolbar-link">
        <VDarkmodeToggle />
      </div>
    </template>
  </SideblockLayout>
</template>
