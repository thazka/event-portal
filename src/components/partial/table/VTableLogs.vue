<script setup lang="ts">
import moment from 'moment'

import { fetchBroadcasts } from '/@src/composables/event/useBroadcast'
import { useBroadcast } from '/@src/stores/event/broadcast'

const itemsPerPageOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
]

const filter = reactive({
    search: '',
    page: 1,
    offset: 10
})

const selectedRows = ref<number[]>([])
const { broadcastList } = useBroadcast()

const sortColumn = ref<any>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

const handleSort = (column: any) => {
    if (sortColumn.value === column) {
        if (sortDirection.value === 'asc') {
            sortDirection.value = 'desc'
        } else if (sortDirection.value === 'desc') {
            sortDirection.value = null
            sortColumn.value = null
        } else {
            sortDirection.value = 'asc'
            sortColumn.value = column
        }
    } else {
        sortColumn.value = column
        sortDirection.value = 'asc'
    }
}

const getColorUp = (column: any) => {
    if (sortColumn.value === column && sortDirection.value === 'asc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const getColorDown = (column: any) => {
    if (sortColumn.value === column && sortDirection.value === 'desc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const processedData = computed(() => {
    let result = [...broadcastList.data]

    if (sortColumn.value && sortDirection.value) {
        result.sort((a, b) => {
            const aValue = a[sortColumn.value!]
            const bValue = b[sortColumn.value!]

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection.value === 'asc' ? aValue - bValue : bValue - aValue
            }

            // Handle string comparison
            const aString = String(aValue).toLowerCase()
            const bString = String(bValue).toLowerCase()

            if (sortDirection.value === 'asc') {
                return aString.localeCompare(bString)
            }
            return bString.localeCompare(aString)
        })
    }

    return result
})

const handleLimit = (limit: number) => {
    filter.page = 1
    filter.offset = limit

    fetchBroadcasts(filter)
}

const handleSearch = () => {
    filter.page = 1

    fetchBroadcasts(filter)
}

const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
        case 'in progress':
            return 'inprogress'  // Maps to is-inprogress
        case 'scheduled':
            return 'scheduled'   // Maps to is-scheduled
        case 'completed':
            return 'completed'   // Maps to is-completed
        default:
            return 'light'       // Use light as fallback
    }
}

onMounted(() => {
    fetchBroadcasts(filter)
})
</script>

<template>
    <div class="datatable-toolbar is-justify-content-space-between">
        <h3>List of Participants</h3>

        <VFlex column-gap="10px">
            <VField>
                <VControl icon="lucide:search">
                    <input v-model="filter.search" class="input custom-text-filter" placeholder="Search..."
                        @keyup.enter="handleSearch">
                </VControl>
            </VField>
        </VFlex>
    </div>

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
                                @click="handleSort('broadcast')">
                                <span class="is-align-items-center">Broadcast Title</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('broadcast')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('broadcast')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('total')">
                                <span class="is-align-items-center">Total Recipient</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('total')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('total')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('status')">
                                <span class="is-align-items-center">Status</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('status')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('status')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('created_at')">
                                <span class="is-align-items-center">Created Date</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('created_at')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('created_at')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('complete_at')">
                                <span class="is-align-items-center">Completed Date</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('complete_at')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('complete_at')" />
                                </svg>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="broadcastList.isLoading">
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
                                    <VPlaceholderSection title="No Broadcast yet"
                                        subtitle="Upload dataset participants first and it will show up here.">
                                        <template #image>
                                            <VIcon icon="formkit:people" class="empty-state" />
                                        </template>
                                    </VPlaceholderSection>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr v-for="(user, index) in processedData" :key="user.no">
                                <td>{{ index + 1 + ((filter?.page - 1) * filter?.offset) }}</td>
                                <td>{{ user.title }}</td>
                                <td>{{ user.participants_count }}</td>
                                <td>
                                    <VTag :color="getStatusClass(user.status)" rounded>
                                        {{ user.status }}
                                    </VTag>
                                </td>
                                <td>{{ user.created_at != null ? moment(user.created_at, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm') : '' }}</td>
                                <td class="has-text-left">{{ user.updated_at != null ? moment(user.updated_at,
                                    'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm') : '' }}</td>
                            </tr>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>
    </div>

    <VFlexPagination v-if="processedData.length > 5" v-model:current-page="filter.page" :item-per-page="10"
        :total-items="873" :max-links-displayed="7" no-router class="mt-4">
        <template #before-pagination>
            <VDropdown left donw class="mr-2">
                <template #button="{ toggle, isOpen }">
                    <VButton @click="toggle">
                        {{ filter.offset }}
                        <span class="ml-2">
                            <i v-if="isOpen" class="lnir lnir-chevron-up" />
                            <i v-else class="lnir lnir-chevron-down" />
                        </span>
                    </VButton>
                </template>
                <template #content="{ close }">
                    <a v-for="item in itemsPerPageOptions" :key="item.value" class="dropdown-item"
                        @click="handleLimit(item.value), close()">
                        {{ item.label }}
                    </a>
                </template>
            </VDropdown>
            <span class="mx-2 mr-5">/ page</span>
        </template>
    </VFlexPagination>
</template>

<style lang="scss" scoped>
.mh-300 {
    min-height: 300px;
}

.empty-state {
    font-size: 94px;
    color: #4B93AD;
}

.is-navbar {
    .datatable-toolbar {
        padding-top: 30px;
    }
}

.datatable-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    h3 {
        font-weight: 600;
        font-size: 18.2px;
        line-height: 27.3px;
        color: #283252;
    }

    &.is-reversed {
        flex-direction: row-reverse;
    }

    .field {
        margin-bottom: 0;

        .control {
            .button {
                color: var(--light-text);

                &:hover,
                &:focus {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: var(--primary--color-invert);
                }
            }
        }
    }

    .buttons {
        margin-left: auto;
        margin-bottom: 0;

        .v-button {
            margin-bottom: 0;
        }
    }
}

.is-dark {
    .datatable-toolbar {
        .field {
            .control {
                .button {
                    background: var(--dark-sidebar) !important;
                    color: var(--light-text);

                    &:hover,
                    &:focus {
                        background: var(--primary) !important;
                        border-color: var(--primary) !important;
                        color: var(--smoke-white) !important;
                    }
                }
            }
        }
    }

    h3 {
        color: var(--light-text);
    }
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
