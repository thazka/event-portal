<script setup lang="ts">
import { fetchEventParticipants } from '/@src/composables/event/useParticipants'
import { useParticipants } from '/@src/stores/event/participants'
import { itemsPerPageOptions } from '/@src/data/options'

export interface UserData {
    no: number
    name: string
    phone: string
}

const pageTitle = useVueroContext<string>('page-title')
const selectedTab = ref('broadcast')
const { participants } = useParticipants()

const filter = reactive({
    search: '',
    page: 1,
    offset: 10
})

const selectedRows = ref<number[]>([])
const sortColumn = ref<keyof UserData | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)
const modalBroadcast = ref(false)
const modalDatePicker = ref(false)

const handleLimit = (limit: number) => {
    filter.page = 1
    filter.offset = limit

    fetchEventParticipants(filter)
}

const handleSearch = () => {
    filter.page = 1

    fetchEventParticipants(filter)
}

const changePage = (page: number) => {
    filter.page = page

    fetchEventParticipants(filter)
}

const openModalBroadcast = () => {
    modalBroadcast.value = true
}

const openModalSchedule = () => {
    modalBroadcast.value = false

    modalDatePicker.value = true
    // setTimeout(() => {
    // }, 100)
}

onMounted(() => {
    pageTitle.value = 'Whatsapp Broadcast'
    fetchEventParticipants(filter)
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
        
        <template v-if="selectedTab === 'broadcast'">
            <!-- Toolbar moved to parent -->
            <div class="datatable-toolbar is-justify-content-space-between">
                <h3>List of Participants</h3>

                <VFlex column-gap="10px">
                    <VField>
                        <VControl icon="lucide:search">
                            <input v-model="filter.search" class="input custom-text-filter"
                                :disabled="participants.isLoading" placeholder="Search..." @keyup.enter="handleSearch">
                        </VControl>
                    </VField>
                    <VButtons>
                        <VButton color="primary" icon="ic:baseline-whatsapp" @click="openModalBroadcast">
                            New Broadcast Message
                        </VButton>
                    </VButtons>
                </VFlex>

                <VModalBroadcast :open="modalBroadcast" @open-schedule="openModalSchedule" @close="modalBroadcast = false" />
                <VModalDatePicker :open="modalDatePicker" />
            </div>

            <!-- Table component -->
            <VTableCheckbox :data="participants.data" :filter="filter" :loading="participants.isLoading"
                :selectedRows="selectedRows" :sortColumn="sortColumn" :sortDirection="sortDirection"
                @broadcast="openModalBroadcast" />

            <!-- Pagination moved to parent -->
            <VFlexPagination v-if="participants.data.length" v-model:current-page="filter.page"
                :item-per-page="filter.offset" :total-items="participants.pagination?.total" :max-links-displayed="7"
                no-router class="mt-4" @update:currentPage="changePage">
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
        </template>

        <VTableLogs v-else />
    </div>
</template>

<style lang="scss" scoped>
/* Toolbar and pagination styles moved to parent */
.is-navbar {
    .datatable-toolbar {
        padding-top: 30px;
    }
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
</style>