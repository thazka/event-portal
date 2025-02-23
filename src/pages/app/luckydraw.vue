<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Participant {
    id: number
    name: string
    selected?: boolean
}

interface Doorprize {
    id: number
    name: string
    image: string
    description: string
    /** Jumlah pemenang maksimal untuk doorprize ini */
    maxWinners: number
    /** Daftar pemenang (siapa saja) */
    winners: Participant[]
}

const pageTitle = useVueroContext<string>('page-title')

/**
 * Apakah peserta yang sudah pernah menang doorprize boleh menang lagi?
 * Terkait switch "Multiple Doorprizes per Winner"
 */
const multipleDoorprizesPerWinner = ref(false)

const searchParticipants = ref('')
const isSpinning = ref(false)
const selectedWinner = ref<Participant | null>(null)
const currentDoorprize = ref<Doorprize | null>(null)

const participants = ref<Participant[]>([
    { id: 1, name: 'Basuki Abdullah' },
    { id: 2, name: 'Sulistyo Budi' },
    { id: 3, name: 'Muhammad Muslim' },
    { id: 4, name: 'Paulus Jeharu' },
    { id: 5, name: 'Dhoddy Cahya' },
    { id: 6, name: 'Dewa Gede Adhiyaksa' },
    { id: 7, name: 'Muhammad Sulton' },
    { id: 8, name: 'Viola Salvadora' },
    { id: 9, name: 'I Wayan Ferry' },
    { id: 10, name: 'Adam Mahyudi' },
    { id: 11, name: 'Vinsensiana Aprilia Nanda' },
    { id: 12, name: 'Anggi Susanto' },
    { id: 13, name: 'Muhammad Nur Hidayat' },
    { id: 14, name: 'Muhammad Satrio Nugroho' },
    { id: 15, name: 'Faqih Fansuri' },
    { id: 16, name: 'Rina Kusumawati' },
    { id: 17, name: 'Budi Santoso' },
    { id: 18, name: 'Sri Wahyuni' },
    { id: 19, name: 'Hendro Wicaksono' },
    { id: 20, name: 'Diana Puspita' }
])

const doorprizes = ref<Doorprize[]>([
    {
        id: 1,
        name: 'Honda Civic Turbo',
        image: '/images/doorprize/civic.svg',
        description: 'Brand new Honda Civic Turbo',
        maxWinners: 1,
        winners: []
    },
    {
        id: 2,
        name: 'Honda Brio RS',
        image: '/images/doorprize/brio.svg',
        description: 'Brand new Honda Brio RS',
        maxWinners: 1,
        winners: []
    },
    {
        id: 3,
        name: 'New Yamaha R25',
        image: '/images/doorprize/r25.svg',
        description: 'Brand new Yamaha R25',
        maxWinners: 1,
        winners: []
    },
    {
        id: 4,
        name: 'Honda Vario 150',
        image: '/images/doorprize/vario.svg',
        description: 'Brand new Honda Vario 150',
        maxWinners: 1,
        winners: []
    },
    {
        id: 5,
        name: 'Uang Tunai Rp5.000.000',
        image: '/images/doorprize/money.svg',
        description: 'Cash prize Rp5.000.000',
        maxWinners: 5,
        winners: []
    },
])

/**
 * Filter participants:
 * - Bila multipleDoorprizesPerWinner = false, maka peserta yang sudah menang (selected) tidak ditampilkan lagi.
 * - Bila ada search, maka disaring sesuai keyword.
 */
 const filteredParticipants = computed(() => {
    let list = participants.value

    if (!multipleDoorprizesPerWinner.value) {
        list = list.filter((p) => !p.selected)
    }

    if (searchParticipants.value) {
        list = list.filter((participant) =>
            participant.name.toLowerCase().includes(searchParticipants.value.toLowerCase())
        )
    }
    return list
})

const spinDuration = 5000 // Lama putar (ms)
const spinSpeed = 50 // Kecepatan animasi putar (ms)

const startSpin = async () => {
    if (isSpinning.value || !currentDoorprize.value) return

    // Cek apakah doorprize ini masih boleh punya pemenang (belum mencapai maxWinners)
    if (currentDoorprize.value.winners.length >= currentDoorprize.value.maxWinners) {
        alert('Pemenang untuk doorprize ini sudah penuh.')
        return
    }

    isSpinning.value = true
    selectedWinner.value = null

    // Kumpulkan peserta yang masih eligible (sesuai filter)
    const eligibleParticipants = filteredParticipants.value
    if (eligibleParticipants.length === 0) {
        // Tidak ada yang bisa dipilih
        isSpinning.value = false
        return
    }

    // Spin cepat
    const startTime = Date.now()
    while (Date.now() - startTime < spinDuration) {
        const randomIndex = Math.floor(Math.random() * eligibleParticipants.length)
        selectedWinner.value = eligibleParticipants[randomIndex]
        await new Promise((resolve) => setTimeout(resolve, spinSpeed))
    }

    // Slow-down effect (opsional)
    for (let i = 0; i < 10; i++) {
        selectedWinner.value = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)]
        await new Promise((resolve) => setTimeout(resolve, 200 + i * 100))
    }

    // Pilih final winner
    const finalIndex = Math.floor(Math.random() * eligibleParticipants.length)
    const winner = eligibleParticipants[finalIndex]

    selectedWinner.value = winner

    isSpinning.value = false
}

const selectDoorprize = (doorprize: Doorprize) => {
    if (isSpinning.value) return
    currentDoorprize.value = doorprize
    selectedWinner.value = null
}

const nextDoorprize = () => {
    if (!currentDoorprize.value) return
    const currentIndex = doorprizes.value.findIndex(d => d.id === currentDoorprize.value?.id)
    if (currentIndex < doorprizes.value.length - 1) {
        currentDoorprize.value = doorprizes.value[currentIndex + 1]
        selectedWinner.value = null
    }
}

const handleWinnerSelected = (winner: Participant) => {
    console.log(winner)
    const idx = participants.value.findIndex(p => p.id === winner.id)
    if (idx !== -1) {
        participants.value[idx].selected = true
    }
    currentDoorprize.value?.winners.push(winner)
    isSpinning.value = false
}

onMounted(() => {
    pageTitle.value = ''
})

useHead({
    title: 'Eventhook - Doorprize',
})
</script>

<template>
    <div class="drawing-wrapper">
        <!-- Side kiri: Daftar Peserta -->
        <VCard radius="smooth" class="participants-area">
            <div class="card-head">
                <!-- Switch multiple doorprizes -->
                <VField class="mb-0">
                    <VControl>
                        <VSwitchBlock color="primary" label="Multiple Doorprizes per Winner"
                            v-model="multipleDoorprizesPerWinner" />
                    </VControl>
                </VField>

                <VButton icon="material-symbols:volume-up">Mute</VButton>
            </div>

            <!-- Search box -->
            <VField class="my-2">
                <VControl>
                    <VInput v-model="searchParticipants" type="text" placeholder="Search" />
                </VControl>
            </VField>

            <div class="card-body">
                <div class="participant-header">
                    <span class="participant-number">No</span>
                    <span class="participant-name">Participant's Name</span>
                </div>
                <div class="participants-list">
                    <div v-for="(participant, index) in filteredParticipants" :key="participant.id"
                        class="participant-item" :class="{ 'is-selected': participant.selected }">
                        <span class="participant-number">{{ index + 1 }}</span>
                        <span class="participant-name">{{ participant.name }}</span>
                    </div>
                </div>
            </div>
        </VCard>

        <!-- Tengah: Display Doorprize + Winner -->
        <VCard radius="smooth" class="prize-display-area">
            <div class="prize-image" v-if="currentDoorprize">
                <img :src="currentDoorprize.image" :alt="currentDoorprize.name" />
                <h2 class="prize-name">{{ currentDoorprize.name }}</h2>
            </div>

            <!-- Area animasi/spinning -->
            <div class="winner-display" :class="{ 'is-spinning': isSpinning }">
                <RollingAnimation :participants="filteredParticipants" :is-spinning="isSpinning"
                    :current-doorprize="currentDoorprize" @winner-selected="handleWinnerSelected" />
            </div>

            <div class="action-buttons mt-5">
                <VButton color="primary" :loading="isSpinning" :disabled="isSpinning || !currentDoorprize"
                    @click="startSpin">
                    Spin Now
                </VButton>

                <VButton v-if="selectedWinner" color="info" @click="nextDoorprize">
                    Next Doorprize
                </VButton>
            </div>
        </VCard>

        <!-- Side kanan: List Doorprize -->
        <VCard radius="smooth" class="doorprize-area">
            <h3 class="title is-5 mb-2">Available Prizes</h3>
            <div class="doorprize-list">
                <div v-for="prize in doorprizes" :key="prize.id" class="doorprize-item"
                    :class="{ 'is-active': currentDoorprize?.id === prize.id }" @click="selectDoorprize(prize)">
                    <img :src="prize.image" :alt="prize.name" />
                    <div class="prize-info">
                        <h4>{{ prize.name }}</h4>
                        <!-- Contoh menampilkan jumlah pemenang -->
                        <p v-if="prize.winners.length === 0">No Winners Yet</p>
                        <p v-else>
                            {{ prize.winners.length }} Winner(s):
                            <!-- tampilkan nama pemenang, contoh singkat -->
                            <span v-for="(w, i) in prize.winners" :key="w.id">
                                {{ w.name }}<span v-if="i < prize.winners.length - 1">, </span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </VCard>
    </div>
</template>

<style lang="scss" scoped>
.drawing-wrapper {
    display: flex;
    justify-content: space-between;
    background: url('/images/doorprize/bg-doorprize.svg');
    height: 90vh;
    padding: 40px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;

    .participants-area {
        max-width: 400px;

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
                max-width: 300px;
                height: auto;
            }

            .prize-name {
                font-size: 1.5rem;
                margin-top: 1rem;
            }
        }

        .winner-display {
            width: 100%;

            &.is-spinning {
                animation: pulse 0.5s infinite;
            }
        }

        .action-buttons {
            display: flex;
            gap: 1rem;
        }
    }

    .doorprize-area {
        max-width: 262px;

        .doorprize-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            overflow: scroll;
            max-height: calc(90vh - 150px);

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
                flex-direction: column;
                justify-content: center;
                text-align: center;
                padding: 0.5rem;
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

                img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    margin-right: 1rem;
                }

                .prize-info {
                    h4 {
                        margin: 0;
                        font-size: 1rem;
                    }

                    p {
                        margin: 0;
                        font-size: 0.875rem;
                        color: #666;
                    }
                }
            }
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
</style>
