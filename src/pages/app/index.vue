<script setup lang="ts">
import { userList } from '/@src/data/datatable'
import { useDemo21RadialBar } from '/@src/data/demo21-radialbar'

onMounted(() => {
    pageTitle.value = 'Dashboard Analytics'
})

useHead({
    title: 'Eventhook - Dashboard Analytics',
})

const demo21 = useDemo21RadialBar()
const pageTitle = useVueroContext<string>('page-title')
const modalSeat = ref(false)

const openModalSeat = () => {
    modalSeat.value = true
}
</script>

<template>
    <div>
        <div class="columns has-fullheight main-container">
            <div class="column is-half column-wrapper">
                <VCardAdvanced nofooter>
                    <template #header-left>
                        <h3 class="title-widget">Layout Event</h3>
                    </template>
                    <template #header-right>
                        <div class="filter-right is-clickable" @click="openModalSeat">
                            <VIcon class="is-flex is-align-items-center"
                                icon="material-symbols:add-photo-alternate-outline">
                            </VIcon>
                            <span>Change Image</span>
                        </div>
                    </template>
                    <template #content>
                        <img class="has-fullwidth" src="/images/event/seatmap.jpg" alt="">
                    </template>
                </VCardAdvanced>
            </div>

            <div class="column is-half column-wrapper">
                <div class="columns is-multiline has-autoheight">
                    <div class="column is-half">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Total Participants
                            </h3>
                            <span class="total-section">0</span>
                        </VCard>
                    </div>
                    <div class="column is-half">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Seats Assigned
                            </h3>
                            <span class="total-section">0</span>
                        </VCard>
                    </div>
                    <div class="column is-half">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Present
                            </h3>
                            <span class="total-section">0</span>
                        </VCard>
                    </div>
                    <div class="column is-half">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Not Yet Present
                            </h3>
                            <span class="total-section">0</span>
                        </VCard>
                    </div>
                    <div class="column">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Attendance Rate
                            </h3>
                            <div>
                                <ApexChart v-bind="demo21" />
                            </div>
                        </VCard>
                    </div>
                </div>
            </div>
        </div>

        <VTableList :data="userList" />
        <VModalInputSeatLayout :open="modalSeat" @close="modalSeat = false"/>
    </div>
</template>

<style lang="scss" scoped>
.title-widget {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
}

.title-section {
    font-family: Roboto;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: #999999;
}

.total-section {
    font-family: Montserrat;
    font-weight: 600;
    font-size: 21px;
    line-height: 31.5px;
    letter-spacing: 0%;
}

.column-wrapper {
    height: auto;
    display: flex;
}

.filter-right {
    display: flex;
    gap: 10px;
    color: #4B93AD;
    padding: 10px;
    border-radius: 5px;
    align-items: center;
    background: #DEF6FF;
}

// New styles for full height
.main-container {
    height: 100%;
}

// Make sure VCardAdvanced fills the height
:deep(.card) {
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>