<script setup lang="ts">
export interface UserData {
    no: number
    name: string
    phone: string
}

interface Props {
    data: UserData[]
    filter: {
        search: string
        page: number
        offset: number
    }
    loading: boolean
    selectedRows: number[]
    sortColumn: keyof UserData | null
    sortDirection: 'asc' | 'desc' | null
}

interface Emits {
    (e: 'update:selectedRows', value: number[]): void
    (e: 'update:sortColumn', value: keyof UserData | null): void
    (e: 'update:sortDirection', value: 'asc' | 'desc' | null): void
    (e: 'broadcast'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSort = (column: keyof UserData) => {
    if (props.sortColumn === column) {
        if (props.sortDirection === 'asc') {
            emit('update:sortDirection', 'desc')
        } else if (props.sortDirection === 'desc') {
            emit('update:sortDirection', null)
            emit('update:sortColumn', null)
        } else {
            emit('update:sortDirection', 'asc')
            emit('update:sortColumn', column)
        }
    } else {
        emit('update:sortColumn', column)
        emit('update:sortDirection', 'asc')
    }
}

const getColorUp = (column: keyof UserData) => {
    if (props.sortColumn === column && props.sortDirection === 'asc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const getColorDown = (column: keyof UserData) => {
    if (props.sortColumn === column && props.sortDirection === 'desc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const processedData = computed(() => {
    let result = [...props.data]

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

const isAllSelected = computed(() => {
    return processedData.value.length > 0 &&
        props.selectedRows.length === processedData.value.length
})

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        emit('update:selectedRows', [])
    } else {
        emit('update:selectedRows', processedData.value.map(row => row.no))
    }
}

const toggleSelectRow = (no: number) => {
    const newSelectedRows = [...props.selectedRows]
    const index = newSelectedRows.indexOf(no)
    
    if (index === -1) {
        newSelectedRows.push(no)
    } else {
        newSelectedRows.splice(index, 1)
    }
    
    emit('update:selectedRows', newSelectedRows)
}
</script>

<template>
    <div class="datatable-wrapper">
        <div class="table-container">
            <table class="table datatable-table is-fullwidth">
                <thead>
                    <tr>
                        <th>
                            <VCheckbox :modelValue="isAllSelected" color="primary" paddingless
                                @update:modelValue="toggleSelectAll" />
                        </th>
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
                                    </VPlaceholderSection>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr v-for="(user, index) in processedData" :key="user.no">
                                <td>
                                    <VCheckbox :modelValue="props.selectedRows.includes(user.no)" :value="user.no" color="primary"
                                        paddingless @update:modelValue="() => toggleSelectRow(user.no)" />
                                </td>
                                <td>{{ index + 1 + ((props.filter?.page - 1) * props.filter?.offset) }}</td>
                                <td>{{ user.name }}</td>
                                <td class="has-text-left">{{ user.phone }}</td>
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

    /* Other styles as in the original */
    /* ... */
}

/* Dark mode styles */
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