<script setup lang="ts">
export interface UserData {
    no: number
    image: string
    doorprize_name: string
    winner: string
    company: string
}

interface Props {
    data: UserData[]
}

const props = defineProps<Props>()

const itemsPerPageOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
]

const filter = reactive({
    search: '',
    page: 1,
    limit: 10
})

const sortColumn = ref<keyof UserData | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)
const modalAddDoorprize = ref(false)
const router = useRouter()

const handleSort = (column: keyof UserData) => {
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

const getColorUp = (column: keyof UserData) => {
    if (sortColumn.value === column && sortDirection.value === 'asc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const getColorDown = (column: keyof UserData) => {
    if (sortColumn.value === column && sortDirection.value === 'desc') {
        return '#1B1B1B'
    }
    return '#D9D9D9'
}

const processedData = computed(() => {
    let result = [...props.data]

    if (filter.search) {
        const filterRe = new RegExp(filter.search, 'i')
        result = result.filter((item) => {
            return (
                item.doorprize_name.match(filterRe) ||
                item.winner.match(filterRe) ||
                item.company.match(filterRe)
            )
        })
    }

    if (sortColumn.value && sortDirection.value) {
        result.sort((a, b) => {
            const aValue = a[sortColumn.value!]
            const bValue = b[sortColumn.value!]

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection.value === 'asc' ? aValue - bValue : bValue - aValue
            }

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
    filter.limit = limit
}

const openCreateDoorrize = () => {
    modalAddDoorprize.value = true
}

const openSpin = () => {
    router.push('/app/luckydraw')
}
</script>

<template>
    <VModalDoorprize :open="modalAddDoorprize" @close="modalAddDoorprize = false" />

    <div class="datatable-toolbar is-justify-content-space-between">
        <h3>Doorprize Winners List</h3>

        <VFlex column-gap="10px">
            <VField>
                <VControl icon="lucide:search">
                    <input v-model="filter.search" class="input custom-text-filter" placeholder="Search...">
                </VControl>
            </VField>
            <VButton icon="lucide:download" color="primary" outlined class="is-flex is-align-item-center">
                Download
            </VButton>
            <VButton icon="material-symbols:play-circle" color="primary" outlined class="is-flex is-align-item-center" @click="openSpin">
                Spin All
            </VButton>
            <VButton icon="material-symbols:add" color="primary" class="is-flex is-align-item-center" @click="openCreateDoorrize">
                New Doorprize
            </VButton>
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
                        <th>Image</th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('doorprize_name')">
                                <span class="is-align-items-center">Doorprize Name</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('doorprize_name')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('doorprize_name')" />
                                </svg>
                            </span>
                        </th>
                        <th>
                            <span class="is-flex is-align-items-center is-justify-content-space-between"
                                @click="handleSort('winner')">
                                <span class="is-align-items-center">Winner</span>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M5.41504 7.34924L9.24082 2.88583C9.63991 2.42022 10.3602 2.42022 10.7593 2.88583L14.5851 7.34924C15.1411 7.99791 14.6802 9.00003 13.8259 9.00003H6.1743C5.31994 9.00003 4.85903 7.99791 5.41504 7.34924Z"
                                        :fill="getColorUp('winner')" />
                                    <path
                                        d="M14.5851 12.6508L10.7593 17.1142C10.3602 17.5798 9.63991 17.5798 9.24082 17.1142L5.41504 12.6508C4.85903 12.0021 5.31994 11 6.1743 11L13.8259 11C14.6802 11 15.1411 12.0021 14.5851 12.6508Z"
                                        :fill="getColorDown('winner')" />
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
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in processedData" :key="user.no">
                        <td>{{ user.no }}</td>
                        <td><img :src="user.image" alt="Doorprize" class="product-photo"></td>
                        <td>{{ user.doorprize_name }}</td>
                        <td>{{ user.winner }}</td>
                        <td>{{ user.company }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <VPlaceholderPage v-if="processedData.length === 0" title="We couldn't find any matching results."
            subtitle="Too bad. Looks like we couldn't find any matching results for the search terms you've entered. Please try different search terms or criteria."
            larger />
    </div>

    <VFlexPagination v-if="processedData.length > 5" v-model:current-page="filter.page" :item-per-page="filter.limit"
        :total-items="processedData.length" :max-links-displayed="7" no-router class="mt-4">
        <template #before-pagination>
            <VDropdown left down class="mr-2">
                <template #button="{ toggle, isOpen }">
                    <VButton @click="toggle">
                        {{ filter.limit }}
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
/* Keeping the original styles */
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
    }

    td {
        font-family: var(--font);
        vertical-align: middle;
        padding: 12px 20px;
        border-bottom: 1px solid var(--fade-grey);
    }

    .product-photo {
        width: 80px;
        height: 80px;
        object-fit: contain;
    }
}
</style>