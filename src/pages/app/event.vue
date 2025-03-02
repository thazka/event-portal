<script setup lang="ts">
import moment from 'moment'
import { fetchEventParticipants, updateAttendance } from '/@src/composables/event/useParticipants'
import { eventOptions } from '/@src/data/options'
import { useParticipants } from '/@src/stores/event/participants'

const pageTitle = useVueroContext<string>('page-title')
const selectedTab = ref('broadcast')
const { participants } = useParticipants()
const route = useRoute()
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

const filteredParticipants = computed(() => {
    return participants.data.filter((participant: any) => {
        const nameMatch = participant.name &&
            participant.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        const phoneMatch = participant.phone &&
            participant.phone.includes(searchQuery.value.toLowerCase());

        return nameMatch || phoneMatch;
    });
});

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

// Fixed fullscreen function to handle display mode properly
const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value

    if (isFullscreen.value) {
        // Set this window as display only when entering fullscreen
        if (!isDisplayOnly.value) {
            localStorage.setItem('hasDisplayWindow', 'true')
        }

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
        if (!isDisplayOnly.value) {
            localStorage.setItem('hasDisplayWindow', 'false')
        }

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

    switch (event.key) {
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

// Handle fullscreen change event
const handleFullscreenChange = () => {
    // Only update the isFullscreen state based on document.fullscreenElement
    // This ensures consistency across browsers
    isFullscreen.value = !!document.fullscreenElement

    // If exiting fullscreen in display mode, allow re-entering fullscreen
    if (!document.fullscreenElement && isDisplayOnly.value) {
        // Add a small delay to make sure the browser has fully exited fullscreen mode
        setTimeout(() => {
            // Show fullscreen prompt again if in display mode
            const cardContent = document.querySelector('.card-seating .card-content')
            if (cardContent && !document.querySelector('.fullscreen-prompt')) {
                const overlay = document.createElement('div')
                overlay.className = 'fullscreen-prompt'
                overlay.innerHTML = `
                    <div class="fullscreen-message">
                        <h2>Click anywhere to enter fullscreen</h2>
                    </div>
                `
                overlay.addEventListener('click', () => {
                    toggleFullscreen()
                    overlay.remove()
                })
                cardContent.prepend(overlay)
            }
        }, 100)
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
                    toggleFullscreen()
                    overlay.remove()
                })
                cardContent.prepend(overlay)
            }
        }, 500)
    }

    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange)

    // Add event listener for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

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
})

const imagesText = computed(() => {
    if (selectedEvent.value == 1) {
        return '/images/event/layout/text-meeting.png'
    } else {
        return '/images/event/layout/text-gala-dinner.png'
    }
})

// Cleanup
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

        // Check if there's a currently selected event in localStorage
        const currentEventId = localStorage.getItem('currentSelectedEvent')
        if (currentEventId) {
            selectedEvent.value = parseInt(currentEventId)
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
                    toggleFullscreen()
                    overlay.remove()
                })
                cardContent.prepend(overlay)
            }
        }, 500)
    }

    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange)

    // Add event listener for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

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
                        <VDropdown modern class="has-fullwidth dropdown-participant">
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
            <VCardAdvanced nofooter class="card-seating" :selectedEvent="selectedEvent">
                <template #header-left>
                    <h3 class="title-card">Participant Seat</h3>
                </template>
                <template #header-right>
                    <VButton color="primary"
                        :icon="isFullscreen ? 'material-symbols:fullscreen-exit' : 'material-symbols:fullscreen-rounded'"
                        outlined class="is-flex is-align-item-center" @click="toggleFullscreen">
                        {{ isFullscreen ? 'Exit Full Screen' : 'Full Screen' }}
                    </VButton>
                    <VButton v-if="!isDisplayOnly" color="info" icon="lucide:external-link" outlined
                        class="is-flex is-align-item-center ml-2" @click="openDisplayView">
                        Open Display View
                    </VButton>
                </template>
                <template #content>
                    <div class="columns columns-participant has-fullheight">
                        <!-- Left side - Meeting Info Card -->
                        <div class="column is-5 has-fullheight">
                            <div class="meeting-info-card has-fullheight">
                                <div class="participant-content">
                                    <div class="participant-name-container">
                                        <h1 class="participant-name">{{ selectedParticipant ? selectedParticipant.name :
                                            'No Participant Selected' }}</h1>
                                    </div>

                                    <div class="participant-details">
                                        <h3 class="title has-text-centered"
                                            v-if="selectedParticipant && selectedParticipant.event">
                                            {{ selectedParticipant.event?.seat?.name ?
                                                `${selectedParticipant.event?.seat?.name}` : 'Not Assigned' }}
                                        </h3>
                                        <h3 class="subtitle" v-else>Select a participant to view seat information</h3>

                                        <!-- <VFlex column-gap="8px" justify-content="center">
                                            <VTag :color="selectedStatus === 'Present' ? 'success' : 'warning'">
                                                <VIcon icon="lucide:user-check" />
                                                <span class="ml-3">{{ selectedStatus || 'Not Checked In' }}</span>
                                            </VTag>
                                            <VTag :color="present !== '-' ? 'info' : 'light'">
                                                <VIcon icon="lucide:clock" />
                                                <span class="ml-3">{{ present || '-' }}</span>
                                            </VTag>
                                        </VFlex> -->
                                    </div>

                                    <div class="event-date">
                                        <h3>4 Maret 2025</h3>
                                    </div>
                                </div>

                                <div class="event-image-container">
                                    <img :src="imagesText" class="event-name" :class="isFullscreen && 'is-fullscreen'"
                                        alt="">
                                </div>

                            </div>
                        </div>
                        <div class="column"></div>
                    </div>
                </template>
            </VCardAdvanced>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dropdown-participant {
    :deep(.dropdown-menu) {
        .dropdown-content {
            max-height: 200px;
            overflow: auto;
        }
    }
}

.gap-20 {
    gap: 20px;
}

.columns-participant {
    margin-inline-start: 30px;
}

.meeting-info-card {
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.participant-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-top: 20px;
}

.participant-name-container {
    background-color: #f5f0e1;
    border: 2px solid #c8b69b;
    border-radius: 20px;
    padding: 10px 20px;
    margin-bottom: 20px;
    text-align: center;
}

.participant-name {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    word-wrap: break-word;
}

.event-image-container {
    align-self: flex-end;
    width: 100%;
    margin-top: auto;
}

.info-display-area {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.event-date {
    align-self: center;
    background-color: #f5f0e1;
    border: 2px solid #c8b69b;
    border-radius: 10px;
    padding: 8px 15px;
    font-size: 1.4rem;
    font-weight: 600;
    margin-top: 10px;
    margin-bottom: 70px;
    width: 60%;
    text-align: center;
}

.event-title {
    font-family: 'Brush Script MT', cursive;
    font-size: 4rem;
    color: #333;
    transform: rotate(-5deg);
    margin-top: 20px;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.participant-details {
    background-color: #f5f0e1;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 20px 0;

    .title {
        font-size: 50px;
    }
}

.event-name {
    width: 100%;
    height: auto;
    max-height: 100px;
    object-fit: contain;

    &.is-fullscreen {
        margin-bottom: 50px;
    }
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

.fullscreen-prompt {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    cursor: pointer;

    .fullscreen-message {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

        h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #333;
        }
    }
}

.seating-area {
    background-color: #f5f0e1;
    border: 2px solid #c8b69b;
    border-radius: 8px;
    height: 100%;
    position: relative;
}
</style>