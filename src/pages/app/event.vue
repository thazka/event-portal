.fullscreen-prompt {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    cursor: pointer;
}

.fullscreen-message {
    background: white;
    padding: 20px 40px;
    border-radius: 8px;
    text-align: center;
    
    h2 {
        margin: 0;
        color: #333;
    }
}// Function to request fullscreen for card-seating-wrapper
const requestCardFullscreen = () => {
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
}<script setup lang="ts">
import moment from 'moment'
import { fetchEventParticipants, updateAttendance } from '/@src/composables/event/useParticipants'
import { eventOptions } from '/@src/data/options'
import { useParticipants } from '/@src/stores/event/participants'

const pageTitle = useVueroContext<string>('page-title')
const selectedTab = ref('broadcast')
const { participants } = useParticipants()

// Notification system
const isLoading = ref(false)
const notyf = useNotyf()

onMounted(() => {
    pageTitle.value = 'Event'
})

useHead({
    title: 'Eventhook - Event',
})

const statusAttendance = reactive([
    { name: 'Not Present Yet', value: 'Not Present Yet' },
    { name: 'Present', value: 'Present' },
])

const searchQuery = ref('')
const selectedParticipant = ref<any>(null)
const selectedStatus = ref('')
const selectedEvent = ref(1)
const present = ref('')
const isFullscreen = ref(false)
// Flag to determine if this is the display window
const isDisplayOnly = ref(false)

// Computed property for filtered participants
const filteredParticipants = computed(() => {
    return participants.data.filter((participant: any) =>
        participant.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '-'
    return moment(dateTimeString).format('YYYY-MM-DD HH:mm')
}

// Select participant and update form
const selectParticipant = (participant: any) => {
    selectedParticipant.value = participant

    if (participant.event?.attendance) {
        selectedStatus.value = 'Present'
        present.value = formatDateTime(participant.event.attendance)
    } else {
        selectedStatus.value = 'Not Present Yet'
        present.value = '-'
    }

    // Save selected participant to localStorage for real-time sync
    localStorage.setItem('currentSelectedParticipant', JSON.stringify(participant))
    
    // Also store the ID for session persistence
    sessionStorage.setItem('selectedParticipantId', participant.id.toString())
}

// Handle status change and update attendance
const changeStatus = async (status: string) => {
    if (!selectedParticipant.value || !selectedParticipant.value.event) {
        notyf.error('Please select a participant first')
        return
    }

    selectedStatus.value = status

    if (status === 'Present') {
        await updateParticipantAttendance()
    } else {
        // Update localStorage for real-time sync even if just changing status
        localStorage.setItem('currentParticipantStatus', status)
    }
}

const updateParticipantAttendance = async () => {
    if (!selectedParticipant.value) return

    isLoading.value = true

    try {
        const formattedDate = moment().format('YYYY-MM-DD HH:mm')
        const result = await updateAttendance(selectedEvent.value, selectedParticipant.value.id, formattedDate)

        if (!result.status) {
            throw new Error(result.error)
        }

        const formattedTime = formattedDate

        if (selectedParticipant.value.event) {
            selectedParticipant.value.event.attendance = formattedTime
        } else {
            selectedParticipant.value.event = {
                event_id: selectedEvent.value,
                participant_id: selectedParticipant.value.id,
                attendance: formattedTime
            }
        }

        present.value = formatDateTime(formattedTime)

        const index = participants.data.findIndex((p: any) => p.id === selectedParticipant.value.id)
        if (index !== -1) {
            if (!participants.data[index].event) {
                participants.data[index].event = {
                    event_id: selectedEvent.value,
                    participant_id: selectedParticipant.value.id,
                    attendance: formattedTime
                }
            } else {
                participants.data[index].event.attendance = formattedTime
            }
        }

        // Store the selected participant ID for persistence
        sessionStorage.setItem('selectedParticipantId', selectedParticipant.value.id.toString())

        // Update status display
        selectedStatus.value = 'Present'

        // Update localStorage for real-time sync
        localStorage.setItem('currentSelectedParticipant', JSON.stringify(selectedParticipant.value))
        localStorage.setItem('currentParticipantStatus', 'Present')
        localStorage.setItem('currentParticipantPresent', formatDateTime(formattedTime))

        notyf.success('Attendance updated successfully')
    } catch (error) {
        console.error('Failed to update attendance:', error)
        notyf.error('Failed to update attendance')
    } finally {
        isLoading.value = false
    }
}

const updateParticipantStatusDisplay = () => {
    if (participants.data && participants.data.length > 0 && selectedParticipant.value) {
        const updatedParticipant = participants.data.find(
            (p: any) => p.id === selectedParticipant.value.id
        )

        if (updatedParticipant) {
            selectedParticipant.value = updatedParticipant

            if (updatedParticipant.event?.attendance) {
                selectedStatus.value = 'Present'
                present.value = formatDateTime(updatedParticipant.event.attendance)
            } else {
                selectedStatus.value = 'Not Present Yet'
                present.value = '-'
            }
        }
    }
}

const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value

    if (isFullscreen.value) {
        // Set this window as display only when entering fullscreen
        isDisplayOnly.value = true
        localStorage.setItem('hasDisplayWindow', 'true')
        
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
        isDisplayOnly.value = false
        localStorage.setItem('hasDisplayWindow', 'false')
        
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen()
        }
    }
}

const selectEvent = () => {
    selectedParticipant.value = null
    selectedStatus.value = ''
    present.value = ''

    // Update localStorage for event selection
    localStorage.setItem('currentSelectedEvent', selectedEvent.value.toString())

    fetchEventParticipants({ offset: 999, event_id: selectedEvent.value })
        .then(() => {
            updateParticipantStatusDisplay()
        })
}

// Function to open display view in a new window
const openDisplayView = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('display', 'true')
    const newWindow = window.open(url.toString(), '_blank')
    
    // Store a flag in localStorage to indicate a display window has been opened
    localStorage.setItem('displayWindowOpened', 'true')
    
    // Transfer any current participant data to the new window
    if (selectedParticipant.value) {
        localStorage.setItem('currentSelectedParticipant', JSON.stringify(selectedParticipant.value))
        localStorage.setItem('currentParticipantStatus', selectedStatus.value)
        localStorage.setItem('currentParticipantPresent', present.value)
    }
}

// Function to handle storage events for real-time updates
const handleStorageChange = (event: StorageEvent) => {
    if (!event.newValue) return

    switch(event.key) {
        case 'currentSelectedParticipant':
            if (!isDisplayOnly.value) return // Skip if this is the control window
            
            const newParticipant = JSON.parse(event.newValue)
            
            // Only update if we're not already showing this participant
            if (!selectedParticipant.value || selectedParticipant.value.id !== newParticipant.id) {
                selectedParticipant.value = newParticipant
                
                if (newParticipant.event?.attendance) {
                    selectedStatus.value = 'Present'
                    present.value = formatDateTime(newParticipant.event.attendance)
                } else {
                    selectedStatus.value = 'Not Present Yet'
                    present.value = '-'
                }
            }
            break
            
        case 'currentParticipantStatus':
            if (!isDisplayOnly.value) return // Skip if this is the control window
            selectedStatus.value = event.newValue
            break
            
        case 'currentParticipantPresent':
            if (!isDisplayOnly.value) return // Skip if this is the control window
            present.value = event.newValue
            break
            
        case 'currentSelectedEvent':
            if (!isDisplayOnly.value) return // Skip if this is the control window
            
            const newEventId = parseInt(event.newValue)
            if (selectedEvent.value !== newEventId) {
                selectedEvent.value = newEventId
                fetchEventParticipants({ offset: 999, event_id: newEventId })
            }
            break
    }
}

onMounted(() => {
    // Check URL parameters to determine if this is display mode
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('display') === 'true') {
        isDisplayOnly.value = true
        
        // Hide the toolbar in display mode
        const toolbarElement = document.querySelector('.toolbar-event')
        if (toolbarElement) {
            (toolbarElement as HTMLElement).style.display = 'none'
        }
        
        // Add instructions for user to click to enter fullscreen
        setTimeout(() => {
            const cardContent = document.querySelector('.card-seating .card-content')
            if (cardContent) {
                const overlay = document.createElement('div')
                overlay.className = 'fullscreen-prompt'
                overlay.innerHTML = `
                    <div class="fullscreen-message">
                        <h2>Click anywhere to enter fullscreen</h2>
                    </div>
                `
                overlay.addEventListener('click', () => {
                    // requestCardFullscreen()
                    overlay.remove()
                })
                cardContent.prepend(overlay)
            }
        }, 500)
    }

    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange)

    document.addEventListener('fullscreenchange', () => {
        isFullscreen.value = !!document.fullscreenElement
    })

    fetchEventParticipants({ offset: 999, event_id: selectedEvent.value }).then(() => {
        // After initial data is loaded, check for query parameters or session storage
        // to restore previous selection if needed
        
        // If this is display mode, check if there's a currently selected participant in localStorage
        if (isDisplayOnly.value) {
            const currentParticipantJson = localStorage.getItem('currentSelectedParticipant')
            if (currentParticipantJson) {
                const currentParticipant = JSON.parse(currentParticipantJson)
                // Find this participant in our data
                const participant = participants.data.find((p: any) => p.id === currentParticipant.id)
                if (participant) {
                    selectParticipant(participant)
                }
            }
        } else {
            // Regular session restore logic
            const storedParticipantId = sessionStorage.getItem('selectedParticipantId')
            if (storedParticipantId) {
                const participant = participants.data.find((p: any) => p.id.toString() === storedParticipantId)
                if (participant) {
                    selectParticipant(participant)
                }
            }
        }
    })
    
    // Cleanup
    onUnmounted(() => {
        window.removeEventListener('storage', handleStorageChange)
    })
})
</script>

<template>
    <div>
        <div class="toolbar-event" v-if="!isDisplayOnly">
            <VCard radius="smooth" class="is-flex is-justify-content-space-between gap-20">
                <VField label="Select Event" class="has-fullwidth">
                    <VControl>
                        <Multiselect v-model="selectedEvent" :options="eventOptions" placeholder="Select Event"
                            label="label" track-by="value" @select="selectEvent" />
                    </VControl>
                </VField>
                <VField label="Participant Name" class="has-fullwidth">
                    <VControl>
                        <VDropdown modern class="has-fullwidth">
                            <template #button="{ open, toggle, isOpen }">
                                <VButton class="is-trigger has-fullwidth button-dropdown" @click="toggle">
                                    <span>{{ selectedParticipant ? selectedParticipant.name : 'Select Participant'
                                        }}</span>
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
                                <a v-for="participant in filteredParticipants" :key="participant.id"
                                    class="dropdown-item"
                                    :class="{ 'is-active': selectedParticipant && selectedParticipant.id === participant.id }"
                                    @click="selectParticipant(participant), close()">
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
                                <VButton class="is-trigger has-fullwidth button-dropdown" @click="toggle"
                                    :disabled="!selectedParticipant">
                                    <span>{{ selectedStatus || 'Select Status' }}</span>
                                    <VIcon v-if="!isOpen" icon="fa6-solid:angle-down" />
                                    <VIcon v-else icon="fa6-solid:angle-up" />
                                </VButton>
                            </template>
                            <template #content="{ close }">
                                <a v-for="status in statusAttendance" :key="status.value" class="dropdown-item"
                                    :class="{ 'is-active': selectedStatus === status.value }"
                                    @click="changeStatus(status.value), close()">
                                    {{ status.name }}
                                </a>
                            </template>
                        </VDropdown>
                    </VControl>
                </VField>
                <VField label="Date & Time Present" class="has-fullwidth">
                    <VControl>
                        <VInput v-model="present" type="text" disabled placeholder="-" />
                    </VControl>
                </VField>
            </VCard>
        </div>

        <div class="card-seating-wrapper" :class="{ 'is-fullscreen': isFullscreen, 'is-display-only': isDisplayOnly }">
            <VCardAdvanced nofooter class="card-seating">
                <template #header-left>
                    <h3 class="title-card">Participant Seat</h3>
                </template>
                <template #header-right>
                    <VButton color="primary"
                        :icon="isFullscreen ? 'material-symbols:fullscreen-exit' : 'material-symbols:fullscreen-rounded'"
                        outlined class="is-flex is-align-item-center" @click="toggleFullscreen">
                        {{ isFullscreen ? 'Exit Full Screen' : 'Full Screen' }}
                    </VButton>
                    <VButton v-if="!isDisplayOnly" color="info" 
                        icon="lucide:external-link"
                        outlined class="is-flex is-align-item-center ml-2" 
                        @click="openDisplayView">
                        Open Display View
                    </VButton>
                </template>
                <template #content>
                    <div class="has-text-centered">
                        <img src="/images/event/seating-color.svg" alt="" class="">

                        <h1 class="title">{{ selectedParticipant ? selectedParticipant.name : 'No Participant Selected'
                            }}</h1>
                        <h3 class="subtitle" v-if="selectedParticipant && selectedParticipant.event">
                            Seat: {{ selectedParticipant.event.seat_id ? `CENTER-00${selectedParticipant.event.seat_id}`
                            : 'Not Assigned' }}
                        </h3>
                        <h3 class="subtitle" v-else>Select a participant to view seat information</h3>

                        <VFlex column-gap="8px" justify-content="center">
                            <VTag :color="selectedStatus === 'Present' ? 'success' : 'warning'">
                                <VIcon icon="lucide:user-check" />
                                <span class="ml-3">{{ selectedStatus || 'Not Checked In' }}</span>
                            </VTag>
                            <VTag :color="present !== '-' ? 'info' : 'light'">
                                <VIcon icon="lucide:clock" />
                                <span class="ml-3">{{ present || '-' }}</span>
                            </VTag>
                        </VFlex>
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

.title-card {
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    font-size: 18.2px;
    line-height: 27.3px;
    letter-spacing: 0%;
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
    
    &.is-display-only {
        margin-top: 0;
        
        .card-seating {
            :deep(.card-head) {
                // Make header smaller in display mode
                padding: 10px 20px;
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