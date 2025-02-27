<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import moment from 'moment'
import { Participant, Props } from '/@src/interface/AnalyticsInterface'

const activeTag = ref(null)
provide('activeTag', activeTag)

const emit = defineEmits<{
    'update:filter': [filter: Props['filter']]
    'update:sortColumn': [column: Props['sortColumn']]
    'update:sortDirection': [direction: 'asc' | 'desc' | null]
    'select-seat': [userId: number, seatId: number]
    'upload': []
}>()

const props = defineProps<Props>()
const notyf = useNotyf()

const assignedSeats = computed(() => {
    const seats: Record<number, number> = {}

    props.data.forEach(participant => {
        if (participant.event?.seat_id) {
            seats[participant.event.seat_id] = participant.id
        }
    })

    return seats
})

const handleSort = (column: Props['sortColumn']) => {
    if (props.sortColumn === column) {
        if (props.sortDirection === 'asc') {
            emit('update:sortDirection', 'desc')
        } else if (props.sortDirection === 'desc') {
            emit('update:sortColumn', null)
            emit('update:sortDirection', null)
        } else {
            emit('update:sortColumn', column)
            emit('update:sortDirection', 'asc')
        }
    } else {
        emit('update:sortColumn', column)
        emit('update:sortDirection', 'asc')
    }
}

const getColorUp = (column: Props['sortColumn']) => {
    if (props.sortColumn === column && props.sortDirection === 'asc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const getColorDown = (column: Props['sortColumn']) => {
    if (props.sortColumn === column && props.sortDirection === 'desc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

// Get seat name for a participant
const getSeatName = (participant: Participant) => {
    if (!participant.event || !participant.event.seat_id) {
        return null
    }

    const seat = props.seatList.find(seat => seat.id === participant.event.seat_id)
    return seat ? seat.name : null
}

const processedData = computed(() => {
    let result = [...props.data]

    // Handle search filtering
    if (props.filter.search) {
        const filterRe = new RegExp(props.filter.search, 'i')
        result = result.filter((item) => {
            const seatName = getSeatName(item) || ''
            const attendanceTime = item.event?.attendance || ''

            return (
                item.name.match(filterRe) ||
                item.company.match(filterRe) ||
                item.phone.match(filterRe) ||
                seatName.match(filterRe) ||
                attendanceTime.match(filterRe)
            )
        })
    }

    // Handle sorting
    if (props.sortColumn && props.sortDirection) {
        result.sort((a, b) => {
            let aValue, bValue;

            // Handle special cases for nested properties
            if (props.sortColumn === 'seat') {
                aValue = getSeatName(a) || ''
                bValue = getSeatName(b) || ''
            } else if (props.sortColumn === 'attendance') {
                aValue = a.event?.attendance || ''
                bValue = b.event?.attendance || ''
            } else {
                aValue = a[props.sortColumn as keyof Participant]
                bValue = b[props.sortColumn as keyof Participant]
            }

            // Handle number comparison
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return props.sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }

            // Handle string comparison
            const aString = String(aValue || '').toLowerCase()
            const bString = String(bValue || '').toLowerCase()

            if (props.sortDirection === 'asc') {
                return aString.localeCompare(bString)
            }
            return bString.localeCompare(aString)
        })
    }

    return result
})

const handleSelectSeat = (userId: number, seatId: number) => {
    // Validate if seat is already assigned
    if (assignedSeats.value[seatId] && assignedSeats.value[seatId] !== userId) {
        notyf.error(`This seat is already assigned to another participant`)
        return
    }

    // Emit event for parent to handle
    emit('select-seat', userId, seatId)
}

const handleUpload = () => {
    emit('upload')
}

// Format seats for dropdown
const formattedSeatList = computed(() => {
    return props.seatList.map(seat => ({
        label: seat.name,
        value: seat.id
    }))
})
</script>

<template>
    <div class="datatable-wrapper">
        <div class="table-container">
            <table class="table datatable-table is-fullwidth">
                <thead>
                    <tr>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('id')">
                                <span class="is-align-items-center">No</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('id')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('id')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('name')">
                                <span class="is-align-items-center">Participants Name</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('name')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('name')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('company')">
                                <span class="is-align-items-center">Company</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('company')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('company')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('phone')">
                                <span class="is-align-items-center">Whatsapp</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('phone')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('phone')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('seat')">
                                <span class="is-align-items-center">Seat</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('seat')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('seat')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('attendance')">
                                <span class="is-align-items-center">Attendance Time</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('attendance')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('attendance')" />
                                </svg>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="props.loading">
                        <tr>
                            <td colspan="7" class="has-text-centered">
                                <VLoader :active="true" class="mh-300" />
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <template v-if="!processedData.length">
                            <tr>
                                <td colspan="7" class="has-text-centered">
                                    <VPlaceholderSection title="No Participants yet"
                                        subtitle="Upload dataset participants first and it will show up here.">
                                        <template #image>
                                            <VIcon icon="formkit:people" class="empty-state" />
                                        </template>
                                        <template #action>
                                            <VButton color="primary" @click.prevent="handleUpload">Input Participants
                                                Dataset </VButton>
                                        </template>
                                    </VPlaceholderSection>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr v-for="(user, index) in processedData" :key="user.id">
                                <td>{{ index + 1 + ((props.filter?.page - 1) * props.filter?.offset) }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.company }}</td>
                                <td>{{ user.phone }}</td>
                                <td>
                                    <!-- {{ formattedSeatList }} -->
                                    <VTag :id="`option-${index}`" :label="getSeatName(user) || 'Seat Unassigned'"
                                        :color="!getSeatName(user) ? 'danger' : 'success'" curved hasDropdown
                                        :options="formattedSeatList" :disabledOptions="assignedSeats"
                                        :currentUserId="user.id" searchPlaceholder="Search"
                                        @select="(seatId: number) => handleSelectSeat(user.id, seatId)" />
                                </td>
                                <td class="has-text-left">
                                    {{ user.event?.attendance ?
                                        moment(user.event.attendance).format('DD-MM-YYYY HH:mm') : '' }}
                                </td>
                            </tr>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.mh-300 {
    min-height: 300px;
}

.empty-state {
    font-size: 94px;
    color: #4B93AD;
}

.datatable-wrapper {
    width: 100%;

    .table-container {
        overflow: unset;
    }

    .datatable-container {
        background: var(--white);
        border: none !important;
        overflow-x: auto;

        .table,
        table {
            width: 100%;
        }

        &::-webkit-scrollbar {
            height: 8px !important;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 10px !important;
            background: rgb(0 0 0 / 20%) !important;
        }
    }
}

.datatable-table {
    border: 1px solid var(--fade-grey);
    border-collapse: collapse;
    border-radius: 0.75rem;

    th {
        padding: 16px 20px;
        font-family: var(--font-alt);
        font-size: 0.8rem;
        color: var(--dark-text);
        text-transform: uppercase;
        border: 1px solid var(--fade-grey);
        font-weight: 600;

        &:last-child {
            text-align: right;
        }
    }

    td {
        font-family: var(--font);
        vertical-align: middle;
        padding: 12px 20px;
        border-bottom: 1px solid var(--fade-grey);

        &:last-child {
            text-align: right;
        }

        &.datatables-empty {
            opacity: 0;
        }
    }

    .light-text {
        color: var(--light-text);
    }

    .flex-media {
        display: flex;
        align-items: center;

        .meta {
            margin-left: 10px;
            line-height: 1.3;

            span {
                display: block;
                font-size: 0.8rem;
                color: var(--light-text);
                font-family: var(--font);

                &:first-child {
                    font-family: var(--font-alt);
                    color: var(--dark-text);
                }
            }
        }
    }

    .row-action {
        display: flex;
        justify-content: flex-end;
    }

    .checkbox {
        padding: 0;
    }
}

.is-dark {
    .datatable-wrapper {
        .datatable-container {
            border-color: color-mix(in oklab, var(--dark-sidebar), white 12%);
            background: color-mix(in oklab, var(--dark-sidebar), white 6%);
        }
    }

    .datatable-table {
        border-color: color-mix(in oklab, var(--dark-sidebar), white 12%);

        th,
        td {
            border-color: color-mix(in oklab, var(--dark-sidebar), white 12%);
            color: var(--dark-dark-text);
        }
    }
}
</style>