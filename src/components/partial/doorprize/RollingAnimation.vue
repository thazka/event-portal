<script setup lang="ts">
interface Participant {
    id: number
    name: string
    selected?: boolean
}

const SPIN_DURATION = 5000
const INITIAL_SPEED = 30
const FINAL_SPEED = 300

const props = defineProps<{
    participants: Participant[]
    currentDoorprize: {
        id: number
        name: string
        maxWinners: number
        image: string
        winners: Participant[]
    } | null
}>()

const emit = defineEmits<{
    (e: 'winner-selected', winner: Participant): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const selectedIndex = ref(0)
const animationFrame = ref<number | null>(null)
const listHeight = ref(0)
const itemHeight = ref(0)
const currentPosition = ref(0)
const startTime = ref(0)
const displayName = ref('')
const isSpinning = ref(false)
const showWinnerModal = ref(false)
const winnerDetails = ref<Participant | null>(null)

const updateInitialDisplay = () => {
    if (props.participants.length > 0) {
        displayName.value = props.participants[0].name
    } else {
        displayName.value = 'No eligible participants'
    }
}

const setupDimensions = () => {
    if (!containerRef.value) return
    const item = containerRef.value.children[0] as HTMLElement
    if (item) {
        itemHeight.value = item.offsetHeight
        listHeight.value = itemHeight.value * props.participants.length
    }
}

const getSpeedFactor = (elapsed: number) => {
    return Math.max(
        FINAL_SPEED,
        INITIAL_SPEED + (FINAL_SPEED - INITIAL_SPEED) * (elapsed / SPIN_DURATION)
    )
}

const animate = (timestamp: number) => {
    if (!startTime.value) {
        startTime.value = timestamp
    }

    const elapsed = timestamp - startTime.value

    if (elapsed < SPIN_DURATION && props.participants.length > 0) {
        const speedFactor = getSpeedFactor(elapsed)
        currentPosition.value = (currentPosition.value + speedFactor) % listHeight.value

        selectedIndex.value = Math.floor(
            (listHeight.value - currentPosition.value) / itemHeight.value
        ) % props.participants.length

        displayName.value = props.participants[selectedIndex.value].name
        animationFrame.value = requestAnimationFrame(animate)
    } else {
        if (props.participants.length > 0) {
            const winner = props.participants[selectedIndex.value]
            displayName.value = winner.name
            winnerDetails.value = winner
            showWinnerModal.value = true
            emit('winner-selected', winner)
            isSpinning.value = false
        }
    }
}

const startSpin = async () => {
    if (isSpinning.value || !props.currentDoorprize) return

    // Check if doorprize can have more winners
    if (props.currentDoorprize.winners.length >= props.currentDoorprize.maxWinners) {
        alert('Maximum winners reached for this doorprize.')
        return
    }

    // Check if there are eligible participants
    if (props.participants.length === 0) {
        alert('No eligible participants available.')
        return
    }

    isSpinning.value = true
    setupDimensions()
    startTime.value = 0
    currentPosition.value = 0
    animationFrame.value = requestAnimationFrame(animate)
}

// Watch for changes in props
watch(() => props.currentDoorprize, () => {
    updateInitialDisplay()
}, { immediate: true })

watch(() => props.participants, () => {
    updateInitialDisplay()
    setupDimensions()
}, { immediate: true })

onMounted(() => {
    setupDimensions()
    updateInitialDisplay()
})

onUnmounted(() => {
    if (animationFrame.value) {
        cancelAnimationFrame(animationFrame.value)
    }
})
const handleCloseModal = () => {
    showWinnerModal.value = false
    winnerDetails.value = null
}
</script>

<template>
    <div class="spinner-container">
        <div class="spinner-window">
            <div class="display-name">
                {{ displayName }}
            </div>
            <div ref="containerRef" class="spinner-content" :class="{ 'is-spinning': isSpinning }" :style="{
                transform: `translateY(${-currentPosition}px)`,
                transition: !isSpinning ? 'transform 0.5s ease-out' : 'none'
            }">
                <div v-for="participant in participants" :key="participant.id" class="spinner-item">
                    {{ participant.name }}
                </div>
            </div>
        </div>
    </div>
    <div class="action-buttons mt-5">
        <VButton color="primary" :loading="isSpinning" :disabled="isSpinning || !currentDoorprize" @click="startSpin">
            Spin Now
        </VButton>
    </div>

    <WinnerModal :is-open="showWinnerModal" :winner="winnerDetails" :doorprize="currentDoorprize"
        @close="handleCloseModal" />
</template>

<style lang="scss" scoped>
.spinner-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

}

.action-buttons {
    display: flex;
    justify-content: center;
    padding: 20px;
    gap: 1rem;
}

.doorprize-name {
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
}

.spinner-window {
    height: 80px;
    overflow: hidden;
    position: relative;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f8f8;
}

.display-name {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    z-index: 1;
    opacity: 1;
    transition: opacity 0.3s;

    .is-spinning & {
        opacity: 0;
    }
}

.spinner-content {
    position: absolute;
    width: 100%;
    will-change: transform;
    opacity: 0;

    &.is-spinning {
        opacity: 1;
    }
}

.spinner-item {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 600;
    padding: 0 20px;
    text-align: center;
    color: #333;
    background: white;
}

.spinner-highlight {
    position: absolute;
    top: 50%;
    left: 20px;
    right: 20px;
    height: 80px;
    transform: translateY(-50%);
    background: linear-gradient(180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 40%,
            rgba(255, 255, 255, 0.3) 60%,
            rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
    border-top: 2px solid #ffd700;
    border-bottom: 2px solid #ffd700;
    border-radius: 4px;
}
</style>