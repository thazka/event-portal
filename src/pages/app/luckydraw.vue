<!-- DoorprizeDrawing.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { fetchDoorprize } from '/@src/composables/event/useDoorprize'
import { useDoorprize } from '/@src/stores/event/doorprize'
import { useParticipants } from '/@src/stores/event/participants'
import { fetchEventParticipants } from '/@src/composables/event/useParticipants'
import { updateWinner } from '/@src/composables/event/useDoorprize' 

// Types
interface Participant {
    id: number
    name: string
    selected?: boolean
    company?: string
    phone?: string
}

interface Doorprize {
    id: number
    name: string
    photo: string
    total_winner: number
    participants: Participant[]
    created_at: string
    updated_at: string
    deleted_at: null | string
    created_by: number
}

// Constants
const LOCAL_STORAGE = {
    DOORPRIZE_WINNERS: 'doorprize_winners',
    PARTICIPANTS_SELECTED: 'participants_selected'
}

// Store access
const { participants } = useParticipants()
const { doorprize } = useDoorprize()

// UI state
const pageTitle = useVueroContext<string>('page-title')
const searchParticipants = ref('')
const multipleDoorprizesPerWinner = ref(false)
const currentDoorprize = ref<Doorprize | null | any>(null)
const isFullscreen = ref(false)
const drawingWrapperRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isWinnersModalOpen = ref(false)

/**
 * Saves winners to localStorage
 * Ensures participants lists are deduplicated
 */
const saveWinnersToLocalStorage = (): void => {
    if (!doorprize.data || !doorprize.data.length) return

    const winnersData = doorprize.data.map(prize => {
        // Ensure no duplicates
        let uniqueParticipants: Participant[] = []
        
        if (prize.participants && prize.participants.length > 0) {
            // Use a Map to deduplicate by ID
            const participantsMap = new Map<number, Participant>()
            
            prize.participants.forEach(participant => {
                if (!participantsMap.has(participant.id)) {
                    participantsMap.set(participant.id, participant)
                }
            })
            
            uniqueParticipants = Array.from(participantsMap.values())
        }
        
        return {
            id: prize.id,
            participants: uniqueParticipants
        }
    })
    
    localStorage.setItem(LOCAL_STORAGE.DOORPRIZE_WINNERS, JSON.stringify(winnersData))
    
    // Also save the selected state of all participants
    const selectedParticipants = participants.data
        .filter(p => p.selected)
        .map(p => p.id)
    
    localStorage.setItem(LOCAL_STORAGE.PARTICIPANTS_SELECTED, JSON.stringify(selectedParticipants))
}

/**
 * Loads winners from localStorage
 * Used as fallback if API is unavailable
 */
const loadWinnersFromLocalStorage = (): void => {
    try {
        const winnersData = localStorage.getItem(LOCAL_STORAGE.DOORPRIZE_WINNERS)
        const selectedParticipantsData = localStorage.getItem(LOCAL_STORAGE.PARTICIPANTS_SELECTED)
        
        if (winnersData) {
            const parsedWinners = JSON.parse(winnersData)
            
            // Apply saved participants to doorprize data
            doorprize.data.forEach(prize => {
                const savedPrize = parsedWinners.find((p: any) => p.id === prize.id)
                if (savedPrize && savedPrize.participants && savedPrize.participants.length > 0) {
                    // Deduplicate participants array
                    const uniqueParticipants = savedPrize.participants.reduce((acc: Participant[], curr: Participant) => {
                        if (!acc.some(p => p.id === curr.id)) {
                            acc.push(curr)
                        }
                        return acc
                    }, [])
                    
                    // Create a proper deep copy of the participants array
                    prize.participants = JSON.parse(JSON.stringify(uniqueParticipants))
                }
            })
        }
        
        // Restore selected state of participants
        if (selectedParticipantsData) {
            const selectedIds = JSON.parse(selectedParticipantsData)
            
            participants.data.forEach(participant => {
                participant.selected = selectedIds.includes(participant.id)
            })
        }
    } catch (error) {
        console.error('Error loading doorprize winners from localStorage:', error)
        errorMessage.value = 'Failed to load saved winners data.'
        setTimeout(() => { errorMessage.value = null }, 5000)
    }
}

/**
 * Updates the doorprize winners in the API
 * @param doorprizeId - ID of the doorprize
 * @param participantIds - Array of participant IDs who won the doorprize
 * @returns Promise with the API response
 */
const saveWinnersToAPI = async (doorprizeId: number, participantIds: number[]): Promise<any> => {
    try {
        const response = await updateWinner(doorprizeId, {
            participants: participantIds
        })
        
        if (response instanceof Error) {
            throw response
        }
        
        return response
    } catch (error) {
        console.error(`Error saving winners to API for doorprize ID ${doorprizeId}:`, error)
        throw error
    }
}

/**
 * Initializes the doorprize data from the API
 */
const fetchDoorprizes = async (): Promise<void> => {
    try {
        isLoading.value = true
        errorMessage.value = null
        
        await fetchDoorprize({
            // offset: 999
            paginate: false
        })

        doorprize.data.forEach(prize => {
            if (!prize.participants) {
                prize.participants = [];
            }

            // Set default total_winner to 10 if it's 1 or not specified
            if (!prize.total_winner || prize.total_winner === 1) {
                prize.total_winner = 10;
            }
        });

        // Force reactivity update
        doorprize.data = [...doorprize.data]

        if (doorprize.data.length > 0 && !currentDoorprize.value) {
            const firstPrize = doorprize.data[0]
            // Create a new reference to ensure reactivity
            currentDoorprize.value = JSON.parse(JSON.stringify(firstPrize))
        }
    } catch (error) {
        console.error('Error fetching doorprizes:', error)
        errorMessage.value = 'Failed to load doorprize data.'
        setTimeout(() => { errorMessage.value = null }, 5000)
    } finally {
        isLoading.value = false
    }
}

/**
 * Filtered list of participants based on search and selection status
 */
const filteredParticipants = computed(() => {
    let list = participants.data.filter(data => data.events.find(event => event.event_id == 3 && event.attendance) && !['CMI', 'VVIP'].includes(data.company))

    if (!multipleDoorprizesPerWinner.value) {
        // Filter out participants who already won any doorprize
        list = list.filter((p) => !p.selected)
    }

    if (searchParticipants.value) {
        list = list.filter((participant: any) =>
            participant.name.toLowerCase().includes(searchParticipants.value.toLowerCase())
        )
    }
    return list
})

/**
 * Check if all available winner slots are filled for the current doorprize
 */
const isAllWinnersSelected = computed(() => {
    if (!currentDoorprize.value) return false;
    const currentWinners = currentDoorprize.value.participants ?
        currentDoorprize.value.participants.length : 0;
    const maxWinners = currentDoorprize.value.total_winner || 0;
    return currentWinners >= maxWinners;
});

/**
 * Change the current doorprize
 */
const selectDoorprize = (prize: Doorprize): void => {
    currentDoorprize.value = JSON.parse(JSON.stringify(prize))
}

/**
 * Move to the next doorprize in the list
 */
const nextDoorprize = (): void => {
    if (!currentDoorprize.value) return
    const currentIndex = doorprize.data.findIndex(d => d.id === currentDoorprize.value?.id)
    if (currentIndex < doorprize.data.length - 1) {
        currentDoorprize.value = JSON.parse(JSON.stringify(doorprize.data[currentIndex + 1]))
    } else if (doorprize.data.length > 0) {
        // Loop back to the first doorprize
        currentDoorprize.value = JSON.parse(JSON.stringify(doorprize.data[0]))
    }
}

/**
 * Handler when a winner is selected from the animation
 * Updates both local state and API
 */
const handleWinnerSelected = async (winner: Participant, shouldEliminate: boolean = true): Promise<void> => {
    if (!currentDoorprize.value || !shouldEliminate) return

    // Mark participant as selected in main list if we're eliminating them
    if (!multipleDoorprizesPerWinner.value) {
        const participantIndex = participants.data.findIndex(p => p.id === winner.id)
        if (participantIndex !== -1) {
            participants.data[participantIndex].selected = true
        }
    }
    
    // Get the doorprize index in the main data array
    const doorprizeIndex = doorprize.data.findIndex(p => p.id === currentDoorprize.value?.id)
    
    if (doorprizeIndex !== -1) {
        // Ensure the participants array exists in the main data
        if (!doorprize.data[doorprizeIndex].participants) {
            doorprize.data[doorprizeIndex].participants = []
        }
        
        // Check if this winner already exists in the list (prevent duplicates)
        const existsInWinners = doorprize.data[doorprizeIndex].participants.some(
            p => p.id === winner.id
        )
        
        // Only add if not a duplicate
        if (!existsInWinners) {
            // Add winner to the doorprize
            doorprize.data[doorprizeIndex].participants.push({ ...winner })
            
            // Update current doorprize reference
            currentDoorprize.value = JSON.parse(JSON.stringify(doorprize.data[doorprizeIndex]))
            
            // Force reactivity update
            doorprize.data = [...doorprize.data]
            
            // Save to localStorage first (as backup)
            saveWinnersToLocalStorage()
            
            // Then save to API
            try {
                const winnerIds = doorprize.data[doorprizeIndex].participants.map(p => p.id)
                await saveWinnersToAPI(currentDoorprize.value.id, winnerIds)
                
                successMessage.value = `${winner.name} has been added as a winner!`
                setTimeout(() => { successMessage.value = null }, 3000)
            } catch (error) {
                console.error('Failed to save winner to API:', error)
                errorMessage.value = 'Winner saved locally but failed to sync with server.'
                setTimeout(() => { errorMessage.value = null }, 5000)
            }
        }
    }
}

/**
 * Toggle fullscreen mode
 */
const toggleFullscreen = (): void => {
    isFullscreen.value = !isFullscreen.value

    if (isFullscreen.value) {
        const element = document.querySelector('.drawing-wrapper')
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

/**
 * Set up fullscreen change event listeners
 */
const setupFullscreenListeners = (): void => {
    const handleFullscreenChange = () => {
        isFullscreen.value = !!document.fullscreenElement
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
}

/**
 * Get remaining winner slots for a doorprize
 */
const getRemainingWinners = (prize: Doorprize): number => {
    const currentWinners = prize.participants ? prize.participants.length : 0;
    const maxWinners = prize.total_winner || 0;
    return Math.max(0, maxWinners - currentWinners);
}

/**
 * Open the winners modal to display all winners
 */
const openWinnersModal = (): void => {
    if (currentDoorprize.value && currentDoorprize.value.participants?.length > 0) {
        isWinnersModalOpen.value = true
    }
}

/**
 * Close the winners modal
 */
const closeWinnersModal = (): void => {
    isWinnersModalOpen.value = false
}

/**
 * Reset all winners (clears localStorage and API)
 */
const resetAllWinners = async (): Promise<void> => {
    if (!confirm('Are you sure you want to reset all winners? This cannot be undone.')) {
        return
    }
    
    try {
        isLoading.value = true
        
        // Clear local storage
        localStorage.removeItem(LOCAL_STORAGE.DOORPRIZE_WINNERS)
        localStorage.removeItem(LOCAL_STORAGE.PARTICIPANTS_SELECTED)
        
        // Reset participants selected state
        participants.data.forEach(participant => {
            participant.selected = false
        })
        
        // Reset doorprize participants and API
        for (const prize of doorprize.data) {
            // Reset in local data
            prize.participants = []
            
            // Reset in API
            try {
                await saveWinnersToAPI(prize.id, [])
            } catch (error) {
                console.error(`Error resetting winners for doorprize ID ${prize.id} in API:`, error)
                errorMessage.value = 'Some winners could not be reset in the database.'
                setTimeout(() => { errorMessage.value = null }, 5000)
            }
        }
        
        // Force update doorprize data
        doorprize.data = [...doorprize.data]
        
        // Update current doorprize if it exists
        if (currentDoorprize.value) {
            const doorprizeIndex = doorprize.data.findIndex(d => d.id === currentDoorprize.value?.id)
            if (doorprizeIndex !== -1) {
                currentDoorprize.value = JSON.parse(JSON.stringify(doorprize.data[doorprizeIndex]))
            }
        }
        
        successMessage.value = 'All winners have been reset.'
        setTimeout(() => { successMessage.value = null }, 3000)
    } catch (error) {
        console.error('Error resetting winners:', error)
        errorMessage.value = 'Failed to reset winners. Please try again.'
        setTimeout(() => { errorMessage.value = null }, 5000)
    } finally {
        isLoading.value = false
    }
}

/**
 * Synchronize local winners with the API
 * Used when coming back online after being offline
 */
const syncWinnersWithAPI = async (): Promise<void> => {
    try {
        if (doorprize.data.length === 0) return
        
        for (const prize of doorprize.data) {
            if (prize.participants && prize.participants.length > 0) {
                await saveWinnersToAPI(
                    prize.id, 
                    prize.participants.map(p => p.id)
                )
            }
        }
        
        successMessage.value = 'Winners synchronized with server.'
        setTimeout(() => { successMessage.value = null }, 3000)
    } catch (error) {
        console.error('Failed to sync winners with API:', error)
        errorMessage.value = 'Failed to sync winners with server.'
        setTimeout(() => { errorMessage.value = null }, 5000)
    }
}

// Lifecycle hooks
onMounted(async () => {
    pageTitle.value = ''
    
    try {
        isLoading.value = true
        
        // First fetch participants
        await fetchEventParticipants({
            offset: 999
        })
        
        // Then fetch doorprizes
        await fetchDoorprizes()
        
        // Load existing winners from localStorage
        loadWinnersFromLocalStorage()
        
        // If we have local winners data, sync with API
        if (localStorage.getItem(LOCAL_STORAGE.DOORPRIZE_WINNERS)) {
            await syncWinnersWithAPI()
        }
        
        setupFullscreenListeners()
        
        // Watch for changes to save to localStorage
        watch(() => doorprize.data, () => {
            saveWinnersToLocalStorage()
        }, { deep: true })
        
        // Handle online/offline status
        window.addEventListener('offline', () => {
            console.warn('Internet connection lost. Falling back to localStorage.')
            errorMessage.value = 'Internet connection lost. Data will be saved locally.'
            setTimeout(() => { errorMessage.value = null }, 5000)
        })
        
        window.addEventListener('online', async () => {
            console.log('Internet connection restored. Syncing with API...')
            successMessage.value = 'Internet connection restored. Syncing data...'
            await syncWinnersWithAPI()
        })
    } catch (error) {
        console.error('Error during initialization:', error)
        errorMessage.value = 'Failed to initialize doorprize drawing.'
        setTimeout(() => { errorMessage.value = null }, 5000)
    } finally {
        isLoading.value = false
    }
})

onUnmounted(() => {
    // Clean up event listeners
    document.removeEventListener('fullscreenchange', () => {})
    document.removeEventListener('webkitfullscreenchange', () => {})
    document.removeEventListener('mozfullscreenchange', () => {})
    document.removeEventListener('MSFullscreenChange', () => {})
    
    window.removeEventListener('online', () => {})
    window.removeEventListener('offline', () => {})
})

useHead({
    title: 'Eventhook - Doorprize',
})
</script>

<template>
    <div ref="drawingWrapperRef" class="drawing-wrapper" :class="{ 'is-fullscreen': isFullscreen }">
        <!-- Fullscreen toggle button -->
        <div class="fullscreen-button" @click="toggleFullscreen">
            <i class="fas" :class="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
        </div>

        <!-- Notifications -->
        <div class="notification-area">
            <div v-if="errorMessage" class="notification is-danger">
                <button class="delete" @click="errorMessage = null"></button>
                {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="notification is-success">
                <button class="delete" @click="successMessage = null"></button>
                {{ successMessage }}
            </div>
        </div>

        <!-- Loading overlay -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="loader"></div>
            <p>Loading...</p>
        </div>

        <!-- Main content -->
        <VCard radius="smooth" class="prize-display-area">
            <div class="prize-image" v-if="currentDoorprize">
                <img :src="currentDoorprize.photo" :alt="currentDoorprize.name" />
                <h2 class="prize-name">{{ currentDoorprize.name }}</h2>
                <p class="winners-count">
                    Winners: {{ currentDoorprize.participants?.length || 0 }} / {{ currentDoorprize.total_winner }}
                </p>
                <button v-if="currentDoorprize.participants?.length > 0" 
                        @click="openWinnersModal" 
                        class="see-winners-btn">
                    <i class="fas fa-trophy"></i> See All Winners
                </button>
            </div>

            <div class="winner-display">
                <RollingAnimation 
                    :participants="filteredParticipants" 
                    :current-doorprize="currentDoorprize"
                    @winner-selected="handleWinnerSelected" 
                    :is-all-winners-selected="isAllWinnersSelected"
                    @next-doorprize="nextDoorprize" 
                />
            </div>
        </VCard>
    </div>
    
    <!-- Winners Modal -->
    <div class="winners-modal-overlay" v-if="isWinnersModalOpen" @click="closeWinnersModal">
        <div class="winners-modal-content" @click.stop>
            <div class="winners-modal-header">
                <div class="modal-close" @click="closeWinnersModal">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            
            <div class="prize-showcase" v-if="currentDoorprize">
                <div class="prize-image-container">
                    <img :src="currentDoorprize.photo" :alt="currentDoorprize.name" />
                    <h3 class="prize-title">{{ currentDoorprize.name }}</h3>
                </div>
            </div>
            
            <div class="winners-container columns">
                <div class="winners-column column">
                    <div class="winner-item" v-for="(winner, index) in currentDoorprize?.participants?.slice(0, 5)" :key="winner.id">
                        <span class="winner-name">{{ winner.name }}</span>
                    </div>
                </div>
                
                <div class="winners-column column" v-if="currentDoorprize?.participants?.length > 5">
                    <div class="winner-item" v-for="(winner, index) in currentDoorprize?.participants?.slice(5, 10)" :key="winner.id">
                        <span class="winner-name">{{ winner.name }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '/@src/scss/custom/_luckydraw.scss'
</style>