<script setup lang="ts">
import type { SideblockItem } from '/@src/components/layouts/sideblock/sideblock.types'
import mainLogo from '/@src/images/illustrations/login/logo-main.svg'

const links = ref<SideblockItem[]>([
  {
    type: 'link',
    label: 'Dashboard Analytics',
    icon: 'material-symbols:grid-view-outline',
    to: '/app',
  },
  {
    type: 'link',
    label: 'Whatsapp Broadcast',
    icon: 'ic:baseline-whatsapp',
    to: '/app/broadcast',
  },
  {
    type: 'link',
    label: 'Event',
    icon: 'material-symbols:festival',
    to: '/app/event',
  },
  {
    type: 'link',
    label: 'Doorprize',
    icon: 'material-symbols:attractions',
    to: '/app/doorprize',
  },
  {
    type: 'link',
    label: 'Seat Management',
    icon: 'material-symbols:chair',
    to: '/app/seating',
  }
])

const modalDataset = ref(false)
const route = useRoute()
const isOpenOnMount = ref(true)


// Handle initial mount
onMounted(() => {
  handleRouteChange(route.path)
})

// Handle route updates
onBeforeRouteUpdate((to) => {
  handleRouteChange(to.path)
})

const shouldLarge = computed(() => {
  return route.path === '/app/luckydraw' ? 'wide' : 'large'
})

const openModalDataset = () => {
  modalDataset.value = true
}

const closeModalDataset = () => {
  modalDataset.value = false
}

const handleRouteChange = (path: any) => {
  isOpenOnMount.value = path != '/app/luckydraw'
}
</script>

<template>
  <SideblockLayout :links :open-on-mounted="isOpenOnMount" :size="shouldLarge" meta>
    <slot />

    <template #logo>
      <h3 class="is-hidden-mobile ml-2">
        <img :src="mainLogo" alt="" />
      </h3>
    </template>
    <template #meta>
      <div class="is-divider my-5"></div>
        <VButton icon="lucide:plus" color="primary" class="is-flex is-align-items-center" @click="openModalDataset">Input Participants Dataset</VButton>
      <div class="is-divider my-5"></div>

      <VModalInputDataset :open="modalDataset" @close="closeModalDataset" />
    </template>
    <template #toolbar>
      <div class="toolbar-link">
        <VDarkmodeToggle />
      </div>
      <ToolbarUserProfile right />
    </template>
  </SideblockLayout>
</template>

<style lang="scss" scoped>
:deep(.sidebar-block) {
  .sidebar-block-inner {
    ul {
      li {
        a {
          &.router-link-exact-active {
            .label-menu {
              font-weight: 600;
              font-size: 12.6px;
              line-height: 18.9px;
              letter-spacing: 0%;
              color: #283252;
            }
          }
        }
      }
    }
  }
}
</style>