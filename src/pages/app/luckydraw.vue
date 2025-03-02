<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { fetchDoorprize } from '/@src/composables/event/useDoorprize'
import { useDoorprize } from '/@src/stores/event/doorprize'
import { useParticipants } from '/@src/stores/event/participants'
import { fetchEventParticipants } from '/@src/composables/event/useParticipants'

interface Participant {
    id: number
    name: string
    selected?: boolean
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

const pageTitle = useVueroContext<string>('page-title')

const { participants } = useParticipants()
const { doorprize } = useDoorprize()

const searchParticipants = ref('')
const multipleDoorprizesPerWinner = ref(false)
const currentDoorprize = ref<Doorprize | null>(null)
const isFullscreen = ref(false)
const drawingWrapperRef = ref<HTMLElement | null>(null)

// Fetch doorprizes from API
const fetchDoorprizes = async () => {
    try {
        await fetchDoorprize({
            offset: 999
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

        if (doorprize.data.length > 0 && !currentDoorprize.value) {
            currentDoorprize.value = doorprize.data[0]
        }
    } catch (error) {
        console.error('Error fetching doorprizes:', error)
    }
}

const filteredParticipants = computed(() => {
    let list = participants.data

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

const isAllWinnersSelected = computed(() => {
    if (!currentDoorprize.value) return false;
    const currentWinners = currentDoorprize.value.participants ?
        currentDoorprize.value.participants.length : 0;
    const maxWinners = currentDoorprize.value.total_winner || 0;
    return currentWinners >= maxWinners;
});

const selectDoorprize = (doorprize: Doorprize) => {
    currentDoorprize.value = doorprize
}

const nextDoorprize = () => {
    if (!currentDoorprize.value) return
    const currentIndex = doorprize.data.findIndex(d => d.id === currentDoorprize.value?.id)
    if (currentIndex < doorprize.data.length - 1) {
        currentDoorprize.value = doorprize.data[currentIndex + 1]
    } else if (doorprize.data.length > 0) {
        // Loop back to the first doorprize
        currentDoorprize.value = doorprize.data[0]
    }
}

const handleWinnerSelected = (winner: Participant, shouldEliminate: boolean = true) => {
    if (!currentDoorprize.value) return

    if (shouldEliminate) {
        // Mark participant as selected in main list if we're eliminating them
        if (!multipleDoorprizesPerWinner.value) {
            const participantIndex = participants.data.findIndex(p => p.id === winner.id)
            if (participantIndex !== -1) {
                participants.data[participantIndex].selected = true
            }
        }

        // Make sure participants array exists before pushing
        if (!currentDoorprize.value.participants) {
            currentDoorprize.value.participants = [];
        }

        // Add winner to the doorprize participants list
        currentDoorprize.value.participants.push({ ...winner });
    }
}

const toggleFullscreen = () => {
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

const getRemainingWinners = (prize: Doorprize) => {
    const currentWinners = prize.participants ? prize.participants.length : 0;
    const maxWinners = prize.total_winner || 0;
    return Math.max(0, maxWinners - currentWinners);
}

onMounted(() => {
    pageTitle.value = ''
    fetchDoorprizes()
    fetchEventParticipants({
        offset: 999
    })

    setupFullscreenListeners()
})

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', () => { })
    document.removeEventListener('webkitfullscreenchange', () => { })
    document.removeEventListener('mozfullscreenchange', () => { })
    document.removeEventListener('MSFullscreenChange', () => { })
    document.removeEventListener('keydown', () => { })
})

useHead({
    title: 'Eventhook - Doorprize',
})
</script>

<template>
    <div ref="drawingWrapperRef" class="drawing-wrapper">
        <div class="fullscreen-button" @click="toggleFullscreen">
            <i class="fas" :class="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
        </div>

        <VCard radius="smooth" class="prize-display-area">
            <div class="prize-image" v-if="currentDoorprize">
                <img :src="currentDoorprize.photo" :alt="currentDoorprize.name" />
                <h2 class="prize-name">{{ currentDoorprize.name }}</h2>
                <p class="winners-count">
                    Winners: {{ currentDoorprize.participants.length }} / {{ currentDoorprize.total_winner }}
                </p>
            </div>

            <div class="winner-display">
                <RollingAnimation :participants="filteredParticipants" :current-doorprize="currentDoorprize"
                    @winner-selected="handleWinnerSelected" :is-all-winners-selected="isAllWinnersSelected"
                    @next-doorprize="nextDoorprize" />
            </div>
        </VCard>
    </div>
</template>

<style lang="scss" scoped>
.drawing-wrapper {
    display: flex;
    justify-content: space-between;
    background: url('/images/doorprize/doorprize-bg.jpg');
    height: 90vh;
    padding: 40px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    &.is-fullscreen {
        height: 100vh;
        padding: 20px;
    }

    .participants-area {
        max-width: 400px;
        width: 25%;

        .card-body {
            border: 1px solid #e8e8e8;
            border-radius: 8px;

            .participant-header {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                border-bottom: 1px solid #eee;
                font-weight: 600;

                .participant-number {
                    min-width: 30px;
                    margin-right: 12px;
                }

                .participant-name {
                    flex-grow: 1;
                }
            }

            .participants-list {
                max-height: calc(90vh - 270px);
                overflow-y: auto;

                .participant-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    border-bottom: 1px solid #eee;

                    &.is-selected {
                        background-color: #f5f5f5;
                        opacity: 0.7;
                    }

                    &:last-child {
                        border-bottom: none;
                    }

                    .participant-number {
                        min-width: 30px;
                        margin-right: 12px;
                        color: #666;
                    }

                    .participant-name {
                        flex-grow: 1;
                    }
                }

                .empty-participants {
                    padding: 30px 20px;
                    text-align: center;
                    color: #666;

                    p {
                        margin: 0;

                        &.hint {
                            font-size: 0.85rem;
                            color: #999;
                            margin-top: 8px;
                        }
                    }
                }
            }
        }
    }

    .prize-display-area {
        background: transparent;
        border: none;
        flex: 1;
        margin: 0 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .prize-image {
            text-align: center;
            margin-bottom: 2rem;

            img {
                max-width: 250px;
                height: auto;
                object-fit: contain;
            }

            .prize-name {
                font-size: 3rem;
                margin-top: 0;
                margin-bottom: 0.5rem;
            }

            .winners-count {
                font-size: 1rem;
                color: #666;
            }
        }

        .winner-display {
            width: 100%;
            text-align: center;

            &.is-spinning {
                animation: pulse 0.5s infinite;
            }
        }
    }

    .doorprize-area {
        max-width: 300px;
        width: 25%;

        .doorprize-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            overflow-y: auto;
            max-height: calc(90vh - 180px);

            &::-webkit-scrollbar {
                height: 0px;
                width: 0;
            }

            &::-webkit-scrollbar-thumb {
                border-radius: 10px;
                background: #ddd;
            }

            &::-webkit-scrollbar-thumb:hover {
                background: #999;
            }

            .doorprize-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem;
                border: 1px solid #eee;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    background-color: #f9f9f9;
                }

                &.is-active {
                    border-color: var(--primary);
                    background-color: var(--primary-light);
                }

                &.is-complete {
                    border-color: #10b981;
                    background-color: rgba(16, 185, 129, 0.1);
                }

                img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 6px;
                }

                .prize-info {
                    flex: 1;

                    h4 {
                        margin: 0;
                        font-size: 1rem;
                        font-weight: 600;
                    }

                    .winner-progress {
                        display: flex;
                        align-items: center;
                        margin: 5px 0;

                        .progress-badge {
                            display: inline-block;
                            background-color: #f3f4f6;
                            color: #4b5563;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 0.75rem;
                            font-weight: 600;

                            &.has-winners {
                                background-color: #3b82f6;
                                color: white;
                            }

                            &.is-complete {
                                background-color: #10b981;
                                color: white;
                            }
                        }

                        .progress-text {
                            margin-left: 8px;
                            font-size: 0.75rem;
                            color: #6b7280;
                        }
                    }

                    .winners-list {
                        font-size: 0.75rem;
                        color: #888;
                        margin-top: 0.25rem;
                        max-height: 60px;
                        overflow-y: auto;
                        word-break: break-word;
                    }
                }
            }
        }
    }


    .fullscreen-button {
        position: absolute;
        top: 90px;
        right: 20px;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 100;
        transition: all 0.3s ease;

        &:hover {
            background-color: rgba(255, 255, 255, 0.9);
            transform: scale(1.1);
        }

        i {
            font-size: 1.2rem;
            color: #333;
        }
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.02);
    }

    100% {
        transform: scale(1);
    }
}

@media (max-width: 1200px) {
    .drawing-wrapper {
        flex-direction: column;
        height: auto;
        gap: 20px;

        .participants-area,
        .doorprize-area {
            width: 100%;
            max-width: 100%;
        }

        .prize-display-area {
            margin: 20px 0;
        }
    }
}
</style>