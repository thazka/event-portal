<script setup lang="ts">
import { ref, computed } from 'vue'

interface SeatData {
    name: string
    email: string
    phone: string
    notes: string
}

interface SeatsMap {
    [key: number]: SeatData
}

// State
const isModalOpen = ref(false)
const isTooltipVisible = ref(false)
const selectedSeat = ref<number | null>(null)
const seats = ref<SeatsMap>({})

// Form data
const formData = ref<SeatData>({
    name: '',
    email: '',
    phone: '',
    notes: ''
})

// Methods
const getSeatNumber = (row: number, col: number): number => {
    return row * 10 + col + 1
}

const isSeatOccupied = (seatNumber: number): boolean => {
    return !!seats.value[seatNumber]
}

const showTooltip = (seatNumber: number) => {
    selectedSeat.value = seatNumber
    isTooltipVisible.value = true
}

const hideTooltip = () => {
    isTooltipVisible.value = false
}

const openSeatModal = (seatNumber: number) => {
    selectedSeat.value = seatNumber
    if (isSeatOccupied(seatNumber)) {
        formData.value = { ...seats.value[seatNumber] }
    } else {
        resetForm()
    }
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
    selectedSeat.value = null
    resetForm()
}

const resetForm = () => {
    formData.value = {
        name: '',
        email: '',
        phone: '',
        notes: ''
    }
}

const saveSeatData = () => {
    if (selectedSeat.value) {
        seats.value[selectedSeat.value] = { ...formData.value }
        closeModal()
    }
}

const clearSeat = () => {
    if (selectedSeat.value) {
        delete seats.value[selectedSeat.value]
        closeModal()
    }
}
</script>

<template>
    <div class="container">
        <div class="seating-layout">
            <div class="seats-container">
                <div v-for="(row, rowIndex) in 10" :key="rowIndex" class="columns is-mobile is-multiline">
                    <div v-for="(col, colIndex) in 10" :key="colIndex" class="column is-1">
                        <div class="seat-wrapper" @mouseenter="showTooltip(getSeatNumber(rowIndex, colIndex))"
                            @mouseleave="hideTooltip">
                            <div class="seat"
                                :class="{ 'is-occupied': isSeatOccupied(getSeatNumber(rowIndex, colIndex)) }"
                                @click="openSeatModal(getSeatNumber(rowIndex, colIndex))">
                                {{ getSeatNumber(rowIndex, colIndex) }}
                            </div>

                            <div v-if="selectedSeat === getSeatNumber(rowIndex, colIndex) &&
                                isSeatOccupied(getSeatNumber(rowIndex, colIndex)) &&
                                isTooltipVisible" class="tooltip-3d">
                                <div class="tooltip-content">
                                    <div class="tooltip-header">
                                        <span class="seat-number">Seat {{ selectedSeat }}</span>
                                    </div>
                                    <div class="tooltip-body">
                                        <div class="info-row">
                                            <span class="icon"><i class="fas fa-user"></i></span>
                                            <span>{{ seats[getSeatNumber(rowIndex, colIndex)].name }}</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="icon"><i class="fas fa-envelope"></i></span>
                                            <span>{{ seats[getSeatNumber(rowIndex, colIndex)].email }}</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="icon"><i class="fas fa-phone"></i></span>
                                            <span>{{ seats[getSeatNumber(rowIndex, colIndex)].phone }}</span>
                                        </div>
                                        <div class="info-row">
                                            <span class="icon"><i class="fas fa-sticky-note"></i></span>
                                            <span>{{ seats[getSeatNumber(rowIndex, colIndex)].notes }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal" :class="{ 'is-active': isModalOpen }">
                <div class="modal-background" @click="closeModal"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">
                            Seat {{ selectedSeat ? selectedSeat : '' }}
                        </p>
                        <button class="delete" aria-label="close" @click="closeModal"></button>
                    </header>
                    <section class="modal-card-body">
                        <form @submit.prevent="saveSeatData">
                            <div class="field">
                                <label class="label">Nama</label>
                                <div class="control">
                                    <input v-model="formData.name" class="input" type="text" required>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label">Email</label>
                                <div class="control">
                                    <input v-model="formData.email" class="input" type="email" required>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label">Phone</label>
                                <div class="control">
                                    <input v-model="formData.phone" class="input" type="tel" required>
                                </div>
                            </div>

                            <div class="field">
                                <label class="label">Notes</label>
                                <div class="control">
                                    <textarea v-model="formData.notes" class="textarea"></textarea>
                                </div>
                            </div>

                            <div class="field is-grouped">
                                <div class="control">
                                    <button class="button is-primary" type="submit">
                                        Simpan
                                    </button>
                                </div>
                                <div class="control" v-if="isSeatOccupied(selectedSeat!)">
                                    <button class="button is-danger" type="button" @click="clearSeat">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.seating-layout {
    padding: 2rem;
}

.seats-container {
    max-width: 1200px;
    margin: 0 auto;
}

.seat-wrapper {
    position: relative;
}

.seat {
    background-color: #f5f5f5;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    padding: 0.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: #e8e8e8;
        transform: scale(1.05);
    }

    &.is-occupied {
        background-color: #48c774;
        color: white;
        border-color: #3ea76a;

        &:hover {
            background-color: #3ea76a;
        }
    }
}

.tooltip-3d {
    position: absolute;
    z-index: 100;
    top: -170px;
    left: 50%;
    transform: translateX(-50%) perspective(1000px) rotateX(10deg);
    min-width: 240px;

    .tooltip-content {
        background: white;
        border-radius: 8px;
        box-shadow:
            0 10px 20px rgba(0, 0, 0, 0.19),
            0 6px 6px rgba(0, 0, 0, 0.23);
        transform-origin: 50% 50%;
        animation: tooltip-appear 0.2s ease-out forwards;
    }

    .tooltip-header {
        background: #4a4a4a;
        color: white;
        padding: 0.5rem;
        border-radius: 8px 8px 0 0;
        font-weight: bold;
    }

    .tooltip-body {
        padding: 1rem;
    }

    .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;

        .icon {
            width: 20px;
            margin-right: 0.5rem;
            color: #4a4a4a;
        }
    }

    &::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid white;
    }
}

@keyframes tooltip-appear {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-card {
    max-width: 500px;
    width: 100%;
}
</style>