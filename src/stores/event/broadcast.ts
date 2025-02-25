import { acceptHMRUpdate, defineStore } from 'pinia'
import type { EventStats } from '/@src/interface/AnalyticsInterface'
import { isError } from 'h3'

export const useBroadcast = defineStore('broadcast', () => {
    const broadcastList = reactive({
        data: [] as any[],
        isLoading: false,
        isError: false,
    })

    return {
        broadcastList
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
    import.meta.hot.accept(acceptHMRUpdate(useBroadcast, import.meta.hot))
}
