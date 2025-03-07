import { acceptHMRUpdate, defineStore } from 'pinia'

export const useDoorprize = defineStore('doorprize', () => {
    const doorprize = reactive<any>({
        data: [],
        isLoading: true,
        isError: false,
        pagination: {
            total: 0,
            offset: 10,
            current: 1,
            last: 1,
        }
    })

    return {
        doorprize,
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
    import.meta.hot.accept(acceptHMRUpdate(useDoorprize, import.meta.hot))
}
