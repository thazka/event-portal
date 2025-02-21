<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import confetti from 'canvas-confetti'

interface Participant {
    id: number
    name: string
}

interface DoorPrize {
    id: number
    name: string
    isAwarded: boolean
}

interface Winner {
    participant: Participant
    prize: DoorPrize
    timestamp: Date
}

const participants = ref<Participant[]>([])
const doorPrizes = ref<DoorPrize[]>([
    { id: 1, name: 'TV LED', isAwarded: false },
    { id: 2, name: 'Smartphone', isAwarded: false },
    { id: 3, name: 'Laptop', isAwarded: false },
])
const winners = ref<Winner[]>([])
const isSpinning = ref(false)
const selectedParticipant = ref<Participant | null>(null)
const spinInterval = ref<number | null | any>(null)
const showWinnerModal = ref(false)
const currentWinner = ref<Winner | null>(null)

const availablePrizes = computed(() => {
    return doorPrizes.value.filter(prize => !prize.isAwarded)
})

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return

    const file = target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheet = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheet]

        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        participants.value = jsonData.map((row: any, index) => ({
            id: index + 1,
            name: row.name || row.Name || ''
        }))
    }

    reader.readAsBinaryString(file)
}

const startSpin = () => {
    if (isSpinning.value || participants.value.length === 0 || availablePrizes.value.length === 0) return

    isSpinning.value = true
    showWinnerModal.value = false

    spinInterval.value = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * participants.value.length)
        selectedParticipant.value = participants.value[randomIndex]
    }, 100)

    const duration = 3000 + Math.random() * 2000
    setTimeout(stopSpin, duration)
}

const stopSpin = () => {
    if (spinInterval.value) {
        clearInterval(spinInterval.value)
    }
    isSpinning.value = false

    if (selectedParticipant.value && availablePrizes.value.length > 0) {
        const prize = availablePrizes.value[0]
        prize.isAwarded = true

        const winner = {
            participant: selectedParticipant.value,
            prize,
            timestamp: new Date()
        }

        winners.value.push(winner)
        currentWinner.value = winner
        showWinnerModal.value = true

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
    }
}

const closeModal = () => {
    showWinnerModal.value = false
    currentWinner.value = null
}
</script>

<template>
    <div class="section">
        <div class="container">
            <div class="box mb-6">
                <h2 class="title is-4">Upload Participant List</h2>
                <div class="file has-name is-fullwidth">
                    <label class="file-label">
                        <input class="file-input" type="file" accept=".xlsx,.xls" @change="handleFileUpload">
                        <span class="file-cta">
                            <span class="file-icon">
                                <i class="fas fa-upload"></i>
                            </span>
                            <span class="file-label">
                                Choose a file...
                            </span>
                        </span>
                    </label>
                </div>
                <p class="help">Upload Excel file (.xlsx, .xls)</p>
                <p v-if="participants.length" class="mt-3 has-text-success">
                    ✓ {{ participants.length }} participants loaded
                </p>
            </div>

            <div class="box has-text-centered mb-6">
                <h2 class="title is-4">Lucky Draw</h2>

                <div class="notification is-light mb-5">
                    <p class="title is-3" :class="{ 'is-spinning': isSpinning }">
                        {{ selectedParticipant?.name || 'Ready to Start!' }}
                    </p>
                </div>

                <button class="button is-primary is-large" :class="{ 'is-loading': isSpinning }" @click="startSpin"
                    :disabled="isSpinning || participants.length === 0 || availablePrizes.length === 0">
                    {{ isSpinning ? 'Drawing...' : 'Start Draw' }}
                </button>
            </div>

            <div class="columns">
                <div class="column is-half">
                    <div class="box">
                        <h2 class="title is-4">Available Prizes</h2>
                        <div class="content">
                            <div v-for="prize in availablePrizes" :key="prize.id"
                                class="notification is-info is-light mb-3">
                                {{ prize.name }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="column is-half">
                    <div class="box">
                        <h2 class="title is-4">Winners</h2>
                        <div class="content">
                            <div v-for="winner in winners" :key="winner.participant.id"
                                class="notification is-success is-light mb-3">
                                <p class="has-text-weight-bold">{{ winner.participant.name }}</p>
                                <p>Won: {{ winner.prize.name }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal" :class="{ 'is-active': showWinnerModal }">
            <div class="modal-background" @click="closeModal"></div>
            <div class="modal-content">
                <div class="box has-text-centered winner-popup">
                    <p class="title is-2 mb-6">🎉</p>
                    <p class="title is-3 has-text-primary mb-4">
                        {{ currentWinner?.participant.name }}
                    </p>
                    <p class="subtitle is-4 mb-4">won</p>
                    <p class="title is-3 has-text-info">
                        {{ currentWinner?.prize.name }}
                    </p>
                </div>
            </div>
            <button class="modal-close is-large" aria-label="close" @click="closeModal"></button>
        </div>
    </div>
</template>

<style lang="scss">
@import 'bulma/sass/utilities/initial-variables';
@import 'bulma/sass/utilities/functions';

$primary: #485fc7;
$info: #3e8ed0;
$success: #48c78e;

@import 'bulma/bulma';

.is-spinning {
    animation: spin 0.1s linear infinite;
}

@keyframes spin {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

.winner-popup {
    animation: popIn 0.3s ease-out;
}

@keyframes popIn {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.notification {
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
    }
}
</style>