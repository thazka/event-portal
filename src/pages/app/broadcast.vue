<script setup lang="ts">
import { userList } from '/@src/data/datatable'

const pageTitle = useVueroContext<string>('page-title')
const selectedTab = ref('broadcast')

onMounted(() => {
    pageTitle.value = 'Whatsapp Broadcast'
})

useHead({
    title: 'Eventhook - Whatsapp Broadcast',
})

const tabs = [
    { label: 'New Broadcast', value: 'broadcast' },
    { label: 'Log History', value: 'history' },
]

const activeTab = (tab: string) => {
    selectedTab.value = tab
}
</script>

<template>
    <div>
        <VTabs slider type="rounded" :selected="selectedTab" :tabs="tabs" @update:selected="activeTab" />

        <VTableCheckbox v-if="selectedTab == 'broadcast'" :data="userList" />
        <VTableLogs v-else :data="userList" />
    </div>
</template>

<style lang="scss"></style>