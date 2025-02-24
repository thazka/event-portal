import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useParticipants = defineStore('participants', () => {
    const participants = reactive({
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
        participants,
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
    import.meta.hot.accept(acceptHMRUpdate(useParticipants, import.meta.hot))
}
