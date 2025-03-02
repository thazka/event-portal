<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

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

const SPIN_DURATION = 8000; // Total duration of spinning in ms
const INITIAL_SPEED = 30; // Starting speed (slower)
const MAX_SPEED = 300; // Maximum speed during spin
const SLOWDOWN_POINT = 0.6; // At what point to start slowing down (0.6 = 60% of duration)

const props = defineProps<{
    participants: Participant[]
    currentDoorprize: Doorprize | null
    isAllWinnersSelected: boolean
}>();

const emit = defineEmits<{
    (e: 'winner-selected', winner: Participant, eliminate: boolean): void
    (e: 'next-doorprize'): void
}>();

const containerRef = ref<HTMLElement | null>(null);
const selectedIndex = ref(0);
const animationFrame = ref<number | null>(null);
const listHeight = ref(0);
const itemHeight = ref(0);
const currentPosition = ref(0);
const startTime = ref(0);
const displayName = ref('');
const isSpinning = ref(false);
const showWinnerModal = ref(false);
const winnerDetails = ref<Participant | null>(null);
const forceStopTriggered = ref(false);
const elapsedBeforeStop = ref(0);
const spinAudio = ref<HTMLAudioElement | null>(null);
const winAudio = ref<HTMLAudioElement | null>(null);

const getSpeedFactor = (elapsed: number) => {
    const normalizedTime = elapsed / SPIN_DURATION;

    if (forceStopTriggered.value) {
        const remainingTime = Math.min(1.0, normalizedTime + 0.2); // Advance progress to simulate quick slowdown

        if (remainingTime > 0.95) {
            return 10; // Very slow at the end
        } else if (remainingTime > 0.9) {
            return 20;
        } else if (remainingTime > 0.8) {
            return 40;
        } else {
            return MAX_SPEED * (1 - Math.pow(remainingTime, 2)); // Gradually slow down
        }
    }

    if (normalizedTime < SLOWDOWN_POINT) {
        return INITIAL_SPEED + (MAX_SPEED - INITIAL_SPEED) * (normalizedTime / SLOWDOWN_POINT);
    } else {
        const slowdownPhase = (normalizedTime - SLOWDOWN_POINT) / (1 - SLOWDOWN_POINT);
        return MAX_SPEED * (1 - Math.pow(slowdownPhase, 2));
    }
};

const initSoundEffects = () => {
    spinAudio.value = new Audio('/sounds/spinning.mp3');
    winAudio.value = new Audio('/sounds/winner.mp3');

    // Configure audio settings
    if (spinAudio.value) {
        spinAudio.value.loop = true;
        spinAudio.value.volume = 0.7;
    }

    if (winAudio.value) {
        winAudio.value.loop = false;
        winAudio.value.volume = 1.0;
    }
};

// Play spin sound
const playSpinSound = () => {
    if (spinAudio.value) {
        spinAudio.value.currentTime = 0;
        spinAudio.value.play().catch(err => {
            console.warn('Audio playback was prevented by browser:', err);
        });
    }
};

// Stop spin sound
const stopSpinSound = () => {
    if (spinAudio.value && !spinAudio.value.paused) {
        spinAudio.value.pause();
        spinAudio.value.currentTime = 0;
    }
};

// Play win sound
const playWinSound = () => {
    if (winAudio.value) {
        winAudio.value.currentTime = 0;
        winAudio.value.play().catch(err => {
            console.warn('Audio playback was prevented by browser:', err);
        });
    }
};

// Animate the spinning effect
const animate = (timestamp: number) => {
    if (!startTime.value) {
        startTime.value = timestamp;
    }

    let elapsed = timestamp - startTime.value;

    // When force stopping, we add time to make it reach the end faster
    if (forceStopTriggered.value && elapsedBeforeStop.value === 0) {
        elapsedBeforeStop.value = elapsed;
    }

    // If force stopped, speed up the elapsed time to reach end faster
    if (forceStopTriggered.value) {
        const timeScale = 2.5; // Accelerate time
        const additionalTime = (elapsed - elapsedBeforeStop.value) * timeScale;
        elapsed = elapsedBeforeStop.value + additionalTime;
    }

    const speedFactor = getSpeedFactor(elapsed);

    // Calculate which participant is selected
    if (elapsed < SPIN_DURATION && props.participants.length > 0) {
        currentPosition.value = (currentPosition.value + speedFactor) % listHeight.value;

        selectedIndex.value = Math.floor(
            (listHeight.value - currentPosition.value) / itemHeight.value
        ) % props.participants.length;

        displayName.value = props.participants[selectedIndex.value].name;
        animationFrame.value = requestAnimationFrame(animate);
    } else {
        // Animation complete
        if (props.participants.length > 0) {
            const winner = props.participants[selectedIndex.value];
            displayName.value = winner.name;
            winnerDetails.value = winner;

            // Stop spinning sound and play winning sound
            stopSpinSound();
            playWinSound();

            showWinnerModal.value = true;
            isSpinning.value = false;
            forceStopTriggered.value = false;
            elapsedBeforeStop.value = 0;
        }
    }
};

// Setup dimensions of the spinner
const setupDimensions = () => {
    if (!containerRef.value || props.participants.length === 0) return;

    const item = containerRef.value.children[0] as HTMLElement;
    if (item) {
        itemHeight.value = item.offsetHeight;
        listHeight.value = itemHeight.value * props.participants.length;
    }
};

// Start the spinning animation
const startSpin = () => {
    if (isSpinning.value || !props.currentDoorprize) return;

    // Get the latest counts for accurate comparison
    const currentWinners = props.currentDoorprize.participants ?
        props.currentDoorprize.participants.length : 0;
    const maxWinners = props.currentDoorprize.total_winner || 0;

    // Check if doorprize can have more winners
    if (currentWinners >= maxWinners) {
        alert(`Maximum winners (${maxWinners}) reached for this doorprize.`);
        return;
    }

    // Check if there are eligible participants
    if (props.participants.length === 0) {
        alert('No eligible participants available.');
        return;
    }

    isSpinning.value = true;
    setupDimensions();
    startTime.value = 0;
    currentPosition.value = 0;
    forceStopTriggered.value = false;
    elapsedBeforeStop.value = 0;

    // Play the spinning sound
    playSpinSound();

    animationFrame.value = requestAnimationFrame(animate);
};

// Force stop the spinning animation
const forceStop = () => {
    if (isSpinning.value) {
        forceStopTriggered.value = true;
    }
};

// Handle winner selection - either eliminate or try again
const handleWinnerDecision = (eliminate: boolean) => {
    if (winnerDetails.value && props.currentDoorprize) {
        emit('winner-selected', winnerDetails.value, eliminate);

        // Close the modal
        showWinnerModal.value = false;
        winnerDetails.value = null;

        // Check if we've reached max winners for this doorprize
        if (props.currentDoorprize.participants) {
            const currentWinners = props.currentDoorprize.participants.length + (eliminate ? 1 : 0);
            const maxWinners = props.currentDoorprize.total_winner || 0;

            if (eliminate && currentWinners >= maxWinners) {
                // Ask if the user wants to move to the next doorprize
                if (confirm(`You've selected all ${maxWinners} winners for this doorprize. Move to the next doorprize?`)) {
                    emit('next-doorprize');
                }
            }
        }
    }
};

const moveToNextDoorprize = () => {
    showWinnerModal.value = false;
    winnerDetails.value = null;
    emit('next-doorprize');
};

// Get the remaining winners count
const getRemainingWinners = () => {
    if (!props.currentDoorprize) return 0;

    const currentWinners = props.currentDoorprize.participants ?
        props.currentDoorprize.participants.length : 0;
    const maxWinners = props.currentDoorprize.total_winner || 0;

    return Math.max(0, maxWinners - currentWinners);
};

// Update display when props change
watch(() => props.currentDoorprize, () => {
    if (props.participants.length > 0) {
        displayName.value = props.participants[0].name;
    } else {
        displayName.value = 'No eligible participants';
    }
}, { immediate: true });

// Watch for changes in participants
watch(() => props.participants, () => {
    setupDimensions();

    if (props.participants.length > 0) {
        displayName.value = props.participants[0].name;
    } else {
        displayName.value = 'No eligible participants';
    }
}, { immediate: true });

onMounted(() => {
    setupDimensions();
    initSoundEffects();
});

onUnmounted(() => {
    if (animationFrame.value) {
        cancelAnimationFrame(animationFrame.value);
    }
    stopSpinSound();
});
</script>

<template>
    <div class="spinner-container">
        <!-- Winner count display -->
        <!-- <div class="winner-count-display" v-if="currentDoorprize">
            <div class="winner-count-badge">
                <span class="current">{{ currentDoorprize.participants ? currentDoorprize.participants.length : 0
                    }}</span>
                <span class="divider">/</span>
                <span class="total">{{ currentDoorprize.total_winner }}</span>
            </div>
            <div class="winner-count-label">Winners Selected</div>
        </div> -->

        <!-- The spinning display window -->
        <div class="spinner-window">
            <!-- Static display when not spinning -->
            <div class="display-name" v-if="!isSpinning">
                {{ displayName }}
            </div>

            <!-- Animated content when spinning -->
            <div ref="containerRef" class="spinner-content" :class="{ 'is-spinning': isSpinning }" :style="{
                transform: `translateY(${-currentPosition}px)`,
                transition: !isSpinning ? 'transform 0.5s ease-out' : 'none'
            }">
                <div v-for="participant in participants" :key="participant.id" class="spinner-item">
                    {{ participant.name }}
                </div>
            </div>

            <!-- Visual highlight for the current selection -->
            <div class="spinner-highlight" v-if="isSpinning"></div>
        </div>

        <!-- Action buttons -->
        <div class="action-buttons mt-5">
            <template v-if="!isSpinning">
                <VButton color="primary"
                    :disabled="isAllWinnersSelected || !currentDoorprize || participants.length === 0"
                    @click="startSpin">
                    <span v-if="!currentDoorprize?.participants || currentDoorprize.participants.length === 0">Spin
                        First Winner</span>
                    <span v-else-if="getRemainingWinners() > 0">
                        Spin Next Winner ({{ getRemainingWinners() }} remaining)
                    </span>
                    <span v-else>All Winners Selected</span>
                </VButton>

                <VButton color="info"
                    :disabled="!currentDoorprize || (!currentDoorprize.participants || currentDoorprize.participants.length === 0)"
                    @click="moveToNextDoorprize">
                    Next Doorprize
                </VButton>
            </template>

            <template v-else>
                <VButton color="danger" @click="forceStop">
                    Stop
                </VButton>
            </template>
        </div>
    </div>

    <!-- Winner Modal using separate component -->
    <WinnerModal :is-open="showWinnerModal" :winner="winnerDetails" :doorprize="currentDoorprize"
        @close="showWinnerModal = false" @confirm-winner="handleWinnerDecision(true)"
        @eliminate="handleWinnerDecision(false)" @next-doorprize="moveToNextDoorprize" />
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

.winner-count-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;

    .winner-count-badge {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 1.2rem;
        display: flex;

        .current {
            font-size: 1.5rem;
        }

        .divider {
            margin: 0 4px;
            opacity: 0.7;
            font-size: 20px;
        }

        .total {
            font-size: 1.5rem;
        }
    }

    .winner-count-label {
        font-size: 0.9rem;
        color: #666;
        margin-top: 5px;
    }
}

.action-buttons {
    display: flex;
    justify-content: center;
    padding: 20px;
    gap: 1rem;
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
    left: 0;
    right: 0;
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
    z-index: 2;
}
</style>