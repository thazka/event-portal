
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

const isModalOpen = ref(false)
const selectedSeat = ref<number | null>(null)
const seats = ref<SeatsMap>({})

const formData = ref<SeatData>({
    name: '',
    email: '',
    phone: '',
    notes: ''
})

const selectedSeatData = computed(() =>
    selectedSeat.value ? seats.value[selectedSeat.value] : null
)

const getSeatNumber = (row: number, col: number): number => {
    return row * 10 + col + 1
}

const isSeatOccupied = (seatNumber: number): boolean => {
    return !!seats.value[seatNumber]
}

const openSeatModal = (seatNumber: number) => {
    selectedSeat.value = seatNumber
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
                        <div class="seat" :class="{ 'is-occupied': isSeatOccupied(getSeatNumber(rowIndex, colIndex)) }"
                            @click="openSeatModal(getSeatNumber(rowIndex, colIndex))">
                            {{ getSeatNumber(rowIndex, colIndex) }}
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
                        <div v-if="selectedSeatData">
                            <div class="card">
                                <div class="card-content">
                                    <div class="content">
                                        <p><strong>Nama:</strong> {{ selectedSeatData.name }}</p>
                                        <p><strong>Email:</strong> {{ selectedSeatData.email }}</p>
                                        <p><strong>Phone:</strong> {{ selectedSeatData.phone }}</p>
                                        <p><strong>Notes:</strong> {{ selectedSeatData.notes }}</p>
                                    </div>
                                </div>
                            </div>
                            <button class="button is-danger mt-4" @click="clearSeat">
                                Hapus Data
                            </button>
                        </div>
                        <form v-else @submit.prevent="saveSeatData">
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

                            <button class="button is-primary" type="submit">
                                Simpan
                            </button>
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

.modal-card {
    max-width: 500px;
    width: 100%;
}
</style>