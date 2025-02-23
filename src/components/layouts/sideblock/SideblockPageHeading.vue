<script setup lang="ts">
import mainLogo from '/@src/images/illustrations/login/logo-main.svg'

const props = defineProps<{
  open?: boolean
}>()
const emits = defineEmits<{
  toggle: []
}>()

const route = useRoute()
const router = useRouter()

const redirectBack = () => {
  router.push('/app/doorprize')
}
</script>

<template>
  <div class="page-title has-text-centered" :class="route.path == '/app/luckydraw' && 'is-luckydraw'">
    <div
      v-if="route.path != '/app/luckydraw'"
      class="vuero-hamburger nav-trigger push-resize"
      tabindex="0"
      role="button"
      @keydown.enter.prevent="() => emits('toggle')"
      @click="() => emits('toggle')"
    >
      <span class="menu-toggle has-chevron">
        <span
          :class="[props.open && 'active']"
          class="icon-box-toggle"
        >
          <span class="rotate">
            <i
              aria-hidden="true"
              class="icon-line-top"
            />
            <i
              aria-hidden="true"
              class="icon-line-center"
            />
            <i
              aria-hidden="true"
              class="icon-line-bottom"
            />
          </span>
        </span>
      </span>
    </div>

    <div v-if="route.path == '/app/luckydraw'" class="mr-auto">
      <VButton icon="lucide:arrow-left" color="primary" outlined @click="redirectBack">
        Back
      </VButton>
    </div>
    <div v-else class="title-wrap">
      <h1 class="title is-4">
        <slot />
      </h1>
    </div>

    <div v-if="route.path == '/app/luckydraw'">
      <img :src="mainLogo" alt="" />
    </div>

    <div v-if="'toolbar' in $slots" class="toolbar desktop-toolbar">
      <slot name="toolbar" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.is-luckydraw {
  padding: 0 40px;
  margin-bottom: 0;
}
</style>