import { acceptHMRUpdate, defineStore } from 'pinia'

export const useSeats = defineStore('seats', () => {
    const seatList = reactive({
        isLoading: true,
        isError: false,
        data: [],
        pagination: {
            total: 0,
            offset: 10,
            current: 1,
            last: 1,
        }
    })

    return {
        seatList
    } as const
})

/**
 * Pinia supports Hot Module replacement so you can edit your stores and
 * interact with them directly in your app without reloading the page.
 *
 * @see https://pinia.esm.dev/cookbook/hot-module-replacement.html
 * @see https://vitejs.dev/guide/api-hmr.html
 */
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSeats, import.meta.hot))
}
