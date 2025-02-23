<script setup lang="ts">
import Layout from '/@src/layouts/sideblock.vue'

definePage({
  meta: {
    requiresAuth: true
  }
})

useHead({
  meta: [
    {
      name: 'robots',
      content: 'noindex',
    },
  ],
})
</script>

<template>
  <Layout>
    <RouterView v-slot="{ Component }">
      <Transition name="translate-page-y" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </Layout>
</template>
