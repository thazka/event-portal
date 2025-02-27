<script setup lang="ts">
const pageTitle = useVueroContext<string>('page-title')

onMounted(() => {
    pageTitle.value = 'Doorprize'
})

useHead({
    title: 'Eventhook - Doorprize',
})
</script>

<template>
    <div>
        <VTableDoorprize />
    </div>
</template>