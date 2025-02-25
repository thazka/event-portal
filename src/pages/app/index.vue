<script setup lang="ts">
import { fetchEventAnalytics, fetchLayoutEvent } from '/@src/composables/event/useAnalytics'
import { fetchEventParticipants, updateParticipant } from '/@src/composables/event/useParticipants'
import { useRadialBar } from '/@src/data/radialBarChart'
import { itemsPerPageOptions } from '/@src/data/options'
import type { Participants } from '/@src/interface/ParticipantsInterface'
import { useAnalytics } from '/@src/stores/event/analytics'
import { useParticipants } from '/@src/stores/event/participants'
import { fetchSeatList } from '/@src/composables/event/useSeats'
import { useSeats } from '/@src/stores/event/seats'

const filter = reactive({
    search: '',
    page: 1,
    offset: 10
})

const radialBar = useRadialBar()
const pageTitle = useVueroContext<string>('page-title')

const sortColumn = ref<keyof Participants | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

const modalSeat = ref(false)
const modalDataset = ref(false)
const notyf = useNotyf()

const { participants } = useParticipants()
const { analytics, seatLayout } = useAnalytics()
const { seatList } = useSeats()

const openModalSeat = () => {
    modalSeat.value = true
}

const handleLimit = (limit: number) => {
    filter.page = 1
    filter.offset = limit

    fetchEventParticipants(filter)
}

const changePage = (page: number) => {
    filter.page = page

    fetchEventParticipants(filter)
}

const handleSearch = () => {
    filter.page = 1

    fetchEventParticipants(filter)
}

// Handle seat selection
const handleSelectSeat = (userId: number, seat: any) => {
    const seatAlreadyAssigned = participants.data.some((participant: any) => 
        participant.seat && 
        participant.seat.id == seat && 
        participant.id != userId
    );
    
    if (seatAlreadyAssigned) {
        notyf.error('This seat is already assigned to another participant');
        return;
    }
    
    updateParticipant(userId, { seat_id: seat.id }).then(() => {
        // fetchEventParticipants(filter)
        participants.data.find((participant: any) => {
            if (participant.id == userId) {
                participant.seat.id = seat.id;
                participant.seat.name = seat.name;
            }
        });
    })
}

const handleSeat = () => {
    fetchLayoutEvent().then(() => {
        modalSeat.value = false
    })
}

onMounted(() => {
    pageTitle.value = 'Dashboard Analytics'

    Promise.all([
        fetchEventParticipants(filter),
        fetchEventAnalytics(),
        fetchSeatList({
            offset: 99
        })
    ])
})

useHead({
    title: 'Eventhook - Dashboard Analytics',
})
</script>

<template>
    <div>
        <div class="columns has-fullheight main-container">
            <div class="column is-half column-wrapper">
                <VCardAdvanced nofooter class="seat-layout-card">
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
                        <VLoader v-if="seatLayout.isLoading" :active="true" class="has-fullheight has-fullwidth" />
                        <img v-else class="has-fullwidth" :src="seatLayout.data.file || '/images/event/seatmap.jpg'"
                            alt="">
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
                            <span class="total-section">{{ analytics.data?.total_participants || 0 }}</span>
                        </VCard>
                    </div>
                    <div class="column is-half">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Seats Assigned
                            </h3>
                            <span class="total-section">{{ analytics.data?.total_seat_assigned || 0 }}</span>
                        </VCard>
                    </div>
                    <div class="column is-half">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Present
                            </h3>
                            <span class="total-section">{{ analytics.data?.total_presents || 0 }}</span>
                        </VCard>
                    </div>
                    <div class="column is-half">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Not Yet Present
                            </h3>
                            <span class="total-section">{{ analytics.data?.total_not_yet_presents || 0 }}</span>
                        </VCard>
                    </div>
                    <div class="column">
                        <VCard class="has-fullheight" radius="smooth">
                            <h3 class="title-section mb-2">
                                Attendance Rate
                            </h3>
                            <div>
                                <ApexChart v-bind="radialBar" />
                            </div>
                        </VCard>
                    </div>
                </div>
            </div>
        </div>

        <div class="list-wrapper">
            <div class="datatable-toolbar is-justify-content-space-between">
                <h3>Participants List</h3>

                <VFlex column-gap="10px">
                    <VField>
                        <VControl icon="lucide:search">
                            <input v-model="filter.search" :disabled="participants.isLoading"
                                class="input custom-text-filter" placeholder="Search..." @keyup.enter="handleSearch" />
                        </VControl>
                    </VField>
                    <VButtons>
                        <VButton color="primary" icon="lucide:download" outlined>
                            Download
                        </VButton>
                    </VButtons>
                </VFlex>
            </div>

            <VTableList :data="participants.data" :loading="participants.isLoading" :filter="filter"
                :sort-column="sortColumn" :sort-direction="sortDirection" :seat-list="seatList.data" @update:filter="filter = $event"
                @update:sort-column="sortColumn = $event" @update:sort-direction="sortDirection = $event"
                @select-seat="handleSelectSeat" @upload="modalDataset = true" />

            <VFlexPagination v-if="participants.data?.length" v-model:current-page="filter.page"
                :item-per-page="filter.offset" :total-items="participants.pagination?.total" :max-links-displayed="7"
                no-router @update:currentPage="changePage">
                <template #before-pagination>
                    <VDropdown left donw class="mr-2">
                        <template #button="{ toggle, isOpen }">
                            <VButton @click="toggle">
                                {{ filter.offset }}
                                <span class="ml-2">
                                    <i v-if="isOpen" class="lnir lnir-chevron-up" />
                                    <i v-else class="lnir lnir-chevron-down" />
                                </span>
                            </VButton>
                        </template>
                        <template #content="{ close }">
                            <a v-for="item in itemsPerPageOptions" :key="item.value" class="dropdown-item"
                                @click="handleLimit(item.value), close()">
                                {{ item.label }}
                            </a>
                        </template>
                    </VDropdown>
                    <span class="mx-2 mr-5">/ page</span>
                </template>
            </VFlexPagination>
        </div>

        <VModalInputSeatLayout :open="modalSeat" @close="modalSeat = false" @upload="handleSeat" />
        <VModalInputDataset :open="modalDataset" @close="modalDataset = false" />

    </div>
</template>

<style lang="scss" scoped>
.seat-layout-card {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    /* Pastikan card memiliki tinggi 100% dari container-nya */

    :deep(.card) {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    :deep(.card-body) {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        overflow: hidden;
    }
}

.datatable-toolbar {
    padding-top: 10px;
}

.datatable-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    h3 {
        font-weight: 600;
        font-size: 18.2px;
        line-height: 27.3px;
        color: #283252;
    }

    &.is-reversed {
        flex-direction: row-reverse;
    }

    .field {
        margin-bottom: 0;

        .control {
            .button {
                color: var(--light-text);

                &:hover,
                &:focus {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: var(--primary--color-invert);
                }
            }
        }
    }

    .buttons {
        margin-left: auto;
        margin-bottom: 0;

        .v-button {
            margin-bottom: 0;
        }
    }
}

.is-dark {
    .datatable-toolbar {
        .field {
            .control {
                .button {
                    background: var(--dark-sidebar) !important;
                    color: var(--light-text);

                    &:hover,
                    &:focus {
                        background: var(--primary) !important;
                        border-color: var(--primary) !important;
                        color: var(--smoke-white) !important;
                    }
                }
            }
        }
    }

    h3 {
        color: var(--light-text);
    }
}

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