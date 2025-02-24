import { acceptHMRUpdate, defineStore } from 'pinia'
import type { EventStats } from '/@src/interface/AnalyticsInterface'

export const useAnalytics = defineStore('analytics', () => {
    const analytics = reactive({
        data: {
            total_participants: 0,
            total_seat_assigned: 0,
            total_presents: 0,
            total_not_yet_presents: 0,
            attendance_rate: 0,
        } as EventStats,
        isLoading: true,
        isError: false,
    })

    const seatLayout = reactive({
        data: {
            file: '',
        },
        isLoading: true,
        isError: false,
    })

    return {
        analytics,
        seatLayout
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
    import.meta.hot.accept(acceptHMRUpdate(useAnalytics, import.meta.hot))
}
