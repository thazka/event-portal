<script setup lang="ts">
import moment from 'moment'
import type { Participants } from '/@src/interface/ParticipantsInterface'

interface Props {
    data: Participants[]
    filter: {
        search: string
        page: number
        offset: number
    }
    loading: boolean
    sortColumn: keyof Participants | null
    sortDirection: 'asc' | 'desc' | null
}

// Define emits for events we need to pass up to parent
const emit = defineEmits<{
    'update:filter': [filter: Props['filter']]
    'update:sortColumn': [column: keyof Participants | null]
    'update:sortDirection': [direction: 'asc' | 'desc' | null]
    'select-seat': [seat: string]
    'upload': []
}>()

// Properly define props with type checking
const props = defineProps<Props>()

const options = [
  'Left - 001',
  'Left - 002',
  'Left - 003',
  'Left - 004',
  'Left - 005'
]

const selectedSeat = ref('Seat Unassigned')

const handleSort = (column: keyof Participants) => {
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

const getColorUp = (column: keyof Participants) => {
    if (props.sortColumn === column && props.sortDirection === 'asc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const getColorDown = (column: keyof Participants) => {
    if (props.sortColumn === column && props.sortDirection === 'desc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const processedData = computed(() => {
    let result = [...props.data]

    if (props.filter.search) {
        const filterRe = new RegExp(props.filter.search, 'i')
        result = result.filter((item) => {
            return (
                item.name.match(filterRe) ||
                item.company.match(filterRe) ||
                item.phone.match(filterRe) ||
                item.seat.match(filterRe) ||
                item.attendance.match(filterRe)
            )
        })
    }

    if (props.sortColumn && props.sortDirection) {
        result.sort((a, b) => {
            const aValue = a[props.sortColumn!]
            const bValue = b[props.sortColumn!]

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return props.sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }

            // Handle string comparison
            const aString = String(aValue).toLowerCase()
            const bString = String(bValue).toLowerCase()

            if (props.sortDirection === 'asc') {
                return aString.localeCompare(bString)
            }
            return bString.localeCompare(aString)
        })
    }

    return result
})

const handleSelect = (value: string) => {
    selectedSeat.value = value
    emit('select-seat', value)
}

const handleUpload = () => {
    emit('upload')
}
</script>

<template>
    <div class="datatable-wrapper">
        <div class="table-container">
            <table class="table datatable-table is-fullwidth">
                <thead>
                    <tr>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('no')">
                                <span class="is-align-items-center">No</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('no')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('no')" />
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
                            <td colspan="6" class="has-text-centered">
                                <VLoader :active="true" class="mh-300" />
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <template v-if="!processedData.length">
                            <tr>
                                <td colspan="6" class="has-text-centered">
                                    <VPlaceholderSection title="No Participants yet" subtitle="Upload dataset participants first and it will show up here.">
                                        <template #image>
                                            <VIcon icon="formkit:people" class="empty-state" />
                                        </template>
                                        <template #action>
                                            <VButton color="primary" @click.prevent="handleUpload">Input Participants Dataset </VButton>
                                        </template>
                                    </VPlaceholderSection>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr v-for="(user, index) in processedData" :key="user.no">
                                <td>{{ index + 1 + ((props.filter?.page - 1) * props.filter?.offset) }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.company }}</td>
                                <td>{{ user.phone }}</td>
                                <td>
                                    <VTag :label="selectedSeat" :color="selectedSeat == 'Seat Unassigned' ? 'danger' : 'success'"
                                        curved hasDropdown :options="options" searchPlaceholder="Search" @select="handleSelect" />
                                </td>
                                <td class="has-text-left">
                                    {{ user.attendance != null ? moment(user.attendance, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm') : '' }}
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

    .product-photo {
        width: 80px;
        height: 80px;
        object-fit: contain;
    }

    .file-icon {
        width: 46px;
        height: 46px;
        object-fit: contain;
    }

    .drinks-icon {
        display: block;
        max-width: 48px;
        border-radius: var(--radius-rounded);
        border: 1px solid var(--fade-grey);
    }

    .negative-icon,
    .positive-icon {
        .iconify {
            height: 16px;
            width: 16px;
        }
    }

    .positive-icon {
        .iconify {
            color: var(--success);

            * {
                stroke-width: 4px;
            }
        }
    }

    .negative-icon {
        &.is-danger {
            .iconify {
                color: var(--danger) !important;
            }
        }

        .iconify {
            color: var(--light-text);

            * {
                stroke-width: 4px;
            }
        }
    }

    .price {
        color: var(--dark-text);
        font-weight: 500;

        &::before {
            content: '$';
        }

        &.price-free {
            color: var(--light-text);
        }
    }

    .status {
        display: flex;
        align-items: center;

        &.is-available {
            .iconify {
                color: var(--success);
            }
        }

        &.is-busy {
            .iconify {
                color: var(--danger);
            }
        }

        &.is-offline {
            .iconify {
                color: var(--light-text);
            }
        }

        .iconify {
            margin-right: 8px;
            font-size: 8px;
        }

        span {
            font-family: var(--font);
            font-size: 0.9rem;
            color: var(--light-text);
        }
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

        .drinks-icon {
            border-color: color-mix(in oklab, var(--dark-sidebar), white 12%);
        }
    }
}
</style>
