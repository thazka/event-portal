<script setup lang="ts">
import { userList } from '/@src/data/datatable'

const pageTitle = useVueroContext<string>('page-title')
const selectedTab = ref('broadcast')

onMounted(() => {
    pageTitle.value = 'Event'
})

useHead({
    title: 'Eventhook - Event',
})

// Sample data - replace with your actual data source
const participants = reactive([
    { name: 'Ade Handiyanto', value: 'Ade Handiyanto' },
    { name: 'Adi Munawar', value: 'Adi Munawar' },
    { name: 'Angga Aditiya Putra', value: 'Angga Aditiya Putra' },
    { name: 'Bayu Septian', value: 'Bayu Septian' },
    { name: 'Reza Aulia Rakhman', value: 'Reza Aulia Rakhman' }
])

const statusAttedence = reactive([
    { name: 'Not Present Yet', value: 'Not Present Yet' },
    { name: 'Present', value: 'Present' },
])

const searchQuery = ref('')
const selectedParticipant = ref('')
const selectedStatus = ref('')
const present = ref('Not Present Yet')
const isFullscreen = ref(false)

// Computed property for filtered participants
const filteredParticipants = computed(() => {
    return participants.filter(participant =>
        participant.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const selectParticipant = (data: string) => {
    selectedParticipant.value = data
    selectedStatus.value = ''
}

const selectStatus = (data: string) => {
    selectedStatus.value = data
}

const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value

    if (isFullscreen.value) {
        const element = document.querySelector('.card-seating-wrapper')
        if (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen()
            } else if ((element as any).webkitRequestFullscreen) {
                (element as any).webkitRequestFullscreen()
            } else if ((element as any).msRequestFullscreen) {
                (element as any).msRequestFullscreen()
            }
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen()
        }
    }
}

onMounted(() => {
    document.addEventListener('fullscreenchange', () => {
        isFullscreen.value = !!document.fullscreenElement
    })
})
</script>

<template>
    <div>
        <div class="toolbar-event">
            <VCard radius="smooth" class="is-flex is-justify-content-space-between gap-20">
                <VField label="Participant Name" class="has-fullwidth">
                    <VControl>
                        <VDropdown modern class="has-fullwidth">
                            <template #button="{ open, toggle, isOpen }">
                                <VButton class="is-trigger has-fullwidth button-dropdown" @click="toggle">
                                    <span>{{ selectedParticipant }}</span>
                                    <VIcon v-if="!isOpen" icon="fa6-solid:angle-down" />
                                    <VIcon v-else icon="fa6-solid:angle-up" />
                                </VButton>
                            </template>
                            <template #content="{ close }">
                                <div class="search-filter">
                                    <VField>
                                        <VControl icon="lucide:search">
                                            <VInput v-model="searchQuery" type="text" placeholder="Search" />
                                        </VControl>
                                    </VField>
                                </div>
                                <a v-for="participant in filteredParticipants" :key="participant.value"
                                    class="dropdown-item"
                                    :class="{ 'is-active': selectedParticipant === participant.value }"
                                    @click="selectParticipant(participant.value), close()">
                                    {{ participant.name }}
                                </a>
                            </template>
                        </VDropdown>
                    </VControl>
                </VField>
                <VField label="Status" class="has-fullwidth">
                    <VControl>
                        <VDropdown modern class="has-fullwidth">
                            <template #button="{ open, toggle, isOpen }">
                                <VButton class="is-trigger has-fullwidth button-dropdown" @click="toggle">
                                    <span>{{ selectedStatus }}</span>
                                    <VIcon v-if="!isOpen" icon="fa6-solid:angle-down" />
                                    <VIcon v-else icon="fa6-solid:angle-up" />
                                </VButton>
                            </template>
                            <template #content="{ close }">
                                <a v-for="status in statusAttedence" :key="status.value"
                                    class="dropdown-item"
                                    :class="{ 'is-active': selectedParticipant === status.value }"
                                    @click="selectStatus(status.value), close()">
                                    {{ status.name }}
                                </a>
                            </template>
                        </VDropdown>
                    </VControl>
                </VField>
                <VField label="Date & Time Present" class="has-fullwidth">
                    <VControl>
                        <VInput v-model="present" type="text" disabled placeholder="john.doe" />
                    </VControl>
                </VField>
            </VCard>
        </div>

        <div class="card-seating-wrapper" :class="{ 'is-fullscreen': isFullscreen }">
            <VCardAdvanced nofooter class="card-seating">
                <template #header-left>
                    <h3>Participant Seat</h3>
                </template>
                <template #header-right>
                    <VButton color="primary"
                        :icon="isFullscreen ? 'material-symbols:fullscreen-exit' : 'material-symbols:fullscreen-rounded'"
                        outlined class="is-flex is-align-item-center" @click="toggleFullscreen">
                        {{ isFullscreen ? 'Exit Full Screen' : 'Full Screen' }}
                    </VButton>
                </template>
                <template #content>
                    <div class="has-text-centered">
                        <img src="/images/event/seating-color.svg" alt="" class="">

                        <h1 class="title">ADE HANDIYANTO</h1>
                        <h3 class="subtitle">Seat: CENTER-007</h3>
                    </div>
                </template>
            </VCardAdvanced>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.gap-20 {
    gap: 20px;
}

.button-dropdown {
    padding: 8px 0.75em;

    :deep(span) {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }
}

:deep(.dropdown) {
    .dropdown-menu {
        width: 100%;
        margin: 0;
        padding: 0;

        .dropdown-content {
            width: 100%;

            .search-filter {
                padding: 10px;
                padding-top: 0;
            }
        }
    }
}

.card-seating-wrapper {
    margin-top: 20px;

    &.is-fullscreen {
        background: white;

        .card-seating {
            height: 100vh;
            margin: 0;

            :deep(.card-content) {
                display: flex;
                align-items: center;
                justify-content: center;
                height: calc(100vh - 60px); // Adjust based on header height

                img {
                    max-height: 80vh;
                    width: auto;
                }
            }
        }
    }

    .card-seating {
        :deep(.card-head) {
            border-bottom: none;
        }
    }
}
</style>