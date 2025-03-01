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

// Control the speed of animation based on time elapsed
const getSpeedFactor = (elapsed: number) => {
    const normalizedTime = elapsed / SPIN_DURATION;
    
    if (forceStopTriggered.value) {
        // Start slowing down immediately when stop is triggered
        const remainingTime = Math.min(1.0, normalizedTime + 0.2); // Advance progress to simulate quick slowdown
        
        // Calculate a gradually decreasing speed
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
    
    // Normal speed curve without force stop
    if (normalizedTime < SLOWDOWN_POINT) {
        // Accelerate until reaching SLOWDOWN_POINT
        return INITIAL_SPEED + (MAX_SPEED - INITIAL_SPEED) * (normalizedTime / SLOWDOWN_POINT);
    } else {
        // Decelerate after SLOWDOWN_POINT
        const slowdownPhase = (normalizedTime - SLOWDOWN_POINT) / (1 - SLOWDOWN_POINT);
        return MAX_SPEED * (1 - Math.pow(slowdownPhase, 2));
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
        
        // Only suggest moving to next doorprize if we've reached max winners
        const currentWinners = props.currentDoorprize.participants ? 
                              props.currentDoorprize.participants.length : 0;
        const maxWinners = props.currentDoorprize.total_winner || 0;
        
        if (eliminate && currentWinners >= maxWinners) {
            // Ask if the user wants to move to the next doorprize
            if (confirm(`You've selected all ${maxWinners} winners for this doorprize. Move to the next doorprize?`)) {
                emit('next-doorprize');
            }
        }
        // Reset for next spin immediately if we haven't reached max winners
    }
};

const moveToNextDoorprize = () => {
    showWinnerModal.value = false;
    winnerDetails.value = null;
    emit('next-doorprize');
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
});

onUnmounted(() => {
    if (animationFrame.value) {
        cancelAnimationFrame(animationFrame.value);
    }
});
</script>

<template>
    <div class="spinner-container">
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
                <VButton 
                    color="primary" 
                    :disabled="isAllWinnersSelected || !currentDoorprize || participants.length === 0" 
                    @click="startSpin"
                >
                    {{ currentDoorprize?.participants.length ? 'Spin Next Winner' : 'Spin First Winner' }}
                </VButton>
                
                <VButton 
                    color="info" 
                    :disabled="!currentDoorprize || currentDoorprize.participants.length === 0" 
                    @click="moveToNextDoorprize"
                >
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
    <WinnerModal
        :is-open="showWinnerModal"
        :winner="winnerDetails"
        :doorprize="currentDoorprize"
        @close="showWinnerModal = false"
        @confirm-winner="handleWinnerDecision(true)"
        @eliminate="handleWinnerDecision(false)"
        @next-doorprize="moveToNextDoorprize"
    />
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