<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="page-content" :class="route.path == '/app/luckydraw' && 'is-luckydraw'">
    <slot />
  </div>
</template>

<style lang="scss">
/* ==========================================================================
3. Page Content
========================================================================== */
.page-content {
  padding: 0 40px;

  &.is-luckydraw {
    padding: 0;
  }

  &.is-relative {
    position: relative;
  }

  &.kanban-content {
    padding: 0 20px;
  }

  &.chat-content {
    padding: 0 40px;
  }

  &.card-content {
    padding: 0 20px;
  }

  &.waterfall-content {
    overflow: hidden;
  }

  &.projects-content {
    padding: 0 40px;
  }
}

@media only screen and (device-width >=768px) and (device-width <=1024px) and (orientation: portrait) {
  .page-content {
    padding: 0 10px;

    &.is-explore {
      padding: 0 !important;
    }
  }
}

@media (width <=767px) {
  .page-content {
    padding: 0 10px !important;

    &.projects-content {
      padding: 0 16px;
    }
  }
}
</style>
